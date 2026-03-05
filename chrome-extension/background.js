// Background service worker for the Job Application Tracker extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'saveApplication') {
        saveApplication(message.data)
            .then(() => {
                sendResponse({ success: true });

                // Show Chrome notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon48.png',
                    title: 'Job Application Tracked',
                    message: `${message.data.company} - ${message.data.position}`,
                    priority: 2
                });
            })
            .catch((error) => {
                console.error('Error saving application:', error);
                sendResponse({ success: false, error: error.message });
            });

        return true; // Keep the message channel open for async response
    }

    if (message.action === 'getApplications') {
        getApplications()
            .then((apps) => {
                sendResponse({ success: true, applications: apps });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    if (message.action === 'deleteApplication') {
        deleteApplication(message.id)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }

    if (message.action === 'updateApplication') {
        updateApplication(message.id, message.data)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});

// Save application to Chrome storage
async function saveApplication(jobInfo) {
    try {
        // Get existing applications
        const result = await chrome.storage.local.get(['applications']);
        const applications = result.applications || [];

        // Check for duplicates (same company and position within last 7 days)
        const isDuplicate = applications.some(app => {
            const isSameJob = app.company === jobInfo.company &&
                            app.position === jobInfo.position;
            const isRecent = (Date.now() - new Date(app.dateApplied).getTime()) < (7 * 24 * 60 * 60 * 1000);
            return isSameJob && isRecent;
        });

        if (isDuplicate) {
            console.log('Duplicate application detected, skipping');
            return;
        }

        // Create new application
        const newApplication = {
            id: Date.now(),
            company: jobInfo.company,
            position: jobInfo.position,
            location: jobInfo.location || '',
            source: jobInfo.source || 'Other',
            status: 'Applied',
            applicationUrl: jobInfo.applicationUrl || '',
            notes: 'Auto-tracked from browser',
            dateApplied: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            autoTracked: true
        };

        // Add to beginning of array
        applications.unshift(newApplication);

        // Save back to storage
        await chrome.storage.local.set({ applications });

        console.log('Application saved:', newApplication);
    } catch (error) {
        console.error('Error in saveApplication:', error);
        throw error;
    }
}

// Get all applications
async function getApplications() {
    const result = await chrome.storage.local.get(['applications']);
    return result.applications || [];
}

// Delete application
async function deleteApplication(id) {
    const result = await chrome.storage.local.get(['applications']);
    const applications = result.applications || [];

    const filtered = applications.filter(app => app.id !== id);
    await chrome.storage.local.set({ applications: filtered });
}

// Update application
async function updateApplication(id, data) {
    const result = await chrome.storage.local.get(['applications']);
    const applications = result.applications || [];

    const index = applications.findIndex(app => app.id === id);
    if (index !== -1) {
        applications[index] = {
            ...applications[index],
            ...data,
            lastUpdated: new Date().toISOString()
        };
        await chrome.storage.local.set({ applications });
    }
}

// Sync applications between extension and local tracker
// This allows the web app to access the same data
async function syncApplications() {
    try {
        const result = await chrome.storage.local.get(['applications']);
        const applications = result.applications || [];

        // Store in a way that can be accessed by the web app
        // (This requires the web app to be updated to read from Chrome storage)
        console.log('Applications synced:', applications.length);
    } catch (error) {
        console.error('Error syncing applications:', error);
    }
}

// Run sync periodically
chrome.alarms.create('syncApplications', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncApplications') {
        syncApplications();
    }
});

// Initial sync on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('Job Application Tracker extension installed');
    syncApplications();
});

// Performance optimization: Cache recent applications
let applicationCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

async function getCachedApplications() {
    const now = Date.now();
    if (applicationCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return applicationCache;
    }
    
    const result = await chrome.storage.local.get(['applications']);
    applicationCache = result.applications || [];
    cacheTimestamp = now;
    return applicationCache;
}

// Clear cache when applications are modified
function clearCache() {
    applicationCache = null;
    cacheTimestamp = 0;
}
