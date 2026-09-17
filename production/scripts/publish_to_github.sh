#!/usr/bin/env bash
# publish_to_github.sh - One-shot script to push the entire PocketLedger repo
# to a new public GitHub org using the GitHub API + git CLI.
#
# Prerequisites:
#   - GITHUB_PAT env var with `repo` + `admin:org` scopes
#   - git CLI installed and configured with your name + email
#   - gh CLI optional (we use REST directly)
#
# Usage:
#   chmod +x scripts/publish_to_github.sh
#   ORG=pocketledger REPO=pocketledger ./scripts/publish_to_github.sh

set -euo pipefail

ORG="${ORG:-albertlaudia}"
REPO="${REPO:-mx.solverwatch.pocketledger}"
PRIVATE="${PRIVATE:-false}"

if [ -z "${GITHUB_PAT:-}" ]; then
  echo "ERROR: GITHUB_PAT env var not set."
  echo "Generate a personal access token at https://github.com/settings/tokens"
  echo "Required scopes: repo (full), admin:org (read+write), workflow"
  exit 1
fi

API="https://api.github.com"
AUTH="Authorization: token $GITHUB_PAT"
ACCEPT="Accept: application/vnd.github+json"

echo "=== PocketLedger GitHub publisher ==="
echo "Org:    $ORG"
echo "Repo:   $REPO"
echo "Private: $PRIVATE"
echo ""

# 1. Create the org if it doesn't exist (best effort, may already exist)
echo "--- Step 1/5: Ensure org exists"
org_check=$(curl -sS -H "$AUTH" -H "$ACCEPT" "$API/orgs/$ORG" -o /dev/null -w "%{http_code}")
if [ "$org_check" = "200" ]; then
  echo "Org $ORG already exists"
elif [ "$org_check" = "404" ]; then
  echo "Org $ORG does not exist. Creating..."
  curl -sS -H "$AUTH" -H "$ACCEPT" -X POST "$API/orgs" \
    -d "{\"login\":\"$ORG\",\"display_name\":\"PocketLedger\"}" \
    | head -c 200
  echo ""
  echo "Created. You may need to verify the org email before it becomes active."
else
  echo "Unexpected response checking org: $org_check"
  exit 1
fi

# 2. Create the repo (idempotent)
echo "--- Step 2/5: Create repo"
repo_check=$(curl -sS -H "$AUTH" -H "$ACCEPT" "$API/repos/$ORG/$REPO" -o /dev/null -w "%{http_code}")
if [ "$repo_check" = "200" ]; then
  echo "Repo $ORG/$REPO already exists"
elif [ "$repo_check" = "404" ]; then
  echo "Creating repo $ORG/$REPO..."
  curl -sS -H "$AUTH" -H "$ACCEPT" -X POST "$API/orgs/$ORG/repos" \
    -d "{\"name\":\"$REPO\",\"description\":\"PocketLedger — private, on-device AI finance notebook for your phone.\",\"private\":$PRIVATE,\"has_issues\":true,\"has_projects\":true,\"has_wiki\":false,\"auto_init\":false,\"license_template\":\"AGPL-3.0\"}" \
    | head -c 200
  echo ""
else
  echo "Unexpected response creating repo: $repo_check"
  exit 1
fi

# 3. Initialize local git and commit
echo "--- Step 3/5: Initialize local git"
if [ ! -d .git ]; then
  git init
  git checkout -b main 2>/dev/null || git branch -m main
  git add -A
  git commit -m "feat: initial commit — strategy docs, architecture, GitHub spec, scaffold, scripts, deck

- 6 strategy + architecture + production roadmap docs (01-07)
- 24-slide pitch deck (PPTX + PDF)
- Monorepo scaffold: FVM (.fvmrc), Melos (melos.yaml), pub workspaces (pubspec.yaml)
- 16 packages + 4 apps stubbed
- Privacy audit composite script (privacy_audit.sh)
- Bootstrap script (bootstrap.sh)
- LICENSE (AGPL-3.0), README, CONTRIBUTING, SECURITY, CODEOWNERS

Status: pre-launch. Epic 1 (repo + CI + scaffolding) in progress."
  echo "Initial commit created."
else
  echo "Git repo already initialized locally."
fi

# 4. Push to GitHub
echo "--- Step 4/5: Push to GitHub"
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$ORG/$REPO.git"
git push -u origin main --force

echo ""
echo "--- Step 5/5: Set default branch protection"
curl -sS -H "$AUTH" -H "$ACCEPT" -X POST "$API/repos/$ORG/$REPO/branches/main/protection" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["ci/analyze", "ci/test", "ci/math-audit", "ci/privacy-audit"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "dismissal_restrictions": false,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_approving_review_count": 2,
      "require_last_push_approval": false
    },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false,
    "block_creations": false,
    "required_conversation_resolution": true,
    "lock_branch": false,
    "allow_fork_syncing": false
  }' | head -c 200

echo ""
echo ""
echo "=== DONE ==="
echo ""
echo "Repo: https://github.com/$ORG/$REPO"
echo ""
echo "Next:"
echo "  1. Open the repo and verify the 6 docs + deck + scaffold are visible."
echo "  2. Create the GitHub Actions workflows (Epic 1 Week 2)."
echo "  3. Set up the self-hosted macOS runner (Epic 1 Week 3)."
echo "  4. Begin Epic 2 (math engine) and Epic 4 (on-device AI runtime)."
