# Contributing to PocketLedger

Thanks for being here. PocketLedger is privacy-critical software that handles
real financial data. Every PR matters.

## The PR gate (7 checks, all must pass)

1. **`melos run format`** — formatting.
2. **`melos run analyze`** — 0 warnings (`very_good_analysis` + strict-casts).
3. **`melos run test`** — all unit tests pass.
4. **`melos run math-audit`** — 200 deterministic math cases (if you touched
   `packages/math_engine/`).
5. **`melos run redteam`** — 100 adversarial financial questions (if you
   touched `packages/ai_runtime/` or `packages/data_layer/`).
6. **`melos run privacy-audit`** — no outbound network calls outside the
   `api.anthropic.com` allowlist (if you touched `packages/ai_runtime/` or
   `packages/data_layer/`).
7. **2 approvals from CODEOWNERS** for the touched area.

## Commit format (Conventional Commits enforced)

```
feat: add FunctionGemma tool router
fix(math_engine): handle empty transaction list
chore: bump flutter to 3.32.1
docs: update privacy whitepaper
```

PR title is squashed to the conventional commit format. Body should reference
the ticket (`PL-123`).

## Local setup

```bash
brew tap leoafarias/fvm && brew install fvm
dart pub global activate melos
fvm use              # reads .fvmrc, installs Flutter 3.32.0
melos bootstrap      # installs all 16 packages, links local packages
melos run analyze    # should pass with 0 warnings
melos run test       # should pass
```

## Code style

- Strict types. No `dynamic` unless wrapped in a runtime check with a comment
  explaining why.
- Every public function in `packages/*` has a doc comment.
- Every Riverpod provider has a name and a family generic.
- Every Drift table has a migration path documented in the schema.
- Every on-device model call has a fallback.
- Every network call has a timeout (default 30s) and a retry policy.
- No `print()`. Use `package:logging` with structured fields.
- No secrets in code. Pre-commit hook (`gitleaks` + `trufflehog`) blocks.

## Testing

- **Unit tests** live next to the code in `test/` directories.
- **Math audit** lives in `packages/math_engine/test/math_audit/`. Add new cases
  when you add a tool or change behavior.
- **Redteam** lives in `packages/ai_runtime/test/redteam/`. Add new adversarial
  questions when you ship a new orchestrator feature.
- **Coverage**: 80% minimum, 90% for `math_engine` and `data_layer`.

## Areas and CODEOWNERS

| Area | Owners |
|---|---|
| `apps/ios/`, iOS-specific Flutter | @pocketledger/ios-team |
| `apps/android/`, Android-specific Flutter | @pocketledger/android-team |
| `apps/web/`, Web-specific Flutter | @pocketledger/web-team |
| `apps/backend/`, Dart server | @pocketledger/backend-team |
| `packages/ai_runtime/` | @pocketledger/ai-team |
| `packages/math_engine/` | @pocketledger/ai-team |
| `packages/data_layer/` | @pocketledger/data-team |
| `packages/ui/` | @pocketledger/design-team |
| `packages/personas/`, `packages/frameworks/` | @pocketledger/content-team |
| `packages/privacy/` | @pocketledger/security-team |
| `infra/`, `.github/` | @pocketledger/platform-team |
| `docs/`, `deck/` | @pocketledger/leadership |

## Triaging

The on-call rotation is weekly. Triage labels:

- `bug` — something is broken.
- `feature-request` — something the user wants.
- `security` — see SECURITY.md.
- `privacy` — touches the data layer, AI runtime, or audit log.
- `docs` — markdown only.
- `good-first-issue` — well-scoped, clear acceptance criteria, no architecture decisions.
- `help-wanted` — we need a contributor for this.
- `redteam` — new adversarial question.

## Releasing

- Monthly minor (`v1.x.0`), weekly patch (`v1.x.y`).
- Triggered by a `v*` tag pushed to main.
- `melos version` bumps versions across all 16 packages.
- GitHub Release auto-generated from conventional commits.
- iOS TestFlight + Android Play Internal on every tag; App Store + Play
  Production on every monthly tag.

## Code of conduct

[Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
Be kind. We're building the privacy-first finance app the post-Mint generation
is asking for.
