# Project Requirements Document

# Project Requirements Document (PRD)

## 1. Project Overview

You’re building a conversational CRM assistant powered by OpenAI’s GPT-5 so that individual salespeople or marketers can manage their leads purely by chatting. Instead of manually filling forms, the user types natural‐language commands like “Add a lead named Jane Doe at Acme Corp, set stage to Prospect,” and the AI creates or updates records automatically. All lead data (name, email, company, stage, optional notes) lives in a PostgreSQL database, and there’s a teal‐accented dashboard to visualize key metrics. An Excel export button generates an on‐demand spreadsheet of all leads.

The core problem this solves is eliminating friction in lead management—no more jumping between chat, spreadsheets, and CRM forms. You’re streamlining data entry, updates, and reporting into one chat window plus a simple dashboard. Success criteria include: 1) users can add or update leads via chat without errors; 2) dashboard charts (new leads today, conversion rate, pipeline status) load in under a second; and 3) Excel exports download immediately with the correct columns.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)

*   **Authentication & User Management**\
    – Email-based sign-up/sign-in (single role; no admin vs. rep)
*   **Chat-Driven Lead CRUD**\
    – Create, read, update lead records with GPT-5\
    – Fields: name, email, company, stage, optional notes\
    – AI follow-ups for missing required fields
*   **Dashboard Visualization**\
    – Three charts: new leads today, overall conversion rate, pipeline breakdown by stage\
    – Teal color palette, mobile-friendly layout
*   **On-Demand Excel Export**\
    – Button triggers backend to generate and download `.xlsx`\
    – Columns: name, email, company, stage, notes, created/updated timestamps
*   **Responsive UI**\
    – Works on desktop and mobile (drawer navigation on narrow screens)
*   **Data Persistence**\
    – Next.js API → Drizzle ORM → PostgreSQL\
    – Docker Compose for local/dev environment

### Out-of-Scope (Later Phases)

*   Multi-user teams or role-based permissions
*   Integrations with external CRMs, calendars, or email providers
*   Phone number or other custom fields beyond specified five
*   Scheduled, recurring report exports
*   Advanced compliance (GDPR workflows, audit logs)
*   Custom branding beyond teal primary color

## 3. User Flow

When a new user lands on the site (desktop or mobile), they see a clean teal-accented landing page with “Sign Up” and “Sign In” buttons. They tap “Sign Up,” enter an email and password, then arrive at the main interface without any role choices. The header shows a “Dashboard” icon, and below is a persistent chat window that invites natural-language commands.

A typical session: the user types “Add a lead: John Smith at WidgetCo, stage = Prospect.” The assistant confirms any missing fields (“Would you like to add notes?”) or records the entry directly. Later, the user asks “Update John Smith’s stage to Qualified and add note ‘sent pricing’.” The AI checks the database, applies the update, and replies “John Smith updated.” At any point, the user taps the Dashboard icon to view three real-time charts (new leads today, conversion rate, pipeline). From the dashboard, they hit “Export Report” to download an Excel file containing all leads.

## 4. Core Features

*   **Email-Based Authentication**\
    Simple sign-up/sign-in with single user role (no roles/permissions).
*   **GPT-5 Conversational Interface**\
    Natural language parsing, follow-up prompts, error handling.
*   **Lead Management via Chat**\
    Create/update leads (name, email, company, stage, notes)\
    Contextual prompts for missing fields.
*   **Real-Time Dashboard**\
    Charts for new leads today, overall conversion rate, pipeline stages\
    Auto-refresh on navigation.
*   **On-Demand Excel Export**\
    Backend endpoint streams `.xlsx` using ExcelJS, matching lead schema.
*   **Mobile-First Responsive Design**\
    Drawer navigation, resizable chart components, accessible touch targets.
*   **Data Layer & Tool Integration**\
    Next.js API routes → Drizzle ORM → PostgreSQL → Docker Compose

## 5. Tech Stack & Tools

*   **Frontend**\
    – Next.js (React framework)\
    – TypeScript\
    – Tailwind CSS + Shadcn UI components
*   **Backend**\
    – Next.js API routes\
    – Drizzle ORM (TypeScript-first)\
    – PostgreSQL (Docker)\
    – ExcelJS for `.xlsx` generation
*   **AI Integration**\
    – OpenAI GPT-5 via server-side API calls
*   **Authentication**\
    – better-auth (or NextAuth) for email/password
*   **Development Tools**\
    – Docker Compose for local env\
    – VS Code (Cursor, Windsurf plugins optional)

## 6. Non-Functional Requirements

*   **Performance**\
    – API response <200 ms for simple CRUD calls\
    – Dashboard charts load <1 s on typical broadband/mobile
*   **Security**\
    – TLS for all network traffic\
    – Database at-rest encryption via PostgreSQL config\
    – Sanitized inputs to prevent injection
*   **Usability**\
    – WCAG-compatible touch targets (≥44 px)\
    – Color contrast passes accessibility guidelines
*   **Scalability**\
    – Single-user scale initially, architecture allows horizontal scaling

## 7. Constraints & Assumptions

*   GPT-5 API access and rate limits are available and sufficient.
*   Only one user per account—no multi-tenant logic.
*   No external integrations (CRM, email, calendar).
*   Starter kit configuration (CodeGuide Fullstack) drives project structure.
*   Users have modern browsers; legacy IE support not required.

## 8. Known Issues & Potential Pitfalls

*   **AI Hallucinations**\
    – Mitigation: always confirm key fields before persisting; validate email format.
*   **API Rate Limits**\
    – Mitigation: batch calls or implement retry/back-off logic.
*   **Excel Generation Load**\
    – For large lead sets, stream rows instead of in-memory build.
*   **Mobile Performance**\
    – Charting libraries can be heavy; use lightweight, canvas-based charts.
*   **Database Concurrency**\
    – Locking on updates if two chat commands reference the same lead; handle version conflicts gracefully.

*This PRD provides a complete, unambiguous blueprint for the AI model and any subsequent technical documents. All core features, flows, and constraints are defined so you can directly generate architecture designs, frontend guidelines, and backend structures without further clarification.*


---
**Document Details**
- **Project ID**: 035d385e-0595-41b5-ab10-8b244d5ee4d3
- **Document ID**: 04a2394f-7109-41aa-b5f4-73ccd9b49dd9
- **Type**: custom
- **Custom Type**: project_requirements_document
- **Status**: completed
- **Generated On**: 2025-10-05T12:56:59.018Z
- **Last Updated**: 2025-10-07T11:47:09.705Z
