# Braindump — Product Requirements Document

**Version:** 2.0  
**Last updated:** June 2026  
**Status:** Beta — feature-complete core loop · pre-monetisation

---

## 1. Product Vision

Braindump is a personal knowledge retention engine. The core loop:

1. **Capture** — clip anything you read, watch, or hear
2. **Review** — spaced repetition surfaces items before you forget them
3. **Teach Back** — prove you understand it by explaining it in your own words
4. **Express** — turn retained knowledge into professional output (talking points, STAR stories, LinkedIn bullets)

The differentiator: most read-later apps are graveyards. Braindump closes the loop between consuming and actually knowing. The library metaphor (book spines, shelves, topic grouping) makes the knowledge feel owned, not just stored.

---

## 2. What Changed Since v0.1

### Major additions since the last PRD

| Change | Impact |
|--------|--------|
| Full visual redesign — warm editorial palette (Spectral serif, terracotta `#b5462f`, cream `#f5f2ec`) | Product identity; bookshelf metaphor established |
| Library bookshelf view — learnings rendered as book spines grouped by topic | Core UX differentiator |
| AI topic merging — similar topic names collapsed intelligently (DB-cached) | Cleaner library organisation |
| Book-opening transition — two-phase CSS animation when opening a book | Delight / polish |
| Library filters restored — search, topic, tag, sort dropdowns | Search usability |
| Express rebuilt — format-first flow with verbose copy, shelf picker, history tab | Express is now a full feature |
| Express history saved to `express_results` and surfaced in UI | Continuity |
| Express proof gate — requires quiz ≥ 70 or teach-back ≥ 60 on at least one selected learning | Integrity / quality signal |
| Express one-time free trial — first run always free; subsequent runs require Pro | Monetisation hook |
| Capture daily quota — free users limited to 5 captures/day | Monetisation hook |
| Review user-scoping fixed — `userId` column added directly to `review_items` | Correctness (was fragile join) |
| AI cost optimisation — `getWhatsNext`, `groupSimilarTopics`, `generateDailySummary` all DB-cached | Cost control |
| Model downgrades — `suggestWhatsNext` and `generateDailySummary` moved from Sonnet → Haiku | Cost control |

---

## 3. Current State — Feature Status

### 3.1 Infrastructure

| Item | Status | Notes |
|------|--------|-------|
| PostgreSQL + Drizzle ORM | ✅ | 11 migrations applied |
| NextAuth.js v5 (email/password) | ✅ | JWT sessions |
| Vercel deployment + cron | ✅ | `vercel.json` configured |
| AI — Anthropic Haiku 4.5 (fast) | ✅ | Capture, review gen, topic grouping, whats-next, daily summary |
| AI — Anthropic Sonnet 4.6 (smart) | ✅ | Express generation, teach-back grading |
| Dark/light theme | ✅ | CSS variables, next-themes |
| Warm editorial design system | ✅ | Spectral + Inter, 7-color book palette |
| Responsive layout (sidebar + mobile nav) | ✅ | Mobile-first |

### 3.2 Feature Status

