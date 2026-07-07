# Braindump — Product Requirements Document

**Version:** 3.0  
**Last updated:** June 2026  
**Status:** Beta — core loop complete · Razorpay billing integrated · tester access live

---

## 1. Product Vision

Braindump is a personal knowledge retention engine. The core loop:

1. **Capture** — clip anything you read, watch, or hear
2. **Review** — spaced repetition surfaces items before you forget them
3. **Teach Back** — prove you understand it by explaining it in your own words
4. **Express** — turn retained knowledge into professional output (talking points, STAR stories, LinkedIn bullets)

The differentiator: most read-later apps are graveyards. Braindump closes the loop between consuming and actually knowing. The library metaphor (book spines, shelves, topic grouping) makes the knowledge feel owned, not just stored.

---

## 2. What Changed Since v2.0

| Change | Impact |
|--------|--------|
| **Onboarding redesign** — book-spine topic chips, live shelf preview, loop flow diagram, arc progress ring, confetti on step 3 | Higher activation; teaches the book metaphor before user reaches the library |
| **Dashboard redesign** — personalised greeting, 3-col stat grid (library / mastered / ready-to-revisit), terracotta CTA row, "Pick up where you left off" volume cards with gradient covers | Clearer daily orientation; mastered count now correct (SR confidence ≥ 80 OR teach-back ≥ 80) |
| **Mastered count fix** — was only counting SR confidence ≥ 80; now also counts teach-back `gap_score` ≥ 80 | Correctness; users saw 0 mastered despite completed teach-backs |
| **Session persistence fix** — authenticated users saw Login on landing; redirect loop on nav | `proxy.ts` now redirects logged-in users away from `/login` and `/signup`; 30-day JWT maxAge set |
| **Landing page auth-aware** — shows "Go to dashboard →" for logged-in users | No confusion for returning users |
| **Hero flashcard layout fix** — card height was `minHeight` causing jumpy layout when answer appeared | Fixed to `height: 220px` + `overflow: hidden` |
| **Razorpay integration** — replaced Stripe; JS popup flow, subscription API, webhook handler | Billing is now live; uses INR; no redirect to hosted page |
| **Tester account** — `tester@brain-dump.co` / `tester@12345` shows a password field instead of OTP | Razorpay app approval without real payment needed |
| **Email preferences** — digest opt-in toggle in Settings; stored in `user_profiles.preferences` JSONB | Legal: digest is now opt-in |
| **Onboarding bug fix** — `completeOnboarding` changed from `insert().onConflictDoUpdate()` to `update()` with fallback insert | 500 error on onboarding completion resolved |
| **Express rebuilt** — 2-col card grid, single "Select all", narrow colour band on card header, more space for card detail | Cleaner learning picker UX |
| **Google OAuth** | Live in production |
| **Supabase pooler URL** — switched to port 6543 connection pooler for serverless compatibility | Eliminated ENOTFOUND errors on Vercel |

---

## 3. Current State — Feature Status

### 3.1 Infrastructure

| Item | Status | Notes |
|------|--------|-------|
| PostgreSQL + Drizzle ORM | ✅ | 12 migrations applied; Supabase pooler URL in use |
| NextAuth.js v5 — Email OTP | ✅ | JWT sessions, 30-day maxAge |
| NextAuth.js v5 — Google OAuth | ✅ | Live in production |
| NextAuth.js v5 — Tester credentials | ✅ | `tester@brain-dump.co` / `tester@12345` |
| Resend — OTP emails | ✅ | Production: requires verified domain on Resend |
| Resend — daily digest | 🟡 | Route built; opt-in toggle added; needs `RESEND_API_KEY` confirmed in production |
| Vercel deployment + cron | ✅ | `vercel.json` configured |
| Razorpay — subscriptions | ✅ | `createSubscription`, `verifyAndActivate`, `cancelSubscription` wired |
| Razorpay — webhook handler | ✅ | `/api/razorpay/webhook` handles activated / charged / cancelled / expired |
| AI — Anthropic Haiku 4.5 | ✅ | Capture, review gen, topic grouping, whats-next, daily summary |
| AI — Anthropic Sonnet 4.6 | ✅ | Express generation, teach-back grading |
| Dark/light theme | ✅ | CSS variables, next-themes |
| Warm editorial design system | ✅ | Spectral + Inter, 7-colour book palette, `topicGradient()` |
| Responsive layout | ✅ | Sidebar (desktop) + mobile nav |
| `proxy.ts` auth routing | ✅ | Protects `/app` routes; redirects logged-in users away from auth pages |

