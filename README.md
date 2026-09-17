# PocketLedger

A mobile-first, on-device AI finance notebook. Built from the XDA / NotebookLM-for-finance signal.

## What's in this folder

```
ledgerlens/
├── docs/
│   ├── 01-research-findings.md     # Why this exists. The XDA article, the demand signature, the gap.
│   ├── 02-platform-spec.md         # The product. Personas, pillars, features, monetization, metrics.
│   ├── 03-architecture.md          # The technical blueprint. Five layers, hybrid orchestration, privacy architecture.
│   ├── 04-platform-deep-dive.md    # Engineering + UX + cost detail. Every model named, every latency targeted.
│   ├── 05-financial-model.md       # 3-year P&L, unit economics, sensitivity, fundraising path, exit scenarios.
│   └── 06-github-architecture.md   # Repo structure, Melos + FVM, CI/CD, secrets, AGPL, redteam gates.
└── deck/
    └── slides/output/
        ├── pocketledger-strategy-and-architecture.pptx   # 24-slide PowerPoint deck
        └── pocketledger-strategy-and-architecture.pdf    # PDF export
```

## The headline

In August 2025, a tech writer dragged her bank statements into NotebookLM, asked "where am I overspending?", and called the result "brilliant." The article crossed the personal-finance community in a weekend. The XDA follow-up "Please stop using NotebookLM for your finances" became the punch list.

**PocketLedger is the answer to the question the article was trying to ask:**

> A private, on-device AI finance notebook for your phone. Voice, photo, or chat in. Chat with citations, check-in card, and audio recap out. The model lives on the phone by default. The math is deterministic. The privacy is structural.

## The numbers, in one breath

- **$1.2M** to ship v1.0 (6-month build, 8-person team).
- **$141K/mo** OpEx at 100K MAU (75% gross margin).
- **$0** variable cost on the free tier (on-device inference).
- **5.5× LTV/CAC** by Year 3 (industry healthy: 3-5×).
- **94% gross margin** by Year 3 (on-device default = near-zero variable cost).
- **7.3-month CAC payback** by Year 3 (industry healthy: <12 months).
- **$25M ARR** and profitable by Year 4.
- **$58.5M** total capital to break-even across 4 rounds.
- **8.5× MOIC** at the median exit (10× ARR for $50M exit = $500M valuation).

## The LLM stack, named

| Tier | Model | Job | Cost to us |
|---|---|---|---|
| 1 | FunctionGemma 270M (fine-tuned, via `flutter_llama`) | Tool routing | $0 (on device) |
| 2 | Apple Foundation Models 3B / Gemini Nano 3.25B (via `flutter_gemma`) | Short-context chat | $0 (OS-provided) |
| 3 | Phi-4 Mini 3.8B / Gemma 3 4B (via `flutter_gemma` LiteRT + MediaPipe) | Bundled fallback for older devices | $0 (on device) |
| 4 | Claude Haiku 4.5 + Sonnet 4.6 | Pro opt-in deep analysis | $0.07/user/mo (Haiku-heavy) |
| 5 | bge-small / multilingual-e5-small | Source graph search | $0 (on device) |

## The GitHub architecture, in one breath

- **Monorepo**: **Dart pub workspaces + Melos** (Flutter-native equivalent of pnpm + Turborepo). Single Dart source of truth for iOS / Android / web.
- **Stack**: **Flutter 3.32+** (Dart 3) on iOS 17+ / Android 11+ / Web. State via **Riverpod 3**, routing via **go_router**, persistence via **Drift + SQLCipher**, on-device LLM via **`flutter_gemma: ^0.15.0`** + **`flutter_llama`**, secure storage via **`flutter_secure_storage`**. SDK pinning via **FVM**.
- **On-device AI**: `flutter_gemma` wraps Apple Foundation Models (iOS 18+), Android AICore / Gemini Nano, bundled Gemma 3 / Phi-4, FunctionGemma 270M. One `LocalModelRuntime` Dart interface, multiple impls, hot-swappable via `assets/model_registry.json`.
- **The SDK contract**: Dart `PocketLedgerSDK` abstract class in `packages/sdk/`. One implementation, consumed by all three runtimes. **No codegen. No Swift port. No Kotlin port.** Dart is the source of truth.
- **The math engine**: a separate Dart package (`packages/math_engine/`) — pure functions, optional Rust FFI port via `flutter_rust_bridge` for the hot path. LLM proposes the formula; engine runs it. 200 hand-curated test cases. Math audit runs on every PR.
- **The redteam**: 100 adversarial financial questions (e.g., "what's my average dining spend with ticket >$10?") run nightly + on every label `redteam-ready` PR.
- **The privacy audit**: a custom composite GitHub Action that scans `packages/ai_runtime/` and `packages/data_layer/` for any `package:http` / `dart:io.HttpClient` / `WebSocket` call against a non-allowlisted domain. Allowlist: `api.anthropic.com` only. Anything else fails the build.
- **License**: **AGPL-3.0** — deliberate. Forks that run as a network service must publish source. Protects the privacy posture from silent forks.
- **Branch strategy**: trunk-based. `main` is always deployable. Conventional commits enforced. PR gate: format + analyze + test + math-audit + privacy-audit + 2 approvals.

## Who this is for

- **Maya, 26** — designer, $42-68K, privacy-conscious, AI-fluent, mobile-first, BNPL-habit. Quits budgeting apps because the dashboard feels like homework. Wants the chat.
- **Daniel, 41** — married freelance consultant, mixes personal and business, wants a clean month-end handoff for his accountant.
- **Priya, 19** — college, first credit card, wants streaks without shame.

## How easy is it to use?

- **Day 0** — install to first insight: **90 seconds** (5s of app, 85s of human).
- **Day 7** — first weekly check-in: **12 seconds**.
- **Day 14** — first chat query: **<1 second to first token**.
- **Day 30** — accountant export for 30 days: **8 seconds**.

## How to read these files

1. **Start with `docs/01-research-findings.md`** — sets up the demand and the gap.
2. **Then `docs/02-platform-spec.md`** — the product, the personas, the pillars, the pricing, the metrics.
3. **Then `docs/03-architecture.md`** — the technical blueprint, layer by layer.
4. **Then `docs/04-platform-deep-dive.md`** — the LLM stack named, the cost model line-by-line, the user journey timed.
5. **Then `docs/05-financial-model.md`** — 3-year P&L, unit economics, sensitivity, fundraising, exit.
6. **Then `docs/06-github-architecture.md`** — the repo structure, the CI/CD pipeline, the secret model, the license, the contributor flow, the 12-month repo roadmap.
7. **Then the deck** — 24 slides covering the same ground in presentation form, designed for a 25-30 minute pitch.

## Next step

Give me a green light + a GitHub org name. I'll:
1. `git init` and push these 6 docs as the initial commit.
2. Scaffold the **Dart pub workspaces + Melos** monorepo (`apps/{ios,android,web,backend}` + `packages/{sdk,math_engine,ai_runtime,data_layer,ui,...}`).
3. Wire up the CI (`ci.yml` + `ios-build.yml` + `android-build.yml` + `redteam.yml`).
4. Set up the self-hosted macOS runner for iOS builds.
5. Add the `model_registry.json` and the `LocalModelRuntime` Dart interface.
6. Ship a runnable Flutter iOS prototype (Day 0 — install to first insight, 90s) by end of week.

The 18-month window to own the category is the deadline. The XDA signal is the entry point. The on-device architecture is the moat. The Flutter codebase is the executable.
