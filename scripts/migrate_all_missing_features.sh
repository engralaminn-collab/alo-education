#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/migrate_all_missing_features.sh \
#     https://github.com/engralaminn-collab/alo-education.git \
#     https://github.com/engralaminn-collab/alo-education-last.git

PRIMARY_REPO_URL="${1:-https://github.com/engralaminn-collab/alo-education.git}"
SECONDARY_REPO_URL="${2:-https://github.com/engralaminn-collab/alo-education-last.git}"
WORKDIR="${3:-alo-education-full-migration}"
SECONDARY_BRANCH="${4:-main}"
FULL_SYNC="${5:-false}"  # true = mirror secondary (dangerous), false = additive/update

if [ -d "$WORKDIR" ]; then
  echo "[error] Workdir '$WORKDIR' already exists. Remove it or choose another." >&2
  exit 1
fi

echo "[1/10] Cloning primary repo"
git clone "$PRIMARY_REPO_URL" "$WORKDIR"
cd "$WORKDIR"
git checkout main
git pull origin main

echo "[2/10] Adding and fetching secondary repo"
git remote add secondary "$SECONDARY_REPO_URL"
git fetch secondary "$SECONDARY_BRANCH"

echo "[3/10] Exporting secondary tree"
mkdir -p ../_secondary_export
SECONDARY_SHA="$(git rev-parse secondary/${SECONDARY_BRANCH})"
git --work-tree ../_secondary_export checkout "$SECONDARY_SHA" -- .

# Preserve production identity/branding of primary
PROTECT_PATHS=(
  ".git"
  ".github"
  ".do"
  "public"
  "src/index.css"
  "src/App.css"
  "src/pages/Home.jsx"
  "src/pages/Landing.jsx"
  "src/components/layout"
  "src/components/ui"
  "tailwind.config.*"
  "postcss.config.*"
  "src/styles/globals.css"
  "styles/globals.css"
  "app/globals.css"
  "src/theme"
  "src/tokens"
  "src/styles/theme.*"
  "src/lib/theme.*"
  "src/constants/colors.*"
  "src/styles/variables.css"
  "README.md"
  "docs"
)

echo "[4/10] Syncing missing/updated feature code from secondary"
echo "        FULL_SYNC=$FULL_SYNC"
RSYNC_EXCLUDES=()
for p in "${PROTECT_PATHS[@]}"; do
  RSYNC_EXCLUDES+=(--exclude "$p")
done

# Copy code and config while preserving protected paths.
if [ "$FULL_SYNC" = "true" ]; then
  rsync -a --delete "${RSYNC_EXCLUDES[@]}" ../_secondary_export/ ./
else
  rsync -a "${RSYNC_EXCLUDES[@]}" ../_secondary_export/ ./
fi

echo "[5/10] Merging dependency metadata (package.json)"
python - <<'PY'
import json
from pathlib import Path

primary = Path('package.json')
secondary = Path('../_secondary_export/package.json')
if not (primary.exists() and secondary.exists()):
    raise SystemExit(0)

p = json.loads(primary.read_text())
s = json.loads(secondary.read_text())

for key in ('dependencies', 'devDependencies'):
    p.setdefault(key, {})
    for dep, ver in s.get(key, {}).items():
        if dep not in p[key]:
            p[key][dep] = ver

# Keep primary scripts; add only missing script names from secondary
p.setdefault('scripts', {})
for name, cmd in s.get('scripts', {}).items():
    if name not in p['scripts']:
        p['scripts'][name] = cmd

primary.write_text(json.dumps(p, indent=2) + '\n')
PY

echo "[6/10] Attempting lockfile refresh"
if npm install --package-lock-only >/dev/null 2>&1; then
  echo "[ok] package-lock.json updated"
else
  echo "[warn] package-lock refresh skipped (likely network/private-registry issue)"
fi

echo "[7/10] Running build validation"
if npm run build >/dev/null 2>&1; then
  echo "[ok] build passed"
else
  echo "[warn] build failed after merge; resolve conflicts manually"
fi

echo "[8/10] Cleaning export temp"
rm -rf ../_secondary_export

echo "[9/10] Creating migration commit"
git add .
if git diff --cached --quiet; then
  echo "[info] No changes detected from secondary migration."
else
  git commit -m "Migrate missing features/modules from alo-education-last"
fi

echo "[10/10] Push + deploy"
git push origin main
echo "Deploy command: doctl apps update <APP_ID> --spec .do/app.yaml"
