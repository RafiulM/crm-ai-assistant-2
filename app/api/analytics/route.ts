import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq, and, gte, lte, count, sql, desc, inArray } from "drizzle-orm";
import { startOfDay, endOfDay, subDays } from "date-fns";

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
    const days = parseInt(searchParams.get("days") || "30");

    const today = startOfDay(new Date());
    const startDate = subDays(today, days - 1);

    // New leads today
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const [newLeadsToday] = await db
      .select({ count: count() })
      .from(leads)
      .where(
        and(
          eq(leads.userId, session.user.id),
          gte(leads.createdAt, todayStart),
          lte(leads.createdAt, todayEnd)
        )
      );

    // Total leads
    const [totalLeads] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.userId, session.user.id));

    // Conversion rate (leads that reached "proposal" stage or beyond)
    const convertedStages = ["proposal", "negotiation", "closed-won"];
    const [convertedLeads] = await db
      .select({ count: count() })
      .from(leads)
      .where(
        and(
          eq(leads.userId, session.user.id),
          inArray(leads.stage, convertedStages)
        )
      );

    const conversionRate = totalLeads.count > 0
      ? Math.round((convertedLeads.count / totalLeads.count) * 100)
      : 0;

    // Pipeline breakdown by stage
    const pipelineBreakdown = await db
      .select({
        stage: leads.stage,
        count: count(),
      })
      .from(leads)
      .where(eq(leads.userId, session.user.id))
      .groupBy(leads.stage)
      .orderBy(sql`CASE
        WHEN ${leads.stage} = 'new' THEN 1
        WHEN ${leads.stage} = 'contacted' THEN 2
        WHEN ${leads.stage} = 'qualified' THEN 3
        WHEN ${leads.stage} = 'proposal' THEN 4
        WHEN ${leads.stage} = 'negotiation' THEN 5
        WHEN ${leads.stage} = 'closed-won' THEN 6
        WHEN ${leads.stage} = 'closed-lost' THEN 7
        ELSE 8
      END`);

    // Daily leads over time (for the last 30 days)
    const dailyLeads = await db
      .select({
        date: sql`DATE(${leads.createdAt})::text`.as('date'),
        count: count(),
      })
      .from(leads)
      .where(
        and(
          eq(leads.userId, session.user.id),
          gte(leads.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(${leads.createdAt})`)
      .orderBy(sql`DATE(${leads.createdAt})`);

    // Recent leads
    const recentLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.userId, session.user.id))
      .orderBy(desc(leads.createdAt))
      .limit(5);

    return NextResponse.json({
      metrics: {
        newLeadsToday: newLeadsToday.count,
        totalLeads: totalLeads.count,
        conversionRate,
        convertedLeads: convertedLeads.count,
      },
      pipelineBreakdown,
      dailyLeads: dailyLeads.map(item => ({
        date: item.date,
        count: item.count,
      })),
      recentLeads,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}