import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

const chatSchema = z.object({
  message: z.string().min(1, "Message is required"),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const LEAD_MANAGEMENT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "create_lead",
      description: "Create a new lead in the CRM system",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Full name of the lead"
          },
          email: {
            type: "string",
            description: "Email address of the lead"
          },
          company: {
            type: "string",
            description: "Company name where the lead works (optional)"
          },
          stage: {
            type: "string",
            enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"],
            description: "Current stage of the lead (defaults to 'new')"
          },
          notes: {
            type: "string",
            description: "Additional notes about the lead (optional)"
          }
        },
        required: ["name", "email"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "update_lead",
      description: "Update an existing lead's information",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "UUID of the lead to update"
          },
          name: {
            type: "string",
            description: "Full name of the lead (optional)"
          },
          email: {
            type: "string",
            description: "Email address of the lead (optional)"
          },
          company: {
            type: "string",
            description: "Company name where the lead works (optional)"
          },
          stage: {
            type: "string",
            enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"],
            description: "Current stage of the lead (optional)"
          },
          notes: {
            type: "string",
            description: "Additional notes about the lead (optional)"
          }
        },
        required: ["id"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_lead",
      description: "Get information about a specific lead",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "UUID of the lead"
          },
          name: {
            type: "string",
            description: "Name of the lead"
          },
          email: {
            type: "string",
            description: "Email address of the lead"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "list_leads",
      description: "List all leads for the current user",
      parameters: {
        type: "object",
        properties: {
          company: {
            type: "string",
            description: "Filter leads by company (optional)"
          },
          stage: {
            type: "string",
            enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"],
            description: "Filter leads by stage (optional)"
          }
        }
      }
    }
  }
];

const LEAD_MANAGEMENT_PROMPT = `You are an AI CRM assistant that helps users manage their sales leads. 

Your capabilities:
- Create new leads with name, email, company, stage, and notes
- Update existing lead information  
- Retrieve specific lead details
- List all leads with optional filtering

Lead stages follow this progression: new → contacted → qualified → proposal → negotiation → closed-won OR closed-lost

When users speak naturally about lead management, use the available tools to help them. Always be conversational and helpful. If required information is missing (like name or email for creating leads), ask for it.

Examples:
- "Add John Smith from Acme Corp" → Use create_lead (ask for email if missing)
- "Move John to qualified stage" → Find lead first, then update_lead
- "Show me all my leads" → Use list_leads
- "What's the status of Sarah's lead?" → Use get_lead

Always provide a friendly, conversational response after executing tool operations.`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationHistory = [] } = chatSchema.parse(body);

    // Build conversation context
    const messages = [
      { role: "system" as const, content: LEAD_MANAGEMENT_PROMPT },
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    // Get OpenAI response with tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o as GPT-5 isn't available yet
      messages,
      tools: LEAD_MANAGEMENT_TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
    });

    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage?.content && !responseMessage?.tool_calls) {
      throw new Error("No response from OpenAI");
    }

    // Execute tool calls if present
    const toolResults = [];
    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        const result = await executeToolCall(toolCall, session.user.id);
        toolResults.push({
          tool_call_id: toolCall.id,
          result,
        });
      }

      // Get final response after tool execution
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          ...messages,
          responseMessage,
          ...toolResults.map(result => ({
            role: "tool" as const,
            tool_call_id: result.tool_call_id,
            content: JSON.stringify(result.result),
          })),
        ],
        temperature: 0.7,
      });

      const finalMessage = finalCompletion.choices[0]?.message;
      if (!finalMessage?.content) {
        throw new Error("No final response from OpenAI");
      }

      return NextResponse.json({
        response: {
          type: "response",
          message: finalMessage.content,
        },
        toolResults,
      });
    }

    // Return regular text response
    return NextResponse.json({
      response: {
        type: "response",
        message: responseMessage.content,
      },
      toolResults: [],
    });

  } catch (error) {
    console.error("Error in chat:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

async function executeToolCall(toolCall: { id: string; function: { name: string; arguments: string } }, userId: string) {
  try {
    const toolFunction = toolCall.function;
    const functionName = toolFunction.name;
    const args = JSON.parse(toolFunction.arguments);

    switch (functionName) {
      case "create_lead":
        const [newLead] = await db
          .insert(leads)
          .values({
            name: args.name,
            email: args.email,
            company: args.company || null,
            stage: args.stage || "new",
            notes: args.notes || null,
            userId,
          })
          .returning();
        
        return { 
          success: true, 
          lead: newLead,
          message: `Successfully created lead: ${newLead.name} from ${newLead.company || 'unknown company'}`
        };

      case "update_lead":
        const { id, ...updateData } = args;
        const [updatedLead] = await db
          .update(leads)
          .set({ 
            ...updateData, 
            updatedAt: new Date() 
          })
          .where(and(eq(leads.id, id), eq(leads.userId, userId)))
          .returning();
        
        if (!updatedLead) {
          return { 
            success: false, 
            error: "Lead not found or you don't have permission to update it" 
          };
        }
        
        return { 
          success: true, 
          lead: updatedLead,
          message: `Successfully updated lead: ${updatedLead.name}`
        };

      case "get_lead":
        let lead;
        
        if (args.id) {
          [lead] = await db
            .select()
            .from(leads)
            .where(and(eq(leads.id, args.id), eq(leads.userId, userId)))
            .limit(1);
        } else if (args.name) {
          [lead] = await db
            .select()
            .from(leads)
            .where(and(eq(leads.name, args.name), eq(leads.userId, userId)))
            .limit(1);
        } else if (args.email) {
          [lead] = await db
            .select()
            .from(leads)
            .where(and(eq(leads.email, args.email), eq(leads.userId, userId)))
            .limit(1);
        }
        
        if (!lead) {
          return { 
            success: false, 
            error: "Lead not found" 
          };
        }
        
        return { 
          success: true, 
          lead,
          message: `Found lead: ${lead.name} from ${lead.company || 'unknown company'}`
        };

      case "list_leads":
        let query = db
          .select()
          .from(leads)
          .where(eq(leads.userId, userId));

        if (args.company) {
          query = query.where(eq(leads.company, args.company));
        }
        
        if (args.stage) {
          query = query.where(eq(leads.stage, args.stage));
        }

        const userLeads = await query.orderBy(leads.createdAt);
        
        return { 
          success: true, 
          leads: userLeads,
          message: `Found ${userLeads.length} leads${args.stage ? ` in ${args.stage} stage` : ''}${args.company ? ` from ${args.company}` : ''}`
        };

      default:
        return { 
          success: false, 
          error: `Unknown function: ${functionName}` 
        };
    }
  } catch (error) {
    console.error("Error executing tool call:", error);
    return { 
      success: false, 
      error: "Failed to execute operation" 
    };
  }
}
