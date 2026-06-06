# Braindump — Product Requirements Document

**Version:** 0.1 (Pre-Release)  
**Last updated:** June 2026  
**Status:** MVP functional · preparing for public launch

---

## 1. Product Vision

Braindump is a personal knowledge retention engine. The core loop:

1. **Capture** — clip anything you read, watch, or hear
2. **Review** — spaced repetition surfaces items before you forget them
3. **Teach Back** — prove you understand it by explaining it in your own words
4. **Express** — turn retained knowledge into professional output (talking points, STAR stories, LinkedIn bullets)

The differentiator: most read-later apps are graveyards. Braindump closes the loop between consuming and actually knowing.

---

## 2. Current State — What's Built

### 2.1 Infrastructure & Auth
| Item | Status | Notes |
|------|--------|-------|
| PostgreSQL + Drizzle ORM | ✅ Complete | 7 tables, 4 migrations applied |
| NextAuth.js v5 (email/password) | ✅ Complete | JWT sessions, Drizzle adapter |
| Vercel deployment | ✅ Complete | Cron jobs configured via vercel.json |
| AI integration (Anthropic) | ✅ Complete | Haiku 4.5 (fast), Sonnet 4.6 (smart) |
| Dark/light theme system | ✅ Complete | CSS variables, next-themes |
| Responsive layout (sidebar + bottom nav) | ✅ Complete | Mobile-first |

### 2.2 Feature Status Summary

| Feature | Status | Release-Ready? |
|---------|--------|----------------|
| Landing page | ✅ Built | Needs copy review |
| Sign up / Login | ✅ Built | Functional |
| Onboarding flow | ✅ Built | Needs testing |
| Dashboard / Home | ✅ Built | Functional |
| Capture (URL + text) | ✅ Built | Core flow solid |
| Library browsing + search | ✅ Built | Basic, needs filters |
| Learning detail page | ✅ Built | Functional |
| Review (spaced repetition) | ✅ Built | SM-2 working |
| Teach Back | ✅ Built | Bug: hardcoded learningId |
| Express mode | ✅ Built | 4 formats working |
| Settings | 🟡 Partial | Only theme works |
| Email digest (cron) | 🟡 Partial | Route exists, no UI config |
| Video capture | 🔴 Stub | Upgrade prompt shown, not enforced |
| Streak freeze tokens | 🟡 Partial | Logic built, no UI |
| Pro / paid tier | 🔴 Stub | Schema exists, no payment |
| Knowledge insights dashboard | 🔴 Not built | Planned Sprint 2 |
| Browser extension | 🔴 Not built | Planned Sprint 3 |
| AI connections ("related learnings") | 🔴 Not built | Planned |
| OAuth (Google/GitHub) | 🔴 Not built | Post-launch |
| Advanced search (date/difficulty) | 🔴 Not built | Post-launch |
| Admin / analytics panel | 🔴 Not built | Post-launch |
| Mobile app (native / PWA) | 🔴 Not built | Future |

---

## 3. Feature Requirements — One by One

Each section below covers: what it does, what's built, what needs fixing, and what the acceptance criteria are for release.

---

### Feature 1: Landing Page

**What it does:** Marketing page for unauthenticated visitors. Explains the product and drives signup.

**Current state:** Built. Cyberpunk/HUD aesthetic with hero, 4 feature cards, "How It Works" section, CTAs.

**Gaps for release:**
- [ ] Copy review — ensure it clearly explains the core loop (capture → review → teach-back → express)
- [ ] Add social proof section (testimonials or "N learnings captured" counter)
- [ ] Meta tags / OG image for link previews when shared
- [ ] Verify CTAs go to `/signup` (not `/home` which requires auth)

**Acceptance criteria:**
- Visitor can understand what the product does in under 10 seconds
- "Get Started" CTA leads to signup
- Page renders correctly on mobile
- OG image present for social sharing

---

### Feature 2: Sign Up / Login

**What it does:** Email/password authentication via NextAuth.js.

