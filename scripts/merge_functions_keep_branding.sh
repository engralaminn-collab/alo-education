#!/usr/bin/env bash
set -euo pipefail

PRIMARY_REPO_URL="${1:-https://github.com/engralaminn-collab/alo-education.git}"
SECONDARY_REPO_URL="${2:-https://github.com/engralaminn-collab/alo-education-last.git}"
WORKDIR="${3:-alo-education-merge-brand-safe}"

if [ -d "$WORKDIR" ]; then
  echo "[error] Workdir '$WORKDIR' already exists. Remove it or pass a different one." >&2
  exit 1
fi

# Paths to preserve from primary repo (branding/layout identity)
BRANDING_PATHS=(
  "src/index.css"
  "src/App.css"
  "public"
  "src/components/layout"
  "src/components/ui"
  "src/pages/Home.jsx"
  "src/pages/Landing.jsx"
  "tailwind.config.js"
)

echo "[1/8] Clone primary repo"
git clone "$PRIMARY_REPO_URL" "$WORKDIR"
cd "$WORKDIR"

echo "[2/8] Checkout main"
git checkout main
git pull origin main

echo "[3/8] Save primary branding snapshot"
mkdir -p .brand-snapshot
for p in "${BRANDING_PATHS[@]}"; do
  if [ -e "$p" ]; then
    mkdir -p ".brand-snapshot/$(dirname "$p")"
    cp -R "$p" ".brand-snapshot/$p"
  fi
done

echo "[4/8] Add/fetch secondary remote"
git remote add secondary "$SECONDARY_REPO_URL"
git fetch secondary

echo "[5/8] Merge secondary/main"
if ! git merge secondary/main --allow-unrelated-histories -m "Merge extra functions from alo-education-last"; then
  echo "[warn] Merge conflicts detected. Resolve conflicts first, then continue manually."
  exit 2
fi

echo "[6/8] Restore primary branding paths"
for p in "${BRANDING_PATHS[@]}"; do
  if [ -e ".brand-snapshot/$p" ]; then
    rm -rf "$p"
    mkdir -p "$(dirname "$p")"
    cp -R ".brand-snapshot/$p" "$p"
  fi
done

echo "[7/8] Commit brand-safe merge"
git add .
if git diff --cached --quiet; then
  echo "[info] No additional branding restores were needed."
else
  git commit -m "Keep alo-education branding while adding functions from alo-education-last"
fi

echo "[8/8] Push and deploy"
git push origin main
echo "Run now: doctl apps update <APP_ID> --spec .do/app.yaml"
