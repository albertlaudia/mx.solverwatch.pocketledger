# PocketLedger — Production Roadmap

> The ultra-detailed plan to take PocketLedger from "6 strategy docs in a sandbox folder" to "v1.0 shipping on the App Store and Play Store, public on GitHub, with paying users."

---

## 1. The honest starting line

**What exists today (Sep 17, 2026)**:
- 6 strategy documents (~190KB of markdown) in `/workspace/ledgerlens/docs/`.
- A 24-slide pitch deck (`/workspace/ledgerlens/deck/slides/output/pocketledger-strategy-and-architecture.pptx`, 629KB).
- A PDF export of the deck (104KB).
- **Zero** lines of production code. **Zero** git commits. **Zero** deployed infrastructure. **Zero** registered domains. **Zero** Apple Developer Program enrollment. **Zero** Anthropic BAA.

**What "production" means for PocketLedger**:
- v1.0 live on the App Store and Play Store with a paid Pro tier.
- Public GitHub repo under the `pocketledger` org with the AGPL-3.0 source.
- 100K+ MAU, 4-8% Pro conversion, $144K-1.5M ARR.
- All on-device-by-default, $0 variable cost on the free tier.
- A self-improving redteam + math-audit + privacy-audit pipeline.
- A private cloud LLM tier (Claude Haiku 4.5) accessible only to Pro users who explicitly opt in.

**The 6-month journey from zero to v1.0** has three stages, each 2 months:
1. **Stage 1: Spine (months 1-2)** — monorepo, math engine, data layer, on-device AI runtime, design system, CI.
2. **Stage 2: Surface (months 3-4)** — iOS app, Android app, Day 0 / Day 7 / Day 14 / Day 30 user journeys, all on-device.
3. **Stage 3: Store (months 5-6)** — Pro tier + Plaid opt-in + couples + accountant export + App Store + Play Store + waitlist onboarding + first 10K users.

After v1.0: **months 7-12 = scale to 125K MAU**, **months 13-24 = scale to 600K MAU + v1.5 features**, **months 25-36 = scale to 1.75M MAU + Series B + path to profitability**, **months 37-48 = scale to 3.5M MAU + Series C + break-even at $25M ARR**.

---

## 2. The 10 epics that comprise v1.0

Each epic has: scope, deliverables, success criteria, dependencies, effort estimate, who-owns-it.

### Epic 1 — Repo, tooling, CI

**Scope**: Get the monorepo from zero to "any Flutter engineer can clone, bootstrap, and ship a green build in under 10 minutes."

**Deliverables**:
- Public GitHub repo at `github.com/pocketledger/pocketledger` (license: AGPL-3.0).
- FVM pinning `.fvmrc` → Flutter 3.32.0 / Dart 3.5.0+.
- Dart pub workspaces + Melos 6.x: `pubspec.yaml` at root, `melos.yaml`, `melos bootstrap`.
- `.github/workflows/`: `ci.yml` (format + analyze + test + math-audit + privacy-audit), `ios-build.yml` (self-hosted macOS), `android-build.yml` (Ubuntu), `redteam.yml` (nightly 02:00 UTC).
- 16 packages scaffolded with `pubspec.yaml` + `lib/` + `test/` + `analysis_options.yaml` inheriting from root.
- `melos run analyze`, `melos run test`, `melos run format`, `melos run math-audit`, `melos run redteam`, `melos run privacy-audit`, `melos run build:all`.
- `.gitignore`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `README.md`, `CODEOWNERS`, `dependabot.yml`.
- Self-hosted macOS M2 Pro runner registered with the label `[self-hosted, macos, ARM64]`.
- `packages/config/` with root `analysis_options.yaml` enforcing 0 warnings.

**Success criteria**:
- `git clone https://github.com/pocketledger/pocketledger && cd pocketledger && fvm use && melos bootstrap && melos run analyze && melos run test` passes for a fresh contributor in <10 min.
- CI passes on the first commit.
- CODEOWNERS enforces review on every PR.
- Privacy audit composite action (`/.github/actions/privacy-audit/`) blocks any `package:http` / `dart:io.HttpClient` / `WebSocket` call against a non-`api.anthropic.com` domain in `packages/ai_runtime/` and `packages/data_layer/`.

