# PocketLedger — Platform Spec

> The product behind the positioning. This is what gets built, what gets sold, and what gets measured.

---

## 1. Product summary

**PocketLedger** is a mobile-first, on-device-default personal finance notebook. Users log money in three ways (voice, photo, chat), and the app answers in three ways (chat with citations, a structured check-in card, an audio recap). The model that reads the data lives on the phone by default. Cloud is opt-in and end-to-end encrypted.

**Platforms**: iOS 17+ (Apple Intelligence path), Android 14+ (AICore / Gemini Nano path). Web companion for power users. WatchOS / Wear OS read-only glance.

**Languages (v1)**: English, Spanish, Indonesian, Tagalog, Vietnamese, Hindi. (Gemma 3 4B has 140-language capability; the smaller Phi-3 is English-strong.)

---

## 2. Target users and JTBD

### Primary persona — "Maya"
26, designer, $42K–$68K income, 1–2 credit cards, 1 HYSA, BNPL habit. Anxiety-driven, mobile-first, AI-fluent, privacy-conscious. Last tried YNAB, quit in 3 weeks.

**Three jobs to be done**:
1. *Show me where the money actually goes, without making me build a budget.*
2. *Catch me before I make a mistake I'll regret on Sunday.*
3. *Show me I'm getting better, not worse.*

### Secondary persona — "Daniel"
41, married, two kids, freelance consultant. Mixes personal and business receipts, hates tying them together in spreadsheets. Needs monthly check-ins that survive an audit. JTBD: "Give me a clean, citable, month-end recap I can show my accountant in five minutes."

### Tertiary persona — "Priya"
19, college student, first credit card, parents send money. JTBD: "Help me not freak out every time I open my banking app." Needs the soft Gen-Z voice, gamified streaks, no shame.

### Anti-persona — "Marcus"
40, options trader, needs Bloomberg-level data on his portfolio. **PocketLedger is not for him.** Telling him so politely is a feature, not a bug.

---

## 3. Core feature pillars

### Pillar 1 — The Notebook (data substrate)
The durable object in the user's life. Every source, every transaction, every chat, every check-in lives here.

- **Sources** — bank statement PDFs/photos, credit-card summaries, brokerage statements, manually-typed notes, voice memos, photo receipts, recurring text entries ("Amex 150 Petrol").
- **Pages** — durable groupings inside a notebook: `Dining`, `Subscriptions`, `Rent + Utilities`, `Travel`, `Side Income`. Auto-suggested, user-confirmed.
- **Threads** — every chat is a thread attached to a source, a page, or a goal. Threads are searchable, pinnable, exportable.
- **Check-ins** — a recurring ritual, weekly or monthly, that produces a 1-page "what changed" card.

### Pillar 2 — The Three Inputs
- **Voice** — "Spent fourteen fifty on lunch." On-device speech-to-text (Whisper-tiny or Apple Speech), on-device intent parser.
- **Photo** — receipt, bank statement, contract, payslip. On-device OCR + LLM extraction.
- **Chat** — the long-form conversation. "Where am I overspending?" "What changed in March?" "What subscriptions do I have?"

### Pillar 3 — The Three Outputs
- **Chat with citations** — every claim points to a source line. The user can tap the citation to see the original.
- **Check-in card** — a structured 1-page artifact: top movers, subscription creep, goal progress, an "Aura" score. Designed to be screenshot-shared.
- **Audio recap** — a 2-minute spoken summary of the check-in. Voice is on-device TTS (Piper / Apple AVSpeechSynthesizer). The script is generated on-device.

### Pillar 4 — The Math Layer
A deterministic Python-or-Rust execution environment that the on-device LLM can call as a tool. Sits next to the model, not behind it.

- All aggregations, averages, deltas, projections run here.
- Every numeric answer ships with an expandable "show me the calculation" view.
- Numbers are reproducible — same input, same answer, no sampling.

