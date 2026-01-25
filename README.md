# 📘 ALO Education – International Education Consultancy Automation

![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Automation](https://img.shields.io/badge/automation-n8n-orange)

🌍 **Website:** https://www.aloeducation.co.uk  
🤖 **Automation:** https://automation.aloeducation.co.uk  

---

## 🏫 About ALO Education
ALO Education is a Dhaka-based international education consultancy supporting students in pursuing higher education abroad. We provide transparent, ethical, and professional guidance across admissions, scholarships, visa preparation, and pre-departure support.

**Primary Destinations:** UK, USA, Australia, Canada, Europe

---

## 🎯 Mission
To empower students with global academic opportunities through personalised counselling, structured processes, and secure digital automation.

---

## 🚀 Project Overview
This repository contains **production-ready automation infrastructure** for ALO Education, built using **self-hosted n8n**, Docker, and secure webhook-based integrations.

It is intended for:
- Internal automation
- Technical audits
- Partner collaboration
- Compliance review
- Release documentation

⚠️ **Public Repository Notice:**  
No secrets, API keys, or credentials are stored in this repository. All sensitive values must be provided via environment variables.

---

## 🧠 Core Features
- 🤖 Self-Hosted n8n Automation
- 📤 Student → CRM Workflow
- ⚙️ Secure Webhooks & APIs
- 🔐 Environment-based Secrets
- 📚 Release-Ready Documentation

---

## 🏗 Infrastructure Overview

### 🔧 Server Bootstrap (API + Automation Proxy)
Use the provisioning script below on a fresh Ubuntu host to set up the ALO API (PM2 + Node), Nginx reverse proxies for the API and automation domains, and a basic firewall.

```bash
sudo bash scripts/provision-alo-services.sh
```

You can override defaults with environment variables:

```bash
API_DOMAIN=api.aloeducation.co.uk \
AUTOMATION_DOMAIN=automation.aloeducation.co.uk \
API_PORT=4000 \
N8N_UPSTREAM_HOST=n8n.srv915514.hstgr.cloud \
sudo bash scripts/provision-alo-services.sh
```
