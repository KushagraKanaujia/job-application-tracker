# Contributing to Job Application Tracker

First off, thank you for considering contributing! This tool exists to help job seekers stay organized, and every contribution makes it better for everyone.

## Ways to Contribute

### 1. Add Support for New Platforms

The most impactful contribution is adding auto-detection for new job sites. If you've used a platform that isn't supported, help others by adding it!

**Current gaps:**
- AngelList/Wellfound
- Dice
- ZipRecruiter
- Monster
- Remote.co
- We Work Remotely
- More ATS platforms (Jobvite, iCIMS, Taleo, etc.)

### 2. Improve Existing Detectors

Job sites change their HTML structure frequently. If a detector breaks:
- Update the selectors
- Add fallback detection methods
- Improve reliability

### 3. Bug Fixes

Found a bug? Fix it and submit a PR! Check the [Issues](https://github.com/yourusername/job-application-tracker/issues) page for known bugs.

### 4. New Features

Ideas for new features:
- Dark mode
- Statistics and charts
- Email parsing
- Interview reminders
- Salary tracking
- Application templates
- Follow-up tracking

### 5. Documentation

Help others use the tool:
- Write guides
- Create video tutorials
- Translate to other languages
- Improve installation instructions

### 6. Testing

Test the extension on different platforms and report issues.

---

## Getting Started

### Prerequisites

- Google Chrome browser
- Basic knowledge of JavaScript
- Text editor (VS Code, Sublime, etc.)
- Git installed

### Setup for Development

1. **Fork the repository**
   - Click "Fork" button on GitHub
   - Clone your fork locally

```bash
git clone https://github.com/YOUR_USERNAME/job-application-tracker.git
cd job-application-tracker
```

2. **Load the extension in Chrome**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension/` folder

3. **Make your changes**
   - Edit the relevant files
   - Reload the extension to test changes

4. **Test thoroughly**
   - Visit supported job sites
   - Try applying to jobs (or simulate it)
   - Check console for errors (F12)
   - Verify data is saved correctly

---

## Adding a New Platform

### Step 1: Identify the Platform

Research the job site:
- What's the URL pattern? (e.g., `*.greenhouse.io`, `linkedin.com`)
- What triggers an application? (form submit, button click)
- Where is the job info? (company name, position, location)

### Step 2: Update manifest.json

Add the domain to `host_permissions`:

```json
"host_permissions": [
    "https://www.newsite.com/*",
    // ... other sites
]
```

### Step 3: Add Detection Logic

In `chrome-extension/content.js`, add your detector:

```javascript
extractNewSiteJob() {
    try {
        // Find elements using querySelector
        const company = document.querySelector('.company-selector')?.textContent.trim();
        const position = document.querySelector('.job-title-selector')?.textContent.trim();
        const location = document.querySelector('.location-selector')?.textContent.trim();

        // Validate we got the essentials
        if (company && position) {
            return {
                company,
                position,
                location: location || '',
                source: 'NewSite',
                applicationUrl: window.location.href.split('?')[0]
            };
        }
    } catch (error) {
        console.error('[Job Tracker] Error extracting NewSite job:', error);
    }
    return null;
}
```

### Step 4: Wire It Up

Update the `detectSite()` method:

```javascript
detectSite() {
    const hostname = window.location.hostname;
    // ... existing checks
    if (hostname.includes('newsite.com')) return 'newsite';
    return 'unknown';
}
```

Update the `extractJobInfo()` method:

```javascript
extractJobInfo() {
    switch (this.currentSite) {
        // ... existing cases
        case 'newsite':
            return this.extractNewSiteJob();
        default:
            return this.extractGenericJob();
    }
}
```

### Step 5: Test

1. Go to the job site
2. Open DevTools Console (F12)
3. Look for `[Job Tracker]` messages
4. Click "Apply" or submit an application
5. Verify the green notification appears
6. Check extension popup to confirm it was saved

### Step 6: Document

Add your platform to the README under "Supported Platforms".

---

## Code Style

### JavaScript

- Use ES6+ features (const, let, arrow functions, etc.)
- Meaningful variable names
- Add comments for complex logic
- Handle errors gracefully

**Good:**
```javascript
extractJobTitle() {
    try {
        // Try primary selector first
        const title = document.querySelector('.job-title')?.textContent.trim();
        if (title) return title;

        // Fallback to meta tag
        const metaTitle = document.querySelector('meta[property="og:title"]')?.content;
        return metaTitle || 'Unknown Position';
    } catch (error) {
        console.error('[Job Tracker] Error extracting title:', error);
        return 'Unknown Position';
    }
}
```

**Bad:**
```javascript
function getTitle() {
    var t = document.querySelector('.job-title').textContent; // Can crash
    return t;
}
```

### CSS

- Use CSS Grid and Flexbox for layouts
- Maintain existing color scheme
- Ensure responsive design
- Test on different screen sizes

### HTML

- Semantic HTML5 elements
- Accessible markup (ARIA labels where appropriate)
- Clean, indented structure

---

## Debugging Tips

### Console Logging

The extension logs useful info:

```javascript
console.log('[Job Tracker] Initializing on:', this.currentSite);
console.log('[Job Tracker] Saving application:', jobInfo);
```

Watch for these in DevTools Console.

### Selector Testing

Test selectors in the browser console:

```javascript
// On the job site, open console and test:
document.querySelector('.company-name')?.textContent
document.querySelector('.job-title')?.textContent
```

### Extension Debugging

1. Go to `chrome://extensions/`
2. Find Job Application Tracker
3. Click "Inspect views: background page" (for background.js)
4. Click "Inspect" on any page (for content.js)

### Testing Application Flow

1. Add `console.log()` statements in your code
2. Reload extension
3. Visit job site and apply
4. Watch console for your logs
5. Check extension popup for saved data

---

## Pull Request Process

### Before Submitting

- [ ] Test your changes thoroughly
- [ ] Add console logging for debugging
- [ ] Update documentation (README, etc.)
- [ ] Ensure no errors in browser console
- [ ] Verify the extension still loads

### Submitting

1. **Create a branch**
   ```bash
   git checkout -b feature/add-newsite-support
   ```

2. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add support for NewSite job applications"
   ```

3. **Push to your fork**
   ```bash
   git push origin feature/add-newsite-support
   ```

4. **Open a Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Describe your changes
   - Reference any related issues

### PR Description Template

```markdown
## Description
Brief description of what you changed

## Type of Change
- [ ] Bug fix
- [ ] New feature (platform support)
- [ ] Documentation update
- [ ] UI improvement

## Platform Added (if applicable)
- **Site Name:** NewSite
- **URL:** https://newsite.com
- **Detection Method:** Form submission / Button click

## Testing
- [ ] Tested on Chrome
- [ ] Verified application is saved
- [ ] Checked for console errors
- [ ] Updated documentation

## Screenshots (if UI change)
[Add screenshots here]
```

---

## Issue Guidelines

### Bug Reports

Use this template:

```markdown
## Bug Description
What's broken?

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- Chrome version:
- Extension version:
- Operating System:

## Console Errors
Paste any errors from DevTools console
```

### Feature Requests

Use this template:

```markdown
## Feature Description
What feature do you want?

## Use Case
Why is this useful?

## Proposed Implementation
How might this work?

## Alternatives Considered
Other ways to solve this?
```

### Platform Support Requests

```markdown
## Platform Name
Name of the job site

## URL
Link to the job site

## Why It's Needed
How popular is this platform?

## Notes
Any special considerations?
```

---

## Code of Conduct

### Our Pledge

We're building a tool to help job seekers. Be kind, respectful, and supportive.

### Expected Behavior

- Be welcoming to newcomers
- Respect differing viewpoints
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Publishing private information

---

## Questions?

- **General questions:** Open a [Discussion](https://github.com/yourusername/job-application-tracker/discussions)
- **Bug reports:** Open an [Issue](https://github.com/yourusername/job-application-tracker/issues)
- **Want to chat:** Comment on existing issues

---

## Recognition

All contributors will be acknowledged in the README. Thank you for making job hunting easier for everyone!

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Development Setup

### Local Development

1. Clone the repository
2. Make changes to the code
3. Load extension in Chrome (chrome://extensions → Load unpacked)
4. Test your changes
5. Reload extension to see updates

### Testing Checklist

Before submitting a PR:

- [ ] Extension loads without errors
- [ ] No console errors in browser
- [ ] Feature works as expected
- [ ] Doesn't break existing functionality
- [ ] Code is well-commented
- [ ] Documentation updated if needed

### Commit Messages

Use clear, descriptive commit messages:

- ✅ "Add Indeed.com application detection"
- ✅ "Fix LinkedIn selector for job title"
- ✅ "Improve error handling in background.js"
- ❌ "fix bug"
- ❌ "update"
- ❌ "changes"