**Dependencies**: none.

**Effort**: 4-6 days for a senior Flutter engineer with infra experience.

**Owner**: Founding Flutter engineer (you or first hire).

---

### Epic 2 — Math engine + 200-case audit

**Scope**: Build the deterministic math engine that is the structural answer to "NotebookLM is the wrong tool for money." Ship the 200 hand-curated test cases that prove the engine is correct. This is the trust wedge.

**Deliverables**:
- `packages/math_engine/` with the 15 tools: `sum_transactions`, `group_by_category`, `detect_subscriptions`, `goal_progress`, `month_over_month_delta`, `projection`, `aura_score`, `anomaly_detect`, `forecast_cashflow`, `category_rewrite`, `merchant_normalize`, `recurring_detect`, `top_merchants`, `budget_burn_rate`, `savings_rate`.
- Each tool as a pure Dart function returning `{ result, formula, provenance }` where `formula` is the reproducible expression string and `provenance` is the list of inputs that drove the result.
- 200 hand-curated test cases in `packages/math_engine/test/math_audit/` covering: simple sums, multi-category aggregations, monthly deltas, subscription detection across noisy data, goal progress + projection, anomaly detection on synthetic spikes, currency normalization, year-over-year comparisons, partial-month scenarios, leap-year edge cases, weekend-vs-weekday splits.
- Optional Rust port via `flutter_rust_bridge` for the hot path (sum / group on large datasets).
- `melos run math-audit` runs the 200 cases. Any failure fails the build.

**Success criteria**:
- 200/200 cases pass on every commit.
- Median latency for `sum_transactions` on a 10K-row notebook: <50ms.
- Median latency for `group_by_category` on a 10K-row notebook: <120ms.
- Every tool's output has a SHA-256 of `(input + formula)` that matches across two runs of the same input.

**Dependencies**: Epic 1.

**Effort**: 2-3 weeks for a senior Flutter engineer, with 1 week of dedicated test-case authoring (the 200 cases).

**Owner**: Founding Flutter engineer.

---

### Epic 3 — Data layer (Drift + SQLCipher + secure storage)

**Scope**: The encrypted notebook store. The source graph. The audit log. The vector index. The E2E sync envelope. The data layer never leaves the device by default.

**Deliverables**:
- `packages/data_layer/` with the Drift schema defining: `Notebook`, `Source`, `Chunk`, `Citation`, `Page`, `Transaction`, `Thread`, `Turn`, `Goal`, `Framework`, `CheckIn`, `Card`, `Persona`.
- Drift schema migration system with versioned migrations.
- SQLCipher 4.x integration via `drift/native` with `sqlite3mc` build hook.
- Master key generation via `Random.secure()` (256-bit, hex) on first install.
- Master key storage via `flutter_secure_storage`:
  - iOS: Keychain with `KeychainAccessibility.first_unlock`.
  - Android: Android Keystore + EncryptedSharedPreferences with AES-256 GCM.
  - Web: WebCrypto non-extractable.
- Per-notebook + per-source key derivation via HKDF-SHA-256.
- HNSW vector index over chunk embeddings, stored in the same encrypted Drift database.
- Append-only audit log table with signed entries.
- E2E sync envelope: X25519 + XChaCha20-Poly1305 between paired devices.
- 50+ unit tests for encryption, key derivation, sync envelope, retrieval correctness.

**Success criteria**:
- Database opens in <500ms on a 2023 flagship.
- 10K-row notebook + 10K vectors: search latency <50ms.
- Two paired devices sync in <5s for a typical 1MB notebook.
- Tampering with any byte of the encrypted DB file → "wrong key" error, no data leak.
- GDPR right-to-erasure: `consent.erase()` deletes the master key + overwrites the DB file in <2s.

**Dependencies**: Epic 1.

**Effort**: 3-4 weeks for a senior Flutter engineer with crypto experience.

**Owner**: Founding Flutter engineer.

---

### Epic 4 — On-device AI runtime (flutter_gemma + flutter_llama)