### 3.2 Feature Status

| Feature | Status | Release-Ready? |
|---------|--------|----------------|
| Landing page | ✅ Built | Needs OG image, social proof, pricing section |
| Sign up / Login — OTP | ✅ Built | Works; email delivery requires Resend domain verification |
| Sign up / Login — Google | ✅ Built | Live |
| Tester login (`tester@brain-dump.co`) | ✅ Built | Temporary; remove after Razorpay approval |
| Onboarding (3-step wizard, redesigned) | ✅ Built | Book-spine topic chips, shelf preview, confetti |
| Dashboard / Home (redesigned) | ✅ Built | Stats correct; volume cards live |
| Capture (URL + text) | ✅ Built | 5/day free quota enforced |
| Library — bookshelf view | ✅ Built | Core differentiator |
| Library — search + filters | ✅ Built | Dynamic facets |
| Learning detail page | ✅ Built | Needs delete/edit options |
| Review (SM-2, 4 buttons) | ✅ Built | Needs progress indicator + summary screen |
| Teach Back (AI grading) | ✅ Built | Feeds mastered count + Express proof gate |
| Express (4 formats, history, proof gate) | ✅ Built | Trial gate + Pro gate live |
| Settings — theme, logout, email digest toggle | ✅ Built | Most prefs interactive; delete account missing |
| Billing — Razorpay subscriptions | ✅ Built | Needs Razorpay plan IDs + env vars set |
| Billing — cancel subscription | ✅ Built | Confirmation dialog → Razorpay API cancel at cycle end |
| Pricing page | ✅ Built | INR pricing; Razorpay popup |
| Email digest (cron) | 🟡 Partial | Opt-in toggle done; Resend key + domain verification needed |
| Streak + freeze tokens | 🟡 Partial | Backend done; no freeze token UI |
| Razorpay plan setup | 🔴 Required | Plans not yet created in Razorpay dashboard |
| Knowledge insights dashboard | 🔴 Not built | Sprint 2 priority |
| Browser extension | 🔴 Not built | Sprint 3 |
| AI connections (related learnings) | 🔴 Not built | Post-launch |
| Forgot password | 🔴 Not built | Needed before public launch |
| Delete account | 🔴 Not built | GDPR required before launch |
| OG / meta tags | 🔴 Not built | Needed for social sharing |
| Video capture (Pro) | 🔴 Stub | Gate shown; not enforced end-to-end |
| PWA / native app | 🔴 Not built | Future |

---

## 4. Feature Requirements

### Feature 1: Landing Page

**Current state:** Built. Hero with animated flashcard, 4 feature cards, "How It Works" section, warm editorial styling. Auth-aware — logged-in users see "Go to dashboard →" instead of Login.

**Gaps:**
- [ ] OG image for social sharing (`og:image`, `og:title`, `og:description`)
- [ ] Social proof — "N learnings captured" counter or 2–3 user quotes
- [ ] Pricing section — even a simple free vs pro table
- [ ] Copy review — core loop explainable in < 10 seconds above the fold

**Acceptance criteria:**
- Visitor understands the product in < 10 seconds
- OG image present and renders correctly on Twitter/Slack/WhatsApp previews
- Pricing communicated before trial gates are hit
- Renders correctly on 375px viewport

---

### Feature 2: Authentication

**Current state:** Three paths — Email OTP (Resend), Google OAuth, and Tester credentials. JWT sessions with 30-day maxAge. Proxy routes logged-in users away from `/login` and `/signup`. Profile row always created at sign-in.

