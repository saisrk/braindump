# Braindump v2 — Activation & Growth Execution Plan

> Working document. The goal of v2 is to fix the single biggest problem the
> analytics surfaced: **users almost never reach Express (the paid, differentiating
> feature) — only ~21 of 634 visitors did — so they never feel the value that
> justifies paying.** v2 moves that "aha" from step 7 of the funnel to day one,
> and adds capture inputs that make the library fill itself.

---

## Context (why we're doing this)

From the post-launch Vercel analytics (7-day window after the TheresAnAIForThat launch):

- **Funnel:** `/` 594 → `/signup` 102 → `/onboarding` 77 → `/capture` 64 → `/library` 49 → `/review` 37 → `/teachback` 26 → **`/express` 21** → `/pricing` 9.
- **Onboarding completion is healthy** (~75% of signups finish). Don't disrupt it.
- **Express — the painkiller feature — is the end of the longest path and is not even mentioned in onboarding today.** Step 3 of `app/onboarding/page.tsx` shows a static Capture → Review → Master loop that omits Quiz *and* Express.
- Traffic was a one-time directory spike, now decaying. No compounding acquisition loop.

**Strategic decisions baked into this plan (from the product discussion):**
1. **Lead with Express** (outcomes: interview answers, talking points) as the hero of onboarding and the daily loop — retention is the supporting act.
2. **Grant one free, ungated Express** on a seed learning so every user tastes the value on day one (keeps the proof-gate for ongoing use). This is what makes the dashboard highlight actually land.
3. **Show pricing at the moment of value** (right after an Express output), not only at trial expiry.