| Feature | Status | Release-Ready? |
|---------|--------|----------------|
| Landing page | ✅ Built | Needs social proof + OG image |
| Sign up / Login | ✅ Built | Missing: forgot password, email verify |
| Onboarding (3-step wizard) | ✅ Built | Needs end-to-end test |
| Dashboard / Home | ✅ Built | Needs freeze token UI |
| Capture (URL + text, instant pipeline) | ✅ Built | Solid; 5/day free quota enforced |
| Library — bookshelf view | ✅ Built | Core differentiator; working |
| Library — search + filters | ✅ Built | Dynamic facets, topic/tag/sort |
| Library — AI topic merging | ✅ Built | DB-cached, low cost |
| Book-opening transition | ✅ Built | Two-phase animation |
| Learning detail page | ✅ Built | Needs delete/edit options |
| Review (SM-2, 4 buttons) | ✅ Built | Again/Hard/Good/Easy; user-scoped |
| Teach Back (AI grading) | ✅ Built | Verify learningId from URL param works |
| Express (4 formats, history, proof gate) | ✅ Built | Trial gate live; Pro gate live |
| Settings | 🟡 Partial | Most prefs are stubs; delete account missing |
| Email digest (cron) | 🟡 Partial | Route built; no opt-in UI; untested with real Resend key |
| Streak + freeze tokens | 🟡 Partial | Backend done; no freeze token UI |
| Pro / paid tier | 🔴 Stub | Schema + gates exist; no Stripe integration |
| Knowledge insights dashboard | 🔴 Not built | Sprint 2 priority |
| Browser extension | 🔴 Not built | Sprint 3 |
| AI connections (related learnings) | 🔴 Not built | Post-launch |
| OAuth (Google / GitHub) | 🔴 Not built | Post-launch |
| Forgot password | 🔴 Not built | Needed before public launch |
| Delete account | 🔴 Not built | GDPR required before launch |
| Video capture (Pro) | 🔴 Stub | Gate shown; not enforced end-to-end |
| PWA / native app | 🔴 Not built | Future |

---

## 4. Feature Requirements

Each section covers: current state, gaps, and release acceptance criteria.

---

### Feature 1: Landing Page

**Current state:** Built. Hero, 4 feature cards with Express showcase section, "How It Works", CTAs. Warm editorial styling matches app.

**Gaps:**
- [ ] Social proof — "N learnings captured" counter or testimonials
- [ ] OG image for social sharing (link previews when posted to Slack/Twitter)
- [ ] Meta tags: `<title>`, `<description>`, `og:image`, `og:title`
- [ ] Copy review — explain the core loop in under 10 seconds above the fold
- [ ] "Get Started" CTA must go to `/signup`, not `/home`
- [ ] Pricing section (even a simple free vs pro table) before launch

