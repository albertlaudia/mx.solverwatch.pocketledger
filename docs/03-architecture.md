# PocketLedger — System Architecture

> The technical blueprint behind the product spec. Mobile-first, on-device-default, hybrid-cloud opt-in. Designed to be auditable, hot-swappable, and privacy-defensible.

> **Stack**: Flutter 3.32+ (Dart 3) on iOS 17+ / Android 11+ / Web. State via Riverpod 3, routing via go_router, persistence via Drift + SQLCipher, on-device LLM via flutter_gemma + flutter_llama, secure storage via flutter_secure_storage. Monorepo managed by Melos, SDK pinning via FVM.

---

## 1. Architectural principles (the non-negotiables)

1. **Local-first, online-second.** Every user-facing feature must work with no network. Cloud is for *cross-device sync* and *deep analysis*, never for *primary reads*.
2. **The on-device LLM is the default inference engine.** Cloud LLMs are opt-in, behind a toggle, and only triggered for tasks the local model cannot do reliably.
3. **The deterministic math layer is the only source of numeric truth.** LLMs suggest the calculation; the engine runs it. Every number is reproducible.
4. **Sources are first-class data, not input.** Every claim traces to a source. The source graph is part of the user's notebook.
5. **The model layer is hot-swappable.** Apple Intelligence, Gemini Nano, Gemma 3, Phi-3, FunctionGemma, plus the cloud fallback — all behind a single `LocalModelRuntime` interface.
6. **The privacy posture is structural, not policy.** We cannot read your data. The architecture enforces this, not the privacy page.
7. **One codebase, three runtimes.** iOS (Flutter), Android (Flutter), Web (Flutter). Shared via Melos monorepo + a common Dart interface layer.

---

## 2. The five-layer architecture (top-down)

```
+------------------------------------------------------------------+
| Layer 5: EXPERIENCE LAYER                                        |
|   iOS app, Android app, Web companion, Watch/Wear glance          |
|   (Flutter / Riverpod / go_router / Material 3 / iOS adaptive)  |
+------------------------------------------------------------------+
| Layer 4: AGENT ORCHESTRATION LAYER                               |
|   On-device planner, tool router, citations, persona engine      |
|   (Dart, Riverpod providers, isolates for streaming)            |
+------------------------------------------------------------------+
| Layer 3: INTELLIGENCE LAYER                                      |
|   On-device LLM (flutter_gemma / flutter_llama) + Math engine    |
|   Cloud LLM (Claude Haiku/Sonnet) - OPT-IN, E2E encrypted        |
+------------------------------------------------------------------+
| Layer 2: DATA LAYER                                              |
|   Encrypted notebook store (Drift + SQLCipher) + Source graph     |
|   + Sync engine (libp2p-style envelope)                          |
+------------------------------------------------------------------+
| Layer 1: PLATFORM LAYER                                          |
|   Flutter engine / FFI / MethodChannels / OS keystore / Whisper  |
+------------------------------------------------------------------+
```

Each layer below depends only on the layer beneath it. The Experience Layer talks to the Orchestration Layer via a single, well-defined protocol. The Orchestration Layer is the only consumer of the Intelligence Layer's tool API. This is what makes the model hot-swappable and the cloud opt-in safe.

---

## 3. Layer 1 — Platform layer (the substrate)

The platform layer is what the OS gives us through Flutter's engine. We pick the best path per platform and abstract it behind a single `LocalModelRuntime` interface in pure Dart.