**Active gaps:**
- [ ] Forgot password flow — not built; critical for public launch
- [ ] Email verification — column exists, flow does not
- [ ] Rate limiting on OTP send endpoint (brute force / spam prevention)
- [ ] Tester account must be removed after Razorpay production approval

**Tester account (temporary):**
- Email: `tester@brain-dump.co`
- Password: `tester@12345`
- Bypasses OTP entirely; shows a password field on login
- Remove: delete the `'tester'` Credentials provider in `lib/auth.ts` and the `step === 'tester'` branch in `components/auth/login-form.tsx`

**Acceptance criteria:**
- OTP email arrives within 60s for all users
- Tester account removed before public launch
- Forgot password sends reset email and allows password change
- Session persists across browser refresh and tab close

---

### Feature 3: Onboarding Flow

**Current state:** 3-step wizard at `/onboarding`. Redesigned with book-spine topic chips that lift on selection, live shelf preview updating in real time, 3-icon loop flow diagram (Capture → Review → Master), confetti burst on step 3, arc progress ring. `completeOnboarding` uses `update()` with fallback `insert()` — the previous `onConflictDoUpdate()` was causing 500 errors.

**Gaps:**
- [ ] "Skip for now" option — some users want to jump straight in without picking topics
- [ ] Handle mid-onboarding browser close (partial state; if `onboardedAt` is null, show onboarding again next login — already works, but verify)
- [ ] Mobile test — book-spine chips at 375px viewport (7 chips may overflow)

**Acceptance criteria:**
- New user always sees onboarding once and only once
- Completing saves name, goals, seeds ≤ 2 learnings with review items due today, redirects to `/home`
- Book-spine chips render correctly on mobile
- Seeded learnings visible in library immediately after redirect

---

### Feature 4: Dashboard / Home

**Current state:** Personalised greeting (first name from session). 3-column stat grid: Library card (total learnings + topic colour bars), Mastered (confidence ≥ 80 OR teach-back gap_score ≥ 80), Ready to revisit (due today + due this week count). Two CTA buttons: Capture (terracotta) and Review N due (muted). "Pick up where you left off" shows 3 most recent learnings as volume cards with gradient book covers, progress bar, and status row.

**Volume card status variants:**
- Due today → clock icon, terracotta, `X of Y cards · due today`
- Mastered → check icon, moss green, `Mastered · revisit in N days`
- Summary ready → sparkle icon, indigo, `Summary ready · express it`
- Default → book icon, gold progress bar, `Y cards · review when ready`

**Gaps:**
- [ ] Empty state for brand-new users — prompt to capture first learning
- [ ] Streak display on day 0 — "Start your streak today" instead of "0 days"
- [ ] Freeze token count visible somewhere on dashboard
- [ ] Stats revalidate after capture or review (currently only refreshes on full page load)

**Acceptance criteria:**
- All stats display correct values; mastered count includes teach-back data
- Empty state shown with CTA to `/capture` when user has zero learnings
- Streak handles day 0 gracefully (no "0 days" shown)

---

### Feature 5: Capture

**Current state:** Full pipeline. Skeleton-first instant save → async enrichment. Daily quota enforced in `saveSkeleton`: 10 captures/day for trial/Pro. (The older `saveCapture` wizard-step function was dead code — removed; it duplicated persistence logic and was the only capture path that called `recordActivity`, which is now called from `saveSkeleton` instead.)

**Gaps:**
- [ ] Daily quota shows raw error string, not a designed upgrade prompt
- [ ] Duplicate URL detection — warn if URL already captured
- [ ] Character limit for text input (~20k chars with counter)
- [ ] User can't edit AI-generated tags or difficulty before saving
- [ ] Video capture Pro gate needs to fully block, not just prompt

**Acceptance criteria:**
- URL capture → AI summary within 12s
- Free user hitting 5/day sees upgrade prompt with link to `/pricing`
- Saving creates learning + minimum 4 review items due today

---

### Feature 6: Library — Bookshelf View

**Current state:** Learnings grouped by topic, rendered as book spines. AI merges similar topic names (DB-cached). Book-opening transition (two-phase CSS animation). Search/filter active → falls back to flat card list.

