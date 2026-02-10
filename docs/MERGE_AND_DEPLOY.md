# Merge two repos into main and redeploy (DigitalOcean)

This guide merges code from:
- Primary: `https://github.com/engralaminn-collab/alo-education`
- Secondary: `https://github.com/engralaminn-collab/alo-education-last.git`

Then redeploys using `.do/app.yaml`.

## 1) Clone primary repo and switch to main

```bash
git clone https://github.com/engralaminn-collab/alo-education.git
cd alo-education
git checkout main
git pull origin main
```

## 2) Add secondary repo and fetch

```bash
git remote add secondary https://github.com/engralaminn-collab/alo-education-last.git
git fetch secondary
```

## 3) Merge secondary main into primary main

Use this if histories are unrelated:

```bash
git merge secondary/main --allow-unrelated-histories
```

If merge conflicts appear:

```bash
git status
# edit conflicted files
# keep the final desired content
git add .
git commit -m "Merge alo-education-last into main"
```

## 4) Push merged main

```bash
git push origin main
```

## 5) Redeploy DigitalOcean app

From the same repo (where `.do/app.yaml` exists):

```bash
doctl apps update <APP_ID> --spec .do/app.yaml
```

If app is not created yet:

```bash
doctl apps create --spec .do/app.yaml
```

## 6) Verify web + CRM

- `www.aloeducation.co.uk` should open web pages.
- `crm.aloeducation.co.uk` should open CRM routes.
- Ensure CRM DNS points to the same DigitalOcean app hostname if both are hosted on DO.


## Single-command helper script (this repo)

You can use the helper script added in this repo:

```bash
bash scripts/merge_repos_and_prepare_deploy.sh   https://github.com/engralaminn-collab/alo-education.git   https://github.com/engralaminn-collab/alo-education-last.git
```

Then run deploy:

```bash
doctl apps update <APP_ID> --spec .do/app.yaml
```


## Keep `alo-education` branding + add only extra functions

If you want to keep the existing `alo-education` look/colors/layout and only bring new features from `alo-education-last`, use:

```bash
bash scripts/merge_functions_keep_branding.sh   https://github.com/engralaminn-collab/alo-education.git   https://github.com/engralaminn-collab/alo-education-last.git
```

This script:
- merges `secondary/main` into primary `main`
- restores key branding files from primary
- pushes merged `main`
- prints the DigitalOcean redeploy command


## Full migration: integrate all missing features/modules/components

To migrate all missing features from `alo-education-last` into `alo-education` (while keeping core production branding), run:

```bash
bash scripts/migrate_all_missing_features.sh   https://github.com/engralaminn-collab/alo-education.git   https://github.com/engralaminn-collab/alo-education-last.git
```

What it does:
- syncs missing/updated code from secondary repo
- keeps protected production branding/layout paths from primary
- merges missing dependencies/scripts in `package.json`
- attempts lockfile refresh + build validation
- commits, pushes `main`, and prints DigitalOcean deploy command

Optional 5th parameter for sync mode:
- `false` (default): additive/update sync (safer for production)
- `true`: full mirror of secondary (uses `--delete`, can remove primary-only files)

Example full mirror mode:
```bash
bash scripts/migrate_all_missing_features.sh \
  https://github.com/engralaminn-collab/alo-education.git \
  https://github.com/engralaminn-collab/alo-education-last.git \
  alo-education-full-migration \
  main \
  true
```
