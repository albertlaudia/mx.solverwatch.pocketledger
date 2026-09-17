# PocketLedger — Platform Deep-Dive

> The full engineering and product spec. Every model named, every cost line-itemed, every UX decision justified.

> **Stack**: Flutter 3.32+ (Dart 3) on iOS 17+ / Android 11+ / Web. State via Riverpod 3, routing via go_router, persistence via Drift + SQLCipher, on-device LLM via flutter_gemma + flutter_llama, secure storage via flutter_secure_storage. Monorepo managed by Melos, SDK pinning via FVM.

---

## 1. Recap: what we're building

**PocketLedger** is a mobile-first, on-device-default AI finance notebook. You talk, snap, or type. The model that reads your data lives on the phone. Cloud is opt-in, end-to-end encrypted, and used only for tasks the local model cannot reliably do (deep "what if" reasoning, very long context, complex contract Q&A).

This document goes deep on:
1. The exact LLM stack (per-platform, per-tier) — and why each one.
2. The rest of the intelligence layer (OCR, math, embeddings, TTS/STT).
3. The product surfaces (iOS, Android, web, watch) and the SDK that ties them.
4. The user journey with second-by-second timing.
5. The ease-of-use design system (the eight rules that make it feel effortless).
6. The cost model (every line, every assumption, every rate).
7. The revenue model and unit economics (with cohort tables).
8. The 3-year P&L and the path to break-even.

---

## 2. The LLM stack (the heart of the system)

The architecture has five LLM "tiers" in the request path. They are not interchangeable — each tier does one job, and the orchestrator routes between them. All five run on the user's phone except tier 4 (cloud, opt-in).