**Scope**: The five LLM tiers. The orchestrator that routes between them. The "show me the math" expansion. The persona engine.

**Deliverables**:
- `packages/ai_runtime/` with the `LocalModelRuntime` abstract class.
- Five impls:
  - `AppleFoundationModelRuntime` (iOS 18+, via `flutter_gemma` Apple Intelligence backend).
  - `AndroidAICoreRuntime` (Android 14+, via `flutter_gemma` AICore backend).
  - `BundledGemmaRuntime` (via `flutter_gemma` MediaPipe backend, Gemma 3 4B 4-bit).
  - `BundledPhiRuntime` (via `flutter_gemma` LiteRT backend, Phi-4 Mini 3.8B 4-bit).
  - `FunctionGemmaRuntime` (via `flutter_llama` with the fine-tuned GGUF).
  - `WebLLMRuntime` (web target only, via JS interop).
  - `CloudHaikuRuntime` (via `package:http` + E2E envelope, opt-in Pro only).
- `assets/model_registry.json` with the model manifest.
- `Orchestrator` Riverpod graph: `userInputProvider → intentClassifierProvider (FunctionGemma) → contextRetrieverProvider (Drift + HNSW) → planBuilderProvider (Tier 1/2 LLM) → toolExecutorProvider (math engine + Drift) → responseNarratorProvider → citationEngineProvider → personaApplierProvider → chatResultProvider`.
- FunctionGemma 270M fine-tune on the 15-tool API surface (one-time, $2K of GPU).
- Citation engine: every claim resolves to a `Citation` Drift row pointing to a `Chunk` row pointing to a `Source` row.
- Persona engine: three personas (Calm / Direct / Playful), each with system prompt prefix + TTS voice mapping + color palette.
- 100-question redteam suite in `packages/ai_runtime/test/redteam/`.
- Privacy audit composite action that scans the source code of `packages/ai_runtime/` and `packages/data_layer/` for outbound network calls.

**Success criteria**:
- FunctionGemma route + tool-call latency <300ms on iPhone 15 Pro / Pixel 8.
- Tier 1 / Tier 2 first-token latency <300ms.
- Redteam suite: 100/100 pass.
- Math audit + citation audit: every numeric answer ships with the reproducible formula.
- Privacy audit: 0 outbound network calls outside the allowlist.

**Dependencies**: Epic 1, Epic 2, Epic 3.

**Effort**: 4-6 weeks. 3 weeks for the runtime, 1 week for FunctionGemma fine-tune, 1-2 weeks for the orchestrator + redteam.

**Owner**: ML engineer + founding Flutter engineer.

---

### Epic 5 — iOS app (the primary surface)

**Scope**: The first shippable surface. All 7 pillars, all 4 key moments (Day 0, Day 7, Day 14, Day 30).

**Deliverables**:
- `apps/ios/` Flutter project with `ios/` Xcode workspace.
- `lib/main.dart` wires up `PocketLedgerSDK` with iOS implementations.
- 7 features: `chat/`, `checkin/`, `goals/`, `settings/`, `export/`, `onboarding/`, `thread/`.
- Material 3 + iOS-adaptive theming.
- WidgetKit home-screen widget showing the last check-in aura.
- ActivityKit Live Activity during check-in composition.
- App Intents for Siri Shortcuts ("Hey Siri, log this to PocketLedger").
- CloudKit integration for Pro cross-device sync (encrypted envelope).
- App Store privacy nutrition labels: "Data Not Collected" (free tier).
- TestFlight beta release at 1% / 10% / 50% / 100% staged rollout.

**Success criteria**:
- Day 0 path: install → first insight in **90 seconds** (5s app, 85s human).
- Day 7 path: first weekly check-in in **12 seconds**.
- Day 14 path: first chat query, **<1s to first token**.
- Day 30 path: accountant export for 30 days, **8 seconds**.
- App Store review passes on first submission (TestFlight beta).

**Dependencies**: Epics 2, 3, 4.

**Effort**: 6-8 weeks for a senior Flutter engineer with iOS experience. The 4 key-moment targets are the hardest thing — each has a target latency that must be hit in production.

**Owner**: Founding Flutter engineer + iOS-specialist engineer.

