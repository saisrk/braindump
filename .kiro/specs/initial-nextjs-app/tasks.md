# Implementation Plan: Initial Next.js App (Braindump)

## Overview

This plan establishes the foundational scaffold for the Braindump application. Tasks are ordered by dependency — project initialization first, then configuration, data layer, auth, UI components, layouts, pages, and finally documentation. Each task is independently verifiable and builds on previous steps.

## Tasks

- [x] 1. Initialize Next.js project and install dependencies
  - Run `npx create-next-app@latest` with App Router, TypeScript, Tailwind CSS, ESLint, and `src` directory disabled (files at root)
  - Install runtime dependencies: `@supabase/ssr`, `@supabase/supabase-js`, `drizzle-orm`, `postgres`
  - Install dev dependencies: `drizzle-kit`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `prettier`, `class-variance-authority`
  - Configure `.prettierrc` with consistent formatting rules (semi, singleQuote, trailingComma, tabWidth)
  - Update `.eslintrc.json` to extend Next.js recommended config
  - Verify the project builds with `next build`
  - _Requirements: 1.1, 1.3_

- [x] 2. Environment configuration and validation
  - [x] 2.1 Create `.env.example` with all required variables
    - Include `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`
    - Add comments explaining each variable and local development defaults
    - _Requirements: 6.1, 8.1_

  - [x] 2.2 Implement environment variable validation (`lib/env.ts`)
    - Create `requireEnv()` helper that throws descriptive errors for missing variables
    - Export typed `env` object with all required variables
    - Ensure the module fails fast at import time if variables are missing
    - _Requirements: 6.4_

- [x] 3. Tailwind CSS custom theme and design tokens
  - Update `tailwind.config.ts` with custom `brand` color palette (50–900), `surface` colors (light/dark), and `text` colors
  - Add custom font families (`Inter` for sans, `JetBrains Mono` for mono)
  - Configure `darkMode: 'class'` strategy
  - Add custom spacing values (`18`, `88`)
  - Set content paths to `./app/**/*.{ts,tsx}` and `./components/**/*.{ts,tsx}`
  - Update `app/globals.css` with Tailwind directives and any base styles
  - _Requirements: 7.1, 7.3, 7.4_

- [x] 4. Docker Compose and Drizzle ORM setup
  - [x] 4.1 Create `docker-compose.yml` for local PostgreSQL
    - Use `postgres:16` image with user/password/db set to `postgres`/`postgres`/`braindump`
    - Map port 5432 and configure a named volume for data persistence
    - _Requirements: 8.3_

  - [x] 4.2 Create Drizzle configuration (`drizzle.config.ts`)
    - Point schema to `./db/schema/index.ts`
    - Set output directory to `./db/migrations`
    - Configure PostgreSQL dialect with `DATABASE_URL` from env
    - _Requirements: 4.1_

  - [x] 4.3 Define database schema files
    - Create `db/schema/users.ts` — users table with id (uuid PK), goals, preferences, streakTarget, timestamps
    - Create `db/schema/learnings.ts` — learnings table with FK to users
    - Create `db/schema/teach-backs.ts` — teach_backs table with FK to learnings
    - Create `db/schema/review-items.ts` — review_items table with FK to learnings
    - Create `db/schema/daily-logs.ts` — daily_logs table with FK to users and unique constraint on (user_id, date)
    - Create `db/schema/streaks.ts` — streaks table with user_id as PK and FK to users
    - Create `db/schema/index.ts` — re-export all tables
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 4.4 Create Drizzle client instance (`db/index.ts`)
    - Import `postgres` driver and `drizzle` from `drizzle-orm/postgres-js`
    - Import schema and env, create and export the `db` instance
    - _Requirements: 4.1_

  - [x] 4.5 Generate and verify initial migration
    - Run `npx drizzle-kit generate` to produce the initial migration SQL
    - Verify migration files are created in `db/migrations/`
    - Add `db:generate`, `db:migrate`, and `db:studio` scripts to `package.json`
    - _Requirements: 4.7, 4.8_

- [x] 5. Checkpoint — Verify database setup
  - Start local PostgreSQL with `docker compose up -d`
  - Run `npx drizzle-kit migrate` to apply migrations
  - Verify tables are created correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Supabase Auth client setup
  - [x] 6.1 Create browser Supabase client (`lib/supabase/client.ts`)
    - Use `createBrowserClient` from `@supabase/ssr`
    - Import env variables for URL and anon key
    - Export a `createClient()` function
    - _Requirements: 6.1, 6.2_

  - [x] 6.2 Create server Supabase client (`lib/supabase/server.ts`)
    - Use `createServerClient` from `@supabase/ssr`
    - Read/write cookies via `next/headers` cookies API
    - Export an async `createClient()` function
    - _Requirements: 6.2_

  - [x] 6.3 Create middleware helper (`lib/supabase/middleware.ts`)
    - Implement `updateSession(request)` that creates a server client, calls `getUser()`, and handles cookie refresh
    - Redirect unauthenticated users to `/login` (except for `/login`, `/signup`, `/auth` paths)
    - _Requirements: 3.2, 3.5_

  - [x] 6.4 Create Next.js middleware (`middleware.ts`)
    - Import and call `updateSession` from the middleware helper
    - Configure `matcher` to run on appropriate routes (exclude static files, API routes, auth callback)
    - _Requirements: 3.2_

