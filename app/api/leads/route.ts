import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { createLeadSchema } from "@/lib/validations/lead";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

// GET /api/leads - List all leads for the authenticated user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const stage = searchParams.get("stage");
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(leads.userId, session.user.id)];

    if (stage && stage !== "all") {
      conditions.push(eq(leads.stage, stage));
    }

    if (search) {
      // Search in name, email, and company fields
      conditions.push(
        `(${leads.name.ilike(`%${search}%`)} OR ${leads.email.ilike(`%${search}%`)} OR ${leads.company.ilike(`%${search}%`)})`
      );
    }

    // Get total count
    const totalCount = await db
      .select({ count: leads.id })
      .from(leads)
      .where(eq(leads.userId, session.user.id))
      .then((result) => result.length);

    // Get leads with pagination
    const leadsList = await db
      .select()
      .from(leads)
      .where(eq(leads.userId, session.user.id))
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      leads: leadsList,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create a new lead
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

    // Validate input
    const validatedData = createLeadSchema.parse(body);

    // Check if email already exists for this user
    const existingLead = await db
      .select()
      .from(leads)
      .where(eq(leads.email, validatedData.email))
      .limit(1);

    if (existingLead.length > 0) {
      return NextResponse.json(
        { error: "A lead with this email already exists" },
        { status: 409 }
      );
    }

    // Create new lead
    const [newLead] = await db
      .insert(leads)
      .values({
        ...validatedData,
        userId: session.user.id,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}