### 3.1 iOS
- **Apple Foundation Models** (iOS 18+, via `flutter_gemma`'s Apple Intelligence backend): ~3B parameter on-device model, ships with the OS.
- **Apple Speech** (`speech_to_text` plugin) for streaming STT.
- **Apple Vision** (`google_mlkit_text_recognition` for iOS, or `vision_kit` style via platform channels) for on-device OCR.
- **Keychain** (via `flutter_secure_storage` backed by `KeychainAccessibility.first_unlock`) for the master key.
- **AVSpeechSynthesizer** (via `flutter_tts` with `IOSSpeechSynthesizer`) for on-device TTS in the audio recap.
- **App Group + CloudKit (E2E encrypted via custom envelope key)** for Pro tier cross-device sync.
- **WidgetKit** + **ActivityKit** for the home-screen widget and check-in Live Activities.

### 3.2 Android
- **AICore** (Android 14+, via `flutter_gemma`'s AICore backend): system-managed on-device model runtime with hot-swap.
- **Gemini Nano** as the default v1 model; falls back to bundled Gemma 3 4B (4-bit quantized) on devices without Nano.
- **Whisper** (via `whisper_ggml` FFI plugin) for STT.
- **ML Kit Text Recognition** (via `google_mlkit_text_recognition`) for OCR.
- **Android Keystore + StrongBox** (via `flutter_secure_storage` backed by `EncryptedSharedPreferences` with AES-256 GCM) for the master key.
- **`flutter_tts`** with on-device voices for the audio recap.
- **WorkManager** (via `workmanager` plugin) for the Sunday check-in scheduling.
- **Google Drive REST API** (App-Specific Password, app-data scope, client-side encrypted) for Pro sync.

### 3.3 Web (companion, v1.5+)
- **flutter_web** with the **CanvasKit** renderer (default in Flutter 3.32+).
- **WebLLM** for in-browser inference, called from Dart via a JS interop package (`web_llm` for the web target only).
- **Web Crypto API** for the keystore (via `flutter_secure_storage`'s web backend).
- **IndexedDB + Origin Private File System** for local persistence (via `drift`'s web executor, with the SQLCipher-wasm fork for encryption).
- The web companion is **read-only** in v1.5, write-enabled in v2.0.

### 3.4 The abstraction: `LocalModelRuntime`
```dart
// lib/ai_runtime/local_model_runtime.dart
abstract class LocalModelRuntime {
  /// Lifecycle
  Future<RuntimeInfo> isAvailable();
  Future<void> warmup();
  Future<void> swapModel(String modelId);

  /// Core inference
  Stream<Token> generateStream(
    String prompt, {
    required GenerateOpts opts,
  });

  Future<GenerateResult> generateWithTools(
    String prompt, {
    required List<ToolDef> tools,
    required GenerateOpts opts,
  });

  /// Local-only telemetry (never leaves the device)
  int get lastTokenCount;
  Duration get lastLatency;
}

class RuntimeInfo {
  final bool available;
  final String modelId;
  final ModelTier tier; // fast | balanced | pro
  final String? reason;
}
```

This is the seam. Every backend — Apple Foundation Models (via `flutter_gemma`), Android AICore (via `flutter_gemma`), bundled Gemma 3 4B (via `flutter_gemma`'s MediaPipe backend), bundled Phi-3 Mini (via `flutter_gemma`'s LiteRT backend), FunctionGemma 270M (via `flutter_llama`), WebLLM (via JS interop), cloud Haiku (via `package:http` + E2E envelope) — implements this interface. The Agent Orchestration Layer never knows which model is on the other side.

---

## 4. Layer 2 — Data layer (the notebook)

The user's notebook is the durable object. It is also the auditable surface for the on-device AI.

### 4.1 The notebook schema
A notebook is a tree of:
- **Notebook** (1 per user in free tier; unlimited in Pro)
  - **Source** (a PDF, photo, voice memo, text note, or imported CSV)
    - **Chunk** (a chunked + embedded unit; embedding is on-device, stored locally)
    - **Citation** (a pointer from a generated answer back to a specific chunk)
  - **Page** (a user-or-AI-suggested grouping, e.g. "Dining", "Subscriptions")
    - **Transaction** (a parsed, categorized line item; can be from a source or directly captured)
  - **Thread** (a chat conversation, attached to a notebook, a source, a page, or a goal)
    - **Turn** (user or assistant message, with citations attached)
  - **Goal** (a structured intent parsed from free-form text or selected from the library)
  - **Framework** (a curated or user-uploaded document that grounds the AI's recommendations)
  - **CheckIn** (a weekly/monthly ritual snapshot)
    - **Card** (the structured check-in artifact, with citations to threads and sources)
  - **Persona** (Calm / Direct / Playful — affects voice, color, copy)

### 4.2 Storage
- **Primary store**: **Drift** (the type-safe Dart ORM, formerly Moor) on top of **SQLCipher** for AES-256 encryption. The encryption key is stored in the OS keystore via `flutter_secure_storage` and never leaves the device. (`NativeDatabase` on mobile, sql.js-wasm + sqlcipher-wasm on web.)
- **Vector index**: HNSW index over chunk embeddings, stored alongside the SQLite DB. Embedding model is `bge-small-en-v1.5` (33M params, ~130MB) for English or the multilingual `multilingual-e5-small` for SEA/LATAM. Both run on the NPU via the same `flutter_gemma`/`flutter_llama` runtime.
- **Blob store**: Original source files (PDF, photo, audio) stored in the encrypted filesystem, referenced by hash from Drift.
- **No cloud-side data in the free tier.** Period.

### 4.3 The source graph
Every claim the AI makes resolves to a `Citation` Drift row pointing to a `Chunk` row pointing to a `Source` row. The graph is queryable in O(1) via the vector index. This is what makes "show me the line" a single tap, not a feature.

### 4.4 The math engine sits *next to* the store
A separate Dart isolate (with an optional Rust FFI port for the hot path) exposes a deterministic tool API. Drift exposes the data; the math engine reads it, runs the calculation, and returns a number with a reproducible formula string. The math engine has no LLM dependency — it is a pure function of the store.

---

## 5. Layer 3 — Intelligence layer

This is where the model, the math engine, the OCR, and the optional cloud LLM live. The Intelligence Layer is a *tool-using* layer, not a *chat* layer.

### 5.1 The on-device LLM via `flutter_gemma`
The canonical Flutter package as of May 2026 is `flutter_gemma: ^0.15.0`. It wraps every on-device model we care about under one dependency:
- **Gemma 4 / Gemma 3n** — multimodal (vision + audio), function calling, thinking mode, on-device RAG.
- **Gemma 3** (1B / 4B / 12B / 27B) — the workhorse.
- **FunctionGemma 270M** — Google's tool-calling specialist. Runs at ~50 tok/s on a Pixel 8 / iPhone 15 Pro. Fine-tunable via Unsloth.
- **FastVLM** — Apple's fast vision-language model for receipt/statement OCR.
- **Phi-4 / Phi-4 Mini** — Microsoft's reasoning-strong small models.
- **Qwen 2.5 / 3.5** small — strong multilingual, including Chinese.
- **DeepSeek R1 distill** — for deeper reasoning when the on-device model returns low confidence.
- **SmolLM** — the smallest viable chat models for low-end devices.

`flutter_gemma` ships with GPU acceleration on Android (via MediaPipe + LiteRT-LM), iOS (via Apple Intelligence / llama.cpp / MLX), and desktop. For FunctionGemma 270M specifically, we use `flutter_llama` (a thin llama.cpp wrapper) for the tool-routing path, because function calling needs sub-300ms latency and FunctionGemma 270M at 50 tok/s is the right fit.

**v1 default**:
- iOS 18+ (iPhone 15 Pro and newer): **Apple Foundation Models 3B** (via the `flutter_gemma` Apple Intelligence backend — the OS provides the model, our app pays $0 for the bundle).
- iOS 16-17 and older iPhones: **Phi-4 Mini 3.8B** (4-bit quantized, ~2.3GB on disk, ~1.5GB resident, strong at structured output).
- Android 14+ AICore devices (Pixel 8 Pro / 9 / 10, Galaxy S24+): **Gemini Nano 3.25B** via AICore.
- Android 8-13 (no AICore): **Gemma 3 4B** (4-bit quantized, ~2.5GB on disk).
- For non-English-heavy markets (SEA, LATAM, India, MENA): **Gemma 3 4B** (140-language support) bundled by default on both platforms.
- **FunctionGemma 270M** as the tool router on all platforms.

**Latency**: 80-180ms first-token on a current-gen SoC (Apple A17 Pro / M3 / Snapdragon 8 Gen 3 / Tensor G4 class).

**Bundle impact**: 28MB base + 0-2.5GB model download (download on first launch over Wi-Fi, with progress visible to the user).

### 5.2 The deterministic math engine
A separate Dart isolate (with an optional Rust FFI port via `flutter_rust_bridge` for the hot path). Pure functions. No LLM dependency. The LLM calls it via a tool API:

```dart
// lib/math_engine/tools.dart
final mathTools = <ToolDef>[
  ToolDef(
    name: 'sum_transactions',
    description: 'Sum transaction amounts matching filters.',
    params: {
      'notebookId': 'string',
      'pageIds?': 'string[]',
      'categoryIds?': 'string[]',
      'dateFrom?': 'ISO8601',
      'dateTo?': 'ISO8601',
    },
    returns: {'total': 'number', 'count': 'number', 'formula': 'string'},
  ),
  ToolDef(
    name: 'group_by_category',
    description: 'Group and sum by category within a date range.',
    returns: 'GroupedSum[]',
  ),
  ToolDef(
    name: 'detect_subscriptions',
    description: 'Find recurring transactions that look like subscriptions.',
    returns: 'Subscription[]',
  ),
  ToolDef(
    name: 'goal_progress',
    description: 'Compute progress against a goal, projected to deadline.',
    returns: 'GoalProgress',
  ),
  ToolDef(
    name: 'month_over_month_delta',
    description: 'Compute the delta between two months for a given grouping.',
    returns: 'Delta',
  ),
  // ... 10 more deterministic tools
];
```

The LLM *plans* the query; the engine *runs* it; the LLM *narrates* the answer. The LLM never invents a number.

### 5.3 OCR pipeline
- **Receipt**: `google_mlkit_text_recognition` → small on-device layout model → LLM extracts `{merchant, items[], total, date, tax, payment_method}`. Runs in <3 seconds on a 2023 flagship.
- **Statement**: `google_mlkit_text_recognition` → table-aware extraction (a small fine-tuned LayoutLMv3-style model, ~50MB) → LLM reconciles with prior statements. Runs in <10 seconds for a 5-page statement.
- **FastVLM** (Apple) and **Gemma 3n** (Android) can do end-to-end vision-language extraction in a single model call. We use the two-stage path (OCR + LLM) for explicability — the user can see the OCR text and the extracted fields separately.
- **Contracts**: deferred to v1.5 (requires a heavier model, runs in the cloud tier, E2E).

### 5.4 Optional cloud LLM (Pro tier, opt-in)
- **When triggered**: Only when the on-device model returns low confidence, or when the user explicitly asks a "deep analysis" question. The orchestrator decides.
- **Default provider**: **Claude Haiku 4.5** ($1/M input, $5/M output, $0.10/M cached) for short deep-analysis turns, and **Claude Sonnet 4.6** ($3/M input, $15/M output) for long-context synthesis. The prompt to the user is always: "Want me to ask the cloud for a deeper answer? Your data is encrypted."
- **Zero-retention contract**: Anthropic's API allows zero-retention mode for enterprise customers. We sign the BAA.
- **Latency**: 200-800ms first-token (network-dependent).
- **Cost to us per 1M tokens (blended Haiku-heavy usage, ~3:1 input/output, with 70% cache hit rate on system prompts)**:
  - Input: 0.30 × $1 + 0.70 × $0.10 = $0.37/M effective
  - Output: $5/M
  - Realistic blended: ~$1.85/M tokens (assuming 80% input / 20% output post-cache)
- **Budget assumption**: Average Pro user runs ~15 deep-analysis questions/month, average 2,000 input tokens + 800 output tokens per question. Per user per month cloud cost: 15 × (2000 × $0.37 + 800 × $5) / 1,000,000 = 15 × ($0.74 + $4.00) / 1M × 1M = 15 × $0.00474 = ~$0.07/user/month. At 100K Pro users, that's $7K/month of cloud spend.

### 5.5 The persona engine
Three personas — Calm, Direct, Playful — drive:
- System prompt prefix (e.g., Playful: "you're a friend who happens to be good with money, never preachy, never snarky")
- TTS voice selection (Apple: Ava / Samantha / custom; Android: en-US-Wavenet-A/B/F)
- Color palette (Calm: soft teal; Direct: black/white; Playful: warm gradient)
- Check-in card design (Calm: minimal; Direct: table-forward; Playful: emoji + progress bar)

The persona engine is a thin layer of Riverpod providers + template strings, not a separate model. Switching personas does not retrain anything.

---

## 6. Layer 4 — Agent orchestration layer

This is the heart of the system, written in pure Dart with Riverpod 3 for state and `compute`/`Isolate` for streaming. The orchestrator is itself a small on-device planner (often a fine-tuned 1B model, sometimes the main LLM with a constrained system prompt).

### 6.1 The planner (the Riverpod graph)
When a user input arrives (voice, photo, or text), the orchestrator:

1. **Classifies** the intent: `logTransaction` | `query` | `plan` | `reconcile` | `checkIn` | `goalUpdate` | `smalltalk`. (FunctionGemma 270M does this in <200ms.)
2. **Retrieves** relevant context from the source graph: top-k chunks, recent check-ins, active goals. (Drift query + HNSW index.)
3. **Plans** the tool sequence: a small DAG of `mathEngine` and `search` tool calls.
4. **Executes** the plan, streaming partial results to the UI as they land.
5. **Cites** every claim by attaching the relevant `Citation` nodes to the response.
6. **Personalizes** the response through the persona engine.
7. **Surfaces the calculation** for every numeric claim: the "show me the math" expand.

The planner runs on-device. The only cloud round-trip is the optional deep-analysis path.

The Riverpod graph is structured as:
```
userInputProvider
  -> intentClassifierProvider (FunctionGemma 270M)
  -> contextRetrieverProvider (Drift + HNSW)
  -> planBuilderProvider (Tier 1/2 LLM)
  -> toolExecutorProvider (math engine + Drift)
  -> responseNarratorProvider (Tier 1/2 LLM with citations attached)
  -> personaApplierProvider
  -> chatResultProvider
```

Each provider is independently testable. The streaming is handled by `StreamProvider` and `Isolate.run` for the LLM call so the UI never blocks.

### 6.2 The citation engine
Citations are not a UI afterthought. They are produced at planning time:
- Every tool call returns a `provenance` object: the rows it touched, the formula it used, the source chunks it derived from.
- The planner attaches the relevant `Citation` nodes to the response text.
- The UI renders citations as inline tappable markers, like footnote anchors.
- Tapping a citation opens the source line in a side-by-side view with the chat answer. This is the "show me the line" interaction, and it is the single most important trust surface in the product.

### 6.3 The "show me the math" expansion
Every numeric claim in a chat response or check-in card has an expand chevron. Tapping it reveals:
- The formula (e.g., `sum(txns where category=Dining and date in March 2026)`)
- The 10 transactions that drove the number
- A "rerun with different filters" link

This is the structural answer to the "NotebookLM is the wrong tool for money" critique. We don't ask the user to trust the LLM's math; we show them the SQL.

### 6.4 The check-in ritual engine
A scheduled background task (`workmanager` on Android, `BGTaskScheduler` on iOS via the `background_fetch` plugin):
1. Snapshot the notebook state at the scheduled time (Drift query, all in <200ms).
2. Run the math engine against the last period.
3. Compose the check-in card with: top movers, anomalies, goal progress, aura.
4. Optionally generate the audio recap via on-device TTS (`flutter_tts`).
5. Push a local notification with a deep link to the card.

The card is deterministic for a given snapshot — no LLM in the loop for the composition. The narrative summary *is* LLM-generated, but every claim is cited to a tool call result.

---

## 7. Layer 5 — Experience layer

The product surface. Two Flutter apps + a Flutter web companion + watch glances. All four consume the same lower layers via a single `PocketLedgerSDK` Dart package.

### 7.1 iOS app
- **Stack**: Flutter 3.32+, Dart 3, Riverpod 3, go_router, Drift, Material 3 + iOS-adaptive theming.
- **Min iOS**: 17.0 (recommend 18+ for Foundation Models path).
- **Size**: 28MB base + model download. Comparable to a game.
- **Plugins used**: `flutter_gemma`, `flutter_llama`, `flutter_secure_storage`, `drift`, `sqflite_sqlcipher`, `google_mlkit_text_recognition`, `speech_to_text`, `flutter_tts`, `workmanager` (via the `background_fetch` plugin for iOS-side), `in_app_purchase` (StoreKit 2), `app_intents` (Siri Shortcuts), `home_widget` (WidgetKit), `flutter_local_notifications` (with `flutter_activitykit` for Live Activities), `cloud_kit` (encrypted sync), `health` (for "money vs. health" correlations, opt-in).
- **Review time**: ~24-48h typical, 7-day phased release via TestFlight.

### 7.2 Android app
- **Stack**: Flutter 3.32+, Dart 3, Riverpod 3, go_router, Drift, Material 3 + Material You dynamic color.
- **Min SDK**: 30 (Android 11.0). Target SDK 35.
- **Size**: 28MB base + model download.
- **Plugins used**: `flutter_gemma` (AICore + LiteRT backends), `flutter_llama`, `flutter_secure_storage` (Android Keystore backend), `drift`, `sqflite_sqlcipher`, `google_mlkit_text_recognition`, `speech_to_text`, `flutter_tts`, `workmanager`, `in_app_purchase` (Play Billing 7), `home_widget`, `flutter_local_notifications`, `google_drive` (encrypted sync), `health`.
- **Review time**: ~24-72h typical, 5% → 20% → 100% staged rollout via Play Console.

### 7.3 Web companion (v1.5+)
- **Stack**: Flutter web with CanvasKit renderer, Riverpod 3, Drift web executor, `web_llm` (JS interop) for inference.
- **Min browser**: Chrome 138+ / Edge 138+ / Safari 18+ (WebGPU required for inference). Firefox fallback: read-only via REST.
- **Inference**: WebLLM running Gemma 3 4B in browser. First load: ~2.5GB download, cached.
- **Mode**: Read-only in v1.5. Full read/write in v2.0.

### 7.4 Watch / Wear
- **watchOS**: Complication + glance of last check-in. Quick-log via Shortcut on the phone.
- **Wear OS**: Tile + complication. One-tap voice log (uses watch's STT, syncs to phone over BLE).

### 7.5 The shared SDK
A single Dart package `pocketledger_sdk` is the contract between the Experience Layer and the Orchestration Layer. The same package is consumed by all three runtimes.

```dart
// pocketledger_sdk/lib/pocketledger_sdk.dart
abstract class PocketLedgerSDK {
  final NotebookService notebook;
  final ChatService chat;
  final CaptureService capture;
  final CheckInService checkIn;
  final GoalsService goals;
  final ExportService export;
  final PersonalsService personals;
}

abstract class ChatService {
  Future<ChatResult> send(String message, {ChatOpts? opts});
  Stream<ChatEvent> stream(String message, {ChatOpts? opts});
}

abstract class CaptureService {
  Future<VoiceResult> voice();
  Future<PhotoResult> photo(String uri);
}

abstract class CheckInService {
  Future<CheckInCard> run({CheckInOpts? opts});
  Future<void> schedule(CheckInCadence cadence);
}
```

The SDK is published to the internal Melos workspace; the iOS, Android, and web apps all import the same package. There is no codegen step — Dart is the source of truth for all three runtimes, and the SDK is consumed by all three without a Swift/Kotlin port (unlike the React Native + Expo world).

---

## 8. The hybrid orchestration contract

This is the explicit decision boundary between on-device and cloud:

| Task | On-device | Cloud (opt-in) |
|---|---|---|
| Voice-to-text | ✅ | ❌ |
| Photo OCR | ✅ | ❌ |
| Transaction categorization | ✅ | ❌ |
| Sum / group / delta / trend | ✅ (math engine) | ❌ |
| Subscription detection | ✅ | ❌ |
| Goal reconciliation | ✅ | ❌ |
| Check-in composition | ✅ | ❌ |
| Chat with citations, short context | ✅ | ❌ |
| Chat, long context (multi-year) | ⚠️ degraded | ✅ |
| "What if" scenario modeling | ⚠️ shallow | ✅ |
| Complex contract Q&A (v1.5) | ❌ | ✅ |
| Tax-prep handoff (v2.0) | ❌ | ✅ |

The rule: **if the task can be done by reading the user's own notebook deterministically, it stays on-device.** Cloud is only consulted for tasks that require either a much larger reasoning budget or knowledge outside the notebook.

---

## 9. The privacy architecture in detail

### 9.1 The key hierarchy
- **Master key**: 256-bit, generated on first install using `Random.secure()` (which sources from `/dev/urandom` on iOS/Android and the Web Crypto API on web), never leaves the device keystore (Keychain on iOS, StrongBox on Android, WebCrypto non-extractable on web). Stored via `flutter_secure_storage`.
- **Notebook key**: derived from master + notebookId via HKDF. Rotated on notebook delete.
- **Source key**: derived from notebook + sourceId. Allows per-source revocation.
- **Cloud envelope key**: a one-time key generated when the user enables Pro sync. Wraps the master key for storage in the user's iCloud / Drive app-data. We never see the unwrapped master key.

### 9.2 The data flow on a Pro sync
1. User enables Pro on device A.
2. Device A generates `cloudEnvelopeKey` (X25519), encrypts the local master key with it, uploads only the ciphertext to the user's own iCloud / Drive app-data.
3. User installs PocketLedger on device B, signs in with the same Apple/Google account.
4. Device B reads the ciphertext, asks device A (over local network or BLE) to release the envelope key.
5. Both devices now hold the master key locally. The cloud stores only ciphertext.
6. **We (the company) cannot decrypt the notebook. The cloud provider (Apple/Google) cannot decrypt it either** — they see only ciphertext in their app-data scope.

### 9.3 The audit log
A local, append-only Drift table:
- Every cloud call (question, model, response hash, duration)
- Every share-with-watermark
- Every export
- Every cross-device sync event

The user can view, filter, and delete the log. We never see it.

### 9.4 The model update channel
When Apple or Google ships a better on-device model:
1. We ship a Flutter app update that points the `LocalModelRuntime` to the new model ID.
2. The OS fetches the new model weights through its own signed channel (AICore, Apple Intelligence).
3. The first inference with the new model is gated behind a "new model available, try it?" prompt.
4. If the user accepts, the runtime swaps models. If they decline, the old model stays.

We never push model updates silently. We never push model updates that change the system's behavior without the user's knowledge.

---

## 10. The deployment and release architecture

### 10.1 iOS
- Flutter 3.32+ stable channel, Dart 3.5+.
- `flutter build ios --release` via Fastlane.
- TestFlight for beta, phased release at 1% / 10% / 50% / 100% over 7 days.
- App Store privacy nutrition labels: "Data Not Collected" for free tier, "Data Not Linked to You" for Pro cloud sync (because we don't have the key).
- Crash logs via `firebase_crashlytics` or `sentry_flutter`, opt-in only.

### 10.2 Android
- Flutter 3.32+ stable, Dart 3.5+, minSdk 30 (Android 11), targetSdk 35.
- `flutter build appbundle --release` via Fastlane.
- Internal testing track, then 5% / 20% / 100% staged rollout via Play Console.
- Google Play Data Safety form: same posture as iOS.
- AICore-aware: detect on launch whether Nano is available; fall back to bundled Gemma 3.

### 10.3 The backend (minimal by design)
- **Auth**: Sign in with Apple / Google (only for Pro). No passwords. No email.
- **Billing**: `in_app_purchase` on iOS, Play Billing on Android. Receipts validated server-side via App Store Server API / Google Play Developer API.
- **Telemetry**: opt-in, anonymized, aggregated. Server is a thin Dart (using `dart_frog`) or Go service on Fly.io or Dokploy.
- **No user data ever lands on our servers.** The auth and billing services are deliberately decoupled from the data services. Even if the data services are breached, there is no data to breach.

### 10.4 The model registry
A small JSON file shipped in the app (`assets/model_registry.json`), listing supported on-device models, their minimum device requirements, and their hot-swap plan. The orchestrator consults this file to pick the best model for the current device.

```json
{
  "models": [
    {
      "id": "apple-foundation-3b",
      "tier": "primary",
      "min_ios": "18.0",
      "device_class": "high",
      "params_b": 3.0,
      "language": "english-strong"
    },
    {
      "id": "gemma-3-4b-4bit",
      "tier": "fallback",
      "min_ios": "17.0",
      "min_android": "11",
      "params_b": 4.0,
      "download_mb": 420,
      "resident_mb": 2500,
      "language": "multilingual"
    },
    {
      "id": "function-gemma-270m",
      "tier": "router",
      "params_b": 0.27,
      "fine_tuned": true,
      "purpose": "tool-routing"
    },
    {
      "id": "claude-haiku-4.5",
      "tier": "cloud",
      "cost_per_1m_input": 1.00,
      "cost_per_1m_output": 5.00,
      "zero_retention": true,
      "e2e_encrypted": true
    }
  ]
}
```

---

## 11. The observability and quality story

Because we cannot see user data, we need a different observability strategy.

### 11.1 On-device telemetry (opt-in, anonymized, aggregated)
- "User asked a query, on-device model succeeded, took 1.4s, used 3 tool calls, 2 citations shown." No text. No numbers. No PII.
- "User enabled Pro cloud sync." Just the event.
- Aggregated daily; we see deltas, not individuals.

### 11.2 Quality signals
- **Citation-tap rate**: if users are tapping citations, the answers are landing. If they aren't, the answers are off.
- **"Show me the math" expand rate**: if users are expanding calculations, the numbers are surprising. If they aren't, the numbers are landing.
- **Rerun-with-different-filters rate**: power-user signal that the math engine is being explored.
- **Cloud opt-in rate**: how often the on-device model is enough.
- **Check-in completion rate**: did the user engage with the Sunday card?
- **Share rate**: did the user post a watermarked card?

### 11.3 The "math audit" — automated nightly
A small test corpus of ~200 hand-curated financial questions, run against a reference notebook, with expected numeric answers. Runs in CI and on-device nightly. Any deviation fails the build. This is how we guarantee the math engine stays correct as it evolves.

### 11.4 The "red team" — adversarial financial questions
A library of ~100 adversarial prompts designed to surface the kinds of errors NotebookLM makes:
- "What's my average monthly dining spend, including only restaurants with >$10 average ticket?"
- "Did my subscription costs go up or down in March vs February, in absolute dollars?"
- "If I keep spending at the March rate, when will I hit my $1,000 savings goal?"
Each is run against the orchestrator nightly. Any answer that doesn't include the citation + the calculation expand fails the build.

---

## 12. The architecture in one diagram

```
                        +-------------------------+
                        |       USER (Maya)       |
                        +-----------+-------------+
                                    |
                            voice | photo | chat
                                    v
+------------------------------------------------------------------+
|                       EXPERIENCE LAYER                            |
|     iOS (Flutter)      Android (Flutter)      Web (Flutter)      |
|     + Riverpod 3       + Riverpod 3           + Riverpod 3       |
|     + go_router        + go_router            + go_router        |
|     + Material 3       + Material 3 / You     + Material 3       |
+----------------------------+-------------------------------------+
                             |   pocketledger_sdk (Dart)
                             v
+------------------------------------------------------------------+
|                  AGENT ORCHESTRATION LAYER                        |
|  (Dart, Riverpod 3, StreamProvider, Isolate.run for streaming)   |
|                                                                  |
|  Intent Classifier (FunctionGemma 270M) -> Context Retriever    |
|  -> Plan Builder (Tier 1/2 LLM) -> Tool Executor (math engine)   |
|  -> Response Narrator -> Citation Engine -> Persona Applier     |
+------+---------------------+------------------+------------------+
       |                     |                  |
       v                     v                  v
+-------------+   +--------------------+   +------------------+
| ON-DEVICE   |   | DETERMINISTIC      |   | OPTIONAL CLOUD   |
| LLM         |   | MATH ENGINE        |   | LLM (Pro, opt-in)|
|             |   |                    |   |                  |
| flutter_    |   | Dart isolate,      |   | Claude Haiku     |
| gemma       |   | optional Rust FFI  |   | 4.5 + Sonnet 4.6 |
| (Apple FM,  |   | (flutter_rust_     |   |                  |
| Android AI  |   | bridge). Pure      |   | E2E encrypted    |
| Core, bundled|  | functions. No LLM  |   | zero retention   |
| Gemma, Phi-4|   | dependency.        |   | no training      |
| , Qwen 2.5) |   |                    |   |                  |
|             |   | 15 tools: sum,     |   |                  |
| flutter_    |   | group, delta, sub, |   |                  |
| llama for   |   | goal, projection,  |   |                  |
| tool router |   | aura, anomaly...   |   |                  |
+------+------+   +---------+----------+   +---------+--------+
       |                    |                       |
       v                    v                       v
+------------------------------------------------------------------+
|                       DATA LAYER                                 |
|                                                                  |
|   +-------------------+   +------------------+   +------------+  |
|   | Drift + SQLCipher |   | HNSW vector      |   | Encrypted  |  |
|   | (Notebook, Source,|   | index (bge-small |   | blob store |  |
|   | Chunk, Citation,  |   | embedding,       |   | (PDFs,     |  |
|   | Transaction, Goal,|   | on-device)       |   | photos,    |  |
|   | CheckIn, Persona) |   |                  |   | audio)     |  |
|   +-------------------+   +------------------+   +------------+  |
|                                                                  |
|   Encryption: AES-256-GCM, key in OS keystore (Keychain /       |
|   StrongBox / WebCrypto). SQLCipher page-level encryption.      |
|   Sync: E2E envelope key, opt-in Pro only                        |
+----------------------------+-------------------------------------+
                             |
                             v
+------------------------------------------------------------------+
|                       PLATFORM LAYER                             |
|  iOS: Foundation Models / Speech / Vision / Keychain / AVSpeech |
|  Android: AICore / MediaPipe / ML Kit / Keystore / TTS          |
|  Web: CanvasKit / WebLLM / WebCrypto / IndexedDB / sqlcipher-wasm|
+------------------------------------------------------------------+
```

---

## 13. Why this architecture is hard to copy

1. **The on-device LLM runtime abstraction is non-trivial.** Shipping a model hot-swap layer that works across Apple Foundation Models, Android AICore, Gemini Nano, and bundled Gemma 3 / Phi-3 is a real engineering investment. The `flutter_gemma` package makes it tractable; the `LocalModelRuntime` interface makes it portable. Competitors who pick one platform (Monarch is iOS-first, Cleo is iOS-only) cannot easily follow.
2. **The math engine as a separate isolate is a deliberate architectural choice.** It says: "we don't trust the LLM to do math, and we will show you the SQL." This is rare in AI-first products. It is also the most defensible trust surface we have.
3. **The E2E envelope key flow is hard to implement correctly.** We cannot see user data — by design. This is a structural advantage in a year of CFPB/FTC scrutiny of AI financial advice.
4. **The source graph + citation engine is a real product surface.** "Show me the line" is one tap, not a feature. This is the trust wedge.
5. **The check-in ritual is a habit, not a feature.** Habits are hard to build, easy to lose, and almost impossible to migrate. Once a user has 26 Sunday check-ins in PocketLedger, the switching cost is enormous.
6. **Flutter end-to-end** (iOS, Android, web from one Dart codebase) gives us 2-3× the engineering velocity of a polyglot stack. The shared SDK, the shared Riverpod graph, the shared Drift schema, the shared math engine — all in one language, one type system, one test runner.

This is the architecture. The next 12 months are about shipping it, in that order: the spine, the ritual, the surface area, the trust.
