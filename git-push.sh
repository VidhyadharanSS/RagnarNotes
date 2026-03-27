#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# git-push.sh — One-command push for Ragnar Notes
#
# Usage:
#   ./git-push.sh "commit message"
#   ./git-push.sh                     # uses auto-generated message
#
# The GitHub token is read from RAGNAR_GH_TOKEN env var.
# Set it in your ~/.zshrc or ~/.bashrc:
#   export RAGNAR_GH_TOKEN="your_pat_here"
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
REPO_URL="https://github.com/VidhyadharanSS/RagnarNotes.git"
BRANCH="main"

# ── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RESET='\033[0m'

info()    { echo -e "${CYAN}ℹ  $*${RESET}"; }
success() { echo -e "${GREEN}✅ $*${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $*${RESET}"; }
error()   { echo -e "${RED}❌ $*${RESET}"; exit 1; }

# ── Validate token ──────────────────────────────────────────────────────────
TOKEN="${RAGNAR_GH_TOKEN:-}"
if [[ -z "$TOKEN" ]]; then
  # Fallback: read from .env if present (never commit .env!)
  if [[ -f ".env" ]]; then
    TOKEN=$(grep -E '^RAGNAR_GH_TOKEN=' .env | cut -d= -f2-)
  fi
fi

if [[ -z "$TOKEN" ]]; then
  error "RAGNAR_GH_TOKEN is not set.\nRun: export RAGNAR_GH_TOKEN='your_pat_here'"
fi

# ── Commit message ──────────────────────────────────────────────────────────
if [[ $# -ge 1 && -n "$1" ]]; then
  MSG="$1"
else
  STAGE="Stage 2"
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  MSG="chore: auto-push ${STAGE} — ${TIMESTAMP}"
fi

# ── Git operations ──────────────────────────────────────────────────────────
info "Staging all changes…"
git add -A

# Check if there's anything to commit
if git diff --cached --quiet; then
  warn "Nothing to commit — working tree clean."
  info "Pushing existing commits…"
else
  info "Committing: \"${MSG}\""
  git commit -m "$MSG"
  success "Committed."
fi

# Update remote URL with token (in-memory only, not stored)
AUTHED_URL="https://${TOKEN}@${REPO_URL#https://}"
git remote set-url origin "$AUTHED_URL"

info "Pushing to ${BRANCH}…"
git push origin "$BRANCH"

# Reset remote URL to token-free version
git remote set-url origin "$REPO_URL"

success "Pushed to GitHub → ${REPO_URL}"
echo -e "${CYAN}🔗 https://github.com/VidhyadharanSS/RagnarNotes${RESET}"
