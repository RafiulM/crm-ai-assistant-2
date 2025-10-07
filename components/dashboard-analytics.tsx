"use client";

import React, { useEffect, useState } from 'react';

interface Analytics {
  totalLeads: number;
  newLeadsToday: number;
  conversionRate: number;
  leadsByStage: Record<string, number>;
  recentLeads: Array<{
    id: string;
    name: string;
    email: string;
    company: string | null;
    stage: string;
    createdAt: string;
  }>;
}

export function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Leads</h3>
          <p className="text-2xl font-bold text-primary">Loading...</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">New Today</h3>
          <p className="text-2xl font-bold text-green-600">Loading...</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Conversion Rate</h3>
          <p className="text-2xl font-bold text-blue-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">Error loading analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Total Leads</h3>
          <p className="text-2xl font-bold text-primary">{analytics.totalLeads}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">New Today</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.newLeadsToday}</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Conversion Rate</h3>
          <p className="text-2xl font-bold text-blue-600">{analytics.conversionRate}%</p>
        </div>
      </div>

      {analytics.recentLeads.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold mb-4">Recent Leads</h3>
          <div className="space-y-2">
            {analytics.recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                  {lead.company && (
                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    lead.stage === 'closed-won' ? 'bg-green-100 text-green-800' :
                    lead.stage === 'closed-lost' ? 'bg-red-100 text-red-800' :
                    lead.stage === 'proposal' ? 'bg-blue-100 text-blue-800' :
                    lead.stage === 'negotiation' ? 'bg-orange-100 text-orange-800' :
                    lead.stage === 'qualified' ? 'bg-purple-100 text-purple-800' :
                    lead.stage === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.stage.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