**Current state:** Built. Signup creates user + password hash. Login creates JWT session.

**Gaps for release:**
- [ ] After signup, user should land on `/onboarding` (verify this redirect is wired)
- [ ] Password strength indicator on signup form
- [ ] "Forgot password" flow — not built; needed before public launch
- [ ] Rate limiting on auth endpoints to prevent brute force
- [ ] Email verification (emailVerified column exists but flow not built)
- [ ] Error messages are user-friendly (not raw DB errors)

**Acceptance criteria:**
- Signup → onboarding redirect works
- Login with wrong password shows clear error
- Session persists across browser refresh
- Rate limiting prevents brute-force (or behind Vercel WAF)
- "Forgot password" either built or explicitly blocked with clear message

---

### Feature 3: Onboarding Flow

**What it does:** First-time setup wizard. Collects name + learning topics. Seeds 2 starter learnings so the app isn't empty.

**Current state:** 3-step wizard built (`/onboarding`). Layout redirects to it if `onboardedAt` is null.

**Gaps for release:**
- [ ] Verify seeded learnings actually appear in the library after completion
- [ ] Verify review items are created for seeded learnings (due today)
- [ ] Verify `onboardedAt` is set and repeat visits skip onboarding
- [ ] "Skip for now" option — some users may want to skip topic selection
- [ ] Handle edge case: user exits mid-onboarding (partial state)
- [ ] Test on mobile — topic chips should wrap properly
- [ ] Loading state on "Start learning →" button while server action runs

**Acceptance criteria:**
- New user after signup always sees onboarding
- Completing onboarding saves name, goals, sets onboardedAt
- Library contains 2 seeded learnings with review items due today
- Returning user never sees onboarding again
- Works on mobile viewport

---

### Feature 4: Dashboard / Home

**What it does:** Overview of learning activity. Shows streak, items learned today, items due for review, total learnings count. Quick links to capture and review.

**Current state:** Fully functional. Pulls from `getDashboardStats()`, streaks, due count.

**Gaps for release:**
- [ ] Empty state — what does a brand-new user with no learnings see? Should prompt them to capture
- [ ] "Due for Review" badge should link directly to `/review`
- [ ] Streak display needs to handle day 0 gracefully (no streak yet)
- [ ] "Consistency score" formula (`streak/30`) is arbitrary — needs product decision on better metric
- [ ] Verify stats update in real-time after actions (cache invalidation with `revalidatePath`)

**Acceptance criteria:**
- All 4 stats display correct values
- Empty state guides new users to their first action
- Streak correctly resets if user misses 2+ days (without freeze token)
- Stats refresh after capturing or reviewing

---

### Feature 5: Capture (URL + Text)

**What it does:** The primary input mechanism. Paste a URL or text; AI extracts title, summary, topic, tags, difficulty, key points. User reviews and confirms. Saved as a Learning with auto-generated review items.

**Current state:** Full pipeline working. 4-step wizard: Quick → (metadata enrichment) → Organize → Result.

**AI pipeline:**
- URL: `extractFromUrl()` → `analyzeBlogContent()` → `summarizeCapture()` → `generateReviewItems()`
- Text: `summarizeCapture()` → `generateReviewItems()`
- Video URL: `detectVideoUrl()` → `analyzeVideoMetadata()` → (pro gate)

**Gaps for release:**
- [ ] Error handling UX when URL is unreachable or returns 403 — show clear message, not a crash
- [ ] Character limit for text input — very long pastes may cause LLM timeouts
- [ ] Loading states between each analysis step (currently may feel frozen)
- [ ] User should be able to edit AI-generated tags and difficulty before saving
- [ ] Duplicate detection — warn if same URL has already been captured
- [ ] Review items quality check — generated items should be meaningful, not generic
- [ ] Verify all 4-6 review items are created and linked correctly
- [ ] Source URL is preserved and displayed on the learning detail page

