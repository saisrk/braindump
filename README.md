# Braindump

A knowledge externalization engine that helps you capture, understand, retain, and express what you learn.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Authentication:** NextAuth.js (Auth.js v5) with credentials provider
- **Database:** PostgreSQL with Drizzle ORM
- **Styling:** Tailwind CSS v4 (dark mode support)
- **Testing:** Vitest + React Testing Library

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- npm (comes with Node.js)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd braindump
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. For local development, the default `DATABASE_URL` works with the Docker setup below. Generate an `AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

### 4. Start the local database

```bash
docker compose up -d
```

This starts a PostgreSQL 16 instance on port 5432.

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Apply pending database migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

## Project Structure

```
app/                    → Next.js pages and layouts
├── (app)/              → Authenticated app routes (home, capture, library, review, express, settings)
├── (auth)/             → Auth routes (login, signup)
└── api/auth/           → NextAuth API routes and signup endpoint

components/             → Reusable components
├── ui/                 → Base UI components (Button, Card, Input, PageHeader)
├── navigation/         → Sidebar, bottom nav, nav links
└── auth/               → Login and signup forms

db/                     → Drizzle ORM data layer
├── schema/             → Table definitions (users, auth, learnings, teach-backs, review-items, daily-logs, streaks)
└── migrations/         → Generated SQL migrations

lib/                    → Utilities
├── auth.ts             → NextAuth.js configuration
└── env.ts              → Environment variable validation

types/                  → Shared TypeScript types
```

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string (Drizzle ORM) |
| `AUTH_SECRET` | Secret for encrypting NextAuth tokens and cookies |
| `AUTH_URL` | Base URL of the application (for NextAuth callbacks) |
