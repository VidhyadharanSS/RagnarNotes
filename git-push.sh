#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# git-push.sh — Ragnar Notes automated Git push script
#
# Usage:
#   chmod +x git-push.sh
#   ./git-push.sh "feat: add new feature"   # custom message
#   ./git-push.sh                            # auto-generates message
#
# ⚠️  SECURITY: Never hardcode tokens in this file.
#     Set your token as an environment variable instead:
#
#     export RAGNAR_GH_TOKEN="ghp_your_token_here"
#
#     Add that export to your ~/.zshrc or ~/.bashrc so it persists.
#     This script reads it from the environment — it is never stored
#     in the repository or any tracked file.
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ───────────────────────────────────────────────────────────────────
REPO_URL="https://github.com/VidhyadharanSS/RagnarNotes"
BRANCH="${RAGNAR_BRANCH:-main}"

# ── Colour output ─────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

info()    { echo -e "${BLUE}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✓${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $*"; }
error()   { echo -e "${RED}✗${NC}  $*"; exit 1; }

# ── Banner ────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}⚡ Ragnar Notes — Git Push Script${NC}"
echo -e "────────────────────────────────────\n"

# ── Verify token ──────────────────────────────────────────────────────────────
if [[ -z "${RAGNAR_GH_TOKEN:-}" ]]; then
  error "RAGNAR_GH_TOKEN is not set.\n\n  Run:  export RAGNAR_GH_TOKEN=\"ghp_your_token_here\"\n  Then: ./git-push.sh"
fi

# ── Verify we're in a git repo ────────────────────────────────────────────────
if ! git rev-parse --git-dir &>/dev/null; then
  error "Not a git repository. Run: git init"
fi

# ── Commit message ────────────────────────────────────────────────────────────
if [[ $# -ge 1 && -n "$1" ]]; then
  COMMIT_MSG="$1"
else
  TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
  BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
  COMMIT_MSG="chore: auto-commit on ${BRANCH_NAME} at ${TIMESTAMP}"
fi

# ── Check for changes ─────────────────────────────────────────────────────────
if git diff --quiet && git diff --staged --quiet; then
  UNTRACKED=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
  if [[ "$UNTRACKED" -eq 0 ]]; then
    warn "Nothing to commit — working tree is clean."
    exit 0
  fi
fi

# ── Stage, commit, push ───────────────────────────────────────────────────────
info "Staging all changes…"
git add -A

info "Committing: \"${COMMIT_MSG}\""
git commit -m "${COMMIT_MSG}" || {
  warn "Nothing new to commit (already committed)."
}

# Set remote URL with token (token is never written to any file)
AUTHED_URL="https://${RAGNAR_GH_TOKEN}@github.com/VidhyadharanSS/RagnarNotes.git"

info "Pushing to ${REPO_URL} (branch: ${BRANCH})…"
git push "${AUTHED_URL}" "HEAD:${BRANCH}" --follow-tags

echo -e "\n${GREEN}${BOLD}✓ Successfully pushed to ${REPO_URL}${NC}\n"
