{
  "name": "ALO Education - Document Reminder",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 10 * * *"
            }
          ]
        }
      },
      "id": "cron-daily",
      "name": "Every Day at 10 AM",
      "type": "n8n-nodes-base.cron",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "={{$env.BASE44_URL}}/functions/n8nDocumentReminder",
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
      "id": "check-missing-docs",
      "name": "Check Missing Documents",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.reminders_count}}",
              "operation": "larger",
              "value2": 0
            }
          ]
        }
      },
      "id": "has-reminders",
      "name": "Has Reminders?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "fieldToSplitOut": "reminders",
        "options": {}
      },
      "id": "split-reminders",
      "name": "Split Into Items",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [850, 200]
    },
    {
      "parameters": {
        "phoneNumberId": "={{$env.WHATSAPP_PHONE_NUMBER_ID}}",
        "recipient": "={{$json.student_phone}}",
        "messageType": "text",
        "message": "=Hi {{$json.student_name}}! 👋\n\n⚠️ *Document Reminder* ⚠️\n\nYour application is pending the following documents:\n\n{{$json.missing_documents.map(doc => `❌ ${doc.replace(/_/g, ' ').toUpperCase()}`).join('\\n')}}\n\n📅 Days Pending: *{{$json.days_pending}}*\n\n📤 Please upload your documents as soon as possible to avoid delays.\n\nUpload here:\nhttps://app.aloeducation.co.uk/my-documents\n\nNeed help? Contact your counselor:\n+88 01805020101\n\n*ALO Education Team*"
      },
      "id": "send-whatsapp-reminder",
      "name": "Send WhatsApp Reminder",
      "type": "n8n-nodes-base.whatsapp",
      "typeVersion": 1,
      "position": [1050, 100],
      "credentials": {
        "whatsAppApi": {
          "id": "2",
          "name": "WhatsApp Business API"
        }
      }
    },
    {
      "parameters": {
        "fromEmail": "={{$env.GMAIL_FROM_EMAIL}}",
        "toEmail": "={{$json.student_email}}",
        "subject": "⚠️ Missing Documents - Action Required",
        "emailType": "html",
        "message": "=<html>\n<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n  <div style=\"background: linear-gradient(135deg, #0066CC, #F37021); padding: 30px; text-align: center;\">\n    <h1 style=\"color: white; margin: 0;\">⚠️ Document Reminder</h1>\n  </div>\n  \n  <div style=\"padding: 30px; background: #f8f9fa;\">\n    <h2 style=\"color: #0066CC;\">Hi {{$json.student_name}},</h2>\n    \n    <p style=\"font-size: 16px; line-height: 1.6; color: #333;\">\n      Your application has been pending for <strong>{{$json.days_pending}} days</strong> due to missing documents.\n    </p>\n    \n    <div style=\"background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;\">\n      <h3 style=\"color: #856404; margin-top: 0;\">Missing Documents:</h3>\n      <ul style=\"line-height: 1.8; color: #856404;\">\n        {{$json.missing_documents.map(doc => `<li><strong>${doc.replace(/_/g, ' ').toUpperCase()}</strong></li>`).join('')}}\n      </ul>\n    </div>\n    \n    <p style=\"font-size: 16px; line-height: 1.6; color: #333;\">\n      Please upload these documents as soon as possible to proceed with your application.\n    </p>\n    \n    <div style=\"text-align: center; margin: 30px 0;\">\n      <a href=\"https://app.aloeducation.co.uk/my-documents?application={{$json.application_id}}\" style=\"background: #F37021; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;\">Upload Documents Now</a>\n    </div>\n    \n    <p style=\"font-size: 14px; color: #666;\">\n      Need assistance? Contact your counselor at <strong>+88 01805020101</strong>\n    </p>\n  </div>\n  \n  <div style=\"background: #0066CC; padding: 20px; text-align: center; color: white; font-size: 12px;\">\n    <p>© 2025 ALO Education. All rights reserved.</p>\n  </div>\n</body>\n</html>",
        "options": {}
      },
      "id": "send-email-reminder",
      "name": "Send Email Reminder",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [1050, 300],
      "credentials": {
        "gmailOAuth2": {
          "id": "1",
          "name": "Gmail account"
        }
      }
    }
  ],
  "connections": {
    "Every Day at 10 AM": {
      "main": [
        [
          {
            "node": "Check Missing Documents",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Check Missing Documents": {
      "main": [
        [
          {
            "node": "Has Reminders?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Has Reminders?": {
      "main": [
        [
          {
            "node": "Split Into Items",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Split Into Items": {
      "main": [
        [
          {
            "node": "Send WhatsApp Reminder",
            "type": "main",
            "index": 0
          },
          {
            "node": "Send Email Reminder",
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