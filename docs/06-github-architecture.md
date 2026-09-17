# PocketLedger — GitHub Architecture & Repository Structure

> The engineering blueprint for the repo. Designed for a 4-12 person founding team that ships v1.0 in 6 months, then scales. Every choice is justified against a 2026 Flutter reference architecture (FVM + Melos + flutter_gemma 0.15.0 + Drift + SQLCipher + EAS-style Cloud Build + Fastlane match).

---

## 1. The big picture

**PocketLedger ships three runnable surfaces from one Flutter monorepo:**

1. **iOS app** (primary, Flutter + Material 3 adaptive)
2. **Android app** (primary, same Flutter code, Material 3 + Material You)
3. **Web companion** (secondary, Flutter web + CanvasKit, read-only in v1.5, read/write in v2.0)
4. **Backend** (minimal — auth, billing receipt validation, opt-in telemetry; not a product surface)

All four live in a single GitHub repo as a **Dart pub workspace + Melos monorepo**. CI is GitHub Actions with a self-hosted macOS runner for iOS builds (saves 10× the GitHub-hosted minutes cost). The on-device model runtime is a Dart abstraction layer over `flutter_gemma` (the canonical May 2026 package that wraps every on-device model under one API) and `flutter_llama` (the llama.cpp-backed plugin we use specifically for FunctionGemma 270M tool routing).

**Why Flutter, not React Native + Expo**:
- One Dart codebase, one type system, one test runner across iOS / Android / web. No `TurboModule` codegen, no Swift/Kotlin port of the SDK contract, no `expo prebuild` rebuilds.
- Riverpod 3 + Drift give us the same state management and type-safe SQL on every platform with one set of patterns.
- `flutter_gemma: ^0.15.0` (May 2026) is the canonical on-device AI package in the Flutter ecosystem — it wraps Gemma 4/3n/3, Phi-4, Qwen 2.5/3, DeepSeek R1, SmolLM, FastVLM, FunctionGemma, with multimodal + function calling + thinking mode + GPU acceleration across iOS / Android / desktop.
- 2-3× engineering velocity vs a polyglot stack. The shared SDK, the shared Riverpod graph, the shared Drift schema, the shared math engine — all in one language.
- Same Flutter app shell ships to iOS, Android, and the web companion. No second framework to maintain.

**Why Dart pub workspaces + Melos, not pnpm + Turborepo**:
- We're a Dart end-to-end stack. pnpm doesn't manage Dart packages. `dart pub workspaces` (the official Dart 3.5+ feature) + Melos is the Flutter-native equivalent.
- Melos provides the same task-graph and caching semantics as Turborepo, with a Dart-native CLI (`melos bootstrap`, `melos run test`, etc.).
- FVM (Flutter Version Manager) pins the Flutter SDK version across the team and CI, equivalent to `.nvmrc`.

---

## 2. The repository layout

