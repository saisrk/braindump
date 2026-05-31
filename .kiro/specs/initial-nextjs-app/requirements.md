# Requirements Document

## Introduction

This document defines the requirements for the initial Next.js application scaffold ("Phase 0") of the Braindump project — a knowledge externalization engine that helps users capture, understand, retain, and express learnings. This phase establishes the foundational project structure, authentication, database schema, page shells, and styling setup that all future phases build upon.

## Glossary

- **App**: The Braindump Next.js web application
- **User**: An authenticated individual using the Braindump application
- **Supabase_Client**: The configured Supabase JavaScript client used for authentication and database operations
- **Auth_Module**: The authentication subsystem powered by Supabase Auth
- **Database_Schema**: The set of PostgreSQL tables and relationships in Supabase
- **Layout_Shell**: The top-level application layout including navigation and page structure
- **Page_Shell**: A placeholder page component with basic structure and routing
- **Navigation**: The primary navigation component providing access to all main pages

## Requirements

### Requirement 1: Project Scaffold

**User Story:** As a developer, I want a properly configured Next.js project with TypeScript and Tailwind CSS, so that I have a solid foundation for building the application.

#### Acceptance Criteria

1. THE App SHALL be a Next.js 14+ project using the App Router with TypeScript enabled
2. THE App SHALL include Tailwind CSS configured with a base design system (colors, spacing, typography)
3. THE App SHALL include ESLint and Prettier configured for consistent code formatting
4. THE App SHALL define a clear directory structure separating pages, components, utilities, and types

### Requirement 2: Application Layout and Navigation

**User Story:** As a user, I want a consistent layout with clear navigation, so that I can move between sections of the application easily.

#### Acceptance Criteria

1. THE Layout_Shell SHALL render a persistent navigation sidebar or bottom bar across all authenticated pages
2. THE Navigation SHALL provide links to Home, Capture, Library, Review, Express, and Settings pages
3. WHEN a user navigates to a page, THE Navigation SHALL visually indicate the currently active page
4. THE Layout_Shell SHALL be responsive, adapting from sidebar navigation on desktop to bottom navigation on mobile

### Requirement 3: Authentication

**User Story:** As a user, I want to sign up and log in securely, so that my learning data is private and persistent.

#### Acceptance Criteria

1. THE Auth_Module SHALL support email/password sign-up and sign-in using Supabase Auth
2. WHEN a user is not authenticated, THE App SHALL redirect the user to the login page
3. WHEN a user successfully authenticates, THE App SHALL redirect the user to the Home page
4. WHEN a user clicks sign out, THE Auth_Module SHALL end the session and redirect to the login page
5. THE Auth_Module SHALL persist sessions across page reloads using Supabase session management
6. IF an authentication error occurs, THEN THE Auth_Module SHALL display a descriptive error message to the user

### Requirement 4: Database Schema Foundation

**User Story:** As a developer, I want the core database tables defined and migrated, so that future features have a data layer to build upon.

#### Acceptance Criteria

1. THE Database_Schema SHALL include a `users` table with columns for id, goals, preferences, streak configuration, and timestamps
2. THE Database_Schema SHALL include a `learnings` table with columns for id, user_id, title, source_type, source_ref, summary, tags, topic, difficulty, and created_at
3. THE Database_Schema SHALL include a `teach_backs` table with columns for id, learning_id, user_explanation, ai_feedback, gap_score, and created_at
4. THE Database_Schema SHALL include a `review_items` table with columns for id, learning_id, type, question, answer, sr_interval, sr_ease, due_date, and last_reviewed
5. THE Database_Schema SHALL include a `daily_logs` table with columns for id, user_id, date, items_captured, items_reviewed, and summary
6. THE Database_Schema SHALL include a `streaks` table with columns for user_id, current_count, longest, last_active_date, and freeze_tokens
7. THE Database_Schema SHALL enforce foreign key relationships between user_id references and the users table
8. THE Database_Schema SHALL enable Row Level Security (RLS) policies so that users can only access their own data

### Requirement 5: Page Shells

**User Story:** As a developer, I want placeholder pages for all main sections, so that routing works and future phases can fill in functionality incrementally.

#### Acceptance Criteria

1. THE App SHALL include a Home page shell displaying a placeholder heading and layout zones for capture button, due reviews, streak, and daily summary
2. THE App SHALL include a Capture page shell displaying a placeholder heading and layout zone for the capture wizard
3. THE App SHALL include a Library page shell displaying a placeholder heading and layout zone for a searchable list of learnings
4. THE App SHALL include a Review page shell displaying a placeholder heading and layout zone for spaced-repetition sessions
5. THE App SHALL include an Express page shell displaying a placeholder heading and layout zone for interview/profile generation
6. THE App SHALL include a Settings page shell displaying a placeholder heading and layout zone for user preferences

### Requirement 6: Supabase Client Configuration

**User Story:** As a developer, I want a properly configured Supabase client, so that all parts of the application can interact with authentication and the database consistently.

#### Acceptance Criteria

1. THE Supabase_Client SHALL be configured using environment variables for the Supabase URL and anonymous key
2. THE App SHALL provide separate Supabase client instances for server-side and client-side usage
3. THE Supabase_Client SHALL include TypeScript types generated from the database schema for type-safe queries
4. IF the Supabase environment variables are missing, THEN THE App SHALL fail with a clear error message at startup

### Requirement 7: Styling Foundation

**User Story:** As a developer, I want a consistent design system established, so that all future UI work follows a cohesive visual language.

#### Acceptance Criteria

1. THE App SHALL define a Tailwind CSS theme with custom colors, font sizes, and spacing scales appropriate for a learning application
2. THE App SHALL include reusable base UI components: Button, Card, Input, and PageHeader
3. THE App SHALL support dark mode via Tailwind's dark mode class strategy
4. THE App SHALL use a clean, minimal aesthetic with adequate whitespace to reduce cognitive load

### Requirement 8: Environment and Developer Experience

**User Story:** As a developer, I want clear environment setup and documentation, so that I can onboard quickly and run the project locally.

#### Acceptance Criteria

1. THE App SHALL include a `.env.example` file documenting all required environment variables
2. THE App SHALL include a README with setup instructions, prerequisites, and available scripts
3. THE App SHALL include scripts for running the development server, linting, and type-checking
