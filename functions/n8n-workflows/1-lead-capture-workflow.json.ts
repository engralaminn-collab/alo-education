{
  "name": "ALO Education - Lead Capture & Auto Response",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "lead-capture",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-node",
      "name": "Webhook - Lead Form",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BASE44_URL}}/functions/n8nLeadWebhook",
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
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "name",
              "value": "={{$json.name}}"
            },
            {
              "name": "email",
              "value": "={{$json.email}}"
            },
            {
              "name": "phone",
              "value": "={{$json.phone}}"
            },
            {
              "name": "country_of_interest",
              "value": "={{$json.country}}"
            },
            {
              "name": "degree_level",
              "value": "={{$json.degree_level}}"
            },
            {
              "name": "field_of_study",
              "value": "={{$json.field_of_study}}"
            },
            {
              "name": "message",
              "value": "={{$json.message}}"
            },
            {
              "name": "source",
              "value": "website"
            }
          ]
        },
        "options": {}
      },
      "id": "http-request-crm",
      "name": "Send to Base44 CRM",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.priority}}",
              "operation": "equals",
              "value2": "high"
            }
          ]
        }
      },
      "id": "if-high-priority",
      "name": "Is High Priority?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "fromEmail": "={{$env.GMAIL_FROM_EMAIL}}",
        "toEmail": "={{$node['Webhook - Lead Form'].json['email']}}",
        "subject": "Welcome to ALO Education!",
        "emailType": "html",
        "message": "=<html>\n<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n  <div style=\"background: linear-gradient(135deg, #0066CC, #F37021); padding: 30px; text-align: center;\">\n    <h1 style=\"color: white; margin: 0;\">Welcome to ALO Education!</h1>\n  </div>\n  \n  <div style=\"padding: 30px; background: #f8f9fa;\">\n    <h2 style=\"color: #0066CC;\">Hi {{$node['Webhook - Lead Form'].json['name']}},</h2>\n    \n    <p style=\"font-size: 16px; line-height: 1.6; color: #333;\">\n      Thank you for your interest in studying in <strong>{{$node['Webhook - Lead Form'].json['country']}}</strong>!\n    </p>\n    \n    <p style=\"font-size: 16px; line-height: 1.6; color: #333;\">\n      Our expert counselors will contact you within <strong>24 hours</strong> to discuss your study abroad journey.\n    </p>\n    \n    <div style=\"background: white; padding: 20px; border-radius: 10px; margin: 20px 0;\">\n      <h3 style=\"color: #F37021; margin-top: 0;\">Next Steps:</h3>\n      <ul style=\"line-height: 1.8;\">\n        <li>Check your email for important updates</li>\n        <li>Prepare your academic documents</li>\n        <li>Review your English test options</li>\n      </ul>\n    </div>\n    \n    <p style=\"font-size: 14px; color: #666;\">\n      Need immediate assistance? Call us at <strong>+88 01805020101</strong>\n    </p>\n    \n    <div style=\"text-align: center; margin-top: 30px;\">\n      <a href=\"https://aloeducation.co.uk\" style=\"background: #F37021; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;\">Visit Our Website</a>\n    </div>\n  </div>\n  \n  <div style=\"background: #0066CC; padding: 20px; text-align: center; color: white; font-size: 12px;\">\n    <p>© 2025 ALO Education. All rights reserved.</p>\n  </div>\n</body>\n</html>",
        "options": {}
      },
      "id": "gmail-send",
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [850, 200],
      "credentials": {
        "gmailOAuth2": {
          "id": "1",
          "name": "Gmail account"
        }
      }
    },
    {
      "parameters": {
        "phoneNumberId": "={{$env.WHATSAPP_PHONE_NUMBER_ID}}",
        "recipient": "={{$node['Webhook - Lead Form'].json['phone']}}",
        "messageType": "text",
        "message": "=Hi {{$node['Webhook - Lead Form'].json['name']}}! 👋\n\nThank you for choosing *ALO Education* for your study abroad journey to *{{$node['Webhook - Lead Form'].json['country']}}*!\n\n✅ Your inquiry has been received\n📞 Our counselor will contact you within 24 hours\n🎓 Study Level: {{$node['Webhook - Lead Form'].json['degree_level']}}\n\nQuestions? Reply to this message or call:\n+88 01805020101\n\nBest regards,\n*ALO Education Team*"
      },
      "id": "whatsapp-send",
      "name": "Send WhatsApp Message",
      "type": "n8n-nodes-base.whatsapp",
      "typeVersion": 1,
      "position": [850, 400],
      "credentials": {
        "whatsAppApi": {
          "id": "2",
          "name": "WhatsApp Business API"
        }
      }
    },
    {
      "parameters": {
        "chatId": "={{$env.TELEGRAM_ALERT_CHAT_ID}}",
        "text": "=🚨 *HIGH PRIORITY LEAD*\n\n👤 Name: {{$node['Webhook - Lead Form'].json['name']}}\n📧 Email: {{$node['Webhook - Lead Form'].json['email']}}\n📱 Phone: {{$node['Webhook - Lead Form'].json['phone']}}\n🌍 Country: {{$node['Webhook - Lead Form'].json['country']}}\n🎓 Level: {{$node['Webhook - Lead Form'].json['degree_level']}}\n📊 Lead Score: {{$json.lead_score}}\n⚡ Priority: {{$json.priority}}\n\n💬 Message:\n{{$node['Webhook - Lead Form'].json['message']}}\n\n⏰ Action Required: Contact within 6 hours!",
        "additionalFields": {
          "parseMode": "Markdown"
        }
      },
      "id": "telegram-alert",
      "name": "Telegram Alert - High Priority",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.1,
      "position": [850, 600],
      "credentials": {
        "telegramApi": {
          "id": "3",
          "name": "Telegram Bot"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"message\": \"Thank you! We'll contact you soon.\", \"inquiry_id\": $json.inquiry_id } }}"
      },
      "id": "respond-webhook",
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Webhook - Lead Form": {
      "main": [
        [
          {
            "node": "Send to Base44 CRM",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send to Base44 CRM": {
      "main": [
        [
          {
            "node": "Is High Priority?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Is High Priority?": {
      "main": [
        [
          {
            "node": "Send Welcome Email",
            "type": "main",
            "index": 0
          },
          {
            "node": "Send WhatsApp Message",
            "type": "main",
            "index": 0
          },
          {
            "node": "Telegram Alert - High Priority",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Send Welcome Email",
            "type": "main",
            "index": 0
          },
          {
            "node": "Send WhatsApp Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send Welcome Email": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
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