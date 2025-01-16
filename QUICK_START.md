# Job Application Tracker - Quick Start Guide

## What You Have

You now have a complete job application tracking system with two components:

### 1. Web Application (Already Working)
- Location: `~/job-application-tracker/index.html`
- Features: Track, search, filter, export applications
- Storage: Browser localStorage

### 2. Chrome Extension (Needs Installation)
- Location: `~/job-application-tracker/chrome-extension/`
- Features: Auto-detects job applications as you apply
- Works on: LinkedIn, GitHub, Indeed, Greenhouse, Lever, and more

## Step-by-Step Setup (5 minutes)

### STEP 1: Install the Chrome Extension

1. **Open Chrome** and go to: `chrome://extensions/`

2. **Enable Developer Mode**
   - Look for the toggle in the top-right corner
   - Click to turn it ON

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to: `/Users/kush/job-application-tracker/chrome-extension/`
   - Click "Select"

4. **Verify Installation**
   - You should see "Job Application Auto-Tracker" in your extensions
   - Pin it to your toolbar by clicking the puzzle icon

### STEP 2: Test It Out

1. **Open LinkedIn or GitHub Jobs**
   - Visit a job posting
   - Click "Apply" or submit an application

2. **Check the Extension**
   - Click the extension icon in Chrome toolbar
   - You should see your application tracked!

3. **View Full Tracker**
   - Click "Open Full Tracker" in the extension popup
   - Or run: `open ~/job-application-tracker/index.html`

## How to Use Daily

### Applying to Jobs

1. Browse jobs on LinkedIn, GitHub, Indeed, etc.
2. Apply normally - the extension auto-tracks
3. See a green notification when an application is saved
4. Click the extension icon to review recent apps

### Managing Applications

1. **View All**: Open the full tracker (`open ~/job-application-tracker/index.html`)
2. **Update Status**: Edit applications as you get interviews/offers
3. **Search**: Use filters to find specific applications
4. **Export**: Download CSV for spreadsheets

### Quick Stats

- Click the extension icon anytime to see:
  - Total applications
  - Applications today
  - Applications this week
  - Auto-tracked vs manual

## Supported Job Sites

The extension automatically tracks applications on:

✅ **LinkedIn** - Easy Apply and regular applications
✅ **GitHub** - Job boards and company pages
✅ **Indeed** - All job applications
✅ **Glassdoor** - Job applications
✅ **Greenhouse** - Common ATS platform
✅ **Lever** - Common ATS platform
✅ **Workable** - ATS platform
✅ **SmartRecruiters** - ATS platform

*ATS = Applicant Tracking System (used by many companies)*

## Tips for Best Results

1. **Install the extension first** before applying to jobs
2. **Keep Chrome open** while job hunting
3. **Check the extension popup** after applying to verify tracking
4. **Update statuses regularly** to track your pipeline
5. **Export weekly** as a backup
6. **Use notes** to track important details (recruiter contacts, etc.)

## What Gets Auto-Tracked

When you apply to a job, the extension captures:

- ✅ Company name
- ✅ Job title/position
- ✅ Location
- ✅ Source platform (LinkedIn, GitHub, etc.)
- ✅ Application URL
- ✅ Date applied
- ✅ Auto-generated notes

## Manual Entry

If the extension misses an application:

1. Click the extension icon
2. Click "+ Add Application Manually"
3. Enter company and position
4. Click "Add Application"

## Commands Reference

```bash
# Open the full tracker
open ~/job-application-tracker/index.html

# Open Chrome extensions (to install)
# Go to: chrome://extensions/

# Extension location
# /Users/kush/job-application-tracker/chrome-extension/
```

## Troubleshooting

**Extension not detecting applications?**
- Reload the page after installing the extension
- Check that the site is in the supported list
- Use manual entry as a backup

**Not seeing applications in the full tracker?**
- Click "Open Full Tracker" from the extension popup
- Wait 10 seconds for auto-sync
- Applications are stored in Chrome's extension storage

**Want to see what's happening?**
- Open Developer Tools (F12)
- Check Console for "[Job Tracker]" messages

## Privacy

- All data stays on your computer
- Nothing sent to external servers
- Extension only runs on job sites
- No tracking or analytics

## Next Steps

1. ✅ Install the extension (follow STEP 1 above)
2. ✅ Apply to a test job to see it work
3. ✅ Explore the full tracker features
4. ✅ Start tracking all your applications!

---

**Need the detailed installation guide?**
See: `EXTENSION_INSTALL.md`

**Questions?**
Check the README.md in the tracker directory
