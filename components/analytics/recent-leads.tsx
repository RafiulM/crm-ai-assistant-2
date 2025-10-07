"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Mail, Building, Calendar } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  stage: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RecentLeadsProps {
  leads: Lead[];
  isLoading?: boolean;
}

const STAGE_COLORS = {
  "new": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  "contacted": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  "qualified": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
  "proposal": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  "negotiation": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  "closed-won": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  "closed-lost": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
};

export function RecentLeads({ leads, isLoading }: RecentLeadsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-48 rounded bg-muted" />
                  </div>
                  <div className="h-6 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Leads</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting || leads.length === 0}
        >
          {isExporting ? (
            <>
              <Download className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Eye className="mx-auto h-12 w-12 opacity-50 mb-4" />
            <p>No leads yet. Start by creating your first lead!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1 sm:space-y-0 sm:space-x-3 sm:flex sm:items-center">
                  <div>
                    <h4 className="font-medium">{lead.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                    {lead.company && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-3 w-3" />
                        {lead.company}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={STAGE_COLORS[lead.stage as keyof typeof STAGE_COLORS]}
                    >
                      {lead.stage.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 sm:mt-0">
                  <Calendar className="h-3 w-3" />
                  {formatDate(lead.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}