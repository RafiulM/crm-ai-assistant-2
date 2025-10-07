import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total leads
    const [totalLeadsResult] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, userId));

    // New leads today
    const [newLeadsTodayResult] = await db
      .select({ count: count() })
      .from(leads)
      .where(
        and(
          eq(leads.userId, userId),
          sql`${leads.createdAt} >= ${today}`
        )
      );

    // Leads by stage
    const leadsByStage = await db
      .select({
        stage: leads.stage,
        count: count(),
      })
      .from(leads)
      .where(eq(leads.userId, userId))
      .groupBy(leads.stage);

    // Convert stage counts to an object
    const stageCounts = leadsByStage.reduce(
      (acc, { stage, count }) => {
        acc[stage] = Number(count);
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate conversion rate (closed-won / total leads)
    const totalLeads = Number(totalLeadsResult.count);
    const closedWonCount = stageCounts["closed-won"] || 0;
    const conversionRate = totalLeads > 0 ? (closedWonCount / totalLeads) * 100 : 0;

    // Recent leads (last 5)
    const recentLeads = await db
      .select({
        id: leads.id,
        name: leads.name,
        email: leads.email,
        company: leads.company,
        stage: leads.stage,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(leads.createdAt)
      .limit(5);

    const analytics = {
      totalLeads,
      newLeadsToday: Number(newLeadsTodayResult.count),
      conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal place
      leadsByStage: stageCounts,
      recentLeads,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
