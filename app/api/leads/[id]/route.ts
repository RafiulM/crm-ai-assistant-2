import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { updateLeadSchema, leadIdSchema } from "@/lib/validations/lead";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/leads/[id] - Get a specific lead
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Validate lead ID
    const { id: leadId } = leadIdSchema.parse({ id });

    // Get lead for this user
    const [lead] = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.userId, session.user.id)))
      .limit(1);

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(lead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid lead ID" },
        { status: 400 }
      );
    }

    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/leads/[id] - Update a specific lead
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();

    // Validate inputs
    const { id: leadId } = leadIdSchema.parse({ id });
    const validatedData = updateLeadSchema.parse(body);

    // Check if lead exists and belongs to user
    const existingLead = await db
      .select()
      .from(leads)
      .where(and(eq(leads.id, leadId), eq(leads.userId, session.user.id)))
      .limit(1);

    if (existingLead.length === 0) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Check if email is being updated and if it already exists
    if (validatedData.email && validatedData.email !== existingLead[0].email) {
      const emailExists = await db
        .select()
        .from(leads)
        .where(and(eq(leads.email, validatedData.email), eq(leads.userId, session.user.id)))
        .limit(1);

      if (emailExists.length > 0) {
        return NextResponse.json(
          { error: "A lead with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Update lead
    const [updatedLead] = await db
      .update(leads)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(eq(leads.id, leadId), eq(leads.userId, session.user.id)))
      .returning();

    return NextResponse.json(updatedLead);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] - Delete a specific lead
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Validate lead ID
    const { id: leadId } = leadIdSchema.parse({ id });

    // Delete lead (only if it belongs to the user)
    const deletedLead = await db
      .delete(leads)
      .where(and(eq(leads.id, leadId), eq(leads.userId, session.user.id)))
      .returning();

    if (deletedLead.length === 0) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid lead ID" },
        { status: 400 }
      );
    }

    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}