**Acceptance criteria:**
- Paste a URL → AI summary appears within 10s
- Paste raw text → AI summary appears within 8s
- User can edit title, tags before saving
- Saving creates learning + minimum 4 review items due today
- Error states are friendly (not JSON blobs)
- Duplicate URL warning shown

---

### Feature 6: Library — Browse & Search

**What it does:** Grid/list view of all captured learnings. Search by text. Filter by category/topic.

**Current state:** Built. Text search on title/summary/topic. Category filter pills.

**Gaps for release:**
- [ ] Category filter pills are hardcoded; should be dynamic from user's actual topics
- [ ] Search is case-sensitive — should be case-insensitive (likely a DB query issue)
- [ ] Empty state when no learnings match search — "No results for X"
- [ ] Sort order — currently unclear; should default to newest first with option to sort by "most due"
- [ ] Card preview — summary text is truncated but may cut awkwardly; test with long titles
- [ ] Loading skeleton while data fetches
- [ ] Library should show teach-back score badge if user has done a teach-back for that item

**Acceptance criteria:**
- Search returns results within 500ms
- Filter by topic works (dynamic, not hardcoded)
- Empty state shown with clear CTA
- Default sort is newest-first
- Each card shows title, topic, tags, and when it was captured

---

### Feature 7: Learning Detail Page

**What it does:** Full view of a single learning — summary, key points, tags, source URL, related review items, teach-back history.

**Current state:** Built. Server-rendered with client interactions.

**Gaps for release:**
- [ ] "Teach Back" button should pre-populate the teach-back page with this specific learningId (currently teach-back page has hardcoded `learning-1`)
- [ ] Source URL should be a clickable link that opens in new tab
- [ ] Review items count and next due date displayed
- [ ] Teach-back history — show previous scores (not just count)
- [ ] Delete learning option (with confirmation) — not present
- [ ] Edit learning option (title, tags, summary) — not present but valuable

**Acceptance criteria:**
- All learning fields display correctly
- "Teach Back" button routes to teach-back page pre-loaded with this learning
- Source URL is clickable and opens in new tab
- Review items section shows count and next due date

---

### Feature 8: Review (Spaced Repetition)

**What it does:** Flashcard session showing due items. User reveals answer, rates confidence (Hard / Good / Easy). SM-2 algorithm calculates next review date.

**Current state:** Fully functional. SM-2 implemented correctly. Records activity for streak tracking.

**Gaps for release:**
- [ ] Session summary screen at end — "You reviewed 8 items. Next session: 3 items due tomorrow."
- [ ] Show which learning a review item belongs to (link back to detail page)
- [ ] Progress indicator during session ("3 of 8")
- [ ] "Skip this item" option for users who want to come back to it
- [ ] If no items due, show an encouraging empty state ("You're all caught up! Nothing due today.")
- [ ] Keyboard shortcuts (Space = show answer, 1/2/3 = Hard/Good/Easy) for power users
- [ ] Review streaks — "You've reviewed X days in a row"

**Acceptance criteria:**
- All items with dueDate ≤ today appear in session
- Rating Hard/Good/Easy updates the correct interval via SM-2
- Activity recorded (streak bump)
- Session ends with summary screen
- Empty state when nothing is due
- Progress shown during session

---

### Feature 9: Teach Back

**What it does:** User explains a concept in their own words. AI grades the explanation (score 0-100, verdict strong/partial/shaky, nailed points, gaps, follow-up questions).

**Current state:** 3-step wizard built. AI grading works. Results saved to DB.

**Known bug:** `learningId` is hardcoded to `'learning-1'` in the page — doesn't load the correct learning.

**Gaps for release:**
- [ ] **Critical bug fix:** Extract `learningId` from URL query params (`?learningId=xxx`) and load the correct learning as reference material
- [ ] Show the learning summary as a "reference card" while user types their explanation
- [ ] Minimum explanation length enforced (15 chars) with clear feedback
- [ ] Show score history — if user has done this before, show previous best score
- [ ] After completing teach-back, offer to return to library or do another
- [ ] Follow-up questions in results should be interactive (let user answer them)
- [ ] Save teach-back result correctly — verify `learningId` FK is written to DB

