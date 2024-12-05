// Content script that detects job applications on various job sites

class JobApplicationDetector {
    constructor() {
        this.currentSite = this.detectSite();
        this.init();
    }

    detectSite() {
        const hostname = window.location.hostname;

        if (hostname.includes('linkedin.com')) return 'linkedin';
        if (hostname.includes('github.com')) return 'github';
        if (hostname.includes('indeed.com')) return 'indeed';
        if (hostname.includes('glassdoor.com')) return 'glassdoor';
        if (hostname.includes('greenhouse.io')) return 'greenhouse';
        if (hostname.includes('lever.co')) return 'lever';
        if (hostname.includes('workable.com')) return 'workable';
        if (hostname.includes('smartrecruiters.com')) return 'smartrecruiters';

        return 'unknown';
    }

    init() {
        console.log('[Job Tracker] Initializing on:', this.currentSite);

        // Listen for application submissions
        this.observeApplications();

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'getJobInfo') {
                const jobInfo = this.extractJobInfo();
                sendResponse(jobInfo);
            }
        });
    }

    observeApplications() {
        // Watch for form submissions and button clicks
        document.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        }, true);

        document.addEventListener('click', (e) => {
            this.handleClick(e);
        }, true);
    }

    handleFormSubmit(event) {
        const form = event.target;

        // Check if this looks like a job application form
        if (this.isApplicationForm(form)) {
            const jobInfo = this.extractJobInfo();
            if (jobInfo) {
                this.saveApplication(jobInfo);
            }
        }
    }

    handleClick(event) {
        const target = event.target;
        const button = target.closest('button');

        if (!button) return;

        const buttonText = button.textContent.toLowerCase();

        // Detect "Apply" button clicks
        if (this.isApplyButton(buttonText)) {
            setTimeout(() => {
                const jobInfo = this.extractJobInfo();
                if (jobInfo) {
                    // Store temporarily and wait for actual submission
                    this.pendingApplication = jobInfo;
                }
            }, 500);
        }

        // Detect submission buttons
        if (this.isSubmitButton(buttonText)) {
            if (this.pendingApplication) {
                this.saveApplication(this.pendingApplication);
                this.pendingApplication = null;
            } else {
                const jobInfo = this.extractJobInfo();
                if (jobInfo) {
                    this.saveApplication(jobInfo);
                }
            }
        }
    }

    isApplicationForm(form) {
        const formText = form.textContent.toLowerCase();
        const formAction = form.action.toLowerCase();

        return formText.includes('apply') ||
               formText.includes('submit application') ||
               formAction.includes('apply') ||
               formAction.includes('application');
    }

    isApplyButton(text) {
        return text.includes('apply') ||
               text.includes('easy apply') ||
               text.includes('quick apply');
    }

    isSubmitButton(text) {
        return text.includes('submit') ||
               text.includes('send application') ||
               text.includes('review application');
    }

    extractJobInfo() {
        switch (this.currentSite) {
            case 'linkedin':
                return this.extractLinkedInJob();
            case 'github':
                return this.extractGitHubJob();
            case 'indeed':
                return this.extractIndeedJob();
            case 'greenhouse':
                return this.extractGreenhouseJob();
            case 'lever':
                return this.extractLeverJob();
            default:
                return this.extractGenericJob();
        }
    }

    extractLinkedInJob() {
        try {
            let company = '';
            let position = '';
            let location = '';

            // Try different selectors for LinkedIn's changing UI
            const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24');
            const companyName = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description a');
            const jobLocation = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .job-details-jobs-unified-top-card__primary-description-container span');

            if (jobTitle) position = jobTitle.textContent.trim();
            if (companyName) company = companyName.textContent.trim();
            if (jobLocation) location = jobLocation.textContent.trim();

            // Fallback: try to get from page title
            if (!company || !position) {
                const titleMatch = document.title.match(/(.+?)\s+[-|]\s+(.+?)\s+[-|]/);
                if (titleMatch) {
                    position = position || titleMatch[1];
                    company = company || titleMatch[2];
                }
            }

            if (company && position) {
                return {
                    company,
                    position,
                    location,
                    source: 'LinkedIn',
                    applicationUrl: window.location.href.split('?')[0]
                };
            }
        } catch (error) {
            console.error('[Job Tracker] Error extracting LinkedIn job:', error);
        }
        return null;
    }

    extractGitHubJob() {
        try {
            // GitHub jobs are usually in repositories like SimplifyJobs/New-Grad-Positions
            const table = document.querySelector('table');
            if (!table) return null;

            // Try to find the currently viewed row or get from URL
            const pathParts = window.location.pathname.split('/');
            const repoName = pathParts[2];

            // For the jobs table, we look for active elements
            const activeRow = document.querySelector('tr.selected, tr:focus-within');

            let company = '';
            let position = repoName.includes('New-Grad') ? 'Software Engineer - New Grad' : 'Software Engineer';
            let location = '';

            if (activeRow) {
                const cells = activeRow.querySelectorAll('td');
                if (cells.length >= 2) {
                    company = cells[0]?.textContent.trim() || '';
                    position = cells[1]?.textContent.trim() || position;
                    location = cells[2]?.textContent.trim() || '';
                }
            }

            return {
                company: company || 'Unknown Company',
                position,
                location,
                source: 'GitHub',
                applicationUrl: window.location.href
            };
        } catch (error) {
            console.error('[Job Tracker] Error extracting GitHub job:', error);
        }
        return null;
    }

    extractIndeedJob() {
        try {
            const company = document.querySelector('.jobsearch-InlineCompanyRating-companyHeader, .jobsearch-CompanyInfoContainer a')?.textContent.trim();
            const position = document.querySelector('.jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title')?.textContent.trim();
            const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle div:last-child, .jobsearch-DesktopStickyContainer-subtitle')?.textContent.trim();

            if (company && position) {
                return {
                    company,
                    position,
                    location: location || '',
                    source: 'Indeed',
                    applicationUrl: window.location.href.split('?')[0]
                };
            }
        } catch (error) {
            console.error('[Job Tracker] Error extracting Indeed job:', error);
        }
        return null;
    }

    extractGreenhouseJob() {
        try {
            const company = document.querySelector('.company-name, #header .company-name')?.textContent.trim();
            const position = document.querySelector('.app-title, #header h1')?.textContent.trim();
            const location = document.querySelector('.location, .app-location')?.textContent.trim();

            if (company && position) {
                return {
                    company,
                    position,
                    location: location || '',
                    source: 'Company Website',
                    applicationUrl: window.location.href.split('?')[0]
                };
            }
        } catch (error) {
            console.error('[Job Tracker] Error extracting Greenhouse job:', error);
        }
        return null;
    }

    extractLeverJob() {
        try {
            const position = document.querySelector('.posting-headline h2')?.textContent.trim();
            const company = document.querySelector('.main-footer-text a')?.textContent.trim();
            const location = document.querySelector('.posting-categories .location')?.textContent.trim();

            if (company && position) {
                return {
                    company,
                    position,
                    location: location || '',
                    source: 'Company Website',
                    applicationUrl: window.location.href.split('?')[0]
                };
            }
        } catch (error) {
            console.error('[Job Tracker] Error extracting Lever job:', error);
        }
        return null;
    }

    extractGenericJob() {
        try {
            // Try to extract from page title and meta tags
            const title = document.title;
            const company = document.querySelector('meta[property="og:site_name"]')?.content;

            return {
                company: company || 'Unknown Company',
                position: title,
                location: '',
                source: 'Other',
                applicationUrl: window.location.href.split('?')[0]
            };
        } catch (error) {
            console.error('[Job Tracker] Error extracting generic job:', error);
        }
        return null;
    }

    saveApplication(jobInfo) {
        console.log('[Job Tracker] Saving application:', jobInfo);

        // Send to background script
        chrome.runtime.sendMessage({
            action: 'saveApplication',
            data: jobInfo
        }, (response) => {
            if (response && response.success) {
                this.showNotification('Job application tracked!', jobInfo.company + ' - ' + jobInfo.position);
            }
        });
    }

    showNotification(title, message) {
        // Create a simple notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
            <div style="font-size: 13px; opacity: 0.9;">${message}</div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.3s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize the detector
new JobApplicationDetector();
