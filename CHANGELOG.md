# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-11-03

### Fixed
- Dashboard did not load: `index.html` pointed at missing `styles-v2.css` / `app-v2.js`, and `app.js` had a syntax error
- `content.js` syntax error (methods outside the class) stopped auto-tracking on every site
- Background service worker crashed on `chrome.alarms` without the `alarms` permission
- Popup "Open Full Tracker" used a hard-coded `file:///Users/...` path; CSV export used `chrome.downloads` without permission
- Icons were 1x1 placeholder PNGs
- Page text shown in the on-page notification is no longer parsed as HTML
- Manual entries from the popup were marked as auto-tracked
- GitHub: no longer records a job when any "Submit" button is clicked; tracks "Apply" links in job tables instead

### Added
- Dashboard now ships inside the extension (`chrome-extension/dashboard/`) and reads `chrome.storage` live
- Interview calendar, resume vault (IndexedDB), analytics charts (Chart.js), dark mode, in-card status changes
- ZipRecruiter and Dice extractors wired up
- Live demo with sample data, landing page, release zip, build scripts

## [1.0.0] - 2025-01-15

### Added
- Initial release of Job Application Tracker
- Chrome extension for automatic application tracking
- Web dashboard for managing applications
- Support for LinkedIn, GitHub, Indeed, Glassdoor
- Support for Greenhouse, Lever, Workable, SmartRecruiters ATS
- Search and filter functionality
- CSV export feature
- Local storage with privacy focus

### Features
- Auto-detection of job applications
- Manual application entry
- Real-time statistics
- Edit and delete applications
- Status tracking (Applied, Interview, Offer, Rejected)
- Duplicate prevention
- Browser notifications

## Future Releases

See [README.md](README.md) roadmap section for planned features.


## [1.1.0] - 2026-02-22

### Added
- ZipRecruiter platform support
- Dice.com platform support
- Keyboard shortcuts (Cmd+K for search, Cmd+N for new)
- FAQ documentation
- Dark mode CSS foundation

### Improved
- Mobile responsiveness for small screens
- README documentation with recent updates

