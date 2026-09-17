# PocketLedger

> The private, on-device AI finance notebook for your phone.
> Your money, your model, your phone.

PocketLedger is a Flutter monorepo that ships a privacy-first consumer finance
app for iOS, Android, and the Web. The on-device LLM runs on the user's phone
by default — Apple Foundation Models / Gemini Nano / bundled Gemma 3 / Phi-4 —
with Claude Haiku 4.5 as an opt-in Pro tier for deep analysis. The math is
deterministic. The privacy is structural. The math engine is a separate
package from the AI runtime, so the LLM never invents a number.

## Status

**Pre-launch.** The strategy, architecture, and 6 detailed documents are in
[`/workspace/ledgerlens/docs/`](../../docs/) (see `01-research-findings.md` for
the XDA / NotebookLM signal, `03-architecture.md` for the technical
blueprint, `05-financial-model.md` for the 3-year P&L, `07-production-roadmap.md`
for the 6-month build plan).

The Flutter codebase is being scaffolded per
[`06-github-architecture.md`](../../docs/06-github-architecture.md). Epic 1
(repo + CI + scaffolding) is in progress.

## Stack

- **Flutter 3.32+** (Dart 3) on iOS 17+ / Android 11+ / Web.
- **FVM** for SDK version pinning. **Melos** for monorepo task graph.
- **Riverpod 3** for state. **go_router** for navigation. **Drift + SQLCipher**
  for the encrypted store. **`flutter_secure_storage`** for the OS keystore.
- **`flutter_gemma: ^0.15.0`** as the canonical on-device AI package
  (Gemma 4 / 3n / 3, Phi-4, Qwen, DeepSeek R1, SmolLM, FastVLM, multimodal +
  function calling + thinking mode + GPU acceleration).
- **`flutter_llama`** for FunctionGemma 270M (the local tool router).
- **Claude Haiku 4.5** (opt-in Pro) for deep analysis. **Zero retention.**
  **E2E encrypted.**

## Quickstart

```bash
# 1. Install deps
brew tap leoafarias/fvm && brew install fvm
dart pub global activate melos

# 2. Clone and bootstrap
git clone https://github.com/pocketledger/pocketledger
cd pocketledger
fvm use
melos bootstrap

# 3. Verify
melos run analyze       # 0 warnings required
melos run test          # all unit tests
melos run math-audit    # 200 deterministic cases
melos run redteam       # 100 adversarial cases (nightly also runs)
melos run privacy-audit # no outbound network calls outside allowlist

# 4. Run the iOS app
cd apps/ios
fvm flutter run -d <iPhone 15 Pro>
```

## Repo layout

See [`docs/06-github-architecture.md`](../../docs/06-github-architecture.md)
for the full breakdown. Short version:

```
pocketledger/
├── apps/                        # runnable surfaces
│   ├── ios/                     # Flutter + iOS Xcode workspace
│   ├── android/                 # Flutter + Android Gradle project
│   ├── web/                     # Flutter web (read-only v1.5)
│   └── backend/                 # dart_frog on Fly.io (auth, billing, telemetry)
├── packages/                    # shared library packages
│   ├── sdk/                     # the PocketLedgerSDK Dart contract
│   ├── math_engine/             # the deterministic math engine (15 tools)
│   ├── ai_runtime/              # the LocalModelRuntime (5 on-device + 1 cloud)
│   ├── data_layer/              # Drift + SQLCipher + flutter_secure_storage
│   ├── ui/                      # Material 3 design system
│   ├── personas/                # Calm / Direct / Playful
│   ├── frameworks/              # 30+ curated frameworks
│   ├── checkin/                 # the check-in ritual engine
│   ├── export/                  # PDF + CSV exporters
│   ├── analytics/               # opt-in, anonymized, aggregated
│   ├── privacy/                 # privacy posture, audit helpers
│   ├── config/                  # shared analysis_options, lints
│   └── fixtures/                # 200 math cases + 100 redteam questions
├── infra/                       # deploy scripts + privacy audit
├── .github/                     # workflows + composite actions
├── fastlane/                    # iOS + Android Fastlane config
├── docs/                        # strategy + architecture + roadmap
└── deck/                        # the 24-slide pitch deck
```

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). All PRs go through the same gate:

1. `melos run format` — formatting.
2. `melos run analyze` — 0 warnings.
3. `melos run test` — unit tests.
4. `melos run math-audit` — 200 deterministic math cases (if you touched math_engine).
5. `melos run redteam` — 100 adversarial financial questions (if you touched ai_runtime).
6. `melos run privacy-audit` — no outbound network calls outside `api.anthropic.com`.
7. 2 approvals from CODEOWNERS.

## License

**AGPL-3.0** — see [`LICENSE`](./LICENSE). Forks that run as a network service
must publish source. Contact licensing@pocketledger.app for commercial terms.

## Security

Report vulnerabilities to security@pocketledger.app (PGP key in
[`SECURITY.md`](./SECURITY.md)). 90-day disclosure window.

## Contact

- Issues: [github.com/pocketledger/pocketledger/issues](https://github.com/pocketledger/pocketledger/issues)
- Security: security@pocketledger.app
- Privacy: privacy@pocketledger.app
- Press: press@pocketledger.app