- [x] 7. Base UI components
  - [x] 7.1 Create Button component (`components/ui/button.tsx`)
    - Implement variants: primary, secondary, ghost
    - Implement sizes: sm, md, lg
    - Support disabled state and loading indicator
    - Accept `className` prop for composition
    - Use `cva` or conditional classes for variant styling
    - _Requirements: 7.2_

  - [x] 7.2 Create Card component (`components/ui/card.tsx`)
    - Implement variants: default, elevated
    - Include border, rounded corners, and padding
    - Support dark mode styling
    - Accept `className` prop and `children`
    - _Requirements: 7.2_

  - [x] 7.3 Create Input component (`components/ui/input.tsx`)
    - Support label, error state, and helper text
    - Support all standard HTML input types
    - Include proper accessibility attributes (id, aria-describedby, aria-invalid)
    - Forward ref for form library compatibility
    - _Requirements: 7.2_

  - [x] 7.4 Create PageHeader component (`components/ui/page-header.tsx`)
    - Accept title (required), subtitle (optional), and action slot (optional)
    - Render with consistent spacing and typography
    - _Requirements: 7.2_

- [x] 8. Layout and navigation components
  - [x] 8.1 Create NavLink component (`components/navigation/nav-link.tsx`)
    - Client component using `usePathname` for active state detection
    - Accept `href`, `label`, and optional `icon` props
    - Apply active styling when pathname matches href
    - _Requirements: 2.3_

  - [x] 8.2 Create Sidebar component (`components/navigation/sidebar.tsx`)
    - Render vertical navigation with links to Home, Capture, Library, Review, Express, Settings
    - Include sign-out button at the bottom
    - Hidden on mobile via Tailwind responsive classes (`hidden md:flex`)
    - _Requirements: 2.1, 2.2_

  - [x] 8.3 Create BottomNav component (`components/navigation/bottom-nav.tsx`)
    - Render horizontal bottom navigation bar for mobile
    - Include same navigation links as Sidebar
    - Hidden on desktop via Tailwind responsive classes (`flex md:hidden`)
    - _Requirements: 2.1, 2.4_

  - [x] 8.4 Create Root Layout (`app/layout.tsx`)
    - Server component setting up `<html>` with `lang` and dark mode class, `<body>` with global font
    - Import global CSS
    - Add dark mode initialization script in `<head>` to prevent flash
    - _Requirements: 1.4, 7.3_

  - [x] 8.5 Create Auth Layout (`app/(auth)/layout.tsx`)
    - Server component with centered layout, no navigation
    - Minimal styling for login/signup pages
    - _Requirements: 1.4_

  - [x] 8.6 Create App Layout (`app/(app)/layout.tsx`)
    - Server component that checks user session via server Supabase client
    - Redirect to `/login` if no session
    - Render Sidebar, BottomNav, and main content area
    - _Requirements: 2.1, 2.4, 3.2_

- [x] 9. Authentication pages
  - [x] 9.1 Create Login form component (`components/auth/login-form.tsx`)
    - Client component with email and password fields
    - Call `supabase.auth.signInWithPassword()` on submit
    - Display inline error messages on failure
    - Redirect to `/home` on success with `router.push` and `router.refresh()`
    - Include link to signup page
    - _Requirements: 3.1, 3.3, 3.6_

  - [x] 9.2 Create Signup form component (`components/auth/signup-form.tsx`)
    - Client component with email, password, and confirm password fields
    - Call `supabase.auth.signUp()` on submit
    - Display inline error messages on failure
    - Show success message or redirect on successful signup
    - Include link to login page
    - _Requirements: 3.1, 3.6_

  - [x] 9.3 Create Login page (`app/(auth)/login/page.tsx`)
    - Server component rendering LoginForm
    - Include app branding/title
    - _Requirements: 3.1_

  - [x] 9.4 Create Signup page (`app/(auth)/signup/page.tsx`)
    - Server component rendering SignupForm
    - Include app branding/title
    - _Requirements: 3.1_

  - [x] 9.5 Create OAuth callback route (`app/auth/callback/route.ts`)
    - Handle the auth callback by exchanging code for session
    - Redirect to `/home` on success
    - _Requirements: 3.5_

  - [x] 9.6 Implement sign-out functionality
    - Create a sign-out server action or client handler
    - Call `supabase.auth.signOut()` and redirect to `/login`
    - Wire into the Sidebar sign-out button
    - _Requirements: 3.4_