### Pillar 5 — The Goals and Frameworks Layer
The user uploads goal documents, learning frameworks, or picks from a curated library.

- Curated library (v1): 30+ frameworks — *50/30/20*, *Zero-based*, *Debt avalanche*, *FIRE 4% rule*, *Ramen-profitability* (for freelancers), *Cash-buffer 1-month*, etc.
- User goals: free-form text, parsed into structured intent on-device.
- Goal-vs-actual reconciliation runs on every check-in.

### Pillar 6 — The Privacy Architecture
- **On-device by default.** Notebook, sources, threads, goals, math all live in an encrypted local store (Apple CryptoKit / Android Keystore).
- **Cloud is opt-in, end-to-end encrypted.** When enabled (e.g., for cross-device sync), the user's key never leaves the device. We cannot read the data.
- **No telemetry by default.** No "improve the model" toggle. Crash logs are opt-in, anonymized, and aggregated.
- **Model hot-swap.** When Apple or Google ships a better on-device model, we ship it as an OTA update behind the same API. The user does not need to do anything.

### Pillar 7 — The Sharing and Social Layer
- **Watermarked check-in cards** — designed for Instagram/TikTok stories. Watermark is the PocketLedger logo + a one-tap "how I did it" link.
- **Couples mode** — two devices, one shared notebook. Both partners can read, only one can write. v1.5.
- **Accountant export** — one-tap PDF/CSV export of structured transactions + receipts for a date range. Daniel's killer feature.
- **Public notebooks** — opt-in. Users can publish a "frameworks I follow" notebook that others can fork.

---

## 4. Feature matrix (v1 vs v1.5 vs v2)

| Feature | v1.0 (months 0–6) | v1.5 (months 6–12) | v2.0 (year 2) |
|---|---|---|---|
| Voice input (en) | ✅ | ✅ | ✅ |
| Voice input (es, id, tl, vi, hi) | ⚠️ en + es | ✅ | ✅ |
| Photo OCR (receipts) | ✅ | ✅ | ✅ |
| Photo OCR (statements) | ✅ | ✅ | ✅ |
| Photo OCR (contracts) | ❌ | ✅ | ✅ |
| Chat with citations | ✅ | ✅ | ✅ |
| Deterministic math layer | ✅ | ✅ | ✅ |
| Check-in card (auto) | ✅ | ✅ | ✅ |
| Audio recap | ✅ | ✅ | ✅ |
| Curated goal library (30+) | ✅ | ✅ | ✅ |
| Free-form goal upload | ✅ | ✅ | ✅ |
| Plaid bank link | ❌ | ⚠️ opt-in Pro | ✅ |
| Couples mode | ❌ | ✅ | ✅ |
| Accountant export (PDF/CSV) | ⚠️ CSV only | ✅ | ✅ |
| Public notebooks | ❌ | ⚠️ read-only | ✅ |
| WatchOS / Wear OS glance | ❌ | ✅ | ✅ |
| Web companion | ❌ | ⚠️ read-only | ✅ |
| Apple Watch / Wear OS quick-log | ❌ | ❌ | ✅ |
| Crypto onramp summaries | ❌ | ❌ | ✅ |
| Tax-prep handoff | ❌ | ❌ | ✅ |

---

## 5. The user journey (Maya's first 30 days)

**Day 0 — Install**
- App Store / Play Store, 28MB download, no signup.
- "Welcome to PocketLedger. No account needed. Your data lives on this phone."
- One onboarding screen: pick a vibe (Calm, Direct, Playful) — affects voice & visual tone.
- Two questions: "What do you want to feel about money in 90 days?" "Anything you want to be different in a year?" (free text, parsed on-device).