---

### Epic 6 — Android app

**Scope**: Same Flutter code, Android overrides. Same 7 pillars, same 4 key moments.

**Deliverables**:
- `apps/android/` Flutter project with `android/` Gradle project.
- `lib/main.dart` wires up `PocketLedgerSDK` with Android implementations.
- Same 7 features as iOS, with Material You dynamic color theming.
- Glance home-screen widget.
- WorkManager scheduling for the Sunday check-in.
- Google Drive integration for Pro cross-device sync (encrypted envelope, app-data scope).
- Play Internal release at 5% / 20% / 100% staged rollout.

**Success criteria**:
- All 4 key-moment latency targets hit on Pixel 8 / Galaxy S24.
- AICore detection on launch; fall back to bundled Gemma 3 4B on older devices.
- Play Store review passes on first submission.

**Dependencies**: Epic 5 (mostly reusing Flutter code; ~30% incremental work).

**Effort**: 2-3 weeks incremental.

**Owner**: Android-specialist Flutter engineer.

---

### Epic 7 — Backend + auth + billing + telemetry

**Scope**: The minimal server. Auth, billing receipt validation, opt-in telemetry. Not a product surface.

**Deliverables**:
- `apps/backend/` `dart_frog` app on Fly.io.
- Sign in with Apple / Google (only for Pro). No passwords, no email.
- App Store Server API receipt validation (iOS).
- Google Play Developer API receipt validation (Android).
- Opt-in, anonymized, aggregated telemetry sink (PostHog or self-hosted).
- Region-based data residency (US / EU / APAC).
- Health check endpoint + uptime monitoring.
- Staging + production environments.

**Success criteria**:
- Receipt validation: 99.9% accuracy on known good / bad cases.
- Auth: <300ms p95 for the Sign in with Apple round-trip.
- Telemetry: <50 events/sec aggregated; <100ms p95 batch upload.
- Zero PII stored server-side (audit log proves it).

**Dependencies**: Epic 1.

**Effort**: 2-3 weeks for a senior Dart backend engineer.

**Owner**: Backend engineer (or founding Flutter engineer wearing the hat in the early days).

---

### Epic 8 — Marketing site + waitlist + privacy whitepaper

**Scope**: The pre-launch surfaces. The 90-second demo video. The privacy whitepaper (the structural answer to CFPB / FTC scrutiny).

**Deliverables**:
- `pocketledger.app` (or `.com`) static site on Vercel.
- Hero, the 90-second demo video, the "Your money, your model, your phone" pitch, the waitlist signup.
- `/privacy` — the privacy whitepaper (3,000 words, plain English).
- `/security` — the threat model + how the architecture enforces privacy.
- `/open-source` — link to the GitHub repo, the AGPL rationale.
- `/about` — the team + the story.
- `/blog` — the XDA-article essay + the NotebookLM follow-up response.

**Success criteria**:
- Lighthouse score >90 on all pages.
- Waitlist conversion >5% from organic traffic.
- Privacy whitepaper is quotable by journalists.

**Dependencies**: none.

**Effort**: 1-2 weeks for a designer + a frontend dev.

**Owner**: Designer + founding marketer (or founding Flutter engineer wearing the hat).

---

### Epic 9 — TestFlight + Play Store submission

**Scope**: Get the apps into the stores. The 7-day phased rollout. The store listing assets. The privacy labels.

**Deliverables**:
- Apple Developer Program enrollment ($99/yr).
- Google Play Console enrollment ($25 one-time).
- App Store Connect record for `app.pocketledger` with: name, subtitle, description, keywords, screenshots (6.5", 6.7", 6.9", 12.9" iPad), app icon, privacy label.
- Google Play Console record for `app.pocketledger` with: title, description, screenshots, feature graphic, icon.
- App Store privacy nutrition labels: "Data Not Collected" (free) / "Data Not Linked to You" (Pro cloud sync).
- Google Play Data Safety form: same posture.
- Phased release: 1% → 10% → 50% → 100% over 7 days (iOS), 5% → 20% → 100% over 7 days (Android).

