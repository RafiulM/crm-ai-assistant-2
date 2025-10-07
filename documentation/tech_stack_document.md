# Tech Stack Document

# Tech Stack Document

This document explains the technology choices for the CRM AI Assistant project in plain, everyday language. You don’t need a technical background to understand why each piece was picked and how they all work together.

## 1. Frontend Technologies

We built the user-facing side of the app (what you see and click on) using these main tools:

- **Next.js**  
  A modern web framework that makes building pages and handling data easy. It gives us fast page loads, automatic code splitting (only sending users the code they need), and built-in support for both server-rendered and client-rendered pages.

- **TypeScript**  
  A version of JavaScript with extra checks. It helps catch mistakes early by verifying that data types (like text or numbers) match what the code expects.

- **Tailwind CSS**  
  A styling toolkit that provides ready-made CSS classes so we can style buttons, forms, and layouts quickly. Using Tailwind keeps our styles consistent and easy to update—our primary color (teal) is defined just once and used everywhere.

- **Shadcn UI**  
  A collection of prebuilt components (buttons, modals, tables, charts) that look great out of the box and follow accessibility best practices. This speeds up development and ensures a uniform look and feel.

- **Chart Components (built on Chart.js)**  
  We use interactive chart components to display metrics like new leads today or pipeline breakdown. These are wrapped in Shadcn UI for styling consistency.

- **ExcelJS**  
  A JavaScript library that runs in the browser and on the server to generate Excel files. This powers the one-click report export feature, creating a downloadable .xlsx file on demand.

## 2. Backend Technologies

Behind the scenes, our server handles data storage, AI calls, and report generation:

- **Next.js API Routes**  
  Part of the same Next.js project, these are simple file-based endpoints (URLs) that run server code. When the chat interface asks to add or update a lead, it calls one of these routes.

- **Drizzle ORM**  
  A friendly way to interact with our database without writing raw SQL. It turns database tables into TypeScript objects, making queries safer and clearer.

- **PostgreSQL**  
  A reliable open-source relational database that stores all lead details (name, email, company, stage, notes, timestamps). It runs in a Docker container locally and can run in a managed service in production.

- **OpenAI GPT-5 API**  
  The engine behind our AI assistant. When you type a message in the chat, our backend sends it to OpenAI’s GPT-5 service, receives a response, then carries out any “tool calls” (like saving or updating leads).

- **better-auth**  
  A lightweight authentication solution that handles user sign-up, sign-in, and session management. Since everyone has the same single role, it keeps the flow simple.

## 3. Infrastructure and Deployment

To keep development smooth and ensure reliable deployment:

- **Docker & Docker Compose**  
  We containerize the database (PostgreSQL) and can containerize the entire app if needed. Docker Compose simplifies starting all parts (app + database) locally with one command.

- **Version Control (Git + GitHub)**  
  All code lives in a GitHub repository. Every change is tracked, reviewed via pull requests, and easy to roll back if needed.

- **CI/CD (GitHub Actions)**  
  On every push to main, tests can run automatically and, if they pass, the app can deploy to production. This keeps deployments consistent and error-free.

- **Hosting (Vercel)**  
  We host the Next.js frontend and API routes on Vercel, a platform designed specifically for Next.js. It offers automatic scaling, global edge caching, and zero-configuration deployments.

## 4. Third-Party Integrations

We keep external dependencies minimal:

- **OpenAI**  
  For all AI-powered chat and lead-processing intelligence.

- **ExcelJS**  
  For generating on-demand Excel reports in the browser or server.

No other CRMs, email services, or payment processors are connected to keep the application focused and secure.

## 5. Security and Performance Considerations

Security Measures:

- **Authentication** via better-auth with secure cookies or tokens.  
- **Environment Variables** store sensitive keys (OpenAI key, database URL) outside of code.  
- **Database Encryption** is enabled by default in PostgreSQL if you choose a managed service—keeping data at rest safe.

Performance Optimizations:

- **Next.js Code-Splitting** ensures each page only loads the JavaScript and CSS it needs.  
- **Server-Side Rendering & Static Generation** for fast first paint and SEO benefits.  
- **Tailwind’s Purge** feature removes unused CSS, keeping files small.  
- **API Route Caching** (where applicable) to avoid repeated database calls for static data.

## 6. Conclusion and Overall Tech Stack Summary

Our CRM AI Assistant uses a modern, widely adopted set of tools:

- Frontend: Next.js, TypeScript, Tailwind CSS, Shadcn UI, Chart.js, ExcelJS
- Backend: Next.js API routes, Drizzle ORM, PostgreSQL, OpenAI GPT-5, better-auth
- Infrastructure: Docker Compose (local), GitHub + GitHub Actions, Vercel deployment

This stack was chosen to deliver a fast, responsive, mobile-friendly experience with minimal overhead. The AI chat interface powered by GPT-5 simplifies lead management, the dashboard offers real-time insights, and one-click exports ensure you always have your data at hand. Everything is built to scale seamlessly as your needs grow, while keeping the setup and ongoing maintenance straightforward.

---
**Document Details**
- **Project ID**: 035d385e-0595-41b5-ab10-8b244d5ee4d3
- **Document ID**: 8d58b1a1-92b7-4d67-a3b8-82209bab1906
- **Type**: custom
- **Custom Type**: tech_stack_document
- **Status**: completed
- **Generated On**: 2025-10-05T12:58:41.305Z
- **Last Updated**: 2025-10-07T11:47:05.260Z