**Gaps:**
- [ ] `groupSimilarTopics()` cold start on first visit — consider warming during onboarding
- [ ] Pagination once users have > 100 learnings
- [ ] Empty "Uncategorised" shelf nudge — prompt to assign topic

**Acceptance criteria:**
- Books render for all learnings grouped by canonical topic
- Book-opening transition plays before navigating to detail
- Search/filter → flat card list fallback works correctly

---

### Feature 7: Learning Detail Page

**Current state:** Two-column layout — book cover (topic gradient, confidence score) on left; summary, key points, tags, stats on right.

**Gaps:**
- [ ] Source URL as clickable link opening in new tab
- [ ] Delete learning option with confirmation (cascades to review_items, teach_backs)
- [ ] Edit option (title, summary, tags) for correcting AI errors
- [ ] Teach-back score history (previous scores, not just count)
- [ ] Next review date visible
- [ ] "Review this item now" shortcut

**Acceptance criteria:**
- Source URL clickable, opens in new tab
- Delete with confirmation; all related rows cascade-deleted
- Latest teach-back score displayed

---

### Feature 8: Review (Spaced Repetition)

**Current state:** SM-2 algorithm. 4 rating buttons: Again / Hard / Good / Easy. User-scoped. Activity recorded for streak.

**Gaps:**
- [ ] Progress indicator — "3 of 8" visible during session
- [ ] Session summary screen on completion
- [ ] Empty state — "All caught up!" with suggestion to capture
- [ ] Keyboard shortcuts — Space = reveal, 1/2/3/4 = rate

**Acceptance criteria:**
- All items with `dueDate ≤ today` appear in session
- Progress indicator visible throughout
- Summary screen shown on completion
- Empty state shown when nothing due

---

### Feature 9: Teach Back

**Current state:** AI grading (score 0–100, strengths, gaps, follow-up questions). `gapScore` feeds mastered count and Express proof gate.

**Gaps:**
- [ ] Reference card always visible while typing on mobile
- [ ] Show previous best score if user has done this before
- [ ] After completion: offer "Back to library" or "Teach another"

**Acceptance criteria:**
- Correct learning displayed as reference card
- AI grades within 15s
- Result saved with correct `learningId` and `userId`
- `gapScore` readable by Express proof gate and dashboard mastered count

---

### Feature 10: Express Mode

**Current state:** Format-first flow (Talking Points / STAR Stories / Profile Summary / Learning Summary). 2-column card grid with narrow colour band, single "Select all". Shelf picker with mini book spines. History tab. Proof gate (quiz ≥ 70 or teach-back ≥ 60). Trial gate (1 free run; Pro required after).

**Gaps:**
- [ ] Upgrade modal for `pro_required` must link to `/pricing` (was linking to Stripe before removal)
- [ ] Export as PDF or Markdown
- [ ] Format-specific context prompts (e.g. STAR: "What role are you applying for?")
- [ ] "Improve" action — regenerate with a user note

**Acceptance criteria:**
- All 4 formats generate coherent output
- Proof gate blocks and shows guidance
- Trial gate links to `/pricing` with working Razorpay flow
- History tab shows last 20 generations

---

### Feature 11: Settings

**Current state:** Theme toggle (works), logout (works), email digest opt-in toggle (works and saves to DB), subscription status and cancel button (Razorpay cancel at cycle end). Review difficulty, streak target, name change — stubs.

**Gaps:**
- [ ] Review difficulty preference — save to DB and use in review item generation
- [ ] Change name — editable, saves to `users.name`, reflects in sidebar
- [ ] **Delete account** — GDPR blocker; must cascade all user data
- [ ] Streak target preference — let user set goal
- [ ] Email digest send-time preference

**Acceptance criteria:**
- Email digest toggle saves and is respected by the cron job
- Cancel subscription triggers Razorpay cancel and `isPro` flips to false on next webhook
- Delete account removes data from all tables

---

### Feature 12: Billing — Razorpay

