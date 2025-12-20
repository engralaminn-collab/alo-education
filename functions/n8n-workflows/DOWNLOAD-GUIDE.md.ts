# 📥 How to Download n8n Workflow Files

## Quick Guide: 3 Easy Steps

### Step 1: Go to Base44 Dashboard
1. Open your Base44 app dashboard
2. Look at the left sidebar
3. Click on **"Code"** menu item

### Step 2: Navigate to Workflows Folder
1. You'll see a list of folders and files
2. Find the **"functions"** folder
3. Inside functions, find **"n8n-workflows"** folder
4. Click to open it

### Step 3: Download the 3 JSON Files
You'll see 4 files:
- ✅ `1-lead-capture-workflow.json` - DOWNLOAD THIS
- ✅ `2-daily-report-workflow.json` - DOWNLOAD THIS  
- ✅ `3-document-reminder-workflow.json` - DOWNLOAD THIS
- 📄 `README.md` - Setup instructions
- 📄 `DOWNLOAD-GUIDE.md` - This file

**How to download each file:**
1. Click on the file name
2. You'll see the JSON content
3. Copy all the content (Ctrl+A, then Ctrl+C)
4. Open Notepad/TextEdit on your computer
5. Paste the content (Ctrl+V)
6. Save with the exact same filename (e.g., `1-lead-capture-workflow.json`)
7. Make sure it ends with `.json`

---

## Alternative: Use File Explorer

If your Base44 dashboard has a download button:
1. Right-click on each file
2. Click "Download"
3. Save to your computer

---

## What to Do After Downloading

### Import to n8n:
1. Open n8n (http://localhost:5678)
2. Click **"Add Workflow"** dropdown
3. Select **"Import from File"**
4. Choose the downloaded JSON file
5. Click "Open"
6. Workflow is now imported!
7. Repeat for all 3 files

---

## Need Help?

**Can't find the files?**
- Make sure you're in the Base44 **Code** section
- Look for: Code → Functions → n8n-workflows

**Files not showing?**
- Refresh the page
- The files were just created and should be there

**Still stuck?**
- Copy the JSON content from the Base44 code editor
- Create a new `.json` file manually
- Paste and save

---

## File Locations (For Reference)

```
your-base44-project/
└── functions/
    └── n8n-workflows/
        ├── 1-lead-capture-workflow.json      ← Download this
        ├── 2-daily-report-workflow.json      ← Download this
        ├── 3-document-reminder-workflow.json ← Download this
        ├── README.md                          ← Setup guide
        └── DOWNLOAD-GUIDE.md                  ← This file
```

---

## Video Tutorial (Text Version)

**[0:00-0:15]** Open Base44 Dashboard
- Go to your app URL
- Login if needed

**[0:15-0:30]** Navigate to Code Section  
- Click "Code" in left sidebar
- See your project files

**[0:30-0:45]** Find Workflows
- Open "functions" folder
- Open "n8n-workflows" folder

**[0:45-1:30]** Download Files
- Click first file `1-lead-capture-workflow.json`
- Select all content (Ctrl+A)
- Copy (Ctrl+C)
- Open Notepad
- Paste (Ctrl+V)
- Save as `1-lead-capture-workflow.json`
- Repeat for other 2 files

**[1:30-2:00]** Import to n8n
- Open n8n in browser
- Click "Import from File"
- Select downloaded file
- Done!

---

## Checklist ✅

Before proceeding to n8n setup, make sure you have:

- [ ] Downloaded `1-lead-capture-workflow.json`
- [ ] Downloaded `2-daily-report-workflow.json`  
- [ ] Downloaded `3-document-reminder-workflow.json`
- [ ] All files end with `.json` extension
- [ ] Files are on your computer (not just copied to clipboard)
- [ ] You can open the files in a text editor and see JSON content

**All checked?** Great! Now follow the README.md for n8n setup instructions.

---

## Common Issues

**Issue:** File downloads as `.txt` instead of `.json`
**Fix:** Rename it and change extension to `.json`

**Issue:** JSON shows errors in n8n
**Fix:** Make sure you copied the ENTIRE content, including first `{` and last `}`

**Issue:** Can't find download button
**Fix:** Just copy-paste the content and save manually

---

## Still Need Help?

If you're having trouble:
1. Take a screenshot of what you see
2. Contact support
3. Or ask in the chat

The files ARE in your Base44 project - you just created them! They're waiting in the `functions/n8n-workflows/` folder.