**Success criteria**:
- Both apps pass store review on first submission.
- Crash-free rate >99.5% in the first 7 days.
- Day 1 retention >40% (industry benchmark for finance apps: 25-30%).

**Dependencies**: Epics 5, 6, 7.

**Effort**: 1-2 weeks for the engineer doing the submission, plus 1-2 days for the designer on store assets.

**Owner**: Founding Flutter engineer + designer.

---

### Epic 10 — First 10K users + design partner program

**Scope**: The cold-start problem. PocketLedger is a category-creating product — there is no search demand yet for "on-device AI finance notebook." We need to seed the category with the first 10,000 users who came in via the XDA / NotebookLM-for-money inbound signal.

**Deliverables**:
- SEO-optimized landing pages for "NotebookLM for money", "private AI finance app", "on-device LLM finance".
- Submissions to Hacker News (Show HN), Product Hunt, and r/NotebookLM.
- 10 finance-creator partnerships (TikTok + YouTube) for Year 1 seeding.
- 50 design partner slots for the v1.0 beta (free Pro for life).
- Email sequence for the waitlist: 5 emails over 14 days from signup, ending with the App Store link.
- Reddit AMA in r/personalfinance + r/fintech + r/FlutterDev.
- Onboarding flow that captures the XDA-article audience: "Did you come from the XDA article? Tap here for the 90-second walkthrough."

**Success criteria**:
- 10,000 downloads in the first 30 days post-launch.
- 25% D7 retention (matches industry benchmark).
- 4% Pro conversion (matches Year 1 target).
- 50 design partner NPS responses, average >50.

**Dependencies**: Epic 9.

**Effort**: Ongoing; 2-4 weeks of dedicated effort for the launch month.

**Owner**: Founding marketer (or founding Flutter engineer wearing the hat).

---

## 3. The 6-month production timeline

```
Month 1 — Spine, week 1-4
├── Week 1: Epic 1 (repo + CI + scaffolding)
├── Week 2: Epic 1 (Melos + lint + privacy-audit composite)
├── Week 3: Epic 2 (math engine core + 50 of 200 cases)
└── Week 4: Epic 2 (math engine complete + remaining 150 cases)

Month 2 — Spine, week 5-8
├── Week 5: Epic 3 (Drift schema + SQLCipher + secure storage)
├── Week 6: Epic 3 (HNSW vector index + sync envelope + audit log)
├── Week 7: Epic 4 (flutter_gemma runtime + FunctionGemma fine-tune)
└── Week 8: Epic 4 (orchestrator + redteam suite + privacy audit)

Month 3 — Surface, week 9-12
├── Week 9:  Epic 5 (Flutter iOS scaffold + onboarding + chat)
├── Week 10: Epic 5 (iOS voice + photo + check-in card)
├── Week 11: Epic 5 (iOS settings + export + citations + math expansion)
└── Week 12: Epic 5 (iOS TestFlight beta + on-device latency tuning)

Month 4 — Surface, week 13-16
├── Week 13: Epic 6 (Flutter Android scaffold + same Flutter code)
├── Week 14: Epic 6 (Android-specific overrides + WorkManager + Glance)
├── Week 15: Epic 7 (backend: auth + billing receipts + telemetry)
└── Week 16: Epic 8 (marketing site + waitlist + privacy whitepaper)

Month 5 — Store, week 17-20
├── Week 17: Epic 9 (Apple Developer enrollment + App Store listing assets)
├── Week 18: Epic 9 (Google Play Console + Android build + 5% staged rollout)
├── Week 19: Epic 9 (TestFlight beta + 1% staged rollout on iOS)
└── Week 20: Epic 10 (launch: HN + Product Hunt + creator partnerships)

Month 6 — Iterate to 10K, week 21-24
├── Week 21: D7 / D30 retention analysis + funnel fixes
├── Week 22: First Pro tier tests + free-trial conversion experiments
├── Week 23: Couples mode + accountant export (v1.5 prep)
└── Week 24: v1.0 series A deck + investor outreach begins
```

---

## 4. The team