**Acceptance criteria:**
- Teach-back page loads the correct learning when navigated from library or detail page
- Reference card visible while user types
- AI grades explanation within 15s
- Results show score, verdict, nailed points, gaps, follow-up questions
- Result saved to `teach_backs` table with correct learningId

---

### Feature 10: Express Mode

**What it does:** Takes all captured learnings and generates professional output in 4 formats — talking points, STAR stories, LinkedIn/resume bullets, or a narrative summary.

**Current state:** All 4 formats working. Copy-to-clipboard. Regenerate button.

**Gaps for release:**
- [ ] Topic filter — currently uses last 40 learnings regardless of topic; let user filter by topic/tag before generating
- [ ] Generated output length control — some outputs may be too long or too short
- [ ] Format-specific prompts for different contexts (e.g. job interview vs LinkedIn)
- [ ] Save output — let user bookmark/copy a generated express output for later
- [ ] Loading state is minimal — show which learnings are being processed
- [ ] If user has < 3 learnings, output quality will be poor — show a "Capture more to improve results" nudge

**Acceptance criteria:**
- All 4 formats generate coherent output
- Topic filter works to narrow which learnings are used
- Copy-to-clipboard works on all major browsers
- Empty-state nudge when too few learnings exist
- Output generates within 20s

---

### Feature 11: Settings

**What it does:** User preferences — theme, learning preferences, account management.

**Current state:** Theme toggle works. "Review Difficulty" and "Daily Reminder" are non-interactive placeholders. Logout works.

**Gaps for release:**
- [ ] **Review difficulty preference:** Let user choose how challenging the AI makes review items (Easy / Medium / Hard)
- [ ] **Email digest toggle:** On/off for daily review digest email (currently no UI to opt in/out)
- [ ] **Email digest time:** Preferred send time (morning / afternoon / evening)
- [ ] **Streak target:** Let user set their goal (currently hardcoded to 1 day/week)
- [ ] **Account settings:** Change name, change email, change password
- [ ] **Danger zone:** Delete account + all data (GDPR requirement before public launch)
- [ ] Persist all settings to DB, not just theme (theme is localStorage-only)

**Acceptance criteria:**
- All displayed settings are interactive (nothing is a stub)
- Email digest preference is saved and respected by cron job
- Change name saves to DB and updates sidebar display
- Delete account removes all user data from all tables
- Theme persists across sessions

---

### Feature 12: Daily Review Digest Email

**What it does:** Vercel Cron at 8am UTC sends each user an email: how many items are due, streak count, direct link to review session.

**Current state:** `/api/cron/daily-digest` route built. `lib/email.ts` built with Resend. `vercel.json` configured. No UI to opt in/out.

**Gaps for release:**
- [ ] Email opt-in UI in Settings (currently no way to enable/disable)
- [ ] Send time preference (8am UTC is hardcoded)
- [ ] Skip users who have already reviewed today (digest is only useful for re-engagement)
- [ ] Test email send works with a real Resend API key in staging
- [ ] Unsubscribe link in email footer must work (GDPR / CAN-SPAM compliance)
- [ ] Rate-limit sending to avoid hitting Resend's hourly limits on large user bases
- [ ] `RESEND_API_KEY` and `CRON_SECRET` must be added to Vercel environment

**Acceptance criteria:**
- User can enable/disable digest in Settings
- Opted-in users receive email at their preferred time
- Email contains: streak, due count, CTA button linking to /review
- Unsubscribe link works (sets preference to off in DB)
- Cron returns `{sent: N, failed: M}` and logs per-user errors without crashing

---

### Feature 13: Streak & Freeze Tokens

**What it does:** Day-count streak of consecutive learning activity. 2 freeze tokens per user to bridge a missed day without breaking streak.

**Current state:** Backend fully built. No UI for freeze tokens.