```
pocketledger/
├── .github/
│   ├── workflows/                          # CI pipelines
│   │   ├── ci.yml                          # Lint, typecheck, unit tests (matrix)
│   │   ├── ios-build.yml                   # iOS TestFlight / App Store via Cloud Build
│   │   ├── android-build.yml               # Android Play Internal / Production
│   │   ├── web-build.yml                   # Flutter web build + Vercel deploy
│   │   ├── backend-deploy.yml              # Fly.io deploy
│   │   ├── e2e.yml                         # Patrol end-to-end (manual trigger)
│   │   ├── redteam.yml                     # Adversarial finance question suite (nightly)
│   │   └── release.yml                     # Tagged release + changelog
│   ├── actions/                            # Composite actions
│   │   ├── setup-fvm/                      # FVM + Flutter SDK pinning
│   │   ├── setup-melos/                    # melos bootstrap
│   │   ├── run-melos/                      # filtered melos run with cache
│   │   ├── upload-testflight/              # Cloud Build submit wrapper
│   │   └── privacy-audit/                  # scans for telemetry leaks
│   ├── CODEOWNERS                          # per-area reviewers
│   ├── dependabot.yml                      # auto-merge patch updates (pub.dev)
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── SECURITY.md
├── apps/
│   ├── ios/                                # the iOS app (Flutter)
│   │   ├── ios/                            # native iOS folder (Xcode workspace)
│   │   ├── lib/                            # Dart app code
│   │   │   ├── main.dart
│   │   │   ├── app.dart                    # MaterialApp + router
│   │   │   ├── theme.dart                  # Material 3 + iOS adaptive theme
│   │   │   ├── features/
│   │   │   │   ├── chat/                   # the home screen
│   │   │   │   ├── checkin/
│   │   │   │   ├── goals/
│   │   │   │   ├── settings/
│   │   │   │   ├── export/
│   │   │   │   └── onboarding/
│   │   │   └── shared/                     # app-local widgets
│   │   ├── assets/
│   │   │   └── model_registry.json
│   │   ├── test/
│   │   └── pubspec.yaml
│   ├── android/                            # the Android app (same Flutter code, platform overrides)
│   │   ├── android/                        # native Android folder
│   │   ├── lib/                            # mirrors apps/ios/lib (via shared packages)
│   │   ├── assets/
│   │   │   └── model_registry.json
│   │   ├── test/
│   │   └── pubspec.yaml
│   ├── web/                                # Flutter web companion
│   │   ├── lib/                            # web-specific UI
│   │   ├── web/                            # web entrypoint + index.html
│   │   ├── test/
│   │   └── pubspec.yaml
│   └── backend/                            # minimal Dart API (dart_frog or shelf)
│       ├── lib/
│       │   ├── auth/                       # Sign in with Apple / Google
│       │   ├── billing/                    # App Store Server API + Play Developer API receipt validation
│       │   ├── telemetry/                  # opt-in, anonymized, aggregated
│       │   ├── pl/                         # privacy / compliance helpers
│       │   └── server.dart                 # dart_frog app
│       ├── Dockerfile
│       ├── fly.toml
│       ├── test/
│       └── pubspec.yaml
├── packages/
│   ├── sdk/                                # the PocketLedgerSDK Dart contract
│   │   ├── lib/
│   │   │   ├── pocketledger_sdk.dart       # the abstract class
│   │   │   ├── src/
│   │   │   │   ├── notebook.dart
│   │   │   │   ├── chat.dart
│   │   │   │   ├── capture.dart
│   │   │   │   ├── checkin.dart
│   │   │   │   ├── goals.dart
│   │   │   │   ├── export.dart
│   │   │   │   └── personals.dart
│   │   │   └── types.dart
│   │   ├── test/
│   │   └── pubspec.yaml
│   ├── math_engine/                        # the deterministic math engine
│   │   ├── lib/
│   │   │   ├── math_engine.dart            # the abstract class
│   │   │   ├── src/
│   │   │   │   ├── sum.dart
│   │   │   │   ├── group.dart
│   │   │   │   ├── delta.dart
│   │   │   │   ├── subscription.dart
│   │   │   │   ├── goal.dart
│   │   │   │   ├── projection.dart
│   │   │   │   ├── aura.dart
│   │   │   │   ├── anomaly.dart
│   │   │   │   └── formula.dart            # the reproducible formula DSL
│   │   ├── native/                         # optional Rust crate (flutter_rust_bridge)
│   │   ├── test/                           # 200 hand-curated financial question test cases
│   │   └── pubspec.yaml
│   ├── ai_runtime/                         # the LocalModelRuntime abstraction
│   │   ├── lib/
│   │   │   ├── ai_runtime.dart             # the abstract class
│   │   │   ├── src/
│   │   │   │   ├── impls/
│   │   │   │   │   ├── apple_foundation/   # via flutter_gemma Apple Intelligence
│   │   │   │   │   ├── android_aicore/     # via flutter_gemma AICore
│   │   │   │   │   ├── bundled_gemma/      # via flutter_gemma MediaPipe
│   │   │   │   │   ├── bundled_phi/        # via flutter_gemma LiteRT
│   │   │   │   │   ├── function_gemma/     # via flutter_llama
│   │   │   │   │   ├── web_llm/            # JS interop, web target only
│   │   │   │   │   └── cloud_haiku/        # via package:http + E2E envelope
│   │   │   │   ├── orchestrator.dart       # intent classifier + tool router
│   │   │   │   ├── citation_engine.dart
│   │   │   │   └── persona.dart            # Calm / Direct / Playful
│   │   │   └── tools.dart                  # the 15 tool definitions
│   │   ├── test/                           # mock runtime for tests
│   │   └── pubspec.yaml
│   ├── data_layer/                         # the encrypted notebook store
│   │   ├── lib/
│   │   │   ├── data_layer.dart
│   │   │   ├── src/
│   │   │   │   ├── notebook.dart           # Notebook, Source, Page, Thread, Goal, CheckIn, Persona
│   │   │   │   ├── source_graph.dart       # chunks + citations + retrieval
│   │   │   │   ├── embedding.dart          # bge-small wrapper
│   │   │   │   ├── hnsw.dart               # vector index
│   │   │   │   ├── database.dart           # Drift schema + SQLCipher connection
│   │   │   │   ├── encryption.dart         # AES-256-GCM, HKDF, envelope
│   │   │   │   ├── sync.dart                # E2E envelope sync (paired devices)
│   │   │   │   ├── audit_log.dart          # local-only audit log
│   │   │   │   ├── consent.dart            # consent ledger
│   │   │   │   └── dsr.dart                # GDPR / CCPA right-to-erasure
│   │   ├── test/
│   │   └── pubspec.yaml
│   ├── ui/                                 # shared design system
│   │   ├── lib/
│   │   │   ├── ui.dart
│   │   │   └── src/
│   │   │       ├── components/             # Button, Card, Chip, PersonaToggle
│   │   │       ├── tokens/                 # colors, typography, spacing
│   │   │       ├── icons/                  # custom + phosphor
│   │   │       ├── illustrations/
│   │   │       └── motion/                 # animations
│   │   ├── test/
│   │   └── pubspec.yaml
│   ├── personas/                           # the persona library (Calm / Direct / Playful)
│   │   ├── lib/
│   │   │   ├── personas.dart
│   │   │   └── src/
│   │   │       ├── calm.dart
│   │   │       ├── direct.dart
│   │   │       └── playful.dart
│   │   └── pubspec.yaml
│   ├── frameworks/                         # the curated goal/framework library
│   │   ├── lib/
│   │   │   ├── frameworks.dart
│   │   │   └── src/
│   │   │       ├── data/                   # 30+ JSON framework files
│   │   │       └── loader.dart
│   │   └── pubspec.yaml
│   ├── checkin/                            # the check-in ritual engine
│   │   ├── lib/
│   │   │   ├── checkin.dart
│   │   │   └── src/
│   │   │       ├── composer.dart           # deterministic check-in card composition
│   │   │       ├── scheduler.dart          # cross-platform scheduling
│   │   │       ├── card.dart               # the check-in card schema
│   │   │       └── audio_recap.dart        # on-device TTS script + render
│   │   └── pubspec.yaml
│   ├── export/                             # PDF + CSV exporters (Daniel's killer feature)
│   │   ├── lib/
│   │   │   ├── export.dart
│   │   │   └── src/
│   │   │       ├── pdf.dart                # via pdf package + printing
│   │   │       └── csv.dart
│   │   └── pubspec.yaml
│   ├── analytics/                          # opt-in, anonymized, aggregated
│   │   ├── lib/
│   │   │   ├── analytics.dart
│   │   │   └── src/
│   │   │       ├── events.dart
│   │   │       └── transport.dart
│   │   └── pubspec.yaml
│   ├── privacy/                            # privacy posture, audit helpers
│   │   ├── lib/
│   │   │   ├── privacy.dart
│   │   │   └── src/
│   │   │       ├── consent.dart
│   │   │       └── dsr.dart
│   │   └── pubspec.yaml
│   ├── config/                             # shared analysis_options.yaml, lints
│   │   ├── analysis_options.yaml           # dart analyze config
│   │   ├── pubspec.yaml
│   │   └── README.md
│   └── fixtures/                           # test data — synthetic notebook + sources + check-ins
│       ├── lib/
│       │   ├── fixtures.dart
│       │   └── src/
│       │       ├── synthetic_notebook.dart
│       │       ├── redteam_questions.dart  # 100 adversarial financial questions
│       │       └── math_cases.dart         # 200 deterministic math test cases
│       └── pubspec.yaml
├── infra/
│   ├── fly/                                # Fly.io app config
│   ├── docker/
│   └── scripts/
│       ├── bootstrap.sh                    # create all the things
│       ├── run_redteam.sh                  # nightly adversarial suite
│       ├── bump_version.sh                 # conventional commits + changelog
│       └── check_secrets.sh                # gitleaks + trufflehog guard
├── docs/                                   # the strategy + product docs (already built)
│   ├── 01-research-findings.md
│   ├── 02-platform-spec.md
│   ├── 03-architecture.md
│   ├── 04-platform-deep-dive.md
│   ├── 05-financial-model.md
│   └── 06-github-architecture.md           # this file
├── deck/                                   # the pitch deck
│   └── slides/
├── fastlane/                               # Fastlane config (shared between iOS + Android)
│   ├── Fastfile
│   ├── Appfile
│   ├── Matchfile
│   └── Pluginfile
├── .gitignore
├── .fvmrc                                  # Flutter SDK version (FVM)
├── .metadata                               # Flutter workspace metadata
├── .editorconfig
├── analysis_options.yaml                   # root Dart analysis config
├── pubspec.yaml                            # workspace root
├── melos.yaml                              # Melos config
├── dart_test.yaml                          # test runner config
├── README.md
├── LICENSE                                 # AGPL-3.0
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

**Why this shape**:
- `apps/*` are the four runnable surfaces. Each is independently deployable. iOS and Android share Flutter code via the packages; the `lib/` folders are minimal shells that wire up the shared packages.
- `packages/sdk` is the **contract**. Every app imports from `package:pocketledger_sdk`. The contract is the only thing that crosses the iOS / Android / web boundary in a typed way — and because everything is Dart, there is no codegen, no Swift port, no Kotlin port. One implementation, one set of tests, one source of truth.
- `packages/ai_runtime` is the abstraction. The impls (Apple FM, Android AICore, bundled Gemma, bundled Phi, FunctionGemma, WebLLM, cloud Haiku) are siblings, not overrides. The orchestrator picks the best per device.
- `packages/math_engine` is **separate from the ai_runtime by design**. This is the structural answer to "NotebookLM is the wrong tool for money." LLM proposes the formula; engine runs it.
- `packages/data_layer` owns the encrypted store (Drift + SQLCipher + flutter_secure_storage for the key). Zero data crosses the SDK boundary unencrypted.
- `packages/ui` is the design system. Material 3 + iOS adaptive serves iOS automatically. The tokens package is the single source of truth.
- `packages/fixtures` holds the test data. The redteam suite and the math test cases are the structural quality gate.
- `infra/` is decoupled from the apps. Deploy via `fly deploy` from `apps/backend`. The frontend apps don't talk to infra directly.

---

## 3. The Dart pub workspaces + Melos task graph

`pubspec.yaml` at the root declares the workspace, and `melos.yaml` declares the task graph. Every script in every package is wired through Melos for caching and parallelism.

```yaml
# pubspec.yaml (root)
name: pocketledger_workspace
publish_to: none
environment:
  sdk: ">=3.5.0 <4.0.0"

workspace:
  - apps/ios
  - apps/android
  - apps/web
  - apps/backend
  - packages/sdk
  - packages/math_engine
  - packages/ai_runtime
  - packages/data_layer
  - packages/ui
  - packages/personas
  - packages/frameworks
  - packages/checkin
  - packages/export
  - packages/analytics
  - packages/privacy
  - packages/config
  - packages/fixtures
```

```yaml
# melos.yaml
name: pocketledger
repository: https://github.com/pocketledger/pocketledger

packages:
  - apps/*
  - packages/*

command:
  bootstrap:
    usePubspecOverrides: true

scripts:
  analyze:
    run: melos exec -c 1 -- "fvm dart analyze ."
    description: Run `dart analyze` in all packages.

  format:
    run: melos exec -c 1 -- "fvm dart format --set-exit-if-changed ."
    description: Check formatting in all packages.

  test:
    run: melos exec -c 1 -- "fvm flutter test --coverage --test-randomize-ordering-seed random"
    description: Run all unit tests with random ordering.

  math-audit:
    run: melos exec -c 1 --dir=packages/math_engine -- "fvm flutter test test/math_audit/"
    description: Run the 200-case deterministic math audit.

  redteam:
    run: melos exec -c 1 --dir=packages/ai_runtime -- "fvm flutter test test/redteam/"
    description: Run the 100-question adversarial redteam suite.

  build:all:
    run: melos exec -c 1 -- "fvm flutter build"
    description: Build all apps using project-specific Flutter versions.

  build_runner:all:
    run: melos exec -c 1 -- "fvm dart run build_runner build --delete-conflicting-outputs"
    description: Run build_runner for codegen (Drift, json_serializable, etc.).

  privacy-audit:
    run: ./infra/scripts/privacy_audit.sh
    description: Custom privacy audit — scans ai_runtime + data_layer for outbound network calls outside the allowlist.

  clean:
    run: melos exec -c 1 -- "fvm flutter clean"
    description: Clean all build artifacts.
```

```json
// .fvmrc
{
  "flutter": "3.32.0",
  "updateMelosSettings": true,
  "flutter_sdk": ".fvm/flutter_sdk"
}
```

**Daily commands** (all run from the repo root):
- `fvm use` — pin Flutter SDK version (per `.fvmrc`).
- `melos bootstrap` — install all workspace deps + link local packages.
- `melos run analyze` — Dart analysis across the monorepo.
- `melos run format` — check formatting.
- `melos run test` — run all unit tests with random ordering.
- `melos run math-audit` — run the 200-case deterministic math audit.
- `melos run redteam` — run the 100-question adversarial suite.
- `melos run privacy-audit` — scan for outbound network calls outside the allowlist.
- `melos run build:all` — build everything.
- `melos run build_runner:all` — codegen (Drift, json_serializable).
- `melos run clean` — clean all build artifacts.

---

## 4. The branch strategy

**Trunk-based development with short-lived feature branches.**

- `main` is always deployable. Every commit on main is a candidate for release.
- Feature branches: `feat/<ticket>-<slug>` (e.g., `feat/PL-142-math-engine-orm`).
- Bugfix branches: `fix/<ticket>-<slug>`.
- Hotfix branches: `hotfix/<slug>` (cut from a release tag, merged back to both main and the release branch).
- Release branches: `release/v1.0.0`, `release/v1.1.0`, etc. Cut from main when we ship, merged back with any release-only fixes.

**Conventional Commits** enforced via `commitlint` (Node tool, runs in the CI's lint step):
- `feat: add FunctionGemma tool router`
- `fix(math_engine): handle empty transaction list`
- `chore: bump flutter to 3.32.1`
- `docs: update privacy whitepaper`

**The PR gate** (`.github/workflows/ci.yml` runs on every PR):
1. **Format** (`dart format --set-exit-if-changed`).
2. **Analyze** (`dart analyze` — 0 warnings required).
3. **Unit tests** (Vitest-equivalent, 80% coverage threshold).
4. **Math audit** (200 deterministic cases in `packages/math_engine/test/math_audit/`).
5. **Redteam suite** (100 adversarial questions, runs on label `redteam-ready`).
6. **Build** (Flutter web build, iOS bundle build, Android bundle build).
7. **Privacy audit** (scans `packages/ai_runtime/` and `packages/data_layer/` for any outbound network call — `package:http`, `dart:io.HttpClient`, `WebSocket` — against a non-allowlisted domain. Allowlist: `api.anthropic.com` only. Anything else fails the build.).

**Merge to main requires**:
- All CI checks pass.
- Two approvals (one from CODEOWNERS for the touched area).
- The PR is "conventional-commit-clean" (commitlint passes on the squashed commit).
- The privacy audit passes.
- The math audit passes if any package under `packages/math_engine/` was touched.

**CODEOWNERS** (`/.github/CODEOWNERS`):
```
/apps/ios/                    @pocketledger/ios-team
/apps/android/                @pocketledger/android-team
/apps/web/                    @pocketledger/web-team
/apps/backend/                @pocketledger/backend-team
/packages/ai_runtime/         @pocketledger/ai-team
/packages/math_engine/        @pocketledger/ai-team
/packages/data_layer/         @pocketledger/data-team
/packages/ui/                 @pocketledger/design-team
/.github/                     @pocketledger/leadership
/infra/                       @pocketledger/platform-team
/docs/                        @pocketledger/leadership
```

---

## 5. The CI/CD pipeline (GitHub Actions)

### 5.1 The runners

| Surface | Runner | Cost | When |
|---|---|---|---|
| Lint, typecheck, unit tests, math audit, redteam | `ubuntu-latest` (GitHub-hosted) | Free for public, paid for private | Every PR + every push to main |
| iOS build (TestFlight, App Store) | Self-hosted macOS M2 Pro (in-office or Mac mini cloud) | $0/mo (hardware) or $50-100/mo (MacStadium) | On PR label `ios-build`, every push to main, every tag |
| Android build (Play Internal, Play Production) | `ubuntu-latest` | Free | Every push to main, every tag |
| Web build + deploy | `ubuntu-latest` → Vercel | Free (Vercel hobby) or $20/mo (pro) | Every push to main |
| Backend deploy | `ubuntu-latest` → Fly.io | Free (Fly hobby) or $5-30/mo | Every push to main (if `apps/backend/**` changed) |
| E2E (Patrol / integration_test) | Self-hosted iOS simulator + Android emulator on macOS | Same self-hosted M2 Pro | Nightly + manual dispatch |

**Why self-hosted macOS**: GitHub-hosted macOS minutes are 10× the cost of Linux. An M2 Pro Mac mini + power + ethernet costs $1,500 once and runs forever. For a consumer-finance app shipping iOS weekly, the payback is under 3 months.

### 5.2 The workflow files

**`/.github/workflows/ci.yml`** — runs on every PR and push to main.

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos bootstrap
      - uses: actions/upload-artifact@v4
        with:
          name: pub-cache
          path: ~/.pub-cache

  format:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos run format

  analyze:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos run analyze --no-select

  test:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos run test --no-select

  math-audit:
    needs: install
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos run math-audit

  redteam:
    if: contains(github.event.pull_request.labels.*.name, 'redteam-ready')
    needs: [format, analyze, test, math-audit]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos run redteam

  privacy-audit:
    needs: [format, analyze, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/audit-codeql-action@v3
      - uses: ./.github/actions/privacy-audit
```

**`/.github/workflows/ios-build.yml`** — runs on push to main and on tag, on self-hosted macOS.

```yaml
name: ios-build
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build-ios:
    runs-on: [self-hosted, macos, ARM64]
    environment: ios
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos bootstrap
      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_16.4.app
      - name: Install Fastlane
        run: bundle install
      - name: TestFlight build
        if: github.ref == 'refs/heads/main'
        working-directory: apps/ios
        run: bundle exec fastlane ios beta
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
      - name: App Store build
        if: startsWith(github.ref, 'refs/tags/v')
        working-directory: apps/ios
        run: bundle exec fastlane ios release
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
```

**`/.github/workflows/android-build.yml`** — runs on push to main, on Ubuntu.

```yaml
name: android-build
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build-android:
    runs-on: ubuntu-latest
    environment: android
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: '21' }
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos bootstrap
      - name: Decode keystore
        run: echo "${{ secrets.RELEASE_KEYSTORE_BASE64 }}" | base64 -d > android/app/release.keystore
      - name: Build Play Internal
        if: github.ref == 'refs/heads/main'
        working-directory: apps/android
        run: fvm flutter build appbundle --release
        env:
          KEYSTORE_PATH: ${{ github.workspace }}/apps/android/android/app/release.keystore
          KEYSTORE_PASSWORD: ${{ secrets.RELEASE_KEYSTORE_PASSWORD }}
          KEYSTORE_ALIAS: ${{ secrets.RELEASE_KEYSTORE_ALIAS }}
      - name: Build Play Production
        if: startsWith(github.ref, 'refs/tags/v')
        working-directory: apps/android
        run: fvm flutter build appbundle --release
        env:
          KEYSTORE_PATH: ${{ github.workspace }}/apps/android/android/app/release.keystore
          KEYSTORE_PASSWORD: ${{ secrets.RELEASE_KEYSTORE_PASSWORD }}
          KEYSTORE_ALIAS: ${{ secrets.RELEASE_KEYSTORE_ALIAS }}
      - uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_SERVICE_ACCOUNT_JSON }}
          packageName: app.pocketledger
          releaseFiles: apps/android/build/app/outputs/bundle/release/*.aab
          track: production
          status: completed
          mappingFile: apps/android/build/app/outputs/mapping/release/mapping.txt
```

**`/.github/workflows/redteam.yml`** — runs nightly at 02:00 UTC.

```yaml
name: redteam-nightly
on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  redteam:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos bootstrap
      - run: melos run redteam
      - uses: actions/upload-artifact@v4
        with:
          name: redteam-report-${{ github.run_id }}
          path: redteam-report.json
      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            { "text": ":rotating_light: PocketLedger redteam suite FAILED on ${{ github.run_id }}. Check artifacts." }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_REDTEAM }}
```

### 5.3 The release pipeline

**`/.github/workflows/release.yml`** — runs on `v*` tag.

```yaml
name: release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: ./.github/actions/setup-fvm
      - uses: ./.github/actions/setup-melos
      - run: melos bootstrap
      - name: Bump version
        run: melos run version
      - name: Build web
        working-directory: apps/web
        run: fvm flutter build web --release
      - name: Deploy web
        run: pnpm -F @pocketledger/web exec vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy backend
        run: pnpm -F @pocketledger/backend exec fly deploy --remote-only
      - name: Trigger iOS + Android releases
        run: echo "iOS + Android triggered by the ios-build.yml + android-build.yml on-tag jobs"
      - name: GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            apps/ios/build/ios/ipa/*.ipa
            apps/android/build/app/outputs/bundle/release/*.aab
          generate_release_notes: true
```

### 5.4 The pre-merge security checks

Three pre-merge checks that are non-negotiable for a financial app:

1. **CodeQL** (`github/codeql-action`) — every PR scanned for SQL injection, command injection, XSS, and the OWASP top 10.
2. **TruffleHog** (`trufflesecurity/trufflehog`) — every commit scanned for committed secrets. The build fails on any hit.
3. **Privacy audit** (custom composite action in `/.github/actions/privacy-audit/`) — scans `packages/ai_runtime/` and `packages/data_layer/` for any code path that calls `package:http`, `dart:io.HttpClient`, or `WebSocket` against a domain not in the allowlist (`api.anthropic.com` only, for the cloud LLM tier). Any other outbound network call in those packages fails the build.

---

## 6. The shared SDK (the only contract)

The `PocketLedgerSDK` Dart class is the single typed boundary between the apps and the platform. There is no codegen step — Dart is the source of truth for all three runtimes, and the SDK is consumed by all three without a Swift/Kotlin port (unlike the React Native + Expo world).

```dart
// packages/sdk/lib/pocketledger_sdk.dart
abstract class PocketLedgerSDK {
  PocketLedgerSDK({
    required this.notebook,
    required this.chat,
    required this.capture,
    required this.checkIn,
    required this.goals,
    required this.export,
    required this.personals,
  });

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

**The contract is versioned** in semver. Breaking changes require a major bump. The SDK is consumed via `import 'package:pocketledger_sdk/pocketledger_sdk.dart';` in all four apps.

The iOS / Android / web apps each have a `lib/main.dart` that constructs the SDK with the platform-appropriate implementations:

```dart
// apps/ios/lib/main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Construct the SDK with platform-appropriate implementations
  final sdk = PocketLedgerSDK(
    notebook: IosNotebookService(),
    chat: IosChatService(aiRuntime: AppleFoundationModelRuntime()),
    capture: IosCaptureService(),
    checkIn: IosCheckInService(),
    goals: IosGoalsService(),
    export: IosExportService(),
    personals: IosPersonalsService(),
  );
  
  runApp(PocketLedgerApp(sdk: sdk));
}
```

The Android and web mains look similar but use Android / web implementations. The SDK is identical.

---

## 7. The on-device model runtime (the heart of the system)

Lives in `packages/ai_runtime/`. The `flutter_gemma` package (May 2026) is the canonical on-device AI package in the Flutter ecosystem. It wraps every on-device model we care about under one dependency. The `LocalModelRuntime` interface in pure Dart gives us a portable abstraction.

```
packages/ai_runtime/
├── lib/
│   ├── ai_runtime.dart                    # public exports
│   ├── runtime.dart                        # the LocalModelRuntime interface
│   ├── orchestrator.dart                   # intent classifier + tool router
│   ├── citation_engine.dart                # citation attach + provenance
│   ├── persona.dart                        # Calm / Direct / Playful
│   ├── tools.dart                          # the 15 tool definitions
│   ├── prompts/                            # system prompt library per persona
│   └── impls/
│       ├── apple_foundation.dart           # iOS Foundation Models 3B
│       ├── android_aicore.dart             # Android AICore / Gemini Nano 3.25B
│       ├── bundled_gemma.dart              # bundled Gemma 3 4B (fallback)
│       ├── bundled_phi.dart                # bundled Phi-4 Mini (fallback)
│       ├── function_gemma.dart             # 270M tool router via flutter_llama
│       ├── web_llm.dart                    # JS interop, web target only
│       └── cloud_haiku.dart                # Claude Haiku 4.5 (opt-in, E2E)
├── assets/
│   └── model_registry.json                 # supported models, min device reqs, hot-swap plan
├── test/                                   # mock runtime for tests
└── pubspec.yaml
```

**`pubspec.yaml`** dependencies (illustrative):
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_gemma: ^0.15.0
  flutter_llama: ^0.4.0
  http: ^1.2.0
  drift: ^2.34.0
  drift_flutter: ^0.2.0
  sqlite3_flutter_libs: ^0.5.0
  sqlite3mc: ^1.0.0
```

**The model registry** (`assets/model_registry.json`) is the single source of truth for which models run on which devices:

```json
{
  "models": [
    {
      "id": "apple-foundation-3b",
      "family": "apple-foundation",
      "params_b": 3.0,
      "min_ios": "18.0",
      "device_class": "high",
      "tier": "primary",
      "cost_to_us": 0,
      "language": "english-strong"
    },
    {
      "id": "android-aicore-gemini-nano",
      "family": "android-aicore",
      "params_b": 3.25,
      "min_android": "14",
      "device_class": "high",
      "tier": "primary",
      "cost_to_us": 0,
      "language": "english-strong"
    },
    {
      "id": "phi-4-mini-3.8b-4bit",
      "family": "litert",
      "params_b": 3.8,
      "min_ios": "17.0",
      "min_android": "11",
      "device_class": "mid",
      "tier": "fallback",
      "download_mb": 350,
      "resident_mb": 1500,
      "cost_to_us": 0,
      "language": "english-strong"
    },
    {
      "id": "gemma-3-4b-4bit",
      "family": "mediapipe",
      "params_b": 4.0,
      "min_ios": "17.0",
      "min_android": "11",
      "device_class": "mid",
      "tier": "fallback",
      "download_mb": 420,
      "resident_mb": 2500,
      "cost_to_us": 0,
      "language": "multilingual"
    },
    {
      "id": "function-gemma-270m",
      "family": "llama.cpp",
      "params_b": 0.27,
      "min_ios": "17.0",
      "min_android": "10",
      "device_class": "low",
      "tier": "router",
      "download_mb": 60,
      "resident_mb": 551,
      "cost_to_us": 0,
      "fine_tuned": true,
      "purpose": "tool-routing"
    },
    {
      "id": "claude-haiku-4.5",
      "family": "anthropic",
      "tier": "cloud",
      "cost_to_us_per_1m_input": 1.00,
      "cost_to_us_per_1m_output": 5.00,
      "zero_retention": true,
      "e2e_encrypted": true
    }
  ]
}
```

The orchestrator reads this at runtime and picks the best model for the current device. When Apple or Google ships a new on-device model, we ship a PR that adds it to the registry. The `flutter_gemma` package handles the runtime swap. No app update required.

---

## 8. The data layer (the encrypted notebook)

`packages/data_layer/` owns the encrypted store. The master key is generated on first install using `Random.secure()` (sourced from `/dev/urandom` on iOS/Android and the Web Crypto API on web), stored via `flutter_secure_storage` in the OS keystore (Keychain on iOS, StrongBox on Android, WebCrypto non-extractable on web), and never leaves the device.

```
packages/data_layer/
├── lib/
│   ├── data_layer.dart
│   └── src/
│       ├── types.dart                      # Notebook, Source, Page, Thread, Goal, CheckIn, Persona
│       ├── notebook.dart                   # CRUD + version history
│       ├── source.dart                     # source import, parse, embed
│       ├── source_graph.dart               # chunk + citation graph
│       ├── page.dart                       # user-or-AI-suggested grouping
│       ├── transaction.dart                # parsed line item
│       ├── thread.dart                     # chat thread with citations
│       ├── goal.dart                       # structured goal intent
│       ├── framework.dart                  # curated framework library
│       ├── checkin.dart                    # check-in card schema + state
│       ├── persona.dart                    # Calm / Direct / Playful
│       ├── embedding.dart                  # bge-small wrapper, on-device
│       ├── hnsw.dart                       # vector index
│       ├── database.dart                   # Drift schema + SQLCipher connection
│       ├── encryption.dart                 # AES-256-GCM, HKDF, envelope
│       ├── sync.dart                       # E2E envelope sync
│       ├── audit_log.dart                  # local-only audit log
│       ├── consent.dart                    # consent ledger
│       └── dsr.dart                        # GDPR / CCPA right-to-erasure
├── test/                                   # 50+ tests for encryption + sync + retrieval
└── pubspec.yaml
```

**The schema** is defined in Dart via Drift's table DSL and compiled to SQLite at build time via `dart run build_runner build`. Schema migrations are versioned in the same file as the schema. Every read and write goes through the encrypted SQLCipher store. The audit log is append-only and signed.

**The encryption setup** in `database.dart`:
```dart
LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'pocketledger.db'));
    
    // 256-bit key from secure random, stored in OS keystore
    final keyBytes = await _loadOrCreateMasterKey();
    final hexKey = keyBytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    
    return NativeDatabase.createInBackground(
      file,
      setup: (rawDb) {
        rawDb.execute("PRAGMA key = \"x'$hexKey'\"");
        rawDb.execute('PRAGMA cipher_page_size = 4096');
        rawDb.execute('PRAGMA kdf_iter = 256000');
      },
    );
  });
}
```

---

## 9. The CI secrets model

**`/.github/SECURITY.md`** documents every secret the repo needs. All secrets live in GitHub Actions Secrets, scoped per environment.

| Secret | Used by | Rotation | Scope |
|---|---|---|---|
| `MATCH_PASSWORD` | Fastlane match (iOS certs) | Annual | iOS environment |
| `ASC_API_KEY` | App Store Connect API | Annual | iOS environment |
| `RELEASE_KEYSTORE_BASE64` | Android signing keystore | Annual | Android environment |
| `RELEASE_KEYSTORE_PASSWORD` | Android signing keystore | Annual | Android environment |
| `RELEASE_KEYSTORE_ALIAS` | Android signing keystore | Annual | Android environment |
| `PLAY_SERVICE_ACCOUNT_JSON` | Play Console uploads | Annual | Android environment |
| `VERCEL_TOKEN` | Web deploy | Annual | Vercel environment |
| `FLY_API_TOKEN` | Backend deploy | Annual | Backend environment |
| `ANTHROPIC_API_KEY` | Cloud LLM (E2E), redteam suite | Quarterly | Production + CI |
| `PLAID_CLIENT_ID` | Plaid sandbox (Pro tier opt-in) | Annual | Production + CI |
| `PLAID_SECRET` | Plaid sandbox | Annual | Production + CI |
| `SLACK_WEBHOOK_REDTEAM` | Slack alerts on redteam failure | Annual | CI |
| `CODECOV_TOKEN` | Coverage reports | Annual | CI |
| `SENTRY_DSN` | Crash reports (opt-in) | Annual | Production |
| `TURBO_TOKEN` | Turborepo remote cache (we use the same caching for Melos builds) | Annual | CI |

**Pre-commit secret scanning** via `gitleaks` and `trufflehog` blocks any secret from being committed.

**The signing setup** for iOS uses **Fastlane match** in readonly mode with certificates stored in a separate private repo (`pocketledger/certificates`, single-team access, two-person approval on cert changes). For Android, the keystore is base64-encoded into the secret and decoded in the workflow.

---

## 10. The contributor + community model

**`LICENSE`**: **AGPL-3.0** — deliberate. AGPL is the right license for a privacy-first consumer app: any fork that runs as a network service must publish its source. This protects the privacy posture from being silently compromised by a fork. It also discourages direct copying of the closed-source competitor model.

**`CONTRIBUTING.md`**: developer setup, conventional commits, the PR gate, the test requirements, the privacy audit requirement, the CODEOWNERS map, the on-call rotation for triage.

**`CODE_OF_CONDUCT.md`**: Contributor Covenant v2.1.

**The on-call rotation** for triage is weekly, two engineers per week, escalates after 4 hours. Triage labels: `bug`, `feature-request`, `security`, `privacy`, `docs`, `good-first-issue`, `help-wanted`, `redteam`.

**Security disclosures** go to `security@pocketledger.app` (PGP key in `SECURITY.md`). We commit to a 90-day disclosure window for any reported vulnerability.

**The release cadence** is monthly minor (`v1.x.0`) and weekly patch (`v1.x.y`). The changelog is generated from conventional commits by `melos run version`. The GitHub Release is auto-created by `release.yml` with the build artifacts attached.

---

## 11. The on-call + observability stack

**Three signals we watch** (the 12 weekly metrics from the financial model):

1. **On-device telemetry** (opt-in, anonymized, aggregated) — event counts per category, not per user. Backend in `apps/backend`, transport in `packages/analytics`. Sinks: Mixpanel or PostHog (privacy-friendly).
2. **Crash reports** (opt-in, anonymized) — Sentry (`sentry_flutter`), DSN in the secrets table. Source maps uploaded automatically in the build workflow.
3. **Cloud LLM cost** (Pro opt-in only) — the backend records per-call token usage. Daily dashboard.

**Three things we *don't* watch** (anti-metrics):
- Per-user spend.
- Per-user chat history (we can't see it anyway).
- Per-user retention curves broken down by source-of-truth data (only by behavior, never by content).

---

## 12. The 12-month repo roadmap

| Month | Repo milestone | What ships in CI |
|---|---|---|
| 1 | Bootstrap: FVM + Melos + Flutter 3.32 + analysis_options + dart_test + lints | `ci.yml` (format, analyze, test) |
| 2 | `packages/sdk` + `packages/data_layer` + `packages/math_engine` | SDK unit tests, math-audit, privacy-audit |
| 3 | `packages/ai_runtime` impls for Apple FM + Android AICore + bundled Gemma + bundled Phi + FunctionGemma | AI runtime tests, model-registry.json validated |
| 4 | `apps/ios` Flutter app with full chat + math + voice + photo flow | iOS Fastlane build to TestFlight via self-hosted |
| 5 | `apps/android` same Flutter app, Android overrides | Android Fastlane build to Play Internal |
| 6 | v1.0 release. Self-hosted macOS runner live. Redteam + math-audit + privacy-audit on every PR. | Full pipeline. |
| 7 | `apps/web` Flutter web companion (read-only) | Vercel deploy on push to main |
| 8 | `apps/backend` minimal `dart_frog` on Fly.io (auth, billing, telemetry) | Fly.io deploy on push |
| 9 | Couples mode (v1.5) — E2E sync, paired-device flow | All four surfaces |
| 10 | Accountant export + Plaid opt-in + Family tier | Same |
| 11 | Public notebooks (read-only) — opt-in fork-and-publish | Same |
| 12 | v1.5 release | Same |

**The 18-month window** to own the category is the deadline. Every month of slip is a month the XDA signal cools.

---

## 13. The repository URL (when we spin it up)

If/when you greenlight, the repo lives at:

**`github.com/pocketledger/pocketledger`** (or `github.com/<your-org>/pocketledger`)

**The supporting repos** that should be separate:

- `github.com/pocketledger/pocketledger-certificates` — private, Fastlane match cert store.
- `github.com/pocketledger/pocketledger-design` — Figma exports, design tokens, marketing site.
- `github.com/pocketledger/pocketledger-status` — public status page.
- `github.com/pocketledger/pocketledger-privacy` — public-facing privacy whitepaper source.

**The current state of the repo** is empty. The strategy, the architecture, the deck, the financial model, and the GitHub architecture spec are all in `/workspace/ledgerlens/docs/` and `/workspace/ledgerlens/deck/`. Pushing them to GitHub is one `git init` + `git remote add` + `git push` away.

---

## 14. The 10 decisions this spec makes

1. **Monorepo, not polyrepo.** Dart pub workspaces + Melos. Single source of truth.
2. **Flutter 3.32+ with Dart 3, not React Native + Expo.** One Dart codebase, one type system, one test runner across iOS / Android / web. No codegen, no Swift/Kotlin port, no `TurboModule` ceremony.
3. **FVM + Melos, not pnpm + Turborepo.** Dart-native toolchain. `dart pub workspaces` is the official Dart 3.5+ feature; Melos provides the same task-graph and caching as Turborepo.
4. **`flutter_gemma: ^0.15.0` (May 2026) as the on-device AI package.** The canonical package in the Flutter ecosystem. Wraps Gemma 4/3n/3, Phi-4, Qwen, DeepSeek R1, SmolLM, FastVLM, FunctionGemma, with multimodal + function calling + thinking mode + GPU acceleration.
5. **Drift + SQLCipher for the encrypted store.** Type-safe SQL, AES-256 encryption, page-level. Master key in OS keystore via `flutter_secure_storage`.
6. **Riverpod 3 for state management.** Idiomatic Flutter, provider-based, type-safe. Works across iOS / Android / web with the same patterns.
7. **AGPL-3.0**, not MIT. Privacy is structural — the license enforces it.
8. **Trunk-based development** with conventional commits. PR gate: format + analyze + test + math-audit + privacy-audit + 2 approvals.
9. **Self-hosted macOS runner** for iOS. M2 Pro Mac mini. Pays back in 3 months.
10. **The math engine is a separate package** from the AI runtime. The redteam + math-audit + privacy-audit are the three structural quality gates. Every PR. Privacy audit blocks any outbound network call outside the allowlist.

If any of these 10 decisions is wrong for the way you want to build, tell me which one and why, and I'll redraw the spec. Otherwise, give me the green light and the org name and I'll bootstrap the repo, push the docs, scaffold the monorepo, and have `fvm flutter run` running the iOS prototype by end of week.

No async operations pending. Ready for the green light.
