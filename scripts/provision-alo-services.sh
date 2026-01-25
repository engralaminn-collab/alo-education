#!/usr/bin/env bash
set -euo pipefail
set +H 2>/dev/null || true

API_DOMAIN="${API_DOMAIN:-api.aloeducation.co.uk}"
AUTOMATION_DOMAIN="${AUTOMATION_DOMAIN:-automation.aloeducation.co.uk}"
API_PORT="${API_PORT:-4000}"
N8N_UPSTREAM_HOST="${N8N_UPSTREAM_HOST:-n8n.srv915514.hstgr.cloud}"

echo "=== 0) Ensure packages ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -y >/dev/null
apt-get install -y curl ca-certificates nginx ufw >/dev/null

echo "=== 1) Ensure Node + PM2 ==="
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y nodejs >/dev/null
fi
command -v pm2 >/dev/null 2>&1 || npm i -g pm2 >/dev/null 2>&1

echo "=== 2) Build alo-api clean ==="
pm2 delete alo-api >/dev/null 2>&1 || true
mkdir -p /root/alo-api
cd /root/alo-api

cat > package.json <<'PKG'
{
  "name": "alo-api",
  "version": "10.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": { "start": "node index.js" },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "sqlite3": "^5.1.7"
  }
}
PKG

cat > index.js <<'JS'
import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: ["https://aloeducation.co.uk", "https://www.aloeducation.co.uk"],
    credentials: true,
  })
);

const PORT = Number(process.env.PORT || 4000);
const HOST = "127.0.0.1";
const DB_PATH = "/root/alo-api/data.db";
new sqlite3.Database(DB_PATH);

app.get("/", (req, res) => res.json({ ok: true, service: "alo-api", port: PORT }));

app.listen(PORT, HOST, () => {
  console.log(`ALO-API running on http://127.0.0.1:${PORT}`);
});
JS

npm install --omit=dev >/dev/null 2>&1 || npm install >/dev/null 2>&1

echo "=== 3) Start API via PM2 ==="
pm2 start /root/alo-api/index.js --name alo-api --update-env >/dev/null
pm2 save >/dev/null 2>&1 || true

echo "=== 4) Nginx vhosts (API + Automation) ==="
rm -f /etc/nginx/sites-enabled/aloeducation-api.conf \
  /etc/nginx/sites-enabled/alo-api.conf \
  /etc/nginx/sites-enabled/api.aloeducation.co.uk.conf 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/aloeducation-automation.conf \
  /etc/nginx/sites-enabled/alo-automation.conf 2>/dev/null || true

cat > /etc/nginx/sites-available/aloeducation-api.conf <<NG
server {
  listen 80;
  server_name ${API_DOMAIN};

  location / {
    proxy_pass http://127.0.0.1:${API_PORT};
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 60s;
  }
}
NG
ln -sf /etc/nginx/sites-available/aloeducation-api.conf /etc/nginx/sites-enabled/aloeducation-api.conf

cat > /etc/nginx/sites-available/aloeducation-automation.conf <<NG
server {
  listen 80;
  server_name ${AUTOMATION_DOMAIN};

  location / {
    proxy_ssl_server_name on;
    proxy_ssl_name ${N8N_UPSTREAM_HOST};
    proxy_set_header Host ${N8N_UPSTREAM_HOST};

    proxy_pass https://${N8N_UPSTREAM_HOST};
    proxy_http_version 1.1;

    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;

    proxy_read_timeout 300s;
    proxy_connect_timeout 30s;
    proxy_send_timeout 300s;
  }
}
NG
ln -sf /etc/nginx/sites-available/aloeducation-automation.conf \
  /etc/nginx/sites-enabled/aloeducation-automation.conf

nginx -t >/dev/null
systemctl reload nginx

echo "=== 5) Firewall ==="
ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow "Nginx Full" >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true

echo
echo "=== ✅ VERIFY ==="
echo "--- PM2 ---"
pm2 list | sed -n "1,25p" || true
echo "--- LISTEN ---"
ss -lntp | egrep ":(80|443|${API_PORT}) " || true
echo "--- LOCAL API ---"
curl -sS -i http://127.0.0.1:${API_PORT}/ | head -n 12 || true
echo "--- PUBLIC API (HTTP) ---"
curl -sS -i http://${API_DOMAIN}/ | head -n 12 || true
echo "--- UPSTREAM n8n (direct from droplet) ---"
curl -m 12 -sS -I https://${N8N_UPSTREAM_HOST}/ | head -n 8 || true
echo "--- PUBLIC automation (HTTP) ---"
curl -m 12 -sS -I http://${AUTOMATION_DOMAIN}/ | head -n 10 || true

echo
echo "DONE URLs:"
echo "  https://${API_DOMAIN}/"
echo "  https://${AUTOMATION_DOMAIN}/"
