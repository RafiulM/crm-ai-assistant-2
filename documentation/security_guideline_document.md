# Security Guideline Document

# Implementation Plan for AI-Powered CRM Assistant

This step-by-step guide outlines phases, tasks, and security best practices to build a mobile-friendly, teal-branded CRM assistant using Next.js, Drizzle ORM, PostgreSQL, OpenAI GPT-5, and Better-Auth.

---

## 1. Project Initialization & Environment Setup

- **Bootstrap Repository**
  - Clone CodeGuide Starter Fullstack.
  - Initialize Git repository; configure `.gitignore`.
- **Environment Configuration**
  - Create `.env.example` with placeholders: `DATABASE_URL`, `OPENAI_API_KEY`, `NEXTAUTH_SECRET`, etc.
  - Store secrets securely (e.g., GitHub Actions Secrets, AWS Parameter Store).
  - Enforce TLS in development with local certs or tools like mkcert.
- **Dependencies & Lockfiles**
  - Install required packages: `next`, `react`, `drizzle-orm`, `better-auth`, `tailwindcss`, `shadcn-ui`, `chart.js`, `exceljs`, etc.
  - Commit lockfile (`package-lock.json` or `yarn.lock`).
- **Security Baseline**
  - Integrate SCA tool (e.g., Dependabot) to flag vulnerable dependencies.
  - Set up ESLint/Prettier and a security linting plugin (e.g., eslint-plugin-security).

---

## 2. Database & ORM Configuration

- **PostgreSQL Setup**
  - Use Docker Compose for local dev; enable at-rest encryption if supported.
  - Create a dedicated DB user with minimal privileges (least privilege).
- **Drizzle ORM Integration**
  - Define `Lead` schema: `id`, `name`, `email`, `company`, `stage`, `notes`, `created_at`, `updated_at`.
  - Use parameterized queries to prevent SQL injection (Drizzle does this by default).
- **Migrations & Seeding**
  - Configure migration scripts; store migration history securely.
  - Seed minimal data for local testing; scrub any PII.

---

## 3. Authentication & Access Control

- **Better-Auth Integration**
  - Configure email/password provider.
  - Enforce strong password policy (min length, complexity).
  - Hash passwords with bcrypt/Argon2 plus unique salts.
- **Session Management**
  - Use secure, HttpOnly, SameSite=strict cookies.
  - Set idle and absolute session timeouts.
  - Provide logout endpoint to invalidate sessions.
- **Single-Role Model**
  - All authenticated users share the same role; no admin API exposed.
  - Secure every API route with server-side auth guard.

---

## 4. AI-Powered Chat Interface

- **OpenAI GPT-5 Wrapper**
  - Build a Next.js API route `/api/ai/chat`.
  - Validate and sanitize user prompts; enforce length limits.
  - Forward requests to OpenAI with the server’s API key (never expose on client).
  - Implement rate limiting and throttling via middleware (e.g., `express-rate-limit`).
- **Follow-Up Question Logic**
  - In the backend, inspect GPT-5 responses; if required fields missing, prompt for them iteratively.
  - Persist partial leads in a “draft” state until all required fields are present.

---

## 5. Lead Management API Endpoints

- **CRUD Routes** (`/api/leads`)
  - GET `/api/leads`: list leads (with pagination).
  - POST `/api/leads`: create lead.
  - PUT `/api/leads/[id]`: update lead (status/stage).
  - DELETE `/api/leads/[id]`: delete (soft-delete preferred).
- **Input Validation**
  - Server-side validation using a schema library (Zod/Yup).
  - Sanitize all text inputs (to prevent XSS in case notes).
- **Authorization Checks**
  - Ensure only authenticated users can call these routes.

---

## 6. Dashboard & Data Visualization

- **Data Aggregation APIs**
  - `/api/metrics/new-leads-today`.
  - `/api/metrics/conversion-rate`.
  - `/api/metrics/pipeline-distribution`.
- **Frontend Components**
  - Use Chart.js or Recharts with Shadcn UI wrappers.
  - Lazy-load charts for performance.
- **Security Headers**
  - Add `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` in Next.js `headers()` config.

---

## 7. Excel Export Feature

- **API Endpoint**: `/api/leads/export` (GET)
  - Authenticate request; enforce rate limits.
  - Query all leads; sanitize data.
  - Generate workbook with ExcelJS; set proper column types and widths.
  - Stream file as `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
- **Client Trigger**
  - Button in UI calls the export API; handle errors gracefully.
  - Show progress indicator for large datasets.

---

## 8. UI & Styling

- **Tailwind CSS & Shadcn UI**
  - Configure Tailwind theme to use teal as primary color.
  - Build mobile-first layouts; use responsive utilities.
  - Implement collapsible sidebar with Shadcn components.
- **Accessibility**
  - Ensure proper ARIA attributes on interactive elements.
  - Test keyboard navigation and screen-reader compatibility.

---

## 9. Security Hardening & Testing

- **Static & Dynamic Scanning**
  - Integrate SAST (e.g., ESLint security plugin) and DAST (e.g., OWASP ZAP).
- **Penetration Testing**
  - Verify endpoints for injection, XSS, CSRF (use CSRF tokens on state-changing POST/PUT/DELETE).
  - Confirm cookies use `Secure`, `HttpOnly`, `SameSite`.
- **Load Testing & Rate-Limiting**
  - Simulate concurrent users; enforce API rate limits.
- **Secret Scanning**
  - Add pre-commit hook to detect accidental secrets in code.

---

## 10. CI/CD & Deployment

- **Continuous Integration**
  - Run linting, type-checks, tests, and security scans on each PR.
- **Continuous Deployment**
  - Deploy to a staging environment; run smoke tests.
  - Use GitHub Actions (or equivalent) with environment secrets.
- **Infrastructure as Code**
  - (Optional) Define Docker Compose for staging/production or Terraform for cloud resources.
- **Production Hardening**
  - Disable debug logs and stack traces.
  - Enforce TLS 1.2+; disable weak ciphers.

---

## 11. Monitoring, Logging & Maintenance

- **Observability**
  - Integrate logging (structured JSON logs) and metrics (Prometheus/Grafana).
  - Mask PII in logs; scrub sensitive fields.
- **Alerts**
  - Configure alerts for error rates, high latency, and failed exports.
- **Dependency Updates**
  - Schedule regular dependency review and upgrades.
- **Incident Response**
  - Define rollback and database restoration procedures.
  - Document security incident playbook.

---

**By following this plan and embedding security controls at every layer, you’ll deliver a robust, compliant, and user-friendly CRM AI assistant.**

---
**Document Details**
- **Project ID**: 035d385e-0595-41b5-ab10-8b244d5ee4d3
- **Document ID**: 49aa40bc-cb9d-41cb-9c12-312ef3d2484c
- **Type**: custom
- **Custom Type**: security_guideline_document
- **Status**: completed
- **Generated On**: 2025-10-05T12:59:10.431Z
- **Last Updated**: 2025-10-07T11:47:05.260Z
