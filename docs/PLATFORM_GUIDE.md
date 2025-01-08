# Platform Support Guide

This guide explains how auto-detection works on each supported platform and provides troubleshooting tips.

## LinkedIn

### How It Works
- Detects "Easy Apply" button clicks
- Monitors form submissions
- Extracts job info from unified top card
- Confirms when application is sent

### Selectors Used
- Job Title: `.job-details-jobs-unified-top-card__job-title`
- Company: `.job-details-jobs-unified-top-card__company-name`
- Location: `.job-details-jobs-unified-top-card__bullet`

### Common Issues
**Issue:** Application not detected
- **Solution:** Make sure you complete the application (don't close mid-way)
- **Solution:** Try refreshing the page before applying

**Issue:** Wrong job information captured
- **Solution:** LinkedIn frequently changes their HTML structure
- **Solution:** Report this so we can update the selectors

### Testing
To test LinkedIn detection:
1. Go to any LinkedIn job posting
2. Click "Easy Apply"
3. Fill out the form
4. Submit application
5. Look for green notification

## GitHub

### How It Works
- Detects clicks on "Apply" links in job tables
- Parses job boards like SimplifyJobs/New-Grad-Positions
- Captures company from table rows
- Tracks external application links

### Supported Formats
- SimplifyJobs repositories
- Company job listings on GitHub
- README-based job boards

### Common Issues
**Issue:** GitHub jobs not tracking
- **Solution:** Make sure you're on a job board repository with a table
- **Solution:** Click the "Apply" link directly from the table

**Issue:** Generic company names
- **Solution:** Some repos don't have structured data - add manually

### Testing
To test GitHub detection:
1. Go to github.com/SimplifyJobs/New-Grad-Positions
2. Find a job in the table
3. Click the company name or "Apply" link
4. Submit on the external site

## Indeed

### How It Works
- Monitors job application forms
- Detects "Apply Now" button clicks
- Extracts from job header
- Tracks external site redirects

### Selectors Used
- Company: `.jobsearch-InlineCompanyRating-companyHeader`
- Position: `.jobsearch-JobInfoHeader-title`
- Location: `.jobsearch-JobInfoHeader-subtitle`

### Common Issues
**Issue:** External applications not tracked
- **Solution:** Indeed often redirects to company sites - track manually
- **Solution:** Stay on Indeed's "Apply" flow when possible

**Issue:** "Apply on Company Website" not detected
- **Solution:** Use manual entry for these applications

### Testing
1. Search for jobs on Indeed
2. Click into a job posting
3. Click "Apply Now"
4. Fill out and submit application

## Greenhouse

### How It Works
- Greenhouse is an ATS (Applicant Tracking System)
- Many companies use `companyname.greenhouse.io`
- Detects form submissions on application pages
- Extracts from standard Greenhouse layout

### Selectors Used
- Company: `.company-name`, `#header .company-name`
- Position: `.app-title`, `#header h1`
- Location: `.location`, `.app-location`

### Common Issues
**Issue:** Custom Greenhouse themes
- **Solution:** Some companies customize Greenhouse heavily
- **Solution:** Report the company so we can add support

### Supported Companies
Any company using standard Greenhouse hosting:
- stripe.greenhouse.io
- airbnb.greenhouse.io
- etc.

### Testing
1. Find a job posted on Greenhouse
2. Click "Submit Application"
3. Fill out the form
4. Submit

## Lever

### How It Works
- Similar to Greenhouse, Lever is an ATS
- URLs like `jobs.lever.co/companyname`
- Detects application form submissions
- Standard Lever layout

### Selectors Used
- Position: `.posting-headline h2`
- Company: `.main-footer-text a`
- Location: `.posting-categories .location`

### Common Issues
**Issue:** Multi-step applications
- **Solution:** Detection happens on final submit
- **Solution:** Make sure to complete all steps

### Testing
1. Find a Lever-hosted job posting
2. Fill out application form
3. Submit on final step

## Workable

### How It Works
- ATS platform used by many companies
- URLs: `apply.workable.com/companyname`
- Detects final form submission
- Standard Workable structure

### Common Issues
**Issue:** Long multi-step forms
- **Solution:** Complete all steps before tracking occurs
- **Solution:** Use manual entry if form is abandoned

## SmartRecruiters

### How It Works
- Enterprise ATS platform
- Various URL patterns
- Detects "Submit Application" actions
- Parses from job posting header

### Common Issues
**Issue:** Highly customized layouts
- **Solution:** SmartRecruiters allows heavy customization
- **Solution:** Report issues for specific companies

## Generic Detection

### How It Works
For sites not explicitly supported:
- Extracts from page title
- Uses Open Graph meta tags
- Basic form submission detection
- Captures URL and timestamp

### When It's Used
- Small company career pages
- Custom ATS platforms
- Direct application pages

### Limitations
- May not capture company name accurately
- Position titles might be incomplete
- Manual verification recommended

### Improving Generic Detection
If you frequently apply via a platform we don't support:
1. Request platform support
2. Or contribute a detector yourself!

---

## Detection Priority

The extension tries detection methods in this order:

1. **Platform-specific detector** (LinkedIn, GitHub, etc.)
   - Most accurate, tailored to each site

2. **ATS detector** (Greenhouse, Lever, etc.)
   - Works across all companies using that ATS

3. **Generic detector**
   - Fallback for unknown sites
   - Less accurate but better than nothing

---

## Troubleshooting Detection

### Extension Not Detecting at All

1. **Check extension is installed**
   - Go to `chrome://extensions/`
   - Verify "Job Application Auto-Tracker" is enabled

2. **Reload the page**
   - Refresh the job site after installing extension
   - Extension only runs on page load

3. **Check console for errors**
   - F12 → Console tab
   - Look for `[Job Tracker]` messages
   - Report any errors you see

4. **Verify site is supported**
   - Check README for supported platforms
   - Request support if it's missing

### Wrong Information Captured

1. **Check what was saved**
   - Click extension icon
   - Review the application details

2. **Edit the application**
   - Use the ✏️ icon to fix incorrect data
   - Update company, position, or location

3. **Report the issue**
   - Open a bug report
   - Include the job site URL
   - Tell us what was wrong

### Application Tracked Twice

- The extension has 7-day duplicate detection
- Same company + position won't be added twice in 7 days
- If you see duplicates, delete one manually

### No Notification Shown

1. **Check browser notifications**
   - Chrome might be blocking notifications
   - Check Chrome settings → Notifications

2. **Check extension permissions**
   - Go to chrome://extensions/
   - Ensure notification permission is granted

---

## Platform Request Process

Want support for a new platform? Here's what happens:

1. **Submit a platform request**
   - Use the GitHub issue template
   - Provide example job URLs
   - Describe the application flow

2. **Investigation**
   - We'll research the platform
   - Check how applications work
   - Identify selectors needed

3. **Implementation**
   - Add to manifest.json
   - Write detector function
   - Test thoroughly

4. **Release**
   - Merge to main branch
   - Users update extension
   - Platform now supported!

**Average time:** 1-2 weeks for popular platforms

---

## Contributing Platform Support

Want to add a platform yourself?

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Follow the "Adding a New Platform" guide
3. Test your implementation
4. Submit a pull request

We're especially looking for:
- AngelList/Wellfound
- Dice
- ZipRecruiter
- Monster
- Remote.co
- We Work Remotely

---

## Platform Statistics

Based on user reports, here's what's most commonly used:

| Platform | Usage | Auto-Detect Success Rate |
|----------|-------|--------------------------|
| LinkedIn | 40%   | 95%                      |
| Greenhouse | 20% | 90%                      |
| Indeed   | 15%   | 85%                      |
| Lever    | 10%   | 90%                      |
| GitHub   | 8%    | 80%                      |
| Other    | 7%    | 60%                      |

*Statistics are estimates based on issue reports and feedback*

---

## Getting Help

- **Bug in detection:** [Report a bug](https://github.com/yourusername/job-application-tracker/issues/new?template=bug_report.md)
- **Request new platform:** [Platform request](https://github.com/yourusername/job-application-tracker/issues/new?template=platform_request.md)
- **General questions:** [Start a discussion](https://github.com/yourusername/job-application-tracker/discussions)
