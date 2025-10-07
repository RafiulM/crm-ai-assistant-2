# Frontend Guidelines Document

# Frontend Guideline Document

This document outlines the frontend setup for our CRM AI Assistant. It’s written in everyday language so anyone can understand how we build, style, and maintain the user interface.

## 1. Frontend Architecture

### Frameworks and Libraries
- **Next.js**: Our React framework of choice. It gives us file-based routing, server-side rendering (SSR), and API routes all in one.
- **React + TypeScript**: We use React for building UI components and TypeScript for type safety.
- **Tailwind CSS**: Utility-first CSS framework that lets us style directly in our markup.
- **Shadcn UI**: A library of pre-built, accessible components styled with Tailwind.
- **SWR**: A React hook library for data fetching and caching.

### Scalability, Maintainability, Performance
- **Scalability**: File-based routing in Next.js keeps pages organized. Modular components ensure we can add new features without rewriting existing code.
- **Maintainability**: TypeScript catches errors early. Tailwind utility classes and Shadcn UI keep styling consistent across the codebase.
- **Performance**: Next.js SSR and static generation speed up page loads. SWR caches responses, reducing unnecessary network calls.

## 2. Design Principles

We follow these key principles to ensure a quality user experience:

- **Usability**: Simple, clear flows. Chat interface for fast lead entry; dashboard widgets easy to read at a glance.
- **Accessibility**: Shadcn UI components are WCAG-compliant. We use semantic HTML, proper labels, and keyboard support.
- **Responsiveness**: Mobile-first layout. All pages adapt seamlessly from small phones to large desktops.
- **Clarity**: Clean typography and consistent spacing make content easy to scan.

**How They’re Applied:**
- Form fields have clear placeholders and labels.
- Color contrasts meet accessibility guidelines.
- Buttons and interactive elements have visible focus states.
- Dashboard charts use concise legends and tooltips.

## 3. Styling and Theming

### Styling Approach
- **Utility-First**: We use Tailwind CSS classes directly in JSX. This avoids large, hard-to-maintain stylesheets.
- **Component Styles**: For any custom CSS, we scope it using the Tailwind `@apply` directive in `.css` files.

### Theming
- **Design Style**: Modern flat design with subtle shadows. We avoid heavy skeuomorphism; our look is clean and minimal.
- **Primary Color**: Teal

### Color Palette
- Primary Teal: `#14B8A6`
- Teal Dark: `#0F766E`
- Neutral Light: `#F3F4F6`
- Neutral Dark: `#374151`
- Success Green: `#10B981`
- Warning Amber: `#F59E0B`
- Error Red: `#EF4444`

### Typography
- **Font Family**: Inter, sans-serif
- **Base Sizes**:
  - Body text: 16px
  - Headings: 24px (h1), 20px (h2), 18px (h3)
- We load Inter via Google Fonts in `_app.tsx`.

## 4. Component Structure

### Organization
- **/components**: Reusable UI elements (buttons, inputs, cards).
- **/components/chat**: Chat-specific parts (message bubbles, input bar).
- **/components/dashboard**: Dashboard widgets (charts, stats cards).
- **/pages**: Page-level components (`/login`, `/chat`, `/dashboard`).
- **/layouts**: Wrappers like `AuthLayout` and `MainLayout`.

### Reuse and Modularity
- Each component does one thing (e.g., `ChatMessage` renders a single message).
- Shared logic lives in hooks (`useChat`, `useLeads`).
- Styles are applied via Tailwind and Shadcn UI variants.

### Benefits of Component-Based Architecture
- **Maintainability**: Fix or update one component, and every instance updates automatically.
- **Testability**: Small, isolated components are easier to unit-test.
- **Reusability**: Components can be dropped into new pages or features.

## 5. State Management

### Approach and Tools
- **Local State**: React `useState` for UI-specific toggles and form inputs.
- **Global State / Data Fetching**: SWR for remote data (leads list, dashboard stats).
- **Context API**: For high-level state like theme settings or user session.

### Flow of Data
1. **Fetch** leads and stats with SWR in page components.
2. SWR provides `data`, `error`, `isLoading` to components.
3. **Chat messages**: Stored in local state until sent, then POSTed to our Next.js API.
4. Page components pass data down as props to child components.

## 6. Routing and Navigation

- **File-Based Routing**: Next.js automatically maps `/pages/chat.tsx` to `/chat`, etc.
- **Protected Routes**: We wrap pages in `AuthLayout` to check user session (using NextAuth or better-auth).
- **Navigation Flow**:
  1. **/login** – email sign-in.
  2. **/chat** – main AI chat interface for lead management.
  3. **/dashboard** – visual overview of leads.

- **Linking**: We use `next/link` for client-side navigation.

## 7. Performance Optimization

### Techniques
- **Code Splitting**: Next.js auto-splits pages. We use dynamic `import()` for heavy components (e.g., chart library).
- **Lazy Loading**: Chat history and dashboard charts load only when in view.
- **Asset Optimization**: Next.js `Image` component for optimized images. Tailwind’s JIT mode removes unused CSS.
- **Caching**: SWR caches API responses. We set reasonable `revalidateOnFocus` and `refreshInterval` values.

### Impact
All these reduce initial load time, improve perceived speed, and keep the interface snappy.

## 8. Testing and Quality Assurance

### Testing Strategies
- **Unit Tests**: Jest + React Testing Library for individual components.
- **Integration Tests**: Test pages and data flows (e.g., chat message lifecycle).
- **End-to-End (E2E) Tests**: Cypress to simulate user actions (sign-in, chat, dashboard export).

### Tools
- **Jest**: Fast unit testing.
- **React Testing Library**: Encourages testing via the UI.
- **Cypress**: Full-browser E2E tests, including Excel export flow.
- **ESLint + Prettier**: Enforce code style and catch common errors.

## 9. Conclusion and Overall Frontend Summary

Our frontend stack centers on Next.js, React, and Tailwind CSS, complemented by Shadcn UI for accessible components. We’ve prioritized mobile-first design, accessibility, and performance at every step. The modular, component-based architecture ensures that adding or changing features—like new dashboard widgets or chat enhancements—is straightforward.

By following these guidelines, the team can build a consistent, maintainable, and high-performance CRM AI assistant that meets our users’ needs: seamless lead management via chat, easy-to-read dashboards, and quick exports.

Happy coding!

---
**Document Details**
- **Project ID**: 035d385e-0595-41b5-ab10-8b244d5ee4d3
- **Document ID**: 4b1c00d8-6a38-4359-b102-21db61af0bec
- **Type**: custom
- **Custom Type**: frontend_guidelines_document
- **Status**: completed
- **Generated On**: 2025-10-05T12:59:07.186Z
- **Last Updated**: 2025-10-07T11:47:05.260Z