### 2.1 Tier 0 — FunctionGemma 270M (the local traffic controller)
- **Parameters**: 270M, dynamic-INT8 quantized, ~288MB on disk, ~551MB peak RSS.
- **Plugin**: `flutter_llama` (a llama.cpp-backed Flutter package, runs FunctionGemma in GGUF format). The smallest possible LLM that can reliably do tool calling.
- **Job**: Translate "where am I overspending?" into a structured tool call. Pure routing.
- **Why this and not the larger model**: speed, determinism, and battery. FunctionGemma runs at **~50 tokens/sec on a Samsung S25 Ultra and iPhone 15 Pro** with **0.3s time-to-first-token** (Google, Unsloth benchmarks). Asking Phi-4 Mini or Gemma 3 4B to do tool calls works but is 5-10× slower and 4-8× more battery-hungry.
- **Fine-tuning**: FunctionGemma's published accuracy on the Mobile Actions benchmark is **58% out of the box, 85% after fine-tuning**. We fine-tune on our own ~50-tool API surface (sum, group, delta, subscription_detect, goal_reconcile, etc.). Cost: one-time, ~$2K of GPU on a Lambda A100 instance, done in a day. The fine-tuned GGUF is then loaded by `flutter_llama` on the user's phone.
- **Latency budget**: <200ms to tool call, including the prompt assembly. By the time the user finishes reading the question, the call is already in flight.
- **Cost to us per call**: $0. (Runs on the user's NPU via `flutter_llama`.)

### 2.2 Tier 1 — Apple Foundation Models / Gemini Nano (the OS-provided on-device model)
- **iOS — Apple Foundation Models**: ~3B parameters, ships with iOS 18+ (iPhone 15 Pro and newer, A17 Pro / M-series). Accessed through `flutter_gemma`'s Apple Intelligence backend. **Apple ships it for free** — the model lives in the OS, not in our app bundle. Zero bundle cost.
- **Android — Gemini Nano via AICore**: ~3.25B parameters, available on Pixel 8 Pro / 9 / 10, Galaxy S24 / S25 / S26, expanding through 2026. Accessed via `flutter_gemma`'s AICore backend. **Google ships it for free.**
- **Job**: Short-context chat with citations, persona-toned summaries, check-in card narrative, intent classification. Everything that does not need deep reasoning or long context.
- **Quality**: Apple's own published benchmarks show the on-device 3B is "competitive with the larger Qwen-3-4B and Gemma-3-4B in English" (Apple ML Research, 2025). That is the right quality bar for our use case.
- **Latency**: 80-180ms first-token on a current-gen SoC (Apple A17 Pro / M3 / Snapdragon 8 Gen 3 / Tensor G4 class).
- **Cost to us per call**: **$0.** This is the cheapest LLM tier that exists.

### 2.3 Tier 2 — Phi-4 Mini / Gemma 3 4B (the bundled fallback on-device model)
- **When used**: On Android devices without AICore (older than Pixel 8 / S24); on iPads without Apple Intelligence; on older iPhones.
- **Phi-4 Mini (3.8B)**: 4-bit quantized, ~2.3GB on disk, ~1.5GB resident. Strongest English reasoning at this size. ~68.5 MMLU. Best for English-strong markets (US, UK, AU, CA). Loaded via `flutter_gemma`'s LiteRT backend.
- **Gemma 3 4B (4B)**: 4-bit quantized, ~2.5GB on disk. Native multimodal (image input), 140 languages. The multilingual leader. ~4.2GB RAM. Best for SEA, LATAM, India. Loaded via `flutter_gemma`'s MediaPipe backend.
- **Job**: Same as Tier 1 — covers the device population that Tier 1 doesn't.
- **Latency**: 100-300ms first-token on Tier 2-capable hardware.
- **Cost to us per call**: $0. (Runs on the user's NPU/CPU.)
- **Bundle impact**: +2-2.5GB app size. We ship one default model per platform (Phi-4 Mini on iOS-bundled, Gemma 3 4B on Android-bundled), with a download-on-demand path for the other.

### 2.4 Tier 3 — Cloud LLM (opt-in, Pro tier, E2E encrypted)
- **When triggered**: Only when the on-device model returns low confidence, or when the user explicitly asks a "deep analysis" question. The orchestrator decides.
- **Default provider**: **Claude Haiku 4.5** ($1/M input, $5/M output, $0.10/M cached) for short deep-analysis turns, and **Claude Sonnet 4.6** ($3/M input, $15/M output) for long-context synthesis. The prompt to the user is always: "Want me to ask the cloud for a deeper answer? Your data is encrypted."
- **Why Haiku first**: 5-10× cheaper than the next credible option for finance-domain reasoning. Cache hit pricing at $0.10/M means our most-repeated system prompts (the persona + the citation instructions + the math tool list) cost almost nothing after warmup.
- **Zero-retention contract**: Anthropic's API allows zero-retention mode for enterprise customers. We sign the BAA.
- **Latency**: 200-800ms first-token (network-dependent).
- **Cost to us per 1M tokens (blended Haiku-heavy usage, ~3:1 input/output, with 70% cache hit rate on system prompts)**:
  - Input: 0.30 × $1 + 0.70 × $0.10 = $0.37/M effective
  - Output: $5/M
  - Realistic blended: ~$1.85/M tokens (assuming 80% input / 20% output post-cache)
- **Budget assumption**: Average Pro user runs ~15 deep-analysis questions/month, average 2,000 input tokens + 800 output tokens per question. Per user per month cloud cost: 15 × (2000 × $0.37 + 800 × $5) / 1,000,000 = 15 × ($0.74 + $4.00) / 1M × 1M = 15 × $0.00474 = ~$0.07/user/month. At 100K Pro users, that's $7K/month of cloud spend.

### 2.5 Tier 4 — Embedding model (the source graph search engine)
- **Model**: `bge-small-en-v1.5` (33M params, 130MB on disk, ~512-dim embeddings) for English markets, `multilingual-e5-small` (~470M params, 1GB) for multilingual markets. Both run on-device via `flutter_gemma`'s embedding mode.
- **Job**: Vector search over the source graph (chunks, transactions, check-ins). Stored in a local HNSW index in the encrypted Drift database.
- **Cost**: $0 to us. Runs on the user's NPU.

### 2.6 Tier 5 — Special-purpose small models
- **Whisper-tiny** (39M params) for STT, loaded via the `whisper_ggml` FFI plugin or `speech_to_text` on iOS. ~$0 cost.
- **FastVLM** (Apple) and **Gemma 3n** (Android) for image captioning on receipt/statement OCR pre-processing. Multimodal-on-device.
- **FunctionGemma 270M** for tool routing (already covered).

### 2.7 Total on-device model bundle sizes (what we ship vs. what the OS ships)

| Platform | OS-provided | Bundled fallback | Optional download |
|---|---|---|---|
| iOS 18+ (iPhone 15 Pro+) | Apple FM 3B (free, in OS, via `flutter_gemma` Apple Intelligence backend) | Phi-4 Mini 2.3GB (via LiteRT backend) | Gemma 3 4B 2.5GB (via MediaPipe backend) |
| iOS 16-17 (older iPhones) | none | Phi-4 Mini 2.3GB | Gemma 3 4B 2.5GB |
| Android 14+ AICore device | Gemini Nano 3.25B (free, in OS, via `flutter_gemma` AICore backend) | Gemma 3 4B 2.5GB (via MediaPipe backend) | Phi-4 Mini 2.3GB (via LiteRT backend) |
| Android 8-13 (no AICore) | none | Gemma 3 4B 2.5GB | Phi-4 Mini 2.3GB |

App store "size" budget: we ship 28MB by default (just the Flutter runtime + math engine + UI). Models download on first launch over Wi-Fi only, ~150-300MB chunks, in the background, with progress visible to the user. The user can also choose to download in advance from a settings screen.

---

## 3. The rest of the intelligence stack

### 3.1 The deterministic math engine
- **Implementation**: A Dart isolate (with an optional Rust port via `flutter_rust_bridge` for the hot path). Pure functions. No LLM dependency.
- **Tool API**: 15 tools. `sum_transactions`, `group_by_category`, `detect_subscriptions`, `goal_progress`, `month_over_month_delta`, `projection`, `aura_score`, `anomaly_detect`, `forecast_cashflow`, `category_rewrite`, `merchant_normalize`, `recurring_detect`, `top_merchants`, `budget_burn_rate`, `savings_rate`.
- **Reproducibility**: Every numeric answer has a SHA-256 of the input query + the formula. Two users with the same notebook and the same question get the same answer.
- **Why a separate isolate**: This is the structural answer to "NotebookLM is the wrong tool for money." The LLM proposes the formula; the engine runs it; the user can show the formula. The LLM never invents a number.
- **Cost to us per call**: $0. (Runs on the user's CPU.)

### 3.2 The OCR pipeline
- **Receipts**: `google_mlkit_text_recognition` → small on-device layout model → LLM extracts `{merchant, items[], total, date, tax, payment_method}`. <3s on a 2023 flagship.
- **Statements**: `google_mlkit_text_recognition` → table-aware extraction (a small fine-tuned LayoutLMv3-style model, ~50MB) → LLM reconciles. <10s for a 5-page statement.
- **Multimodal shortcut**: on iOS, FastVLM can do end-to-end vision-language extraction in a single call; on Android, Gemma 3n can. We use the two-stage path (OCR + LLM) for explicability — the user can see the OCR text and the extracted fields separately.
- **Contracts**: deferred to v1.5 (requires a heavier model, runs in the cloud tier, E2E).

### 3.3 The TTS / STT stack
- **STT**: `speech_to_text` plugin (wraps Apple Speech on iOS, Android SpeechRecognizer on Android) with on-device mode where available. `whisper_ggml` FFI plugin as a unified fallback. Streaming, low-latency.
- **TTS**: `flutter_tts` with on-device voices (Apple `AVSpeechSynthesizer` on iOS, Android `TextToSpeech` with on-device voices on Android 11+). All on-device. No cloud voice.
- **Voice cloning**: out of scope. We use the persona engine's voice selection (Calm/Direct/Playful) which maps to OS-provided voice presets.

### 3.4 The encryption stack
- **Master key**: 256-bit, generated on first install using `Random.secure()` (which sources from `/dev/urandom` on iOS/Android and the Web Crypto API on web), never leaves the OS keystore (Keychain on iOS via `flutter_secure_storage` iOptions, StrongBox on Android via Android Keystore, WebCrypto non-extractable on web).
- **Encryption**: AES-256-GCM at rest via SQLCipher (256-bit, kdf_iter=256000, hex key syntax). Key wrapped by master.
- **Hashing**: SHA-256 for content addressing, source IDs, formula reproducibility.
- **Key derivation**: HKDF-SHA-256 for per-notebook and per-source keys.
- **Sync envelope**: X25519 + XChaCha20-Poly1305 for the E2E envelope between paired devices.
- **Crypto libraries**: `pointycastle` + `cryptography` Dart packages (cross-platform), with platform-channel fallbacks to Apple CryptoKit / Android BoringSSL / libsodium-js for the hot path.

---

## 4. The product surfaces

### 4.1 iOS app
- **Stack**: Flutter 3.32+ (Dart 3), Material 3 + iOS-adaptive theming, Riverpod 3, go_router, Drift + SQLCipher.
- **Min iOS**: 17.0 (recommend 18+ for Foundation Models path).
- **Size**: 28MB base + model download. Comparable to a game.
- **Plugins used**: `flutter_gemma`, `flutter_llama`, `flutter_secure_storage`, `drift`, `sqflite_sqlcipher`, `google_mlkit_text_recognition`, `speech_to_text`, `flutter_tts`, `workmanager` (via `background_fetch`), `in_app_purchase` (StoreKit 2), `app_intents` (Siri Shortcuts), `home_widget` (WidgetKit), `flutter_local_notifications` (with `flutter_activitykit` for Live Activities), `cloud_kit` (encrypted sync).
- **Review time**: ~24-48h typical, 7-day phased release via TestFlight.

### 4.2 Android app
- **Stack**: Flutter 3.32+, Material 3 + Material You dynamic color, Riverpod 3, go_router, Drift + SQLCipher.
- **Min SDK**: 30 (Android 11.0). Target SDK 35.
- **Size**: 28MB base + model download.
- **Plugins used**: `flutter_gemma` (AICore + LiteRT backends), `flutter_llama`, `flutter_secure_storage` (Android Keystore backend), `drift`, `sqflite_sqlcipher`, `google_mlkit_text_recognition`, `speech_to_text`, `flutter_tts`, `workmanager`, `in_app_purchase` (Play Billing 7), `home_widget`, `flutter_local_notifications`, `google_drive` (encrypted sync via app-data scope, client-side encrypted).
- **Review time**: ~24-72h typical, 5% → 20% / 100% staged rollout via Play Console.

### 4.3 Web companion (v1.5+)
- **Stack**: Flutter web with CanvasKit renderer, Riverpod 3, Drift web executor (sql.js + sqlcipher-wasm), `web_llm` for inference.
- **Min browser**: Chrome 138+ / Edge 138+ / Safari 18+ (WebGPU required for inference). Firefox fallback: read-only via REST.
- **Inference**: WebLLM running Gemma 3 4B in browser. First load: ~2.5GB download, cached.
- **Mode**: Read-only in v1.5. Full read/write in v2.0.

### 4.4 Watch / Wear
- **watchOS**: Complication + glance of last check-in. Quick-log via Shortcut on the phone.
- **Wear OS**: Tile + complication. One-tap voice log (uses watch's STT, syncs to phone over BLE).

### 4.5 The shared SDK
A single Dart package `pocketledger_sdk` is the contract between the Experience Layer and the Orchestration Layer. The same package is consumed by all three runtimes. There is no codegen step — Dart is the source of truth for all three runtimes.

```dart
abstract class PocketLedgerSDK {
  final NotebookService notebook;
  final ChatService chat;
  final CaptureService capture;
  final CheckInService checkIn;
  final GoalsService goals;
  final ExportService export;
  final PersonalsService personals;
}
```

---

## 5. The user journey with timing (how easy is it to use?)

This is where the ease-of-use story is told. Every action has a target latency.

### 5.1 Day 0 — Install to first insight (target: 90 seconds total)

| Step | What happens | Target time | Where it runs |
|---|---|---|---|
| 1 | User downloads from App Store / Play Store | — | — |
| 2 | App opens to welcome screen. "No account needed. Your data lives on this phone." | <500ms | Local |
| 3 | User picks a vibe (Calm / Direct / Playful) | 3s (human) | Local |
| 4 | User answers two free-text questions: "What do you want to feel about money in 90 days?" / "Anything you want to be different in a year?" | 30s (human) | Local, parsed by Tier 2 |
| 5 | User taps Snap, photographs a coffee receipt | 5s (human) | Local |
| 6 | Tier 5 (Gemma 3n / FastVLM) captions the image → Tier 2 LLM extracts fields → math engine validates against category | 2.5s | Local |
| 7 | Confirmation card: "$4.75 at Blue Bottle, today 8:42am, category: Coffee. Looks right?" | rendered in <3s total | Local |
| 8 | User taps Yes | 1s (human) | Local |
| 9 | First page "Coffee" auto-created. Done. | <500ms | Local |

**Total wall-clock: under 90 seconds, of which 85 seconds is the human. The app does its work in 5 seconds, all on-device, all private.** This is the wedge — the user feels the magic before they understand the architecture.

### 5.2 Day 7 — First weekly check-in (target: 12 seconds)

| Step | What happens | Target time |
|---|---|---|
| 1 | Sunday 7pm push notification: "Your week, in one tap." | — |
| 2 | User taps → app opens to the check-in card | <1s |
| 3 | Math engine composes: top movers, anomalies, goal progress, aura | <1.5s |
| 4 | Tier 2 LLM writes the 2-paragraph narrative with citations | <4s |
| 5 | Card renders with a soft-animated gradient | 500ms |
| 6 | User taps the share icon → watermarked PNG generated | 1.5s |
| 7 | iOS / Android share sheet opens | 500ms |

**Total: 12 seconds. The user got a complete weekly financial check-in while waiting for the kettle.**

### 5.3 Day 14 — First conversational query (target: 4 seconds to first token)

| Step | What happens | Target time |
|---|---|---|
| 1 | User taps Chat, types "Where am I overspending?" | — |
| 2 | Tier 0 (FunctionGemma) classifies intent and proposes a tool call | 200ms |
| 3 | Orchestrator assembles context: top 12 chunks, current goals, recent check-ins | 50ms |
| 4 | Tier 1 or Tier 2 LLM receives prompt, starts generating | 100-300ms to first token |
| 5 | Streamed answer with inline citation chips | — |
| 6 | User taps a citation → side-by-side view opens | <1s |

**Total to first token: 350-550ms. Total answer: 3-4 seconds. Every claim is cited.**

### 5.4 Day 30 — Accountant export (Daniel's killer feature, target: 8 seconds for a one-month range)

| Step | What happens | Target time |
|---|---|---|
| 1 | User taps Export → "Last 30 days" | — |
| 2 | Math engine generates the structured CSV (date, merchant, category, amount, source, receipt-thumb-id) | 2s |
| 3 | PDF generator composes the report with receipt thumbnails | 4s |
| 4 | Files appear in the share sheet, ready to AirDrop / email | 1s |

**The whole thing is faster than opening Excel.**

### 5.5 The eight ease-of-use rules

1. **Zero taps to value after install.** No signup, no onboarding quiz, no "connect your bank." You get a button that says Snap. You snap. You get an answer.
2. **One tap, one answer.** Every surface should be answerable in one tap. If it isn't, redesign it. We measure the tap count for the 20 most common user intents monthly.
3. **No forms.** You never type "amount, category, date, payment method." You say "fourteen fifty on lunch." The LLM extracts. You confirm.
4. **No dashboard before data.** The home screen is the chat input. The dashboard appears only after you have data, and even then it's behind a tab.
5. **Every number ships with its calculation.** Tap any number → see the formula → see the source transactions → rerun with different filters.
6. **Every claim is cited.** Tap the citation → see the original. The trust is in the substrate, not the policy.
7. **The persona matches the user, not the company.** Three vibes — Calm, Direct, Playful. The user picks. We never override.
8. **The app works on a plane.** No network needed for any core feature. The user is never stranded.

---

## 6. The cost model (CapEx + OpEx)

### 6.1 CapEx — the one-time costs to ship v1.0

| Item | Cost | Note |
|---|---|---|
| Product design (2 designers, 6 months) | $180K | In-house or contract |
| iOS engineering (2 senior Flutter devs, 6 months) | $300K | At $50/hr loaded |
| Android engineering (2 senior Flutter devs, 6 months) | $300K | At $50/hr loaded |
| Backend (1 senior Dart/Go dev, 4 months — minimal: auth, billing, telemetry) | $100K | At $50/hr loaded |
| ML / on-device engineering (1 senior, 6 months — fine-tuning FunctionGemma, model orchestration) | $150K | At $50/hr loaded |
| QA (1 senior, 6 months) | $90K | At $30/hr loaded |
| Design system + assets (icons, illustrations, marketing) | $40K | One-time |
| App Store fees + developer accounts | $200 | $99 Apple + $25 Google + $76 misc |
| Initial cloud infra (Dokploy setup, prod + staging) | $200/mo | See OpEx |
| Legal (privacy policy, ToS, BAA with Anthropic) | $25K | One-time |
| Total CapEx v1.0 | **~$1.2M** | Single founding team, 6-month build |

> **Note**: With Flutter, iOS and Android share the same Dart codebase. The 2+2 split above is two Flutter engineers per platform (one focus on each platform's plugin integration, App Store submission, etc.) — but they share the same SDK, math engine, and Riverpod graph. Effective engineering velocity is 1.5-2× a polyglot stack.

### 6.2 OpEx — the monthly run-rate

At 100K MAU (the milestone for opening Pro tier in month 6):

| Line item | Monthly | Notes |
|---|---|---|
| Cloud LLM (Pro users only) | $7K | 15 deep queries × ~2.8K tokens × $1.85/M blended |
| App store fees (15% Small Business Program tier) | $0 up to $1M ARR, then 15-30% | Variable, see revenue model |
| Cloud infra (Dokploy/Fly for auth + billing + telemetry) | $300 | 2x small VMs + DB + storage |
| Apple Push Notification Service (APNs) | $0 | Free |
| Firebase Cloud Messaging (Android) | $0 | Free tier covers us |
| Plaid (Pro tier bank link) | $0.30/user connected/mo, $0.50 first link | Only triggered for opt-in Plaid users |
| Sentry / observability (crash + perf) | $100 | Team plan |
| Apple Developer Program | $8.25/mo | $99/yr |
| Google Play Console | $2.08/mo | $25/yr |
| Anthropic BAA + zero-retention (annual) | $1K/mo amortized | Enterprise plan |
| Function-calling fine-tuning (one-time + drift) | $500/mo amortized | $6K/yr |
| Marketing (UA) | $50K | Apple Search Ads + UAC + content |
| Salaries (8 people: 4 eng, 1 ML, 1 design, 1 PM, 1 marketing) | $80K | Loaded |
| Office / async tools | $2K | Notion, Linear, Slack, GitHub |
| **Total OpEx at 100K MAU** | **~$141K/mo** | |

Gross margin at $4.99 ARPU × 100K MAU × 6% Pro conversion × 12 months = $359K ARR run rate. Variable cost is ~$9K/mo for cloud. Gross margin = ~75%. Industry benchmark for consumer subscription: 70-80%. We land in the band.

### 6.3 The cost per install (CPI) for our category

2026 benchmarks (AppsFlyer, Sensor Tower, DigitalApplied, businessofapps.com):

- iOS Finance vertical CPI: **$11.62 globally, $4.10 US-only Apple Search Ads**.
- Android Finance vertical CPI: **$3.84 globally, $3.20 US-only UAC**.
- iOS US overall: $4.10.
- Android US overall: $3.20.
- Cross-category average: $5.84 iOS / $1.92 Android.

**Our blended target CPI (iOS + Android weighted by traffic, 60/40)**: 0.6 × $11.62 + 0.4 × $3.84 = **$8.51 globally**, or with US bias 0.6 × $4.10 + 0.4 × $3.20 = **$3.74 US-only**.

The XDA signal gives us an organic tailwind the other apps in this category do not have. People searching "NotebookLM for money" land on our App Store page. ASO captures 27-41% of organic installs in Finance. Realistic blended CAC after 12 months: **$4.50** (iOS-heavy early, with organic carrying half the installs).

### 6.4 Why the unit economics work

The PocketLedger wedge is **on-device inference, so every chat is free to us.** This is structurally different from every Plaid-based competitor, who pays a margin tax on every transaction. Our variable cost is essentially the cloud LLM (Pro users only) and Plaid (opt-in Pro only).

A pure-software, on-device-default product at $4.99/mo with a 6% Pro conversion rate and 11-month average retention has a **5-7× LTV/CAC** in the consumer fintech benchmark band. Industry target is 3:1; we sit at 5-7:1 because the variable cost floor is so low.

### 6.5 Why Flutter wins on cost specifically

- **One codebase, two platforms**: 4 Flutter engineers (2 iOS-focused, 2 Android-focused) replace 4 native engineers (2 Swift, 2 Kotlin) with the same output. ~$200K/year savings on loaded salary.
- **One design system**: a single Dart implementation of Material 3 + iOS adaptive theming serves both platforms. No duplicated Figma libraries, no duplicated design tokens.
- **One CI matrix**: one `melos run test` covers the math engine, the AI runtime, the data layer, and the chat UI for both platforms at once.
- **One model registry**: a single `assets/model_registry.json` declares which models run on which devices. No platform-specific fork.
- **One set of unit tests**: 200 math-audit cases + 100 redteam cases run in CI for both platforms simultaneously.

---

## 7. The revenue model

### 7.1 The three tiers

| Tier | Price | Features | What we make per user/month (after store fees) |
|---|---|---|---|
| Free | $0 | 1 notebook, 5 pages, 30-day history, 30 logs/day, on-device model, 1 framework, check-in card (no share) | $0 |
| Pro | $4.99/mo or $39.99/yr | Unlimited everything, 30 frameworks, Plaid opt-in, couples mode, accountant export, E2E sync, priority on-device model | Year-1 (15% fee): $4.24/mo. Year-2+ (15% fee stays at Pro ARPU): $4.24/mo. Annual: $33.99 effective $33.99/12 = $2.83/mo but front-loaded. |
| Family | $7.99/mo | Up to 5 devices, 1 shared + personal notebooks, kids mode | Year-1 (15% fee): $6.79/mo |

### 7.2 Realistic conversion funnel (the assumption sheet)

| Metric | Year 1 target | Year 2 target | Year 3 target |
|---|---|---|---|
| Free downloads | 500K | 2.0M cumulative | 5.0M cumulative |
| MAU (% of cumulative) | 25% = 125K | 30% = 600K | 35% = 1.75M |
| DAU/MAU | 22% | 25% | 28% |
| D7 retention | 28% | 32% | 35% |
| D30 retention | 14% | 18% | 22% |
| Monthly check-in rate | 45% | 55% | 60% |
| Citation tap rate | 35% | 45% | 50% |
| Watermark share rate | 8% | 12% | 15% |
| **Pro conversion (free → paid)** | **4%** | **6%** | **8%** |
| **Family tier (as % of Pro)** | 8% | 12% | 15% |
| Monthly churn (Pro) | 4% | 3% | 2.5% |
| Annual renewal rate | 55% | 65% | 72% |
| ARPU (blended, all tiers) | $4.40 | $4.85 | $5.10 |

### 7.3 The 3-year P&L (US GAAP, accrual, rounded)

**Year 1 (12 months from launch)**

| Line | Calculation | Amount |
|---|---|---|
| **REVENUE** | | |
| Pro subscriptions | 125K MAU × 4% = 5,000 Pro avg; 5,000 × $4.99 × 12 = $299K; growing from 0 → 5K over 12mo, ~50% of full run-rate = $150K | **$150K** |
| Family subscriptions | 8% of Pro = 400 Family avg; 400 × $7.99 × 12 × 50% timing = $19K | **$19K** |
| App store fees | 15% Small Business (under $1M) | **($25K)** |
| **Net revenue** | | **$144K** |
| **COGS** | | |
| Cloud LLM | $7K/mo × 12, but minimal until Pro user base = ~$30K | $30K |
| Plaid | Minimal until Pro users opt in = ~$5K | $5K |
| Cloud infra | $300/mo × 12 = $3.6K | $4K |
| Anthropic BAA | $12K annual | $12K |
| **Total COGS** | | **$51K** |
| **Gross profit** | | **$93K** |
| **Gross margin** | | **65%** |
| **OPEX** | | |
| Salaries (8 people) | $80K/mo × 12 = $960K | $960K |
| Marketing (UA) | $50K/mo × 12 = $600K | $600K |
| Tools, infra, misc | $5K/mo × 12 = $60K | $60K |
| **Total OpEx** | | **$1.62M** |
| **Net loss** | | **($1.53M)** |

Year 1 is the investment year. We end with 125K MAU, 5K Pro, $144K net revenue, $1.5M loss. The CapEx of $1.2M plus the Year 1 OpEx loss of $1.5M = **$2.7M total Year 1 burn** for a launched product at 125K MAU with a 5K paid base and a 6%+ conversion ramp.

**Year 2**

| Line | Calculation | Amount |
|---|---|---|
| **REVENUE** | | |
| Pro subscribers (avg over year) | 600K MAU × 6% = 36K Pro avg; $4.99 × 12 × 36K × 75% annual pricing = $1.62M | **$1.62M** |
| Family subscribers | 12% of Pro = 4.3K Family avg; $7.99 × 12 × 4.3K = $412K | **$412K** |
| App store fees | 15% under $1M threshold hits in Q1, then 30% above for ~9 months, average ~25% = ($508K) | **($508K)** |
| **Net revenue** | | **$1.52M** |
| **COGS** | | |
| Cloud LLM | $7K/mo × 12 × 5 (volume) = $420K | $420K |
| Plaid | 20% of Pro users opt in × $0.30/mo = ~$26K/mo × 12 = $312K | $312K |
| Cloud infra | $1K/mo × 12 | $12K |
| Fine-tuning + BAA | $20K | $20K |
| **Total COGS** | | **$764K** |
| **Gross profit** | | **$756K** |
| **Gross margin** | | **50%** (depressed by Plaid + cloud LLM) |
| **OPEX** | | |
| Salaries (18 people: 8 eng, 2 ML, 2 design, 2 PM, 4 marketing/sales) | $200K/mo × 12 = $2.4M | $2.4M |
| Marketing (UA) | $150K/mo × 12 = $1.8M | $1.8M |
| Tools, infra, misc | $15K/mo × 12 = $180K | $180K |
| **Total OpEx** | | **$4.38M** |
| **Net loss** | | **($3.62M)** |

Year 2 is the scale year. We 4.8× the MAU, 7.2× the Pro base, 10.5× the revenue. The marketing spend is the big lever — we're buying MAU at $4.50 blended and the Pro conversion is feeding back into LTV.

**Year 3**

| Line | Calculation | Amount |
|---|---|---|
| **REVENUE** | | |
| Pro subscribers (avg) | 1.75M MAU × 8% = 140K Pro avg; $4.99 × 12 × 140K × 70% annual = $5.86M | **$5.86M** |
| Family subscribers | 15% of Pro = 21K Family avg; $7.99 × 12 × 21K = $2.01M | **$2.01M** |
| App store fees | 30% standard rate above $1M = ($2.36M) | **($2.36M)** |
| **Net revenue** | | **$5.51M** |
| **COGS** | | |
| Cloud LLM (scaled) | 140K Pro × $0.07/user/mo = $9.8K/mo × 12 = $118K. Plus Haiku volume discount: $100K. | $100K |
| Plaid | 20% of Pro opt in × $0.30/mo × 140K = $8.4K/mo × 12 = $101K | $101K |
| Cloud infra | $5K/mo × 12 | $60K |
| Fine-tuning + BAA | $50K | $50K |
| **Total COGS** | | **$311K** |
| **Gross profit** | | **$5.20M** |
| **Gross margin** | | **94%** (no Plaid or LLM material at this scale) |
| **OPEX** | | |
| Salaries (32 people) | $400K/mo × 12 = $4.8M | $4.8M |
| Marketing | $300K/mo × 12 = $3.6M | $3.6M |
| Tools, infra, misc | $30K/mo × 12 = $360K | $360K |
| **Total OpEx** | | **$8.76M** |
| **Net loss** | | **($3.56M)** |

Year 3 is still loss-making because we are buying growth aggressively. **Break-even ARR is at ~$11M run-rate, which we hit in Year 4.**

**Year 4 trajectory (forward look)**: 3.5M MAU, 12% Pro conversion = 420K Pro, $25M net revenue, $1.2M cloud cost, 96% gross margin, $14M OpEx, **first profitable year at +$10M net**.

### 7.4 Unit economics — the cohort table

| Metric | Value | Industry benchmark |
|---|---|---|
| ARPU (blended) | $4.40-5.10/mo | YNAB $9.08, Monarch $9.50, Rocket $8-12 |
| Gross margin | 65% Y1 → 94% Y3 | Consumer subscription benchmark 70-80% |
| Monthly churn (Pro) | 4% Y1 → 2.5% Y3 | YNAB/Monarch ~3-4% Y1 → 2% Y3 |
| Annual renewal rate | 55% Y1 → 72% Y3 | YNAB ~70%, Monarch ~85% (higher because household) |
| Avg user lifetime | 1/(4%/12) = 25 mo Y1 → 40 mo Y3 | Consumer SaaS avg 24-36 mo |
| LTV (Pro) | $4.40 × 0.75 (gross margin) × 25 = **$82** Y1 → $4.85 × 0.94 × 40 = **$182** Y3 | YNAB ~$300-400 |
| CAC | $4.50 Y1 → $6.50 Y3 (paid UA + ASO + referral) | Finance app CAC $40-200 |
| **LTV/CAC (Pro/Pro)** | **18.2× Y1 → 28× Y3** | Industry healthy: 3-5×, best-in-class 8-10× |
| Payback period | <1 month | Industry healthy: <12 mo, best: <3 mo |
| Free → Pro conversion | 4-8% | Rocket Money 3-5%, Monarch ~5-7% |

We beat the industry on every metric except ARPU. The LTV/CAC is so high because **our CAC is so low** — on-device inference means the user can experience the product before any bank link, and the XDA-article audience is pre-qualified. We are not buying cold traffic; we are capturing an existing demand signal.

### 7.5 The fundraising story

The raise we need, sized for the path above:

| Round | Timing | Size | Use of funds | Outcome |
|---|---|---|---|---|
| Pre-seed | Q4 2026 (now) | $500K | 2 founders, v1 design + 1 platform prototype | First 10K users |
| Seed | Q3 2027 | $3M | 8-person team, full v1 ship, marketing launch | 125K MAU, 5K Pro |
| Series A | Q2 2028 | $15M | Scale to 600K MAU, v1.5 features (couples, accountant, Plaid) | $1.5M ARR, 6% Pro conversion |
| Series B | Q4 2029 | $40M | Scale to 1.75M MAU, v2.0 features (family, web, public notebooks) | $5.5M ARR, 8% Pro conversion |
| Series C / pre-IPO | 2030 | $80M | Scale to 3.5M MAU, profitability | $25M ARR, path to $50M+ |

**Why this works for VCs**: We are attacking a $1.3-2B personal finance app market with a structural cost advantage (on-device inference) and a structural privacy moat (we cannot read the data, even if subpoenaed). The ARPU is lower than the category leaders, but the conversion is higher (because the XDA signal pre-qualifies users) and the gross margin is structurally higher (because variable cost is near zero on the free tier).

The 18-28× LTV/CAC is unusually high for consumer fintech because we are not competing on cold paid UA. The XDA article and its variants are the OG inbound funnel. We are capturing the demand that already exists, not creating it.

---

## 8. The platform's moat (what's hard to copy)

1. **On-device-first runtime via `flutter_gemma`.** The `LocalModelRuntime` abstraction that works across Apple Foundation Models, Android AICore, bundled Gemma 3 / Phi-4, and WebLLM is a real engineering investment. A competitor who picks one platform (Monarch is iOS-first) cannot easily follow. The `flutter_gemma` package (May 2026) makes the runtime tractable; the abstraction makes it portable.
2. **The deterministic math engine as a separate Dart isolate.** The structural answer to "NotebookLM is the wrong tool for money." No AI-first competitor has this. Monarch's math is integrated into the chat and inherits the LLM's sampling variance.
3. **E2E envelope that we cannot decrypt.** The company cannot read the data. This is enforced by the architecture, not by the privacy policy. The CFPB/FTC scrutiny of AI financial advice is rising; we are structurally defensible.
4. **The source graph + citation engine.** "Show me the line" is one tap. Every claim is tied to a chunk, which is tied to a source, which is tied to a hash. The audit trail is the product.
5. **The check-in ritual.** Once a user has 26 Sunday check-ins in PocketLedger, the switching cost is enormous. Check-ins are the retention engine.
6. **The XDA-article signal.** We own the inbound query "NotebookLM for money" by virtue of being there when the article went viral. The category will reward the incumbent.
7. **Flutter end-to-end.** iOS, Android, web from one Dart codebase. A Swift/Kotlin competitor has 1.5-2× the engineering cost to ship the same surface area.

---

## 9. The risks (named, not hidden)

1. **Model quality drift.** The 3B-class models are good enough for short prompts. If a user's notebook grows to 18 months of check-ins, the in-context retrieval may degrade. Mitigation: aggressive chunking + a "deep analysis" opt-in that escalates to the cloud.
2. **Plaid's gravity.** Users will ask for bank linking because every competitor has it. If we don't ship it, we lose the power users. If we do ship it, we dilute the privacy posture. Mitigation: ship Plaid as a clearly-labeled Pro feature, run all derived data through the on-device pipeline, never let Plaid see the chat.
3. **Compliance drift.** The moment we say "advice" instead of "education", we may trigger fiduciary obligations. Mitigation: language discipline from day one. The check-in card and the chat include a "this is not financial advice" disclosure on first use.
4. **Apple / Google platform risk.** Apple Intelligence and Gemini Nano are evolving fast. If the OS models become dramatically better than our fallback models, our bundle becomes harder to justify. Mitigation: hot-swap architecture; ship updates within 2 weeks of OS model releases.
5. **Cold-start without the XDA signal.** If the XDA-article audience saturates before we acquire the next inbound channel, growth stalls. Mitigation: build a TikTok creator program in Year 1 (10 finance creators × 200K followers each = 2M impressions/month for $30K of seeding).
6. **The $4.99 price is too low.** We may be leaving 30-50% of willingness-to-pay on the table. Mitigation: hold the price for 12 months to maximize funnel, then test $6.99 / $9.99 in Year 2 with a grandfather clause.
7. **Flutter plugin volatility.** `flutter_gemma` is May 2026 cutting-edge. If Google pivots the package, we may need to fork. Mitigation: the `LocalModelRuntime` interface insulates us from any single plugin.

---

## 10. The 18-month shipping plan

| Quarter | Ship | Milestone |
|---|---|---|
| Q4 2026 | Pre-seed, design system, Flutter prototype on iOS | 10 design partners |
| Q1 2027 | v1.0 iOS + Android, free forever | 50K MAU |
| Q2 2027 | v1.0 polished, on-device model hot-swap | 125K MAU |
| Q3 2027 | Pro tier opens, check-in card share, audio recap | 5K Pro, 200K MAU |
| Q4 2027 | Couples mode, accountant export | 8K Pro, 300K MAU |
| Q1 2028 | Plaid opt-in, v1.5 web companion (read-only) | 12K Pro, 500K MAU |
| Q2 2028 | Family tier, 5 more languages, Series A | $1.5M ARR, 600K MAU |

**North star: Weekly Check-ins Completed (WCC).** The user who runs the Sunday check-in and engages with the card is a retained user. The user who shares the card is a growth user. The user who taps "show me the math" is a power user.

**Anti-metrics (we watch and *do not* optimize for):**
- Bank accounts linked. We want this low. It means the on-device model is doing the work.
- DAU on a Tuesday at 3pm. Anxiety engagement is bad engagement.
- Time-in-app. Low is good. This is an answer machine, not a slot machine.