- [x] 10. Page shells
  - [x] 10.1 Create Home page shell (`app/(app)/home/page.tsx`)
    - Render PageHeader with title "Home"
    - Include placeholder layout zones (cards) for: quick capture button, due reviews count, streak display, daily summary
    - _Requirements: 5.1_

  - [x] 10.2 Create Capture page shell (`app/(app)/capture/page.tsx`)
    - Render PageHeader with title "Capture"
    - Include placeholder card for capture wizard area
    - _Requirements: 5.2_

  - [x] 10.3 Create Library page shell (`app/(app)/library/page.tsx`)
    - Render PageHeader with title "Library"
    - Include placeholder card for searchable learnings list
    - _Requirements: 5.3_

  - [x] 10.4 Create Review page shell (`app/(app)/review/page.tsx`)
    - Render PageHeader with title "Review"
    - Include placeholder card for spaced-repetition session area
    - _Requirements: 5.4_

  - [x] 10.5 Create Express page shell (`app/(app)/express/page.tsx`)
    - Render PageHeader with title "Express"
    - Include placeholder card for interview/profile generation area
    - _Requirements: 5.5_

  - [x] 10.6 Create Settings page shell (`app/(app)/settings/page.tsx`)
    - Render PageHeader with title "Settings"
    - Include placeholder card for user preferences area
    - _Requirements: 5.6_

- [x] 11. Root page and shared types
  - Create `app/page.tsx` that redirects to `/home` (authenticated) or `/login` (unauthenticated)
  - Create `types/index.ts` with shared application types (navigation items, page metadata)
  - _Requirements: 3.2, 3.3, 1.4_

- [x] 12. Checkpoint — Full build and route verification
  - Run `next build` and verify zero errors
  - Verify all defined routes resolve without 404
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. README and documentation
  - Update `README.md` with:
    - Project description and tech stack overview
    - Prerequisites (Node.js, Docker, pnpm/npm)
    - Setup instructions (clone, install, env setup, Docker, migrations)
    - Available scripts (`dev`, `build`, `lint`, `type-check`, `db:generate`, `db:migrate`, `db:studio`)
    - Project structure overview
  - _Requirements: 8.2, 8.3_

- [x] 14. Final checkpoint — End-to-end verification
  - Ensure `next build` succeeds
  - Ensure `next lint` passes
  - Ensure TypeScript compilation has no errors (`tsc --noEmit`)
  - Verify Docker + migrations workflow works from scratch
  - Ensure all tests pass, ask the user if questions arise.

## Task Dependency Graph

```json
{
  "waves": [
    {
      "name": "Wave 1 - Project Foundation",
      "tasks": ["1"],
      "description": "Initialize Next.js project and install all dependencies"
    },
    {
      "name": "Wave 2 - Configuration",
      "tasks": ["2", "3"],
      "description": "Environment validation and Tailwind theme setup (both depend on project init)"
    },
    {
      "name": "Wave 3 - Data Layer",
      "tasks": ["4"],
      "description": "Docker, Drizzle ORM schema, and migrations (depends on env config)"
    },
    {
      "name": "Wave 4 - Data Checkpoint",
      "tasks": ["5"],
      "description": "Verify database setup works end-to-end"
    },
    {
      "name": "Wave 5 - Auth & UI Components",
      "tasks": ["6", "7"],
      "description": "Supabase auth clients and base UI components (parallel work)"
    },
    {
      "name": "Wave 6 - Layout & Navigation",
      "tasks": ["8"],
      "description": "App layouts and navigation components (depends on auth client + UI components)"
    },
    {
      "name": "Wave 7 - Auth Pages & Page Shells",
      "tasks": ["9", "10"],
      "description": "Authentication pages and placeholder page shells (depend on layout)"
    },
    {
      "name": "Wave 8 - Integration",
      "tasks": ["11"],
      "description": "Root page routing and shared types (depends on auth + page shells)"
    },
    {
      "name": "Wave 9 - Verification",
      "tasks": ["12"],
      "description": "Full build and route verification checkpoint"
    },
    {
      "name": "Wave 10 - Documentation",
      "tasks": ["13", "14"],
      "description": "README documentation and final end-to-end verification"
    }
  ]
}
```

## Notes

- This is Phase 0 foundation work — tasks focus on scaffold, not full feature implementation
- Page shells are intentionally minimal placeholders for future phases to fill in
- No property-based tests are included — this feature is infrastructure/scaffold work where PBT does not apply
- Database schema is defined via Drizzle ORM; RLS policies are defense-in-depth and applied via migration SQL
- All Supabase usage is auth-only; data access goes through Drizzle ORM exclusively