| Role | FTE | When hired | Year 1 cost |
|---|---|---|---|
| Founding Flutter engineer (you) | 1.0 | Day 0 | $150K |
| Founding designer | 1.0 | Day 0 | $130K |
| ML engineer | 1.0 | Month 1 | $150K |
| Flutter engineer #2 | 1.0 | Month 2 | $130K |
| Backend engineer | 0.5 | Month 3 (then 1.0 from month 6) | $90K (Y1) |
| Marketing / community | 0.5 | Month 4 (then 1.0 from month 9) | $65K (Y1) |
| **Total Y1 headcount cost** | | | **$715K** |

Plus the CapEx from `05-financial-model.md`:
- $40K design system + assets
- $25K legal (privacy policy, ToS, Anthropic BAA)
- $200/mo cloud infra
- $124 Apple/Google developer fees

**Total v1.0 ship cost: ~$1.0M-1.2M**, matching the financial model.

---

## 5. The success criteria for "v1.0 in production"

Six things must all be true for v1.0 to ship:

1. **All 200 math audit cases pass on every PR.**
2. **All 100 redteam cases pass nightly.**
3. **The privacy audit blocks every PR that introduces an outbound network call outside the allowlist.**
4. **The 4 key-moment latency targets are met on real devices**: Day 0 <90s, Day 7 <12s, Day 14 <1s first token, Day 30 <8s.
5. **Crash-free rate >99.5% in TestFlight beta and Play Internal.**
6. **Store listing assets + privacy labels approved by Apple and Google.**

The first three are structural. They are the reason PocketLedger exists. If any of them fails, the v1.0 ship is delayed.

---

## 6. After v1.0, the 18-month scale plan

**Months 7-12 (scale to 125K MAU)**:
- Couples mode (v1.5).
- Accountant export + Plaid opt-in (v1.5).
- 5 more languages (es, pt, id, tl, vi, hi).
- 50 finance creators seeded.
- Pre-seed → Seed raise ($3M).

**Months 13-18 (scale to 600K MAU)**:
- Family tier.
- Public notebooks (read-only fork-and-publish).
- WatchOS / Wear OS glance.
- Series A raise ($15M).

**Months 19-24 (scale to 1.75M MAU)**:
- v2.0: tax-prep handoff, B2B accountant tier.
- Series B raise ($40M).
- Path to profitability: profitability by Year 4.

---

## 7. The single biggest risk and the single biggest edge

**The biggest risk**: missing the 18-month category-creating window. Mint died despite 25M users because Intuit mismanaged the post-Mint scramble. If we don't ship by Q1 2027, the XDA-article audience will have moved on.

**The single biggest edge**: the on-device architecture is the moat. Monarch grew 20x post-Mint because they were the Mint-successor with the strongest UI. PocketLedger's edge is structurally different — we are the only player in the empty quadrant of the matrix (conversational + grounded + on-device + mobile + no-bank-link + the math). If we ship, the wedge is permanent. If we don't ship, the wedge closes.

---

## 8. What gets built first when you greenlight

**Today, in this session**, if you give me the go-ahead, I can:

1. **Push the 6 docs + the deck to a real public GitHub repo** at `github.com/pocketledger/pocketledger` (using the GitHub API with your `GITHUB_PAT`).
2. **Bundle the entire artifact set into a ZIP** at `/workspace/ledgerlens/pocketledger-v1.0-prep.zip` (~2 MB) — docs + deck + the bootstrap scripts you need to scaffold the monorepo, register the Apple/Google dev accounts, and run the first FVM + Melos commands.
3. **Write the FVM + Melos bootstrap script** that creates the 16 packages with the right `pubspec.yaml`, the root `melos.yaml`, the root `pubspec.yaml`, the `.fvmrc`, and the first GitHub Actions workflows. The script is runnable in 30 seconds.
4. **Write the 200 math audit case skeletons** — the 200 input/expected-output pairs in a single Dart file that you or your first hire can flesh out with the real domain logic.

**That's all I can do without a decision from you.** Tell me:
- The org name (default: `pocketledger`).
- Whether to use your existing `GITHUB_PAT` or expect a new one.
- Whether to ship the bundle as a ZIP or as a tarball.
- And whether to make the repo public or private (default: public, AGPL-3.0).

And I'll have a real GitHub URL and a real bundle in this session.