**Acceptance criteria:**
- Visitor understands the product in < 10 seconds
- "Get Started" leads to `/signup`
- Renders correctly on mobile (375px viewport)
- OG image present so social shares look good
- Pricing is communicated (even if Stripe isn't wired yet)

---

### Feature 2: Sign Up / Login

**Current state:** Email/password via NextAuth.js. Signup creates user + hashed password. Login returns JWT session.

**Gaps:**
- [ ] **Forgot password flow** — not built; critical for public launch
- [ ] **Email verification** — column exists, flow does not; should verify before allowing login
- [ ] Password strength indicator on signup form
- [ ] Rate limiting on `/api/auth/signup` and `/api/auth/login` (brute force prevention)
- [ ] User-friendly error messages — no raw DB errors shown to user
- [ ] After signup → verify redirect to `/onboarding` is reliable

**Acceptance criteria:**
- Forgot password sends reset email and allows password change
- Login with wrong password shows clear, friendly error
- Session persists across browser refresh and tab close
- Rate limiting or WAF prevents brute force
- Signup → onboarding redirect always fires for new users

---

### Feature 3: Onboarding Flow

**Current state:** 3-step wizard at `/onboarding`. Collects name + learning goals, seeds 2 starter learnings, sets `onboardedAt`. Layout redirects if `onboardedAt` is null.

**Gaps:**
- [ ] Verify seeded learnings appear in library after completion with review items due today
- [ ] Verify `onboardedAt` is set so returning users skip onboarding reliably
- [ ] "Skip for now" option — some users want to jump straight in
- [ ] Loading state on "Start learning →" while server action runs (currently may feel frozen)
- [ ] Handle mid-onboarding browser close gracefully (partial state recovery)
- [ ] Mobile test — topic chip selection on 375px viewport

**Acceptance criteria:**
- New user after signup always sees onboarding once and only once
- Completing onboarding saves name, goals, seeds 2 learnings, redirects to `/home`
- Skipping saves `onboardedAt` but leaves goals empty
- Library has seeded learnings with review items after onboarding

---

### Feature 4: Dashboard / Home

**Current state:** Shows streak, today's captures, items due for review, total learnings. Quick-capture CTA. "What's Next" AI suggestions (cached 24h). Daily summary sentence.

**Gaps:**
- [ ] Empty state for brand-new users — prompt to capture their first learning
- [ ] "Due for Review" badge should link to `/review`
- [ ] Streak display on day 0 — "Start your streak today" instead of "0 days"
- [ ] Freeze token count display — "2 freeze tokens remaining" visible somewhere
- [ ] Freeze token prompt when streak is about to break (missed yesterday, tokens available)
- [ ] Streak milestone toasts — 7 / 30 / 100 days

**Acceptance criteria:**
- All 4 stats display correct values and update after actions
- Empty state shown with CTA to `/capture`
- Streak handles day 0 gracefully
- Freeze tokens visible
- Stats revalidate after capture or review (no stale cache)

---

### Feature 5: Capture (URL + Text)

**Current state:** Full pipeline. Skeleton-first instant save → `/api/capture/enrich` fills AI fields async. Daily quota: 5 captures/day for free users enforced in `saveCapture` and `saveSkeleton`.

**Pipeline:**
- URL → `extractFromUrl()` → `analyzeBlogContent()` → `summarizeCapture()` → `generateReviewItems()`
- Text → `summarizeCapture()` → `generateReviewItems()`
- Video URL → `detectVideoUrl()` → `analyzeVideoMetadata()` → (Pro gate, currently prompt-only)

**Gaps:**
- [ ] Daily quota UI — when user hits the 5/day limit, show an in-app upgrade prompt (currently just an error string)
- [ ] Duplicate URL detection — warn if this URL has been captured before
- [ ] Character limit for text input — very long pastes risk LLM timeouts; enforce ~20k chars with visible counter
- [ ] Friendly error when URL is unreachable (403 / paywalled) — not a crash
- [ ] User should be able to edit AI-generated tags + difficulty before saving
- [ ] Video capture gate — properly enforce Pro requirement (currently shows prompt but may not block)
- [ ] Source URL displayed on learning detail as a clickable link in new tab

**Acceptance criteria:**
- URL capture → AI summary within 12s
- Text capture → AI summary within 8s
- Free user hitting 5/day sees upgrade prompt, not a raw error
- Duplicate URL shows a non-blocking warning
- Saving creates learning + minimum 4 review items due today
- Error states are friendly (no stack traces or JSON blobs)

---

### Feature 6: Library — Bookshelf View

**Current state:** Learnings grouped by topic and rendered as book spines. AI merges similar topic names (e.g. "Leadership" + "Leadership & Executive Strategy" → "Leadership") using a DB-cached map. Two-column grid layout. Book-opening transition: phase 1 expands the spine, phase 2 opens to a pages overlay before navigating to detail.

**Gaps:**
- [ ] Performance: `groupSimilarTopics()` fires an AI call on first visit per user (cold start). Consider eagerly warming on onboarding.
- [ ] Book height variation — currently deterministic by index; could use `difficulty` field for more meaningful variation
- [ ] Empty shelf state — if a topic has only 1-2 learnings, shelf looks sparse; consider minimum height
- [ ] Pagination or infinite scroll once users have > 100 learnings (library could get slow)
- [ ] "Uncategorised" shelf — learnings with no topic land here; add a nudge to categorise them

**Acceptance criteria:**
- Books render for all learnings grouped by canonical topic
- AI grouping fires once then uses cache on repeat visits
- Book-opening transition plays on click before navigating to detail
- Search or filter active → falls back to flat card list automatically

---

### Feature 7: Library — Search & Filters

**Current state:** Search (title/summary/topic), topic dropdown, tag dropdown, sort (recent/due/confidence). `getUserFacets()` builds dropdown options dynamically from user's actual topics/tags.

**Gaps:**
- [ ] Search is `ilike` (case-insensitive) — verify this works correctly for non-ASCII characters
- [ ] Search across key points and tags — currently only searches title/summary/topic
- [ ] Empty search result state — "No results for X · Clear search"
- [ ] Filter state persists in URL (already done via searchParams) — verify browser back/forward works
- [ ] Sort by "most due" should be the default when user has overdue items

**Acceptance criteria:**
- Search returns results within 500ms
- Filter dropdowns populated from actual user data (not hardcoded)
- Empty result state with clear reset CTA
- URL reflects current filters (shareable, back-button friendly)

---

### Feature 8: Learning Detail Page

**Current state:** Server-rendered. Shows summary, key points, tags, review items count, teach-back history count, confidence score. Two-column layout (book cover left, content right).

**Gaps:**
- [ ] Source URL as a clickable link that opens in a new tab
- [ ] "Delete learning" option with confirmation — not present
- [ ] "Edit" option (title, summary, tags) — valuable for correcting AI errors
- [ ] Teach-back score history — show previous scores, not just count
- [ ] Next review date visible
- [ ] "Review this item now" shortcut (bypasses the full queue and reviews just this card)

**Acceptance criteria:**
- Source URL clickable, opens in new tab
- Delete button present with confirmation modal; deletion cascades to review_items, teach_backs
- Latest teach-back score displayed if available
- Next review date shown

---

### Feature 9: Review (Spaced Repetition)

**Current state:** SM-2 algorithm. 4 rating buttons: Again / Hard / Good / Easy. User-scoped via `userId` column on `review_items`. Activity recorded for streak.

**Gaps:**
- [ ] Session summary screen — "You reviewed 8 items. 2 due again tomorrow, 6 pushed to next week."
- [ ] Progress indicator — "3 of 8" visible during session
- [ ] Show which learning an item belongs to (link to detail page)
- [ ] "Skip this item" — remove from current session without rating
- [ ] Empty state — "All caught up! Nothing due today." with suggestion to capture
- [ ] Keyboard shortcuts — Space = reveal, 1/2/3/4 = Again/Hard/Good/Easy
- [ ] Session streak display — "Reviewed X days in a row"

**Acceptance criteria:**
- All items with `dueDate ≤ today` appear in session
- Rating updates SM-2 interval correctly (Again → 1 day, Easy → larger multiplier)
- Activity recorded for streak on session start (not per-card)
- Session ends with summary screen showing what was reviewed and what's next
- Empty state shown when nothing due
- Progress indicator visible throughout session

---

### Feature 10: Teach Back

**Current state:** 3-step wizard. AI grades explanation (score 0–100, verdict strong/partial/shaky, nailed points, gaps, follow-up questions). `gapScore` saved to `teach_backs` table. Results feed back into Express proof gate.

**Gaps:**
- [ ] Verify `learningId` is loaded from URL query param and correct learning displays as reference card
- [ ] Reference card always visible while user types (not hidden behind a toggle on mobile)
- [ ] Minimum explanation length (15 chars) enforced before submit button activates
- [ ] Show previous best score if user has done this before
- [ ] After completion: offer "Back to library" or "Teach another"
- [ ] Follow-up questions presented in an interactive way (not just static text)

**Acceptance criteria:**
- Teach-back page loads the correct learning via `?learningId=xxx`
- Reference card (title + summary) visible while typing
- AI grades within 15s
- Results show score, verdict, nailed points, gaps, follow-up questions
- Result saved to DB with correct `learningId` and `userId`
- `gapScore` written so Express proof gate can read it

---

### Feature 11: Express Mode

**Current state:** Format-first flow (Talking Points / STAR Stories / Profile Summary / Learning Summary). Shelf picker groups by topic with mini book spines. History tab shows past generations. **Proof gate**: at least one selected learning must have quiz ≥ 70 or teach-back ≥ 60. **Trial gate**: one free run; subsequent runs require Pro. Trial callout banner shown before first use. Lock icons on shelves with no proven learnings.

**Gaps:**
- [ ] UI for daily/weekly limit display if added (currently trial gate blocks entirely; could show "X free runs remaining")
- [ ] Generated output length control — some outputs run very long; max word count option
- [ ] Export as PDF or Markdown file (not just clipboard)
- [ ] Format-specific context prompts — e.g. for STAR: "What role are you applying for?"
- [ ] "Improve" action — regenerate with a user note ("make it more concise")
- [ ] If user has < 3 learnings, output will be poor — show "Capture more to improve results"
- [ ] Upgrade modal for `pro_required` — needs a real upgrade path (Stripe link or waitlist)

**Acceptance criteria:**
- All 4 formats generate coherent, grounded output
- Proof gate blocks generation and shows clear guidance (go review / teach back first)
- Trial gate blocks on second+ run for non-Pro users with upgrade prompt
- Lock icons on shelves with zero proven learnings; selectable shelves have ≥ 1 proven
- Copy to clipboard works on all major browsers
- History tab shows last 20 generations with expandable output and copy button
- Output generates within 20s

---

### Feature 12: Settings

**Current state:** Theme toggle works. Logout works. All other preferences (review difficulty, email digest, streak target) are non-interactive stubs.

**Gaps:**
- [ ] **Review difficulty preference** — Easy / Medium / Hard, saved to `userProfiles.preferences`; used when generating review items
- [ ] **Email digest toggle** — opt-in/out for daily email; saved to DB and respected by cron
- [ ] **Email digest send time** — morning / afternoon / evening preference
- [ ] **Change name** — editable, saves to DB, reflects in sidebar
- [ ] **Change password** — current + new password fields
- [ ] **Delete account** — with "type DELETE to confirm" modal; cascades all user data (GDPR required)
- [ ] **Streak target** — let user set their goal (daily, 3×/week, weekdays only)
- [ ] Pro status and billing section (even if Stripe not wired, show "Pro: Inactive · Upgrade" link)

**Acceptance criteria:**
- All visible settings are interactive (no stubs)
- Email digest preference saved and respected by cron job
- Delete account removes user data from all tables (learnings, review_items, teach_backs, express_results, streaks, daily_logs, user_profiles)
- Theme persists across sessions (already works)
- Name change reflects in sidebar without page reload

---

### Feature 13: Daily Review Digest Email

**Current state:** `/api/cron/daily-digest` route exists. `lib/email.ts` uses Resend. `vercel.json` schedules at 8am UTC. No opt-in UI. Never tested with a real Resend key.

**Gaps:**
- [ ] **Opt-in UI** in Settings — without this, sending is unsolicited (legal risk)
- [ ] `RESEND_API_KEY` + `CRON_SECRET` must be set in Vercel environment variables
- [ ] Skip users who have already completed a review session today (digest is only for re-engagement)
- [ ] Unsubscribe link in email footer must actually update the DB preference
- [ ] Send time personalisation (currently hardcoded 8am UTC)
- [ ] Test email delivery end-to-end in a staging environment
- [ ] Cron should return `{ sent: N, skipped: M, failed: K }` and log per-user failures without crashing

**Acceptance criteria:**
- User can enable/disable digest in Settings → `emailDigestEnabled` column respected
- Opted-in users receive email with streak, due count, and CTA button to `/review`
- Unsubscribe link in footer works and opts user out
- Cron completes without crashing even if individual sends fail
- `RESEND_API_KEY` confirmed working before launch

---

### Feature 14: Streak & Freeze Tokens

**Current state:** Backend fully built. Streak tracked in `streaks` table. 2 freeze tokens per user. No UI for freeze tokens.

**Gaps:**
- [ ] **Freeze token count** visible on dashboard or streak badge
- [ ] **Freeze token prompt** — when user logs in the day after missing a day and has tokens remaining, offer to spend one
- [ ] **Freeze token replenishment rule** — define when tokens refill (monthly? earning through milestones?)
- [ ] **Streak milestone celebrations** — toast/banner at 7, 30, 100 days
- [ ] Verify freeze consumption correctly prevents streak reset (integration test)

**Acceptance criteria:**
- Freeze token count visible to user
- Prompt appears when token can save a streak (missed yesterday, tokens > 0)
- Consuming a token prevents streak reset
- Streak milestones (7 / 30 / 100) shown as a celebratory moment

---

## 5. Monetisation — Pro Tier

**Current state:** Schema has `isPro`, `proTrialEndsAt`, `proSubscriptionEndsAt`. Feature gates are wired:
- Capture: 5/day free, unlimited Pro
- Express: 1 free trial run, unlimited Pro  
- Express proof gate: all users must prove learning (not a Pro feature)

**What's missing:**

| Item | Priority |
|------|----------|
| Stripe integration (subscription + webhooks) | 🔴 Required to monetise |
| Billing page at `/settings/billing` | 🔴 Required |
| Webhook handler `/api/webhooks/stripe` to flip `isPro` | 🔴 Required |
| Trial period flow — 14-day free Pro trial on signup | 🟡 High value |
| Video capture enforced as Pro (currently shows prompt, not blocked) | 🟡 Medium |
| Upgrade modal on Express trial exhaustion links to billing | 🟡 Medium |
| Upgrade CTA on daily quota error links to billing | 🟡 Medium |
| Pro badge in sidebar | 🟡 Low |

**Suggested free vs Pro split:**

| Feature | Free | Pro |
|---------|------|-----|
| Captures per day | 5 | Unlimited |
| Express runs | 1 lifetime trial | Unlimited |
| Video capture | ❌ | ✅ |
| AI connections (future) | ❌ | ✅ |
| Email digest | ✅ | ✅ |
| Library + Review + Teach Back | ✅ | ✅ |

---

## 6. What to Build for a Good Release — Prioritised

### Must-Have Before Launch (Blockers)

| Item | Why it blocks launch |
|------|---------------------|
| Forgot password flow | Users will lock themselves out |
| Delete account | GDPR legal requirement |
| Email digest opt-in UI | Can't send unsolicited email |
| Settings stubs made interactive (at least name + password) | Stubs destroy trust |
| Upgrade modal → real billing path (Stripe or waitlist) | Trial/quota gates need a destination |
| Test Resend API key in staging | Email digest may be broken end-to-end |
| Review session summary screen | Session ends with no feedback — jarring |
| Teach-back `learningId` from URL param verified | Core loop correctness |

### High Value for Retention (Do Before Growth Push)

| Item | Why it matters |
|------|----------------|
| Freeze token UI | Users discover streak broke with no recourse; churn trigger |
| Streak milestone celebrations | Positive reinforcement loop |
| Review progress indicator ("3 of 8") | Session feels blind without it |
| Empty state on review ("all caught up") | Confusion without it |
| Capture duplicate URL detection | Repeated capture of same source is noisy |
| Book detail: delete + edit options | No escape hatch for bad AI summaries |
| Pricing section on landing page | Sets expectation before trial-gate hits |

### High Value for Growth (Sprint 2)

| Item | Why it matters |
|------|----------------|
| Knowledge Insights Dashboard | The shareable "wow" screenshot moment; drives word of mouth |
| OAuth (Google) | Reduces signup friction significantly |
| Email verification on signup | Trust signal; prevents fake accounts |
| OG image for landing page | Social shares look professional |

### Strategic (Sprint 3+)

| Item | Notes |
|------|-------|
| Browser extension | Distribution moat; largest organic growth lever |
| AI connections (related learnings) | The "aha" moment for power users; requires pgvector |
| PWA / push notifications | Mobile re-engagement; complements email digest |
| Collaborative features | Only after individual value is proven |

---

## 7. Known Bugs

| Bug | Severity | Location |
|-----|----------|----------|
| Teach-back `learningId` from URL param — verify this works correctly after recent refactor | 🔴 Critical | `app/(app)/teachback/page.tsx` |
| Email digest has no opt-in UI — unsolicited email on launch is a legal risk | 🔴 Critical | `app/(app)/settings` |
| Delete account missing | 🔴 Critical (GDPR) | Missing |
| Forgot password missing | 🔴 Critical | Missing |
| Stripe not integrated — upgrade modals have no destination | 🔴 Critical for monetisation | Missing |
| Settings preferences (review difficulty, reminder time) are non-interactive stubs | 🟡 Medium | `app/(app)/settings/page.tsx` |
| No session summary screen after completing review | 🟡 Medium | `app/(app)/review/page.tsx` |
| Freeze tokens have no UI to display or consume | 🟡 Medium | Dashboard |
| Capture daily limit shows raw error string, not a designed upgrade prompt | 🟡 Medium | `app/(app)/capture` |
| Video capture Pro gate exists as prompt but may not fully block save | 🟡 Medium | `lib/actions/capture.ts` |
| Review session has no progress indicator | 🟡 Low | `app/(app)/review/page.tsx` |
| No session empty state when nothing is due | 🟡 Low | `app/(app)/review/page.tsx` |
| Book detail has no delete / edit options | 🟡 Low | `app/(app)/library/[id]` |
| Source URL not rendered as clickable link on detail page | 🟡 Low | `app/(app)/library/[id]` |

---

## 8. Pre-Release Checklist

### Security
- [ ] Rate limiting on `/api/auth/signup` and `/api/auth/login`
- [ ] CSRF protection verified (NextAuth provides; confirm not bypassed)
- [ ] All server actions call `requireUserId()` before touching user data
- [ ] `CRON_SECRET` header checked on all cron routes
- [ ] No stack traces or internal errors exposed to users
- [ ] SQL injection not possible (Drizzle ORM parameterises all queries)
- [ ] `.env.example` only (no secrets in git)
- [ ] Stripe webhook signature verified before processing

### Data & Privacy
- [ ] Delete account removes all user data from all tables
- [ ] Privacy policy page exists
- [ ] Terms of service page exists
- [ ] GDPR-compliant email unsubscribe
- [ ] Cookie banner if using analytics

### Reliability
- [ ] Database connection pooling configured for production load
- [ ] AI API errors don't crash the UI
- [ ] Cron job failure alerts (Vercel monitoring)
- [ ] All AI calls have timeouts and fallback error messages
- [ ] Resend API key and cron secret in Vercel environment

### Quality
- [ ] Core flow tested end-to-end: signup → onboarding → capture → review → teach-back → express
- [ ] All forms validate input and show inline errors
- [ ] Loading states on all async actions
- [ ] 404 page exists
- [ ] Error boundary at app layout level
- [ ] No hardcoded IDs or mock data in any route

### Performance
- [ ] Library paginates (don't load 1000 learnings at once)
- [ ] AI responses that are slow (> 8s) have streaming or a progress state
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1
- [ ] Images have `alt` text

---

## 9. Suggested Review Order (Highest Risk First)

1. **Teach-back page** — verify learningId from URL param is working correctly
2. **Settings** — make interactive; add delete account; add email digest toggle
3. **Forgot password + delete account** — legal/trust blockers
4. **Stripe / billing** — upgrade modals need a real destination
5. **Email digest** — add opt-in UI, set Resend env var, test delivery
6. **Review session** — add progress indicator, summary screen, empty state
7. **Capture daily limit** — upgrade prompt UI instead of raw error
8. **Onboarding** — full new-user flow test end to end
9. **Dashboard** — freeze token UI, empty state, streak day 0
10. **Library + detail** — delete/edit, source URL link
11. **Auth** — rate limiting, forgot password, session edge cases
12. **Landing page** — pricing, OG image, social proof, copy review
13. **Security audit** — auth guards, data deletion, cron secret
14. **Performance pass** — library pagination, AI timeout handling
