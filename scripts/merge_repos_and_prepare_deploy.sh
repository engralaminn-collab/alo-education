#!/usr/bin/env bash
set -euo pipefail

PRIMARY_REPO_URL="${1:-https://github.com/engralaminn-collab/alo-education.git}"
SECONDARY_REPO_URL="${2:-https://github.com/engralaminn-collab/alo-education-last.git}"
WORKDIR="${3:-alo-education-merged}"

if [ -d "$WORKDIR" ]; then
  echo "[error] Workdir '$WORKDIR' already exists. Remove it or pass a different folder." >&2
  exit 1
fi

echo "[1/6] Cloning primary repo: $PRIMARY_REPO_URL"
git clone "$PRIMARY_REPO_URL" "$WORKDIR"
cd "$WORKDIR"

echo "[2/6] Checking out main"
git checkout main
git pull origin main

echo "[3/6] Adding secondary remote"
git remote add secondary "$SECONDARY_REPO_URL"
git fetch secondary

echo "[4/6] Merging secondary/main into main"
if ! git merge secondary/main --allow-unrelated-histories -m "Merge alo-education-last into main"; then
  echo "[warn] Merge conflicts detected. Resolve conflicts, then run:"
  echo "       git add ."
  echo "       git commit"
  exit 2
fi

echo "[5/6] Pushing merged main to origin"
git push origin main

echo "[6/6] Ready to deploy on DigitalOcean"
echo "Run inside repo root: doctl apps update <APP_ID> --spec .do/app.yaml"
echo "Or first-time deploy: doctl apps create --spec .do/app.yaml"
