# Backend Structure Document

# Backend Structure Document

This document outlines the backend setup for the CRM AI Assistant. It covers the architecture, database, APIs, hosting, infrastructure, security, monitoring, and maintenance. It’s written in everyday language so anyone can understand how the backend works.

## 1. Backend Architecture

### Overall Design
- We’re using Next.js API routes as our backend framework. This means our server code lives alongside our frontend in the same project.
- We follow a **modular** pattern:
  - Each feature (leads, dashboard, export, auth) lives in its own folder under `/pages/api/`.
  - Shared utilities (database connection, OpenAI client, auth helpers) live in a `lib/` folder.
- We use **Drizzle ORM** to talk to our database in a type-safe way. No raw SQL scattered around.

### Scalability, Maintainability, Performance
- **Scalability:** Serverless functions on Vercel (or your cloud of choice) auto-scale based on traffic. Database can be scaled vertically (bigger machine) or horizontally (read replicas).
- **Maintainability:** Clear folder structure, typed code with TypeScript, and Drizzle migrations keep things consistent and easy to update.
- **Performance:** Cold starts are minimized by keeping functions small. Database queries use indexes on key columns. Static assets and API routes are served from a global CDN.

## 2. Database Management

### Technology
- Type: SQL
- System: PostgreSQL (running in Docker for local dev, managed Postgres in production)
- ORM: Drizzle ORM for queries, migrations, and type safety

### Data Practices
- **Migrations:** We use Drizzle’s migration tool to evolve the schema safely.
- **Connection Pooling:** We configure connection pools (e.g., 5–10 connections) to avoid overload.
- **Backups:** Automated daily backups in production.
- **Encryption:** Data is encrypted at rest by the managed DB provider and in transit via TLS.

## 3. Database Schema

Below is the human-readable schema; SQL is provided for PostgreSQL.

Tables:
- **users**: Stores salesperson account info
- **leads**: Stores lead details
- **sessions**: (Optional) If using NextAuth/Better-Auth’s built-in session table

### users table (PostgreSQL SQL)
```
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### leads table (PostgreSQL SQL)
```
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  stage TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### sessions table (if applicable)
```
-- Provided by NextAuth or Better-Auth, holds session tokens
``` 

## 4. API Design and Endpoints

We follow a RESTful style. All endpoints live under `/pages/api/` in Next.js.

### Authentication
- `POST /api/auth/login` — User logs in with email/password, returns session token.
- `POST /api/auth/logout` — Invalidates the session.
- `GET /api/auth/session` — Returns current session/user info.

### Leads Management
- `GET /api/leads` — List all leads (with optional filters: stage, date).
- `POST /api/leads` — Create a new lead.
- `GET /api/leads/[id]` — Get details of one lead.
- `PUT /api/leads/[id]` — Update name, email, company, stage, notes.
- `DELETE /api/leads/[id]` — Remove a lead.

### Dashboard
- `GET /api/dashboard` — Returns metrics:
  - New leads today
  - Conversion rate (e.g., closed deals ÷ total leads)
  - Pipeline status (count per stage)

### Export
- `GET /api/leads/export` — Triggers an on-demand Excel export (columns: name, email, company, stage, notes). Uses ExcelJS under the hood and returns a downloadable file.

### AI Integration
- `POST /api/openai/chat` — Proxy to OpenAI GPT-5 API. Handles conversational prompts, lead updates via chat interface.

## 5. Hosting Solutions

### Production Environment
- **Vercel** for frontend and API routes:
  - Built-in CDN for static assets.
  - Serverless functions for API auto-scale.
  - Easy env var management.
- **Managed PostgreSQL** (e.g., AWS RDS, Neon, Heroku Postgres):
  - Automated backups and updates.
  - Encryption at rest.

### Local Development
- **Docker Compose** sets up:
  - `postgres` container
  - (Optional) `redis` container if caching is added in the future
  - Next.js app running on port 3000

## 6. Infrastructure Components

### Load Balancer & CDN
- Vercel automatically sits behind a global CDN and load balancer.

### Caching
- Optional future enhancement: Redis for caching dashboard results or rate-limiting data.

### Content Delivery
- Static assets and built pages served by Vercel’s CDN, ensuring fast load times worldwide.

## 7. Security Measures

### Authentication & Authorization
- **Better-Auth (or NextAuth):** Manages sign-in, sessions, and token storage.
- Single user role—no complex permission layers needed.

### Data Protection
- **TLS/HTTPS** enforced for all requests (Vercel provides HTTPS by default).
- **ORM parameterization** prevents SQL injection.
- **Environment Variables:** Secrets (DB URL, JWT secret, OpenAI key) stored outside code.
- **Encryption at Rest:** Enabled by managed DB.

### Additional Practices
- Rate limiting on AI chat endpoints to prevent abuse.
- Use security headers (e.g., Content Security Policy) via Next.js custom server or middleware.

## 8. Monitoring and Maintenance

### Monitoring
- **Vercel Analytics:** Tracks serverless function performance and errors.
- **Error Tracking:** Integrate Sentry or LogRocket for runtime errors.
- **Database Metrics:** Use RDS/Neon dashboards or pgAdmin stats for connection counts, slow queries.

### Maintenance
- **Dependency Updates:** Run `npm audit` and keep packages up to date.
- **Schema Migrations:** Use Drizzle migrations on deploy.
- **Backups:** Automated daily DB backups. Test restore quarterly.
- **Health Checks:** Schedule a cron job to ping `/api/health` endpoint.

## 9. Conclusion and Overall Backend Summary

This backend setup leverages Next.js API routes, Drizzle ORM, and PostgreSQL to deliver a scalable, maintainable, and secure AI-powered CRM assistant. Serverless hosting on Vercel ensures reliability and cost-effectiveness, while clear API design and robust security practices protect user data. With this structure, your salespeople have a responsive chat interface for lead management, a real-time dashboard, and on-demand reporting—fueling smarter decisions and faster follow-ups.

**Unique Highlights:**
- Unified codebase for frontend and backend via Next.js.
- Type-safe database layer with Drizzle.
- Seamless AI integration via OpenAI GPT-5.
- On-demand Excel export using ExcelJS.
- Effortless scaling on Vercel with zero-config CDN and auto-scaling serverless functions.

---
**Document Details**
- **Project ID**: 035d385e-0595-41b5-ab10-8b244d5ee4d3
- **Document ID**: 92b77182-96c1-4c08-b96b-731eee13ee82
- **Type**: custom
- **Custom Type**: backend_structure_document
- **Status**: completed
- **Generated On**: 2025-10-05T12:59:16.471Z
- **Last Updated**: 2025-10-07T11:47:05.260Z
