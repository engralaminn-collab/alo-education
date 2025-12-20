# ALO Education - n8n Workflow Setup Guide

## 📋 Overview
Complete n8n automation workflows for ALO Education CRM system.

## 🚀 Quick Start

### Step 1: Install n8n
```bash
# Using npx (recommended)
npx n8n

# Or install globally
npm install -g n8n
n8n start
```

Access n8n at: `http://localhost:5678`

### Step 2: Set Environment Variables in n8n

Go to Settings → Variables and add:

```
BASE44_URL=https://your-base44-app-url.com
N8N_WEBHOOK_SECRET=your-secret-key-here
GMAIL_FROM_EMAIL=noreply@aloeducation.com
WHATSAPP_PHONE_NUMBER_ID=your-meta-phone-id
TELEGRAM_ALERT_CHAT_ID=your-telegram-chat-id
TELEGRAM_MANAGER_CHAT_ID=manager-chat-id
MANAGER_EMAIL=manager@aloeducation.com
```

### Step 3: Configure Credentials

#### Gmail OAuth2
1. Go to Credentials → Add Credential → Gmail OAuth2
2. Follow Google OAuth setup
3. Name it: "Gmail account"

#### WhatsApp Business API
1. Go to Credentials → Add Credential → WhatsApp
2. Get credentials from Meta Business Manager
3. Name it: "WhatsApp Business API"

#### Telegram Bot
1. Create bot via @BotFather
2. Add credential with bot token
3. Name it: "Telegram Bot"

### Step 4: Import Workflows

1. Go to Workflows → Import from File
2. Import each workflow JSON:
   - `1-lead-capture-workflow.json` - Main lead automation
   - `2-daily-report-workflow.json` - Daily 9 PM reports
   - `3-document-reminder-workflow.json` - Auto document reminders

### Step 5: Activate Workflows

Click "Active" toggle on each workflow.

## 📁 Workflow Details

### 1️⃣ Lead Capture Workflow
**Trigger:** Webhook (POST)
**Runs:** When form submitted on website

**Flow:**
1. Receive lead data from website form
2. Send to Base44 CRM
3. Calculate lead score
4. If high priority → Alert manager via Telegram
5. Send welcome email (Gmail)
6. Send WhatsApp confirmation
7. Return success response

**Webhook URL:** `https://your-n8n-domain.com/webhook/lead-capture`

### 2️⃣ Daily Report Workflow
**Trigger:** CRON (9:00 PM daily)
**Runs:** Automatically every day

**Flow:**
1. Fetch daily statistics from Base44
2. Format beautiful report
3. Send to Telegram (quick view)
4. Send detailed email to manager

**Includes:**
- New leads count
- Applications submitted
- Offers received
- Visa approvals
- Counselor performance
- Top countries
- Urgent items

### 3️⃣ Document Reminder Workflow
**Trigger:** CRON (10:00 AM daily)
**Runs:** Automatically every day

**Flow:**
1. Check Base44 for pending applications
2. Identify missing documents
3. Filter students pending 3+ days
4. Send WhatsApp reminder
5. Send email reminder

## 🔗 Base44 Integration

### Configure Base44 Environment Variables

In your Base44 app settings, add:

```
N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook
N8N_WEBHOOK_SECRET=your-secret-key-here
```

### Available Base44 Endpoints

Your n8n workflows can call these:

1. **Lead Webhook:** `POST /functions/n8nLeadWebhook`
   - Create new inquiry in CRM
   - Auto-assign counselor
   - Return lead score

2. **Application Webhook:** `POST /functions/n8nApplicationWebhook`
   - Update application status
   - Trigger notifications

3. **Document Reminder:** `GET /functions/n8nDocumentReminder`
   - Get list of students with missing docs

4. **Lead Scoring:** `POST /functions/n8nLeadScoring`
   - Calculate lead priority

5. **Daily Report:** `GET /functions/dailyReport`
   - Get daily statistics

## 🌐 Website Integration

### HTML Form Example

```html
<form id="applyForm">
  <input name="name" required>
  <input name="email" type="email" required>
  <input name="phone" required>
  <select name="country">
    <option value="United Kingdom">UK</option>
    <option value="United States">USA</option>
  </select>
  <select name="degree_level">
    <option value="bachelor">Bachelor's</option>
    <option value="master">Master's</option>
  </select>
  <input name="field_of_study">
  <textarea name="message"></textarea>
  <button type="submit">Submit</button>
</form>

<script>
document.getElementById('applyForm').onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  const response = await fetch('https://your-n8n-domain.com/webhook/lead-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (response.ok) {
    alert('Thank you! We will contact you soon.');
  }
};
</script>
```

## 📱 WhatsApp Setup

### Meta Business Setup
1. Go to developers.facebook.com
2. Create Business App
3. Add WhatsApp product
4. Get Phone Number ID
5. Generate permanent token
6. Add to n8n credentials

### Webhook for Incoming Messages (Optional)
- Create separate workflow for receiving WhatsApp replies
- Webhook: `POST /webhook/whatsapp-incoming`
- Update Base44 with conversation

## 📧 Gmail Setup

### Enable Gmail API
1. Go to Google Cloud Console
2. Enable Gmail API
3. Create OAuth credentials
4. Add to n8n

### Send Limits
- Gmail free: ~500/day
- G Suite: ~2000/day

## 🤖 Telegram Setup

### Create Bot
```
1. Message @BotFather on Telegram
2. Send: /newbot
3. Follow instructions
4. Copy token
5. Add to n8n credentials
```

### Get Chat ID
```
1. Add bot to group/channel
2. Visit: https://api.telegram.org/bot<TOKEN>/getUpdates
3. Copy chat id
4. Add to n8n environment variables
```

## 🔄 Testing

### Test Lead Capture
```bash
curl -X POST https://your-n8n-domain.com/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "phone": "+8801234567890",
    "country": "United Kingdom",
    "degree_level": "master",
    "field_of_study": "Computer Science",
    "message": "I want to study in UK"
  }'
```

### Test Daily Report
```bash
curl -X GET https://your-base44-url.com/functions/dailyReport \
  -H "x-webhook-secret: your-secret"
```

## 🐛 Troubleshooting

### Workflow not triggering?
- Check if workflow is activated
- Verify webhook URL is correct
- Check n8n logs

### Emails not sending?
- Verify Gmail OAuth credentials
- Check daily send limits
- Enable "Less secure apps" or use App Password

### WhatsApp errors?
- Verify Phone Number ID
- Check Meta Business verification
- Ensure token is permanent (not temporary)

### Base44 errors?
- Check webhook secret matches
- Verify BASE44_URL is correct
- Check function logs in Base44 dashboard

## 📊 Monitoring

### n8n Dashboard
- Executions tab shows all runs
- Failed workflows highlighted in red
- Click to see detailed logs

### Recommended Monitoring
1. Set up n8n error notifications
2. Monitor Telegram for daily reports
3. Check Base44 logs regularly

## 🔐 Security Best Practices

1. Use strong webhook secrets
2. Enable HTTPS for n8n
3. Restrict n8n access (firewall/VPN)
4. Rotate tokens regularly
5. Never commit secrets to git

## 📈 Scaling

### High Volume?
- Use n8n cloud (managed)
- Set up Redis queue
- Enable worker instances
- Monitor rate limits

## 🆘 Support

**Issues?** Contact your system administrator or Base44 support.

**n8n Docs:** https://docs.n8n.io
**Meta WhatsApp:** https://developers.facebook.com/docs/whatsapp
**Gmail API:** https://developers.google.com/gmail/api