**Gaps for release:**
- [ ] Freeze token display in dashboard — show "2 freeze tokens remaining"
- [ ] Freeze token prompt — when streak is about to break, offer to use a freeze token
- [ ] Freeze token consumption logic — verify it correctly prevents streak reset
- [ ] Streak milestone notifications — "🔥 7 day streak!" celebration
- [ ] Freeze token replenishment logic — does it refill weekly? Monthly? Define the rule.

**Acceptance criteria:**
- Freeze token count displayed on dashboard or streak badge
- When user skips a day and has tokens, streak doesn't reset
- UI notifies user when a freeze token was consumed
- Streak milestone shown as toast/banner at 7, 30, 100 days

---

## 4. Planned Future Features

These are not yet built and are not required for initial launch.

### Sprint 2: Knowledge Insights Dashboard

**Priority:** High — the "wow" shareable moment.

**What it does:**
- Topic breakdown: bar chart of learnings by category
- Mastery heatmap: which topics have the most review + teach-back activity
- Learning velocity: week-over-week captures
- "Strongest topics" vs "Needs review" split
- Shareable card (OG-image via `@vercel/og`)

**Requirements:**
- New `/insights` route
- Aggregate queries on `learnings`, `review_items`, `teach_backs`
- Chart library (recharts or similar)
- Shareable snapshot with static OG image generation
- Accessible without needing real-time data (can be cached daily)

---

### Sprint 3: Browser Extension

**Priority:** High — distribution moat.

**What it does:**
- Chrome/Edge extension
- Highlight text on any page → right-click → "Save to Braindump"
- Extension popup: paste URL or type a note
- Authenticates via stored JWT token

**Requirements:**
- Separate Chrome Extension project (Manifest V3)
- New `/api/capture/quick` endpoint accepting token + content
- Extension UI: popup with text area + submit
- Token storage in `chrome.storage.local`
- Badge showing unreviewed item count (stretch goal)

---

### Future: AI Connections

**Priority:** Medium — retention through discovery.

**What it does:**
- After saving a new learning: "This connects to [X] you captured 2 weeks ago"
- "Related learnings" section on each detail page
- Cosine similarity search using embeddings

**Requirements:**
- Add `embedding vector(1536)` column to `learnings` table
- Compute embedding via Anthropic API at capture time
- Enable pgvector extension on PostgreSQL
- Query top-3 similar learnings by cosine distance at read time

---

### Future: OAuth / Social Login

**Priority:** Medium — reduces signup friction.

**What it does:** "Sign in with Google" and/or "Sign in with GitHub" buttons.

**Requirements:**
- Add Google OAuth provider to NextAuth config
- Add GitHub OAuth provider
- Handle account linking (user signs up with email, later uses Google with same email)
- `accounts` table already exists via Drizzle adapter — just needs provider config

---

### Future: Pro Tier / Payments

**Priority:** Medium — monetization.

**Schema already has:** `isPro`, `proTrialEndsAt`, `proSubscriptionEndsAt` on users table.

**What it does:**
- Free tier: basic capture/review/teach-back
- Pro tier: video capture, AI connections, unlimited history, export features

**Requirements:**
- Stripe integration (subscription + webhooks)
- Billing page at `/settings/billing`
- Webhook handler at `/api/webhooks/stripe` to update `isPro`
- Feature gating in server actions based on `isPro` flag
- Trial period flow (14 days free)
- Video capture pro feature actually enforced (currently just a prompt)

---

### Future: Advanced Search & Filters

**Priority:** Low — quality-of-life.

**What it does:**
- Filter by date range, difficulty level
- Sort by: newest, oldest, least reviewed, most reviewed, lowest teach-back score
- Saved search/filter presets
- Full-text search across key points and tags (not just title/summary)

---

### Future: Collaborative Features

**Priority:** Low — requires critical mass.

**What it does:**
- Share a learning publicly (view-only link)
- Team library — shared collection within an organization
- Group review sessions

**Note:** Not planned until individual value is proven.

---

