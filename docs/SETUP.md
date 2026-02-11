# Full setup guide (No Base44)

This guide documents how to run the ALO Education app without any calls to `app.base44.com`, how to configure environment variables, and how to connect your domains.

---

## 1) Environment variables

Create a `.env` file from the example file in the repo:

```
cp .env.example .env
```

Set the following:

```
VITE_DISABLE_BASE44=true
VITE_API_BASE_URL=
VITE_AUTH_LOGIN_URL=
VITE_BASE44_BACKEND_URL=
VITE_BASE44_APP_ID=
VITE_BASE44_FUNCTIONS_VERSION=
```

**Why this matters:** setting `VITE_DISABLE_BASE44=true` forces the app to use your REST API and prevents any network calls to `app.base44.com`.

---

## 2) Build & run locally

```
npm install
npm run dev
```

The app will run at the local Vite URL (usually `http://localhost:5173`).

### Single command (local run)
If you want a single command to install and run:
```
npm install && npm run dev
```

### Full setup in one command (local)
If you already created `.env`, you can use this single command to install, build, and run a local preview:
```
npm install && npm run build && npm run preview
```

---

## 3) Build for production

```
npm run build
npm run preview
```

Your production build will be in `dist/`. Deploy that folder to your hosting provider.

### One-command deploy (Vercel)
If you want a single command to deploy the app to Vercel:
```
npx vercel --prod
```
This will build and deploy using your Vercel project settings.

### One-command deploy (DigitalOcean App Platform)
If you want a single command deploy on DigitalOcean App Platform, use `doctl` with an app spec:
```
doctl apps create --spec .do/app.yaml
```
Make sure `.do/app.yaml` contains your repo URL, build settings, and environment variables.

---

## 4) Run web + CRM with all functionality

The web site and CRM are the same Vite app with different routes:
- **Web pages**: `/`, `/Universities`, `/Courses`, etc.
- **CRM pages (admin)**: `/CRMDashboard`, `/CRMStudents`, `/CRMCounselors`, etc.

To keep **all pages working**, make sure your API supports the required endpoints (see section 6).

### Recommended production setup
1. **Deploy the same `dist/` build** to both domains:
   - `www.aloeducation.co.uk` for the public site.
   - `crm.aloeducation.co.uk` for the admin/CRM routes.
2. Set these variables in the environment for each deployment:
   ```
   VITE_DISABLE_BASE44=true
   VITE_API_BASE_URL=https://api.aloeducation.co.uk
   VITE_AUTH_LOGIN_URL=https://aloeducation.co.uk/login
   ```
3. Ensure your backend returns **users with a `role` field** so CRM routes can enforce `admin` access.
4. After deployment, log in and visit `/CRMDashboard` on the CRM domain.

---

## 5) Domain + DNS configuration (example)

Use your DNS provider (DigitalOcean, Cloudflare, etc.) to point your domains to the correct services. The following records are the **example values you shared**:

- `automation.aloeducation.co.uk` → `129.212.209.202` (A)
- `api.aloeducation.co.uk` → `129.212.209.202` (A)
- `www.aloeducation.co.uk` → `dolphin-app-3a9hl.ondigitalocean.app` (CNAME)
- `crm.aloeducation.co.uk` → `<your-digitalocean-app>.ondigitalocean.app` (CNAME)
- `aloeducation.co.uk` → `162.159.140.98`, `172.66.0.96` (A)
- `aloeducation.co.uk` → `2a06:98c1:58::60`, `2606:4700:7::60` (AAAA)

Make sure **each hostname points to the correct hosting platform**:

| Subdomain | Service | Notes |
|---|---|---|
| `www` | Web frontend | Vite app deployed to DigitalOcean App Platform |
| `crm` | CRM frontend | Vite app deployed to DigitalOcean App Platform |
| `api` | API backend | Server on `129.212.209.202` |
| `automation` | n8n / automation | Server on `129.212.209.202` |

---

## 6) Verify Base44 is fully disabled

Once deployed:

1. Open the site in a browser.
2. In DevTools → Network, confirm **no requests** go to `app.base44.com`.
3. The app should still load, but Base44 functionality is disabled.

---

## 7) Required API endpoints

When Base44 is disabled, the frontend expects your API to provide the following endpoints:

### Auth
- `GET /api/auth/me` → current user profile (`{ role, email, full_name }`)
- `POST /api/auth/logout`

### Entities
- `GET /api/{Entity}` → list and filter data
- `POST /api/{Entity}` → create
- `PUT /api/{Entity}/{id}` → update
- `DELETE /api/{Entity}/{id}` → delete

### AI + email integrations
- `POST /api/ai/invoke` → LLM requests
- `POST /api/email/send` → outbound email requests

---

## 8) Admin-grade security checklist

- ✅ Enforce HTTPS-only
- ✅ Use JWT/session cookies with short expiry
- ✅ Apply rate limiting and WAF (Cloudflare/DO Firewall)
- ✅ Restrict admin routes to authenticated users (CRM pages now require `admin` role)
- ✅ Log every admin action and AI request
- ✅ Encrypt sensitive data at rest and ensure backups

---

## 9) Optional: remove Base44 usage from specific pages

If you want to fully remove Base44 calls from CRM/Portal pages (not just disable them), provide a list of pages and the replacement API you want to use. We can update those pages to use your own endpoints instead.

---

# বাংলা গাইড (সংক্ষিপ্ত)

## এক কমান্ডে লোকাল রান
`.env` ফাইল সেট করার পর নিচের এক কমান্ডে লোকালি রান করতে পারেন:
```
npm install && npm run dev
```

## এক কমান্ডে ফুল সেটআপ (লোকাল প্রিভিউ)
যদি আপনি `.env` ঠিকমতো সেট করে থাকেন, তাহলে এক কমান্ডে বিল্ড + প্রিভিউ চালাতে পারেন:
```
npm install && npm run build && npm run preview
```

## এক কমান্ডে ডিপ্লয় (Vercel)
যদি আপনি Vercel ব্যবহার করেন, এক কমান্ডে ডিপ্লয় করতে পারেন:
```
npx vercel --prod
```

## এক কমান্ডে ডিপ্লয় (DigitalOcean App Platform)
যদি আপনি DigitalOcean App Platform ব্যবহার করেন, `doctl` দিয়ে এক কমান্ডে ডিপ্লয় করতে পারেন:
```
doctl apps create --spec .do/app.yaml
```

## কোথায় কী করবেন (সংক্ষেপে)
1. `.env.example` কপি করে `.env` বানান এবং ভ্যালু সেট করুন।
2. উপরের এক কমান্ড দিয়ে রান/প্রিভিউ চালু করুন।
3. প্রোডাকশনে `dist/` ফোল্ডার ডিপ্লয় করুন (একই বিল্ড `www` এবং `crm` দুই জায়গায়)।
4. `crm` ডোমেইনে `/CRMDashboard` ভিজিট করে লগইন করে দেখুন।


## 10) Troubleshooting DigitalOcean build failures

### Error: missing output directory `dist`
- Confirm App Platform build command is exactly:
  ```
  npm ci && npm run build && test -d dist
  ```
- Do **not** use `cd legacy && npm ci && npm run build` for this repo unless your app actually builds from `legacy/`.
- This repository builds from the project root and outputs to `dist/`.

### Error: failed to resolve `@/App.jsx`
- Ensure `vite.config.js` includes alias `@` -> `src`.

### Error: lockfile not in sync (`npm ci`)
- Keep `package-lock.json` committed and in sync with `package.json`.
- Redeploy after pushing lockfile updates.
