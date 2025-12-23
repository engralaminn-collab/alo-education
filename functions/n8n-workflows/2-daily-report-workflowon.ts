{
  "name": "ALO Education - Daily Management Report",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 21 * * *"
            }
          ]
        }
      },
      "id": "cron-trigger",
      "name": "Every Day at 9 PM",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BASE44_URL}}/functions/dailyReport",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "x-webhook-secret",
              "value": "={{$env.N8N_WEBHOOK_SECRET}}"
            }
          ]
        },
        "options": {}
      },
      "id": "get-daily-report",
      "name": "Get Daily Report from Base44",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "chatId": "={{$env.TELEGRAM_MANAGER_CHAT_ID}}",
        "text": "=📊 *ALO EDUCATION - DAILY REPORT*\n📅 Date: {{$json.report.date}}\n\n━━━━━━━━━━━━━━━━━━━━━\n\n*📈 TODAY'S SUMMARY*\n\n🆕 New Leads: *{{$json.report.summary.new_leads}}*\n📝 Applications Submitted: *{{$json.report.summary.applications_submitted}}*\n✅ Offers Received: *{{$json.report.summary.offers_received}}*\n🛂 Visas Approved: *{{$json.report.summary.visa_approved}}*\n⏳ Pending Applications: *{{$json.report.summary.pending_applications}}*\n👥 Total Active Students: *{{$json.report.summary.total_active_students}}*\n\n━━━━━━━━━━━━━━━━━━━━━\n\n*🎯 TOP COUNTRIES*\n{{$json.report.top_countries.map((c, i) => `${i+1}. ${c.country}: ${c.count} leads`).join('\\n')}}\n\n━━━━━━━━━━━━━━━━━━━━━\n\n*👨‍💼 COUNSELOR PERFORMANCE*\n{{$json.report.counselor_performance.map(c => `\n▫️ *${c.name}*\n   • Total Leads: ${c.total_leads}\n   • Converted Today: ${c.converted_today}\n   • Active Students: ${c.total_students}`).join('\\n')}}\n\n━━━━━━━━━━━━━━━━━━━━━\n\n*⚠️ URGENT ITEMS*\n• Pending Documents: {{$json.report.urgent_items.pending_documents}}\n• Unassigned Leads: {{$json.report.urgent_items.new_unassigned}}\n\n━━━━━━━━━━━━━━━━━━━━━\n\n_Generated at {{$now.format('HH:mm:ss')}}_",
        "additionalFields": {
          "parseMode": "Markdown"
        }
      },
      "id": "telegram-report",
      "name": "Send to Telegram",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.1,
      "position": [650, 200],
      "credentials": {
        "telegramApi": {
          "id": "3",
          "name": "Telegram Bot"
        }
      }
    },
    {
      "parameters": {
        "fromEmail": "={{$env.GMAIL_FROM_EMAIL}}",
        "toEmail": "={{$env.MANAGER_EMAIL}}",
        "subject": "=ALO Education - Daily Report {{$json.report.date}}",
        "emailType": "html",
        "message": "=<html>\n<body style=\"font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: #f5f5f5;\">\n  <div style=\"background: linear-gradient(135deg, #0066CC, #F37021); padding: 30px; text-align: center;\">\n    <h1 style=\"color: white; margin: 0;\">📊 Daily Management Report</h1>\n    <p style=\"color: white; margin: 10px 0 0 0;\">{{$json.report.date}}</p>\n  </div>\n  \n  <div style=\"padding: 30px; background: white; margin: 20px;\">\n    <h2 style=\"color: #0066CC; border-bottom: 3px solid #F37021; padding-bottom: 10px;\">Today's Summary</h2>\n    \n    <table style=\"width: 100%; border-collapse: collapse; margin: 20px 0;\">\n      <tr style=\"background: #f8f9fa;\">\n        <td style=\"padding: 15px; border: 1px solid #ddd;\"><strong>📊 Metric</strong></td>\n        <td style=\"padding: 15px; border: 1px solid #ddd; text-align: center;\"><strong>Count</strong></td>\n      </tr>\n      <tr>\n        <td style=\"padding: 12px; border: 1px solid #ddd;\">🆕 New Leads</td>\n        <td style=\"padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0066CC;\">{{$json.report.summary.new_leads}}</td>\n      </tr>\n      <tr style=\"background: #f8f9fa;\">\n        <td style=\"padding: 12px; border: 1px solid #ddd;\">📝 Applications Submitted</td>\n        <td style=\"padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0066CC;\">{{$json.report.summary.applications_submitted}}</td>\n      </tr>\n      <tr>\n        <td style=\"padding: 12px; border: 1px solid #ddd;\">✅ Offers Received</td>\n        <td style=\"padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #28a745;\">{{$json.report.summary.offers_received}}</td>\n      </tr>\n      <tr style=\"background: #f8f9fa;\">\n        <td style=\"padding: 12px; border: 1px solid #ddd;\">🛂 Visas Approved</td>\n        <td style=\"padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #28a745;\">{{$json.report.summary.visa_approved}}</td>\n      </tr>\n      <tr>\n        <td style=\"padding: 12px; border: 1px solid #ddd;\">⏳ Pending Applications</td>\n        <td style=\"padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #ffc107;\">{{$json.report.summary.pending_applications}}</td>\n      </tr>\n      <tr style=\"background: #f8f9fa;\">\n        <td style=\"padding: 12px; border: 1px solid #ddd;\">👥 Total Active Students</td>\n        <td style=\"padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold; color: #0066CC;\">{{$json.report.summary.total_active_students}}</td>\n      </tr>\n    </table>\n\n    <h2 style=\"color: #0066CC; border-bottom: 3px solid #F37021; padding-bottom: 10px; margin-top: 40px;\">🎯 Top Countries</h2>\n    <ul style=\"list-style: none; padding: 0;\">\n      {{$json.report.top_countries.map((c, i) => `<li style=\"padding: 10px; border-left: 4px solid #F37021; margin: 10px 0; background: #f8f9fa;\"><strong>${i+1}. ${c.country}</strong>: ${c.count} leads</li>`).join('')}}\n    </ul>\n\n    <h2 style=\"color: #0066CC; border-bottom: 3px solid #F37021; padding-bottom: 10px; margin-top: 40px;\">👨‍💼 Counselor Performance</h2>\n    {{$json.report.counselor_performance.map(c => `\n      <div style=\"background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 5px;\">\n        <h3 style=\"margin: 0 0 10px 0; color: #0066CC;\">${c.name}</h3>\n        <p style=\"margin: 5px 0;\">📊 Total Leads: <strong>${c.total_leads}</strong></p>\n        <p style=\"margin: 5px 0;\">✅ Converted Today: <strong>${c.converted_today}</strong></p>\n        <p style=\"margin: 5px 0;\">👥 Active Students: <strong>${c.total_students}</strong></p>\n      </div>\n    `).join('')}}\n\n    <div style=\"background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 30px;\">\n      <h3 style=\"margin: 0 0 10px 0; color: #856404;\">⚠️ Urgent Items</h3>\n      <p style=\"margin: 5px 0;\">• Pending Documents: <strong>{{$json.report.urgent_items.pending_documents}}</strong></p>\n      <p style=\"margin: 5px 0;\">• Unassigned Leads: <strong>{{$json.report.urgent_items.new_unassigned}}</strong></p>\n    </div>\n  </div>\n  \n  <div style=\"background: #0066CC; padding: 20px; text-align: center; color: white; font-size: 12px;\">\n    <p>© 2025 ALO Education | Generated at {{$now.format('HH:mm:ss')}}</p>\n  </div>\n</body>\n</html>",
        "options": {}
      },
      "id": "email-report",
      "name": "Send Email Report",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [650, 400],
      "credentials": {
        "gmailOAuth2": {
          "id": "1",
          "name": "Gmail account"
        }
      }
    }
  ],
  "connections": {
    "Every Day at 9 PM": {
      "main": [
        [
          {
            "node": "Get Daily Report from Base44",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get Daily Report from Base44": {
      "main": [
        [
          {
            "node": "Send to Telegram",
            "type": "main",
            "index": 0
          },
          {
            "node": "Send Email Report",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {},
  "staticData": null
}