"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PipelineData {
  stage: string;
  count: number;
}

interface PipelineChartProps {
  data: PipelineData[];
  isLoading?: boolean;
}

const STAGE_COLORS = {
  "new": "#10b981",
  "contacted": "#3b82f6",
  "qualified": "#8b5cf6",
  "proposal": "#f59e0b",
  "negotiation": "#ef4444",
  "closed-won": "#059669",
  "closed-lost": "#6b7280",
};

const STAGE_ORDER = ["new", "contacted", "qualified", "proposal", "negotiation", "closed-won", "closed-lost"];

export function PipelineChart({ data, isLoading }: PipelineChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  // Sort data according to pipeline order
  const sortedData = STAGE_ORDER
    .map(stage => ({
      stage: stage.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
      count: data.find(d => d.stage === stage)?.count || 0,
      originalStage: stage,
    }))
    .filter(item => item.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="stage"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [`${value} leads`, "Count"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar
                dataKey="count"
                fill={(entry: any) => STAGE_COLORS[entry.originalStage as keyof typeof STAGE_COLORS] || "#6b7280"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {sortedData.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No leads in pipeline yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}