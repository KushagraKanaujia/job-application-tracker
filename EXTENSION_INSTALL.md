# Chrome Extension Installation Guide

This guide will help you install the Job Application Auto-Tracker extension in Google Chrome.

## Installation Steps

### 1. Open Chrome Extensions Page

- Open Google Chrome
- Navigate to `chrome://extensions/` in the address bar
- Or click the three dots menu → More Tools → Extensions

### 2. Enable Developer Mode

- In the top-right corner of the Extensions page, toggle on **Developer mode**

### 3. Load the Extension

1. Click the **Load unpacked** button (appears after enabling Developer mode)
2. Navigate to: `/Users/kush/job-application-tracker/chrome-extension/`
3. Click **Select** to load the extension

### 4. Verify Installation

- You should see "Job Application Auto-Tracker" in your extensions list
- The extension icon should appear in your Chrome toolbar
- If you don't see it, click the puzzle piece icon and pin the Job Application Auto-Tracker

## How It Works

### Automatic Tracking

The extension automatically detects when you apply to jobs on these platforms:

- **LinkedIn** - Detects Easy Apply and standard applications
- **GitHub** - Tracks applications from job boards like SimplifyJobs
- **Indeed** - Monitors job applications
- **Greenhouse** - Common ATS used by many companies
- **Lever** - Another popular ATS platform
- **Other job sites** - Generic detection for other platforms

### What Gets Tracked

When you submit a job application, the extension automatically captures:

- Company name
- Position title
- Location
- Source (which platform you applied from)
- Application URL
- Date applied

### Notifications

- You'll see a green notification in the top-right when an application is tracked
- Chrome will also show a system notification

## Using the Extension

### Extension Popup

Click the extension icon to:

- View recent applications
- See statistics (total, today, this week, auto-tracked)
- Add applications manually
- Export data to CSV
- Open the full tracker

### Manual Entry

If the extension doesn't auto-detect an application:

1. Click the extension icon
2. Click "+ Add Application Manually"
3. Fill in company and position
4. Click "Add Application"

### Full Tracker

- Click "Open Full Tracker" in the popup to view all applications
- The full tracker syncs with extension data automatically

## Supported Job Sites

### Fully Supported (Auto-detection)
- LinkedIn (linkedin.com)
- GitHub Jobs (github.com)
- Indeed (indeed.com)
- Glassdoor (glassdoor.com)

### ATS Platforms (Auto-detection)
- Greenhouse (*.greenhouse.io)
- Lever (*.lever.co)
- Workable (*.workable.com)
- SmartRecruiters (*.smartrecruiters.com)

### Other Sites
- Generic detection attempts to capture basic info from page metadata

## Troubleshooting

### Extension Not Detecting Applications

1. **Check permissions**: Make sure the extension has permission for the job site
2. **Reload the page**: Refresh the job site after installing the extension
3. **Manual entry**: Use the manual add feature in the popup
4. **Check console**: Open Developer Tools (F12) and check for any errors

### No Data Showing in Full Tracker

1. Make sure you're opening the tracker from the extension popup
2. Applications are stored in Chrome's extension storage
3. The tracker syncs automatically every 10 seconds

### Duplicate Applications

- The extension checks for duplicates within the last 7 days
- Same company + position won't be added twice in 7 days

## Privacy & Data

- **All data stays local**: Applications are stored in Chrome's local storage
- **No external servers**: Nothing is sent to external servers
- **No tracking**: The extension doesn't track your browsing
- **No permissions abuse**: Only accesses job sites you visit

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find "Job Application Auto-Tracker"
3. Click **Remove**

Your data will remain in the local tracker application.

## Tips

1. **Keep Chrome open**: The extension only tracks when Chrome is running
2. **Pin the extension**: Click the puzzle icon and pin for easy access
3. **Regular exports**: Export your data regularly as a backup
4. **Check the popup**: Review tracked applications in the popup
5. **Manual backup**: The full tracker lets you export to CSV

## Quick Reference

- **Extension Location**: `/Users/kush/job-application-tracker/chrome-extension/`
- **Full Tracker**: `/Users/kush/job-application-tracker/index.html`
- **Chrome Extensions**: `chrome://extensions/`

## Need Help?

If you encounter issues:

1. Check the browser console for errors (F12 → Console)
2. Reload the extension from chrome://extensions/
3. Try reinstalling the extension
4. Make sure you're on a supported job site

---

## What the Extension Does Behind the Scenes

### Content Scripts
- Runs on job sites you visit
- Watches for form submissions and button clicks
- Extracts job information from the page
- Sends data to background script

### Background Worker
- Receives job data from content scripts
- Stores in Chrome storage
- Checks for duplicates
- Shows notifications

### Popup Interface
- Displays statistics and recent applications
- Allows manual entry
- Opens full tracker
- Exports data

The extension is designed to be lightweight and only activates on job sites!
