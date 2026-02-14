#!/bin/bash
set -e

echo "=== ALO Education API - Droplet Setup ==="
echo "This script sets up the Node.js API on the DigitalOcean droplet"

# Install Node.js 20 if not present
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
  echo ">>> Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo ">>> Node.js version: $(node -v)"
echo ">>> npm version: $(npm -v)"

# Create app directory
APP_DIR=/opt/alo-education-api
sudo mkdir -p $APP_DIR/data
sudo chown -R $USER:$USER $APP_DIR

# Copy API files
echo ">>> Copying API files..."
cp -r /tmp/alo-api/* $APP_DIR/

# Install dependencies
echo ">>> Installing dependencies..."
cd $APP_DIR
npm install --production

# Create systemd service
echo ">>> Creating systemd service..."
sudo tee /etc/systemd/system/alo-api.service > /dev/null << 'SERVICEEOF'
[Unit]
Description=ALO Education API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/alo-education-api
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=JWT_SECRET=alo-edu-jwt-prod-k3y-ch4ng3-th1s
Environment=DATA_DIR=/opt/alo-education-api/data

[Install]
WantedBy=multi-user.target
SERVICEEOF

# Reload and start service
echo ">>> Starting API service..."
sudo systemctl daemon-reload
sudo systemctl enable alo-api
sudo systemctl restart alo-api

# Wait for startup
sleep 2
sudo systemctl status alo-api --no-pager || true

# Seed admin user
echo ">>> Seeding admin user..."
curl -s -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@aloeducation.co.uk","password":"Admin@123","full_name":"ALO Admin","role":"admin"}' \
  2>/dev/null || echo "(admin may already exist)"

echo ""

# Configure nginx
echo ">>> Configuring nginx for api.aloeducation.co.uk..."
sudo tee /etc/nginx/sites-available/alo-api > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name api.aloeducation.co.uk;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
        client_max_body_size 10M;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/alo-api /etc/nginx/sites-enabled/alo-api

# Remove default nginx site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "=== Setup complete! ==="
echo "API running at http://localhost:3001"
echo "Nginx proxying api.aloeducation.co.uk → localhost:3001"
echo ""
echo "Next steps:"
echo "  1. Install SSL: sudo certbot --nginx -d api.aloeducation.co.uk"
echo "  2. Test: curl https://api.aloeducation.co.uk/api/health"
echo ""
echo "Admin login: admin@aloeducation.co.uk / Admin@123"
