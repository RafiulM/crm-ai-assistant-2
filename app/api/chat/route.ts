import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import OpenAI from "openai";
import { eq, and, ilike, desc, inArray } from "drizzle-orm";
import { z } from "zod";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationId: z.string().optional(),
});

// Tool schemas
const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  stage: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]).optional(),
  notes: z.string().optional(),
});

const updateLeadSchema = z.object({
  id: z.string().uuid("Lead ID is required"),
  name: z.string().optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  stage: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]).optional(),
  notes: z.string().optional(),
});

const searchLeadsSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  company: z.string().optional(),
  stage: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"]).optional(),
});

const deleteLeadSchema = z.object({
  id: z.string().uuid("Lead ID is required"),
});

// Define tools for OpenAI
const tools = [
  {
    type: "function" as const,
    function: {
      name: "create_lead",
      description: "Create a new lead with the provided information",
      parameters: {
        type: "object" as const,
        properties: {
          name: {
            type: "string",
            description: "Full name of the lead",
          },
          email: {
            type: "string",
            description: "Email address of the lead",
          },
          company: {
            type: "string",
            description: "Company name (optional)",
          },
          stage: {
            type: "string",
            enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"],
            description: "Current stage of the lead (defaults to 'new')",
          },
          notes: {
            type: "string",
            description: "Additional notes about the lead (optional)",
          },
        },
        required: ["name", "email"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_lead",
      description: "Update an existing lead's information",
      parameters: {
        type: "object" as const,
        properties: {
          id: {
            type: "string",
            description: "UUID of the lead to update",
          },
          name: {
            type: "string",
            description: "Updated name of the lead",
          },
          email: {
            type: "string",
            description: "Updated email address of the lead",
          },
          company: {
            type: "string",
            description: "Updated company name",
          },
          stage: {
            type: "string",
            enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"],
            description: "Updated stage of the lead",
          },
          notes: {
            type: "string",
            description: "Updated notes about the lead",
          },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_leads",
      description: "Search for leads based on criteria",
      parameters: {
        type: "object" as const,
        properties: {
          name: {
            type: "string",
            description: "Search by name (partial match)",
          },
          email: {
            type: "string",
            description: "Search by email (partial match)",
          },
          company: {
            type: "string",
            description: "Search by company (partial match)",
          },
          stage: {
            type: "string",
            enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"],
            description: "Filter by stage",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_leads",
      description: "List all leads for the user",
      parameters: {
        type: "object" as const,
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_lead",
      description: "Delete a lead by ID",
      parameters: {
        type: "object" as const,
        properties: {
          id: {
            type: "string",
            description: "UUID of the lead to delete",
          },
        },
        required: ["id"],
      },
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message } = chatMessageSchema.parse(body);

    // Create the system prompt for lead management
    const systemPrompt = `You are a helpful CRM assistant that helps users manage their sales leads. Use the available tools to perform lead management operations.

When users ask to create, update, search, list, or delete leads, use the appropriate tool function.
For creating leads, you must have both name and email.
For updating or deleting leads, you need the lead ID.
For searching, you can use any combination of name, email, company, or stage filters.

If users ask general questions about how to use the system or provide information without specific operations, respond helpfully without using tools.`;

    // Call OpenAI API with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = completion.choices[0]?.message;

    if (!responseMessage) {
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
      );
    }

    // Check if the model wants to call a tool
    const toolCalls = responseMessage.tool_calls;

    if (toolCalls && toolCalls.length > 0) {
      // Execute tool calls
      const availableTools = {
        create_lead: createLead,
        update_lead: updateLead,
        search_leads: searchLeads,
        list_leads: listLeads,
        delete_lead: deleteLead,
      };

      const toolResults = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableTools[functionName as keyof typeof availableTools];

        if (functionToCall) {
          try {
            const functionArgs = JSON.parse(toolCall.function.arguments);

            // Validate arguments
            let validatedArgs;
            switch (functionName) {
              case "create_lead":
                validatedArgs = createLeadSchema.parse(functionArgs);
                break;
              case "update_lead":
                validatedArgs = updateLeadSchema.parse(functionArgs);
                break;
              case "search_leads":
                validatedArgs = searchLeadsSchema.parse(functionArgs);
                break;
              case "delete_lead":
                validatedArgs = deleteLeadSchema.parse(functionArgs);
                break;
              case "list_leads":
                validatedArgs = {};
                break;
              default:
                throw new Error(`Unknown function: ${functionName}`);
            }

            const result = await functionToCall(validatedArgs, session.user.id);
            toolResults.push({
              tool_call_id: toolCall.id,
              result: result,
            });
          } catch (error) {
            console.error(`Error executing ${functionName}:`, error);
            toolResults.push({
              tool_call_id: toolCall.id,
              result: {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred"
              },
            });
          }
        }
      }

      // Get final response from OpenAI with tool results
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          responseMessage,
          {
            role: "tool",
            content: JSON.stringify(toolResults.map(r => ({
              tool_call_id: r.tool_call_id,
              content: JSON.stringify(r.result),
            }))),
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const finalMessage = secondResponse.choices[0]?.message?.content;

      return NextResponse.json({
        type: "action_result",
        content: finalMessage || "I've processed your request.",
        toolResults: toolResults.map(r => r.result),
      });
    }

    // If no tool calls, return the message directly
    return NextResponse.json({
      type: "message",
      content: responseMessage.content || "I understand. How can I help you manage your leads?",
    });

  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function createLead(leadData: any, userId: string) {
  // Check required fields
  if (!leadData.name || !leadData.email) {
    return {
      success: false,
      message: "I need both name and email to create a new lead.",
      missingFields: [
        ...(!leadData.name ? ["name"] : []),
        ...(!leadData.email ? ["email"] : []),
      ],
    };
  }

  // Check for duplicate email
  const existingLead = await db
    .select()
    .from(leads)
    .where(and(eq(leads.email, leadData.email), eq(leads.userId, userId)))
    .limit(1);

  if (existingLead.length > 0) {
    return {
      success: false,
      message: "A lead with this email already exists.",
    };
  }

  const [newLead] = await db
    .insert(leads)
    .values({
      name: leadData.name,
      email: leadData.email,
      company: leadData.company,
      stage: leadData.stage || "new",
      notes: leadData.notes,
      userId,
      updatedAt: new Date(),
    })
    .returning();

  return {
    success: true,
    message: `Successfully created lead: ${newLead.name}`,
    lead: newLead,
  };
}

async function updateLead(leadData: any, userId: string) {
  if (!leadData.id) {
    return {
      success: false,
      message: "I need the lead ID to update it.",
    };
  }

  const [updatedLead] = await db
    .update(leads)
    .set({
      ...leadData,
      updatedAt: new Date(),
    })
    .where(and(eq(leads.id, leadData.id), eq(leads.userId, userId)))
    .returning();

  if (!updatedLead) {
    return {
      success: false,
      message: "Lead not found or you don't have permission to update it.",
    };
  }

  return {
    success: true,
    message: `Successfully updated lead: ${updatedLead.name}`,
    lead: updatedLead,
  };
}

async function searchLeads(leadData: any, userId: string) {
  const conditions = [eq(leads.userId, userId)];

  if (leadData.name) {
    conditions.push(ilike(leads.name, `%${leadData.name}%`));
  }
  if (leadData.email) {
    conditions.push(ilike(leads.email, `%${leadData.email}%`));
  }
  if (leadData.company) {
    conditions.push(ilike(leads.company, `%${leadData.company}%`));
  }
  if (leadData.stage) {
    conditions.push(eq(leads.stage, leadData.stage));
  }

  // Build the where clause properly
  let whereClause = conditions[0];
  for (let i = 1; i < conditions.length; i++) {
    whereClause = and(whereClause, conditions[i])!;
  }

  const searchResults = await db
    .select()
    .from(leads)
    .where(whereClause)
    .orderBy(desc(leads.createdAt))
    .limit(20);

  return {
    success: true,
    message: `Found ${searchResults.length} lead${searchResults.length !== 1 ? 's' : ''}`,
    leads: searchResults,
  };
}

async function listLeads(userId: string) {
  const allLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.userId, userId))
    .orderBy(desc(leads.createdAt))
    .limit(50);

  return {
    success: true,
    message: `Found ${allLeads.length} total lead${allLeads.length !== 1 ? 's' : ''}`,
    leads: allLeads,
  };
}

async function deleteLead(leadData: any, userId: string) {
  if (!leadData.id) {
    return {
      success: false,
      message: "I need the lead ID to delete it.",
    };
  }

  const deletedLead = await db
    .delete(leads)
    .where(and(eq(leads.id, leadData.id), eq(leads.userId, userId)))
    .returning();

  if (deletedLead.length === 0) {
    return {
      success: false,
      message: "Lead not found or you don't have permission to delete it.",
    };
  }

  return {
    success: true,
    message: `Successfully deleted lead: ${deletedLead[0].name}`,
  };
}