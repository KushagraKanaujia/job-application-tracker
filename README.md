# Job Application Tracker 🎯

> **Stop losing track of where you applied. Start getting organized.**

A free, open-source tool that automatically tracks your job applications as you apply across LinkedIn, GitHub, Indeed, and dozens of other platforms. Everything stays local on your machine - your data, your privacy.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](chrome-extension/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## Why I Built This

If you're job hunting, you know the pain:

- You apply to 10+ jobs a day across different platforms
- A week later, you get an email asking for an interview
- **You have no idea which company it is or what role you applied for**
- You frantically search your email, LinkedIn, and browser history
- Sometimes you miss opportunities because you forgot you even applied

I built this after losing track of applications during my own job search. I'd applied to 100+ positions across LinkedIn, GitHub job boards, company websites, and more. When recruiters reached out, I'd waste 10-15 minutes trying to remember which role it was, what the job description said, and when I applied.

**This tool solves that problem permanently.**

It runs in the background, automatically tracking every application you submit. No more spreadsheets. No more forgotten applications. Just a clean dashboard of everywhere you've applied, with search, filters, and stats.

---

## Features

### 🤖 Automatic Tracking
- **Chrome extension** detects when you submit job applications
- Works on **LinkedIn, GitHub, Indeed, Glassdoor, Greenhouse, Lever**, and more
- Captures company, position, location, URL, and date automatically
- Shows instant confirmation notification when tracked

### 📊 Full Dashboard
- View all your applications in one place
- Search by company or position
- Filter by status (Applied, Interview, Offer, Rejected)
- Filter by source (LinkedIn, GitHub, etc.)
- Real-time statistics (total apps, pending, interviews, offers)

### 🔒 100% Private
- **All data stored locally** on your machine
- No external servers, no tracking, no data collection
- Your applications are YOUR business
- Export to CSV anytime for backup

### ✏️ Easy Management
- Update status as you progress through interviews
- Add notes about salary, recruiters, interview dates
- Edit any application details
- Delete duplicates or mistakes

---

## Screenshots

### Main Dashboard
![Dashboard showing all applications with search and filters](docs/dashboard-preview.png)

### Chrome Extension Popup
![Extension popup showing recent applications and stats](docs/extension-preview.png)

### Automatic Detection in Action
![Green notification when an application is auto-tracked](docs/notification-preview.png)

---

## Quick Start

### 1. Clone or Download

```bash
git clone https://github.com/yourusername/job-application-tracker.git
cd job-application-tracker
```

Or [download the ZIP](https://github.com/yourusername/job-application-tracker/archive/refs/heads/main.zip) and extract it.

### 2. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder
5. Pin the extension to your toolbar

**Detailed guide:** [EXTENSION_INSTALL.md](EXTENSION_INSTALL.md)

### 3. Open the Tracker

Double-click `index.html` or run:

```bash
open index.html
```

### 4. Start Applying!

Just apply to jobs normally on any supported platform. The extension will automatically track them.

---

## Supported Platforms

### Job Boards
✅ **LinkedIn** (Easy Apply + Standard)
✅ **GitHub Jobs** (SimplifyJobs, company repos)
✅ **Indeed**
✅ **Glassdoor**

### Applicant Tracking Systems (ATS)
✅ **Greenhouse** (*.greenhouse.io)
✅ **Lever** (*.lever.co)
✅ **Workable** (*.workable.com)
✅ **SmartRecruiters** (*.smartrecruiters.com)

### Generic Support
✅ **Most company career pages** (basic detection)

**Missing a platform?** [Request it here](https://github.com/yourusername/job-application-tracker/issues/new?template=platform_request.md) or [contribute a detector](#contributing)!

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Job Sites (LinkedIn, GitHub, Indeed, etc.)         │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Content Script (content.js)                        │
│  • Detects job application submissions              │
│  • Extracts company, position, location             │
│  • Sends to background worker                       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Background Worker (background.js)                  │
│  • Validates application data                       │
│  • Checks for duplicates (7-day window)             │
│  • Stores in Chrome local storage                   │
│  • Shows notification                               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Web Dashboard (index.html + app.js)                │
│  • Syncs with extension storage                     │
│  • Displays all applications                        │
│  • Search, filter, edit, export                     │
└─────────────────────────────────────────────────────┘
```

### Detection Logic

Each platform has custom detection logic. For example:

**LinkedIn:**
- Watches for "Easy Apply" button clicks
- Monitors form submissions on job pages
- Extracts job details from the page structure
- Confirms when "Application sent" appears

**GitHub:**
- Detects clicks on "Apply" links in job tables
- Parses repository job boards (like SimplifyJobs)
- Captures company from table rows
- Tracks external application links

**Greenhouse/Lever:**
- Monitors application form submissions
- Parses company name from page header
- Extracts job title and location from posting
- Detects confirmation pages

---

## Usage Guide

### Managing Applications

#### Update Status
1. Click the ✏️ icon on any application
2. Change status (Applied → Interview → Offer)
3. Add notes about interview dates, salary, etc.
4. Save changes

#### Search & Filter
- **Search bar:** Type company or position name
- **Status filter:** Show only interviews, offers, etc.
- **Source filter:** See applications from specific platforms

#### Export Data
Click "Export to CSV" to download all your applications as a spreadsheet. Great for:
- Keeping backups
- Sharing with career counselors
- Analyzing application patterns
- Import into other tools

### Chrome Extension

#### Popup Interface
Click the extension icon to:
- View recent applications
- See statistics (total, today, this week)
- Add applications manually (if auto-detect missed one)
- Export to CSV
- Open full dashboard

#### Manual Entry
If the extension doesn't auto-detect an application:
1. Click extension icon
2. Click "+ Add Application Manually"
3. Enter company and position
4. Click "Add Application"

---

## Privacy & Security

### What We Collect
**Nothing.** Seriously.

### Where Your Data Lives
- **Chrome Extension:** Chrome's local storage (on your machine)
- **Web Dashboard:** Browser's localStorage (on your machine)
- **No cloud, no servers, no external databases**

### What We Track
- **Only job applications you submit**
- The extension only runs on job sites (LinkedIn, GitHub, etc.)
- It does NOT track your browsing on other sites

### Open Source
All code is open and auditable. Check:
- [`chrome-extension/content.js`](chrome-extension/content.js) - What runs on job sites
- [`chrome-extension/background.js`](chrome-extension/background.js) - How data is stored
- [`app.js`](app.js) - Dashboard logic

No tracking scripts, no analytics, no telemetry.

---

## Contributing

Contributions are welcome! This project is built to help job seekers, and the more platforms we support, the better.

### Ways to Contribute

1. **Add platform support** - Add detection for new job sites
2. **Improve detection** - Fix or enhance existing platform detectors
3. **UI improvements** - Better design, dark mode, accessibility
4. **Features** - Stats, charts, reminders, integrations
5. **Documentation** - Guides, videos, translations

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Adding a New Platform

To add support for a new job site:

1. Add the domain to `manifest.json` host_permissions
2. Add detection logic to `content.js`:

```javascript
extractYourSiteJob() {
    try {
        const company = document.querySelector('.company-class')?.textContent.trim();
        const position = document.querySelector('.job-title')?.textContent.trim();
        const location = document.querySelector('.location')?.textContent.trim();

        if (company && position) {
            return {
                company,
                position,
                location: location || '',
                source: 'YourSite',
                applicationUrl: window.location.href.split('?')[0]
            };
        }
    } catch (error) {
        console.error('[Job Tracker] Error extracting YourSite job:', error);
    }
    return null;
}
```

3. Add your site to the `extractJobInfo()` switch statement
4. Test it!
5. Submit a pull request

---

## Roadmap

Future enhancements (contributions welcome!):

- [ ] **Dark mode** for dashboard
- [ ] **Email parsing** - Auto-import from "Application Received" emails
- [ ] **Calendar integration** - Add interview dates to Google Calendar
- [ ] **Salary tracking** - Log salary ranges and offers
- [ ] **Application reminders** - "Follow up after 1 week" notifications
- [ ] **Stats & analytics** - Response rates by platform, time trends
- [ ] **Firefox extension** - Support for Firefox users
- [ ] **Mobile app** - View applications on phone
- [ ] **AI suggestions** - "You haven't heard back in 2 weeks, time to follow up"

---

## FAQ

### Does this work on Firefox/Safari?
Currently Chrome only. Firefox support is planned. Safari has technical limitations that make extensions harder.

### Will this slow down my browser?
No. The extension only runs on job sites and uses minimal resources.

### What if I apply via email or PDF?
Use the manual add feature in the extension popup. Future versions may parse emails automatically.

### Can I import existing applications?
Not yet, but you can manually add past applications. CSV import is planned.

### Is this really free?
Yes. Open source and free forever. No premium features, no upsells.

### Can I use this for internships/freelance?
Absolutely! It works for any type of position.

---

## Troubleshooting

### Extension not detecting applications
- **Reload the page** after installing the extension
- **Check supported platforms** - Not all sites are supported yet
- **Use manual entry** as a backup
- **Report the issue** so we can add support

### Applications not showing in dashboard
- Click "Open Full Tracker" from extension popup
- Wait 10 seconds for auto-sync
- Check browser console for errors (F12 → Console)

### Duplicate applications
The extension automatically prevents duplicates within 7 days. If you see duplicates, delete one using the 🗑️ icon.

---

## Tech Stack

- **Frontend:** Vanilla JavaScript (no frameworks, fast and simple)
- **Styling:** CSS3 with CSS Grid and Flexbox
- **Storage:** Chrome Storage API + localStorage
- **Extension:** Chrome Extension Manifest V3
- **Build:** None needed - pure HTML/CSS/JS

---

## License

MIT License - See [LICENSE](LICENSE) for details.

**TL;DR:** Use it for anything, commercially or personally. Just keep the license notice.

---

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/job-application-tracker/issues)
- **Feature Requests:** [Request a Feature](https://github.com/yourusername/job-application-tracker/issues/new?template=feature_request.md)
- **Platform Support:** [Request Platform Support](https://github.com/yourusername/job-application-tracker/issues/new?template=platform_request.md)

---

## Acknowledgments

Built out of frustration during my own job search. Special thanks to everyone who's ever lost track of where they applied and thought "there has to be a better way."

If this tool helps you land a job, I'd love to hear about it! Open an issue or discussion to share your story.

---

## Star History

If this project helped you, consider giving it a ⭐! It helps others discover the tool.

---

**Good luck with your job search! You've got this.** 🚀