**Current state:** Full subscription flow. `createSubscription` (server action) → Razorpay JS popup → `verifyAndActivate` (HMAC verify + DB update) → user is Pro. `cancelSubscription` cancels at cycle end. Webhook at `/api/razorpay/webhook` handles `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.completed`, `subscription.expired`.

**DB storage:**
- `stripe_subscription_id` column stores the Razorpay subscription ID (`sub_xxx`) — column name is a legacy artefact
- `stripe_customer_id` is unused (Razorpay subscriptions don't require a pre-created customer)
- `is_pro`, `pro_subscription_ends_at` — used as before

**Outstanding setup (Razorpay dashboard):**
- [ ] Create monthly plan (₹1000/month) → set `RAZORPAY_MONTHLY_PLAN_ID`
- [ ] Create annual plan (₹8000/year) → set `RAZORPAY_ANNUAL_PLAN_ID`
- [ ] Configure webhook URL: `https://www.brain-dump.co/api/razorpay/webhook`
- [ ] Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` on Vercel
- [ ] Complete Razorpay KYC / app approval
- [ ] Remove tester account after approval

**Optional cleanup:**
- [ ] Rename `stripe_customer_id` → `payment_customer_id` and `stripe_subscription_id` → `payment_subscription_id` (cosmetic DB migration, safe at any time)

**Acceptance criteria:**
- New subscription: user clicks "Get Pro" → Razorpay popup opens → payment → `isPro = true` within 5s
- Webhook fires on renewal and keeps `proSubscriptionEndsAt` current
- Cancel: subscription cancels at cycle end; `isPro` flips to false on expiry webhook
- Pricing page shows INR amounts and "Payments secured by Razorpay" footer

---

### Feature 13: Daily Review Digest Email

**Current state:** Route at `/api/cron/daily-digest` (Vercel Cron, 8am UTC). `lib/email.ts` uses Resend. Opt-in toggle in Settings saves to `user_profiles.preferences.dailyDigestEnabled`. Digest only sends to users where this is `true`.

**Gaps:**
- [ ] `RESEND_API_KEY` confirmed working in production
- [ ] Resend domain `braindump.app` or `brain-dump.co` verified (sender address is `digest@braindump.app`)
- [ ] Unsubscribe link in email footer must update the DB preference
- [ ] Skip users who already completed a review session today
- [ ] Cron return `{ sent, skipped, failed }` for observability

**Acceptance criteria:**
- Opted-in users receive email with streak, due count, and CTA link to `/review`
- Unsubscribe link works and opts user out
- Non-opted-in users never receive digest

---

### Feature 14: Streak & Freeze Tokens

**Current state:** Backend fully built. Streak tracked in `streaks` table. 2 freeze tokens per user. No UI.

**Gaps:**
- [ ] Freeze token count visible on dashboard or streak badge
- [ ] Freeze token prompt when user logs in the day after missing a day and has tokens
- [ ] Streak milestone celebrations (7 / 30 / 100 days)
- [ ] Define token replenishment rule

**Acceptance criteria:**
- Freeze token count visible
- Prompt appears when token can save a streak
- Milestones shown as celebratory moment

---

## 5. Monetisation — Pro Tier

**Current state:** Razorpay subscriptions live. Feature gates wired:
- Capture: 1/day free + a 30-learning lifetime library cap; Pro is 10/day + infinite library
- Teach Back: 3 per ISO week free, unlimited Pro
- Quiz: Pro-only (free users see an upgrade screen)
- Express: 1 lifetime trial free, unlimited Pro
- Express proof gate: all users must prove learning (not a Pro feature)

**INR pricing:**
| Plan | Price | Billed |
|------|-------|--------|
| Monthly | ₹1000/month | Monthly |
| Annual | ₹8000/year (₹667/month) | Annually — save ₹4000 |

**Outstanding before billing goes live:**

| Item | Priority |
|------|----------|
| Razorpay KYC / app approval | 🔴 Required |
| Create plans in Razorpay dashboard + set env vars | 🔴 Required |
| Webhook registered in Razorpay dashboard | 🔴 Required |
| Express upgrade modal links to `/pricing` (not old Stripe URL) | 🟡 High |
| Capture quota error links to `/pricing` | 🟡 High |
| Video capture Pro gate enforced end-to-end | 🟡 Medium |
| Pro badge in sidebar | 🟡 Low |
| Rename `stripe_*` columns to `payment_*` | 🟡 Low (cosmetic) |

**Free vs Pro:**

| Feature | Free | Pro |
|---------|------|-----|
| Captures per day | 1 | 10 |
| Library size | Up to 30 learnings (lifetime) | Infinite |
| Teach Back | 3 per week | Unlimited |
| Quiz | ❌ | ✅ |
| Express runs | 1 trial (lifetime) | Unlimited |
| Video capture | ❌ | ✅ |
| AI connections (future) | ❌ | ✅ |
| Email digest | ✅ | ✅ |
| Review | ✅ | ✅ |

---

## 6. What to Build Next — Prioritised

### Must-Have Before Public Launch (Blockers)

| Item | Why it blocks launch |
|------|---------------------|
| Razorpay KYC + plan setup | Billing non-functional without it |
| Forgot password flow | Users will lock themselves out |
| Delete account | GDPR legal requirement |
| Resend domain verification | OTP and digest emails may not deliver |
| Remove tester account | Security — static credentials in production |
| Upgrade modal → `/pricing` link confirmed | Trial/quota gates need a destination |
| Review session summary screen | Session ends with no feedback — jarring |
| Settings stubs made interactive (name, review difficulty) | Stubs destroy trust |

### High Value for Retention (Do Before Growth Push)

| Item | Why it matters |
|------|----------------|
| Freeze token UI | Users discover streak broke with no recourse; churn trigger |
| Streak milestone celebrations | Positive reinforcement loop |
| Review progress indicator ("3 of 8") | Session feels blind without it |
| Empty state on review ("all caught up") | Confusion without it |
| Book detail: delete + edit options | No escape for bad AI summaries |
| Capture duplicate URL detection | Repeated captures of same source is noisy |
| OG image for landing page | Social shares look professional |
| Pricing section on landing page | Sets expectation before trial-gate hits |

### High Value for Growth (Sprint 2)

| Item | Why it matters |
|------|----------------|
| Knowledge Insights Dashboard | The shareable "wow" screenshot moment; drives word of mouth |
| Rename `stripe_*` DB columns | Code hygiene before more engineers join |
| Email verification on signup | Trust signal; prevents fake accounts |
| AI connections (related learnings) | Requires pgvector; the power-user "aha" moment |

### Strategic (Sprint 3+)

| Item | Notes |
|------|-------|
| Browser extension | Distribution moat; largest organic growth lever |
| PWA / push notifications | Mobile re-engagement; complements email digest |
| Collaborative features | Only after individual value is proven |

---

## 7. Known Bugs

| Bug | Severity | Location |
|-----|----------|----------|
| Delete account missing | 🔴 Critical (GDPR) | Missing entirely |
| Forgot password missing | 🔴 Critical | Missing |
| Razorpay plans not created — billing non-functional | 🔴 Critical for monetisation | Razorpay dashboard |
| Resend domain unverified — OTP/digest emails may not deliver in production | 🔴 Critical | Resend dashboard |
| Tester static credentials in production (`tester@12345`) | 🔴 Security — remove after Razorpay approval | `lib/auth.ts` |
| Express upgrade modal has no link to `/pricing` after Stripe removal | 🟡 Medium | `app/(app)/express/client.tsx` |
| Capture daily limit shows raw error, not designed upgrade prompt | 🟡 Medium | `app/(app)/capture` |
| Settings preferences (review difficulty, name) are non-interactive stubs | 🟡 Medium | `app/(app)/settings` |
| No session summary screen after completing review | 🟡 Medium | `app/(app)/review` |
| Freeze tokens have no UI to display or consume | 🟡 Medium | Dashboard |
| Review session has no progress indicator | 🟡 Low | `app/(app)/review` |
| No empty state when nothing is due for review | 🟡 Low | `app/(app)/review` |
| Book detail has no delete / edit options | 🟡 Low | `app/(app)/library/[id]` |
| Source URL not rendered as clickable link on detail page | 🟡 Low | `app/(app)/library/[id]` |
| `stripe_customer_id` / `stripe_subscription_id` column names misleading | 🟢 Cosmetic | DB schema |

---

## 8. Pre-Release Checklist

### Security
- [ ] Remove tester account (`tester@brain-dump.co`) before public launch
- [ ] Rate limiting on OTP send endpoint
- [ ] CSRF protection verified (NextAuth provides; confirm not bypassed)
- [ ] All server actions call `requireUserId()` before touching user data
- [ ] `CRON_SECRET` header checked on all cron routes
- [ ] No stack traces or internal errors exposed to users
- [ ] Razorpay webhook signature verified before processing (✅ done)
- [ ] `.env.example` only (no secrets in git)

### Data & Privacy
- [ ] Delete account removes all user data from all tables
- [ ] Privacy policy page exists
- [ ] Terms of service page exists
- [ ] GDPR-compliant email unsubscribe (digest footer unsubscribe link)
- [ ] Cookie banner if using analytics

### Reliability
- [ ] Supabase pooler URL in use (✅ done)
- [ ] AI API errors don't crash the UI
- [ ] Cron job failure alerts (Vercel monitoring)
- [ ] All AI calls have timeouts and fallback messages
- [ ] Resend API key and cron secret confirmed in Vercel environment

### Quality
- [ ] Core flow end-to-end: signup → onboarding → capture → review → teach-back → express
- [ ] Razorpay payment flow end-to-end: pricing → popup → payment → Pro activated
- [ ] All forms validate input with inline errors
- [ ] Loading states on all async actions
- [ ] 404 page exists
- [ ] Error boundary at app layout level

### Performance
- [ ] Library paginates (don't load 1000 learnings at once)
- [ ] AI responses > 8s have streaming or progress state
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1

---

## 9. Environment Variables Reference

| Variable | Used by | Required |
|----------|---------|----------|
| `DATABASE_URL` | Drizzle ORM | ✅ Must be Supabase pooler URL (port 6543) |
| `AUTH_SECRET` | NextAuth | ✅ |
| `AUTH_URL` | NextAuth | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | ✅ |
| `ANTHROPIC_API_KEY` | All AI features | ✅ |
| `RESEND_API_KEY` | OTP emails, digest | ✅ |
| `EMAIL_FROM` | OTP emails | ✅ Must be verified sender in Resend |
| `CRON_SECRET` | `/api/cron/*` routes | ✅ |
| `NEXT_PUBLIC_APP_URL` | Email links, Razorpay success redirect | ✅ Must be `https://www.brain-dump.co` |
| `RAZORPAY_KEY_ID` | Razorpay server SDK | ✅ |
| `RAZORPAY_KEY_SECRET` | Razorpay server SDK, HMAC verify | ✅ |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verify | ✅ |
| `RAZORPAY_MONTHLY_PLAN_ID` | `createSubscription` | ✅ |
| `RAZORPAY_ANNUAL_PLAN_ID` | `createSubscription` | ✅ |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay JS popup (browser) | ✅ |

---

## 10. Suggested Review Order (Highest Risk First)

1. **Razorpay dashboard setup** — create plans, register webhook, set all env vars on Vercel
2. **Forgot password + delete account** — legal/trust blockers for public launch
3. **Resend domain verification** — OTP and digest emails may silently fail in production
4. **Remove tester account** — do this immediately after Razorpay approval
5. **Express upgrade modal** — confirm it links to `/pricing` (not old Stripe path)
6. **Review session** — progress indicator, summary screen, empty state
7. **Settings** — make name + review difficulty interactive; delete account
8. **Capture daily limit** — upgrade prompt UI instead of raw error
9. **Onboarding** — full new-user flow end-to-end on mobile
10. **Dashboard** — freeze token UI, empty state, streak day 0
11. **Library + detail** — delete/edit, source URL link
12. **Landing page** — OG image, pricing section, social proof
13. **Security audit** — auth guards, data deletion, cron secret
14. **Performance pass** — library pagination, AI timeout handling
