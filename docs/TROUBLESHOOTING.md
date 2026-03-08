# Troubleshooting Guide

## Common Issues and Solutions

### Extension Not Loading

**Problem:** Extension doesn't appear in Chrome toolbar

**Solutions:**
1. Check `chrome://extensions/` to verify it's installed
2. Make sure Developer Mode is enabled
3. Try reloading the extension
4. Check for error messages in the extension details

### Applications Not Being Detected

**Problem:** Applied to a job but it wasn't tracked

**Solutions:**
1. Refresh the job site page after installing extension
2. Check if the site is in the supported platforms list
3. Look for console errors (F12 → Console)
4. Use manual add feature as backup
5. Report the platform so we can add support

### Popup Won't Open

**Problem:** Clicking extension icon does nothing

**Solutions:**
1. Right-click the extension → Inspect popup
2. Check console for errors
3. Try reloading the extension
4. Reinstall if problem persists

### Data Not Syncing

**Problem:** Applications in popup don't match dashboard

**Solutions:**
1. Wait 10 seconds for auto-sync
2. Click "Open Full Tracker" from popup
3. Refresh the dashboard page
4. Check Chrome storage isn't full

### Extension Slowing Down Browser

**Problem:** Chrome feels slow with extension installed

**Solutions:**
1. Check how many applications you have stored
2. Export and clear old applications
3. Disable extension on non-job sites (it shouldn't run anyway)
4. Report performance issues on GitHub

### Can't Export to CSV

**Problem:** Export button doesn't work

**Solutions:**
1. Check if you have applications to export
2. Allow downloads in Chrome settings
3. Try exporting from dashboard instead of popup
4. Check browser console for errors

### Duplicate Applications

**Problem:** Same application tracked multiple times

**Solutions:**
1. Extension prevents duplicates within 7 days normally
2. Delete duplicates manually using 🗑️ icon
3. If happening repeatedly, report as a bug

### LinkedIn Detection Issues

**Problem:** LinkedIn Easy Apply not detected

**Solutions:**
1. LinkedIn changes their UI frequently
2. Make sure you complete the entire application
3. Don't close the tab mid-application
4. Check console for "[Job Tracker]" messages
5. Report if selectors need updating

### GitHub Jobs Not Tracking

**Problem:** Applied via GitHub but not tracked

**Solutions:**
1. Make sure you're on a job board repo (like SimplifyJobs)
2. Click "Apply" from the table view
3. Application tracks when you click the link
4. External site applications may need manual entry

### Storage Issues

**Problem:** "Storage quota exceeded" error

**Solutions:**
1. Export your applications to CSV
2. Delete old/rejected applications
3. Chrome gives extensions limited storage
4. Consider archiving old applications

### Privacy Concerns

**Problem:** Worried about data security

**Solutions:**
1. All data stays local - nothing sent to servers
2. Review the source code (it's open source)
3. Data stored in Chrome's local storage only
4. Export and backup regularly

## Getting Help

If none of these solutions work:

1. **Check GitHub Issues:** Someone may have reported it
2. **Open a New Issue:** Use the bug report template
3. **Include Details:**
   - Chrome version
   - Operating system
   - Console errors
   - Steps to reproduce

## Reporting Bugs

When reporting a bug, include:

```
**Browser:** Chrome 120.x.x
**OS:** macOS 14 / Windows 11 / Linux
**Extension Version:** 1.1.0

**Steps to Reproduce:**
1. Go to...
2. Click...
3. See error

**Expected:** What should happen
**Actual:** What actually happened

**Console Errors:**
[Paste any errors from F12 console]
```

## Feature Requests

Have an idea? Open a feature request issue!

## Platform Support Requests

Want us to support a new job site? Use the platform request template!