**Day 1 — First capture**
- Maya opens the app. Three big buttons: *Speak*, *Snap*, *Chat*.
- She taps *Snap*, photographs a coffee receipt. Three seconds later, the app shows: "$4.75 at Blue Bottle, today 8:42am, category: Coffee. Looks right?" She taps *Yes*.
- A page is auto-created: `Coffee`. She is told: "This is your first page. You can rename it, group it, or delete it."

**Day 3 — First voice entry**
- Walking home from lunch: "Spent eighteen dollars on Thai food."
- Notification: "Got it. $18 at Thai Basil, today 1:14pm, category: Dining. Looks right?" Swipe *Yes*.

**Day 7 — First check-in**
- Push notification, Sunday 7pm: "Your week, in one tap. Want to see it?"
- The check-in card: 
  - Top movers (Subscriptions +$0, Coffee +$12, Dining -$8 vs last week)
  - Anomaly: "That's 4× your usual coffee spend — anything going on?"
  - Goal progress: "You're 12% toward your $1,000 buffer. 6 weeks at this pace."
  - Aura: a soft amber gradient, "Steady."
- One tap to share as a story with the PocketLedger watermark.

**Day 14 — First chat**
- "What subscriptions am I paying for?"
- Answer, with citations: "Spotify $9.99 (source: Amex PDF Feb 4), iCloud+ $2.99 (source: Visa PDF Feb 8), NYT $17 (source: Visa PDF Feb 11). Three total, $29.98/mo. Want to cancel any?"
- Tap *Cancel NYT* → deep link to NYT's cancel page with a one-paragraph "why I'm canceling" pre-filled.

**Day 30 — The first real win**
- The Sunday check-in shows: "You spent $140 less than last month. Three things drove it." A shareable card.
- Maya shares it. Her friend downloads PocketLedger. The loop starts.

---

## 6. Daniel's first 30 days (the pro arc)

**Day 0** — Same install, no signup. Persona-aware onboarding: "Looks like you mix personal and business. Want separate notebooks, or one with a tag?"
**Day 1** — Drop in a year of business bank statements. App parses them, asks: "Which are personal? Which are business?" User tags. From now on, every photo and voice entry carries the active tag.
**Day 7** — First accountant export. "Send the last 30 days of business transactions to my accountant." PDF + CSV with original receipt thumbnails inline. One tap.
**Day 30** — The month-end check-in card is now a single-page client-ready report. Daniel's accountant replies: "This is the cleanest handoff I've ever seen."

---

## 7. Priya's first 30 days (the Gen-Z arc)

**Day 0** — Onboarding vibe: *Playful*. The first screen says "hey 👋 let's make money less weird."
**Day 1** — "How much do I have right now?" Maya says $237. PocketLedger: "Cool. That's $237. Want a goal? I have a starter: *save $50 this month*."
**Day 7** — Streak: 7 days logging. "🔥 week 1." She gets a soft push: "How about a 30-day streak?"
**Day 14** — "What if I spend less on coffee?" → the app shows a concrete path: "Skip 2 coffees a week → save $32/month. That's a new shirt, or $384 a year. Want me to remind you on Mondays?"
**Day 30** — First monthly wrap: "You saved $43. That's 86% of your goal. Your future self is proud."

---

## 8. Design principles

1. **The chat is the home screen.** No dashboard before the user has data.
2. **One tap, one answer.** Every surface should be answerable in 1 tap. If it isn't, redesign it.
3. **The math is a first-class citizen.** Every number ships with the calculation behind it. No "trust me" numbers.
4. **Sources are sacred.** Every claim is cited. The user can always see the line.
5. **Local first, cloud later, never required.** The app works on a plane.
6. **The check-in is the habit.** We are building a ritual, not a tool.
7. **The voice matches the user's vibe, not ours.** Three vibes: Calm, Direct, Playful.
8. **No shame, no streaks that punish.** Priya missing a day does not get a red exclamation mark.

---

## 9. Monetization

