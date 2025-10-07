"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCards } from "@/components/analytics/metrics-cards";
import { PipelineChart } from "@/components/analytics/pipeline-chart";
import { RecentLeads } from "@/components/analytics/recent-leads";
import { ChatInterface } from "@/components/chat-interface";
import { BarChart3, MessageSquare, TrendingUp } from "lucide-react";

interface AnalyticsData {
  metrics: {
    newLeadsToday: number;
    totalLeads: number;
    conversionRate: number;
    convertedLeads: number;
  };
  pipelineBreakdown: Array<{
    stage: string;
    count: number;
  }>;
  dailyLeads: Array<{
    date: string;
    count: number;
  }>;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    company?: string;
    stage: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function DashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/analytics");

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200">Error: {error}</p>
            </div>
          )}

          <MetricsCards
            metrics={analyticsData?.metrics || {
              newLeadsToday: 0,
              totalLeads: 0,
              conversionRate: 0,
              convertedLeads: 0,
            }}
            isLoading={isLoading}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <PipelineChart
                data={analyticsData?.pipelineBreakdown || []}
                isLoading={isLoading}
              />
            </div>
            <div className="col-span-3">
              <RecentLeads
                leads={analyticsData?.recentLeads || []}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <h3 className="font-medium mb-2">Quick Commands</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• "Create a lead for John Doe"</li>
                  <li>• "Search for leads at Google"</li>
                  <li>• "Update Sarah's stage to qualified"</li>
                  <li>• "Show me all new leads"</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <h3 className="font-medium mb-2">Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Be specific with lead details</li>
                  <li>• Use natural language</li>
                  <li>• Include email for new leads</li>
                  <li>• Ask for help anytime</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCards
              metrics={analyticsData?.metrics || {
                newLeadsToday: 0,
                totalLeads: 0,
                conversionRate: 0,
                convertedLeads: 0,
              }}
              isLoading={isLoading}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <PipelineChart
              data={analyticsData?.pipelineBreakdown || []}
              isLoading={isLoading}
            />
          </div>

          <RecentLeads
            leads={analyticsData?.recentLeads || []}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}