### Future: Mobile App / PWA

**Priority:** Low.

**Requirements (if PWA):**
- `manifest.json` + service worker
- Push notification support for review reminders
- Offline review queue with background sync

---

## 5. Pre-Release Checklist

### Security
- [ ] Rate limiting on `/api/auth/signup` and `/api/auth/login`
- [ ] CSRF protection (NextAuth provides this, verify it's not bypassed)
- [ ] All server actions call `requireUserId()` before touching user data
- [ ] `CRON_SECRET` header checked on all cron routes
- [ ] No user data leaks in error messages or API responses
- [ ] SQL injection not possible (Drizzle ORM parameterises all queries)
- [ ] Environment variables not committed to git (`.env.example` only)

### Data & Privacy
- [ ] Delete account flow removes all user data from all tables
- [ ] Privacy policy page exists (even if simple)
- [ ] Terms of service page exists
- [ ] Cookie banner (if using analytics)
- [ ] GDPR-compliant email unsubscribe

### Reliability
- [ ] Database connection pooling configured correctly for production load
- [ ] AI API errors don't crash the UI (user sees friendly error, not stack trace)
- [ ] Cron job failure alerts (Vercel dashboard monitoring)
- [ ] Vercel preview deployments tested before merging to main

### Quality
- [ ] Core flows tested end-to-end: signup → onboarding → capture → review → teach-back
- [ ] All forms validate input and show inline errors
- [ ] Loading states on all async actions
- [ ] 404 page exists
- [ ] Error boundary at app layout level
- [ ] No hardcoded IDs or mock data in production routes (fix teach-back `learning-1` bug)

### Performance
- [ ] Images have `alt` text and proper sizing
- [ ] AI responses stream where possible (avoid 10+ second blank waits)
- [ ] Library page paginates (don't load 1000 learnings at once)
- [ ] Core Web Vitals passing (LCP < 2.5s, CLS < 0.1)

---

## 6. Known Bugs (Must Fix Before Launch)

| Bug | Severity | Location |
|-----|----------|----------|
| Teach-back page loads hardcoded `learning-1` instead of the correct learning | 🔴 Critical | `app/(app)/teachback/page.tsx` |
| Email digest has no opt-in UI — users receive unsolicited email | 🔴 Critical | `app/(app)/settings`, `lib/actions/` |
| Settings preferences (review difficulty, reminder) are non-interactive stubs | 🟡 Medium | `app/(app)/settings/page.tsx` |
| Delete account not available | 🟡 Medium | Missing |
| Forgot password flow not built | 🟡 Medium | Missing |
| Library category filter uses hardcoded list, not user's actual topics | 🟡 Medium | `app/(app)/library/page.tsx` |
| No session summary screen after completing a review session | 🟡 Medium | `app/(app)/review/page.tsx` |
| Freeze tokens have no UI to display or consume | 🟡 Medium | Dashboard |
| Express mode uses last 40 learnings with no topic filtering | 🟡 Low | `app/(app)/express/page.tsx` |
| Review session has no progress indicator | 🟡 Low | `app/(app)/review/page.tsx` |
| Error handling shows no UI feedback on AI timeouts | 🟡 Low | Multiple pages |

---

## 7. Suggested Review Order

To review features one-by-one for release readiness, go in this order (highest risk first):

1. **Teach-back page** — critical bug with hardcoded learningId
2. **Settings page** — many stubs, email consent needed
3. **Onboarding flow** — test full new-user experience end to end
4. **Capture flow** — test URLs, long text, error cases
5. **Review session** — test SM-2, session end state, empty state
6. **Library** — test search, filter, detail page navigation
7. **Express mode** — test all 4 formats, copy to clipboard
8. **Dashboard** — verify all stats and empty states
9. **Auth flows** — signup, login, logout, session persistence
10. **Email digest** — add opt-in UI, test cron with real Resend key
11. **Landing page** — copy, CTAs, OG image, mobile
12. **Security audit** — rate limiting, auth guards, data deletion