**Free tier (forever, no ads)**
- 1 notebook, 5 pages, 30 days of history.
- Voice + photo + chat input, 30 logs/day.
- On-device model.
- Check-in card (no share).
- 1 curated framework.

**Pro tier — $4.99/mo or $39.99/yr**
- Unlimited notebooks, pages, history.
- Unlimited check-ins, unlimited share-with-watermark.
- All curated frameworks.
- Plaid bank link (opt-in).
- Couples mode.
- Accountant export (PDF + CSV).
- Cloud sync across devices, E2E encrypted.
- Priority on-device model (the larger 4B variant when available).

**Family tier — $7.99/mo**
- Up to 5 devices, one shared notebook + personal notebooks.
- Kids' mode (parent-set allowances + visibility).

**No data sales, ever.** No "we'll share anonymized data with research partners" toggle. The on-device default makes this easy to defend.

**Why this price works**:
- Cheaper than YNAB ($14.99) and Monarch ($14.99), the two credible paid players.
- Cheaper than Rocket Money Premium ($6–$14).
- Priced to convert free users who hit the 30-day cap or the 30-logs/day cap.
- The $4.99 number is a *deliberate* under-pricing vs the category — we want the funnel, not the ARPU, in year one.

---

## 10. Success metrics (north star + leading indicators)

**North star**: Weekly Check-ins Completed (WCC). A user who runs the Sunday check-in and engages with the card is a retained user.

**Leading indicators**:
- D1 retention (came back after first install)
- D7 retention (ran the first check-in)
- D30 retention (the second check-in happened)
- Voice/photo share of inputs (higher = more habitual)
- Citations tapped per chat (higher = more trust)
- Share-with-watermark rate (higher = organic loop working)
- Pro conversion at D14 and D30

**Anti-metrics** (we will watch these and *not* optimize for them):
- Bank accounts linked (we want this to be low — it means the on-device model is doing the work)
- DAU on a Tuesday at 3pm (we want engagement, but not anxiety engagement)
- Time-in-app (low is good — this is an answer machine, not a slot machine)

---

## 11. Compliance posture

- **Not a financial advisor.** All output is explicitly framed as educational and personal-tracking. The check-in card and the chat include a "this is not financial advice" disclosure on first use and in the About screen.
- **CFPB/FTC posture** — on-device inference is a structural advantage: we cannot read the data, so we cannot be accused of misusing it. The privacy page makes this auditable.
- **GDPR / CCPA** — because data lives on the device by default, GDPR right-to-erasure is a `delete-the-app` away. The privacy posture is the product.
- **App Store / Play Store** — Apple Nutrition Labels and Google Data Safety forms will be populated honestly: "Data not collected" for the free tier, "Data collected: only what you sync" for Pro.

---

## 12. The roadmap at a glance

| Quarter | Theme | Headline ship |
|---|---|---|
| Q1 (months 0–3) | Ship the spine | iOS + Android v1.0, on-device chat + math + voice + photo, 1 curated framework, free only |
| Q2 (months 3–6) | Ritual | Weekly check-in automation, audio recap, shareable cards, Pro tier opens |
| Q3 (months 6–9) | Surface area | v1.5 — Couples, Accountant export, Plaid opt-in, WatchOS glance, 5 more languages |
| Q4 (months 9–12) | Trust | Public notebooks (read-only), tax-prep handoff, Android AICore deep integration |
| Year 2 | Category | Crypto onramp summaries, web companion, family tier, public API for accountant integrations |

---

## 13. What we are *not* building (the anti-roadmap)

To keep focus, the following are explicitly *out of scope* for 2026:

- Stock trading, brokerage integration, robo-advice
- Crypto custody or exchange integration (we summarize, we don't custody)
- A web-first product (mobile is the only primary surface in v1)
- A social feed (sharing is via OS share-sheet, not an in-app feed)
- An ad-supported tier
- A "premium AI coach" upsell that contradicts our on-device posture
- White-label / B2B (year 3+)
