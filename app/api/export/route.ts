import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ExcelJS from "exceljs";
import { addDays, format } from "date-fns";

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

    // Get all leads for the user
    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.userId, session.user.id))
      .orderBy(desc(leads.createdAt));

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Leads");

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Company", key: "company", width: 20 },
      { header: "Stage", key: "stage", width: 15 },
      { header: "Notes", key: "notes", width: 40 },
      { header: "Created Date", key: "createdAt", width: 20 },
      { header: "Last Updated", key: "updatedAt", width: 20 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE6F3FF" },
    };

    // Add data rows
    allLeads.forEach((lead) => {
      worksheet.addRow({
        name: lead.name,
        email: lead.email,
        company: lead.company || "",
        stage: lead.stage,
        notes: lead.notes || "",
        createdAt: format(new Date(lead.createdAt), "MMM dd, yyyy hh:mm a"),
        updatedAt: format(new Date(lead.updatedAt), "MMM dd, yyyy hh:mm a"),
      });
    });

    // Add summary statistics at the top
    const summarySheet = workbook.addWorksheet("Summary");
    summarySheet.getCell("A1").value = "CRM Lead Management Summary";
    summarySheet.getCell("A1").font = { bold: true, size: 16 };
    summarySheet.getCell("A3").value = "Total Leads:";
    summarySheet.getCell("B3").value = allLeads.length;
    summarySheet.getCell("A4").value = "Export Date:";
    summarySheet.getCell("B4").value = format(new Date(), "MMM dd, yyyy hh:mm a");

    // Pipeline breakdown
    const stageCounts = allLeads.reduce((acc, lead) => {
      acc[lead.stage] = (acc[lead.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    summarySheet.getCell("A6").value = "Pipeline Breakdown:";
    summarySheet.getCell("A6").font = { bold: true };

    let row = 7;
    Object.entries(stageCounts).forEach(([stage, count]) => {
      summarySheet.getCell(`A${row}`).value = stage;
      summarySheet.getCell(`B${row}`).value = count;
      row++;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers
    const filename = `leads-export-${format(new Date(), "yyyy-MM-dd")}.xlsx`;

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}