**What already exists in the codebase that we reuse (don't rebuild):**
- `app/onboarding/page.tsx` — 3-step flow (name → topics → loop). We replace only step 3's static loop.
- `lib/actions/onboarding.ts::completeOnboarding()` — seeds 2 sample learnings (`sourceType: 'sample'`), sets `onboardedAt`, sends welcome email, redirects `/home`.
- `components/dashboard-tour` (`DashboardTour`) + `userProfiles.dashboardTourSeenAt` — infra for the dashboard highlight.
- `userProfiles.expressTrialUsed` (boolean, default false) — originally the old "1 Express trial" flag; **repurpose it as the "used your one free ungated Express" marker.**
- `lib/actions/express.ts::runExpress()` — access gate (`hasAccess`) + proof gate (`getProvenLearningIds`, needs quiz ≥70 or teachback ≥60). This is where the free-taste exception goes.
- `db/schema/learnings.ts` — already has `videoUrl`, `videoTitle`, `videoChannel`, `videoDuration`, and `sourceType` supports `'url' | 'text' | 'video' | 'sample'`. Video capture is half-scaffolded.
- `@vercel/analytics` — installed (`app/layout.tsx`). Use `track()` for custom activation events.
- `lib/email.ts` — `sendRawEmail`, `sendSequentially`, `buildAutoLoginUrl` for any lifecycle touches.

---

## The end state (what "done" looks like)

A new user: signs up → names themselves → picks topics → **watches (or skips) a ~15–20s animation of the full loop including Express** → lands on the dashboard where **the seeded sample learning is highlighted with a "Try this →" prompt** → clicks it → **generates their first Express output (talking points / STAR) with no proof-gate** → sees a **"Loved this? Pro keeps Express unlimited — N days left"** nudge. Separately, they can **capture from a YouTube URL** (and, optionally later, forward newsletters or upload files) so the library fills itself.

Each phase below is independently shippable and ordered so the product is never broken mid-way. Phases 1–3 are the activation core; Phase 4 is the priority new input; Phases 5–6 are **optional** and last.

---

## Phase 0 — Instrumentation (do first; everything else is measured against it)

**Goal:** be able to prove each change works. Without events we can't tell if the animation or the highlight move the needle.

**Steps:**
1. Add a tiny client helper `lib/analytics.ts` wrapping `import { track } from '@vercel/analytics'` with typed event names:
   - `onboarding_animation_played`, `onboarding_animation_skipped`
   - `dashboard_seed_highlight_shown`, `dashboard_seed_highlight_clicked`
   - `first_express_generated` (the north-star activation event)
   - `express_upgrade_nudge_shown`, `express_upgrade_nudge_clicked`
   - `capture_youtube_submitted`
2. Fire `first_express_generated` from the Express result render in `app/(app)/express/client.tsx` (and the guided flow in Phase 2).

**Verification:** trigger each path locally, confirm events appear in Vercel Analytics → Events.

**Leads to:** every later phase reports against these events.

---

## Phase 1 — Onboarding animation of the full loop (incl. Express)

**Goal:** replace step 3's static 3-icon loop with a short, skippable, tracked animation that *shows Express exists* — fixing the gap where the money feature is invisible in onboarding. Keep it subordinate to Phase 2 (the real activation is doing, not watching).

**Files:**
- `app/onboarding/page.tsx` — replace the step-3 `LoopStep` block (the `Capture → Review → Master` grid) with a new `<LoopAnimation name={firstName} onSkip={…} onDone={…} />`.
- New `app/onboarding/loop-animation.tsx` — a self-contained CSS/Framer-free animated sequence (pure CSS keyframes to stay dependency-light, matching the existing inline-style approach). Frames:
  1. **Capture** — a URL "pastes" into a card, card flips to a summary + key points.
  2. **Review** — flashcards flip.
  3. **Teach Back** — a chat bubble types an explanation, AI scores it.
  4. **Quiz** — an MCQ with a correct tick.
  5. **Express** — the learnings visibly *transform* into a "STAR interview answer" / "Talking points" card. **This is the money frame — give it the most screen time.**
- Header uses the captured `firstName` ("Here's how it works, {name}").

**Behavior:**
- Auto-plays once, loops subtly, has a visible **Skip** and a **Continue** that advances to the existing celebration/finish.
- Fire `onboarding_animation_played` on start, `onboarding_animation_skipped` if skipped.
- **Do not add a mandatory gate** — onboarding completion is currently healthy (~75%); the animation replaces existing step-3 content, it does not lengthen the flow.

**Verification:** complete onboarding with and without skipping; confirm both events fire; confirm completion rate isn't harmed (watch `onboarding` → `home` in analytics for a week).

**Leads to:** the user now *knows* Express exists before hitting the dashboard, priming Phase 2.

---

## Phase 2 — First ungated Express + dashboard seed highlight (the activation win)

**Goal:** deliver the actual "aha" — the user generates their **own** first Express output on day one, with no proof-gate, guided from the dashboard. This is the highest-impact change in v2.

### 2a — Grant one free, ungated Express (backend)
**Files:** `lib/actions/express.ts`
- In `runExpress()`, before the proof gate: if `expressTrialUsed === false`, **skip the proof gate** for this one call, generate, then set `expressTrialUsed = true`.
- Keep the `hasAccess` (trial/pro) gate — this is about the *proof* gate only, not entitlement.
- Reuse the existing `userProfiles.expressTrialUsed` column (no migration needed).

### 2b — Dashboard highlight of the seed learning (frontend)
**Files:** `app/(app)/home/page.tsx`, `lib/actions/insights.ts` (extend `getDashboardStats` to return the first `sourceType='sample'` learning id + whether `expressTrialUsed` is still false), reuse/extend `components/dashboard-tour`.
- When `expressTrialUsed === false` and a seed learning exists, render a prominent, dismissible highlight card on the dashboard:
  > **"Try Express on _{seed title}_ →"** — "Turn this into interview-ready talking points in one click."
- Clicking routes to a **guided Express** entry: `/express?learningId={seedId}&format=talking-points&guided=1`.
- Fire `dashboard_seed_highlight_shown` / `_clicked`.

### 2c — Guided Express entry (frontend)
**Files:** `app/(app)/express/client.tsx`
- Support `?learningId=&format=&guided=1`: pre-select the format + scope, auto-run `runExpress`, land the user straight on the result (skip the format/scope pickers on the guided path).
- On result render, fire `first_express_generated`.

**Verification:**
- New user with only seed learnings → dashboard shows highlight → click → Express result renders with **no "prove your learning first" wall** → `expressTrialUsed` flips true → highlight disappears on next load.
- Second Express attempt on an unproven learning correctly hits the proof gate again.

**Leads to:** the user has now *felt* the paid value — Phase 3 converts that feeling.

---

## Phase 3 — Value-moment upgrade nudge

**Goal:** surface pricing at the highest-intent moment (just after an Express output), not only at trial death. `getEntitlement()` already returns `trialDaysLeft`.

**Files:** `app/(app)/express/client.tsx` (result view), reuse `getEntitlement`/`entitlementInfo`.
- After any successful Express result, if `entitlement === 'trial'`, show an inline, low-friction banner:
  > **"Loved this? Pro keeps Express unlimited — {trialDaysLeft} day{s} left in your trial."** → `/pricing`.
- Fire `express_upgrade_nudge_shown` / `_clicked`.
- Optional: a mid-trial value-recap email using the existing email infra (`lib/email.ts`, a new `lib/emails/*` + cron), recapping "captured X, mastered Y — here's what Pro keeps." Sequence after Phases 1–3 ship.

**Verification:** trial user sees the nudge post-Express with correct days-left; pro user sees nothing; clicking lands on `/pricing`.

**Leads to:** activation (Phase 2) now has a conversion path attached.

---

## Phase 4 — YouTube capture (priority new input)

**Goal:** "drop a YouTube link → get a summary + flashcards." High marketing appeal, big learner segment, and the schema is already half-there.

**Files:**
- `app/(app)/capture/page.tsx` — detect YouTube URLs; show a distinct "Video" affordance/state.
- `lib/actions/capture.ts::saveSkeleton()` — set `sourceType: 'video'` + `videoUrl` for YouTube links.
- `app/api/capture/enrich/route.ts` — when video: fetch transcript (YouTube transcript API / a transcript service), then run the existing enrichment (summary, key points, flashcards) over the transcript; populate `videoTitle`, `videoChannel`, `videoDuration`.
- Handle no-transcript gracefully (fall back to title/description or a clear "couldn't read this video" state; keep `learnings.status` = `'failed'` path intact).

**Verification:** paste a YouTube URL → learning is created as `video` → enrichment produces summary + cards → appears in library with video metadata. Fire `capture_youtube_submitted`.

**Leads to:** more captures → more learnings → more Express fuel, and a shareable marketing hook.

---

## Phase 5 — Newsletter ingest *(OPTIONAL, later)*

**Goal:** the library fills itself. A unique inbound email address per user; forwarded newsletters become learnings automatically → recurring reason to open the app.

**Sketch (build only if we pursue it):**
- Per-user inbound address, e.g. `u+{token}@capture.brain-dump.co` (token stored on the user/profile).
- Inbound email webhook (Resend Inbound or similar) → route → resolve token → create a learning from the email body → run existing enrichment.
- Surface the address in Settings with copy/instructions.

**Status:** optional; not scheduled until Phases 1–4 prove out. Requires inbound-email infra + spam/dedup handling.

---

## Phase 6 — File upload (PDF/docs) *(OPTIONAL, last)*

**Goal:** capture from PDFs/documents.

**Sketch (build only if we pursue it):**
- Upload UI on `/capture`; store the file; extract text (PDF parsing); run existing enrichment over the extracted text; `sourceType: 'file'` (schema addition).
- Heaviest lift (parsing, storage, size/type limits) for the least differentiation — deliberately last.

**Status:** optional; lowest priority.

---

## Sequencing summary

| Phase | What | Why it's here | Optional? |
|------|------|---------------|-----------|
| 0 | Instrumentation | Measure everything after | No |
| 1 | Onboarding loop animation (incl. Express) | Make the money feature visible | No |
| 2 | Free ungated Express + dashboard highlight | **The activation win** — day-one aha | No |
| 3 | Post-Express upgrade nudge | Convert the aha while it's hot | No |
| 4 | YouTube capture | Priority new input; schema half-ready | No |
| 5 | Newsletter ingest | Self-filling library / retention loop | **Yes, later** |
| 6 | File upload | Broad but heavy; least differentiated | **Yes, last** |

**North-star metric for v2:** `first_express_generated` per new signup (activation rate). Everything above is judged by whether it lifts that number, then whether trial→paid conversion follows.

## Open decisions to confirm before building
- **Proof-gate free taste** — this plan assumes "one free ungated Express via `expressTrialUsed`." Confirm.
- **Animation scope** — pure-CSS in-house (assumed, dependency-light) vs. a small animation lib.
- **Positioning copy** — whether to also rewrite the landing hero around Express now, or after activation phases prove out (this doc covers in-product; landing copy is a separate change).
