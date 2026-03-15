// Popup script for Job Application Tracker extension

document.addEventListener('DOMContentLoaded', () => {
    loadApplications();
    setupEventListeners();
});

function setupEventListeners() {
    // Toggle manual form
    document.getElementById('toggleForm').addEventListener('click', () => {
        const form = document.getElementById('manualForm');
        form.classList.toggle('hidden');
    });

    // Add manual application
    document.getElementById('addManual').addEventListener('click', () => {
        addManualApplication();
    });

    // Open full tracker
    document.getElementById('openTracker').addEventListener('click', () => {
        const trackerPath = 'file:///Users/kush/job-application-tracker/index.html';
        chrome.tabs.create({ url: trackerPath });
    });

    // Export data
    document.getElementById('exportData').addEventListener('click', () => {
        exportToCSV();
    });
}

async function loadApplications() {
    try {
        const result = await chrome.storage.local.get(['applications']);
        const applications = result.applications || [];

        updateStats(applications);
        renderApplications(applications);
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

function updateStats(applications) {
    const total = applications.length;

    // Today's applications
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayApps = applications.filter(app => {
        const appDate = new Date(app.dateApplied);
        appDate.setHours(0, 0, 0, 0);
        return appDate.getTime() === today.getTime();
    }).length;

    // This week's applications
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekApps = applications.filter(app => {
        return new Date(app.dateApplied) >= weekAgo;
    }).length;

    // Auto-tracked applications
    const autoTracked = applications.filter(app => app.autoTracked).length;

    document.getElementById('totalApps').textContent = total;
    document.getElementById('todayApps').textContent = todayApps;
    document.getElementById('weekApps').textContent = weekApps;
    document.getElementById('autoTracked').textContent = autoTracked;
}

function renderApplications(applications) {
    const container = document.getElementById('applicationsList');

    if (applications.length === 0) {
        container.innerHTML = '<div class="no-applications">No applications tracked yet.</div>';
        return;
    }

    // Show only the 5 most recent
    const recentApps = applications.slice(0, 5);

    container.innerHTML = recentApps.map(app => `
        <div class="application-item">
            <div class="app-company">${escapeHtml(app.company)}</div>
            <div class="app-position">${escapeHtml(app.position)}</div>
            <div class="app-meta">
                <span class="app-source">${app.source}</span>
                <span class="app-date">${formatDate(app.dateApplied)}</span>
            </div>
        </div>
    `).join('');
}

async function addManualApplication() {
    const company = document.getElementById('company').value.trim();
    const position = document.getElementById('position').value.trim();

    if (!company || !position) {
        alert('Please fill in both company and position');
        return;
    }

    const jobInfo = {
        company,
        position,
        location: '',
        source: 'Manual Entry',
        status: 'Applied',
        applicationUrl: '',
        notes: 'Manually added from extension',
        dateApplied: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        autoTracked: false
    };

    try {
        await chrome.runtime.sendMessage({
            action: 'saveApplication',
            data: jobInfo
        });

        // Clear form
        document.getElementById('company').value = '';
        document.getElementById('position').value = '';
        document.getElementById('manualForm').classList.add('hidden');

        // Reload applications
        loadApplications();

        // Show success message
        showNotification('Application added successfully!');
    } catch (error) {
        console.error('Error adding application:', error);
        alert('Error adding application. Please try again.');
    }
}

async function exportToCSV() {
    try {
        const result = await chrome.storage.local.get(['applications']);
        const applications = result.applications || [];

        if (applications.length === 0) {
            alert('No applications to export!');
            return;
        }

        const headers = ['Company', 'Position', 'Location', 'Status', 'Source', 'Date Applied', 'Application URL', 'Notes', 'Auto-tracked'];
        const csvContent = [
            headers.join(','),
            ...applications.map(app => [
                csvEscape(app.company),
                csvEscape(app.position),
                csvEscape(app.location || ''),
                csvEscape(app.status),
                csvEscape(app.source),
                formatDate(app.dateApplied),
                csvEscape(app.applicationUrl || ''),
                csvEscape(app.notes || ''),
                app.autoTracked ? 'Yes' : 'No'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        // Download the file
        chrome.downloads.download({
            url: url,
            filename: `job-applications-${new Date().toISOString().split('T')[0]}.csv`,
            saveAs: true
        });

        showNotification('Export started!');
    } catch (error) {
        console.error('Error exporting:', error);
        alert('Error exporting data. Please try again.');
    }
}

function csvEscape(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

function showNotification(message) {
    // Could add a toast notification here
    console.log(message);
}

// Add statistics breakdown
function renderDetailedStats(applications) {
    const statusBreakdown = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
    }, {});
    
    console.log('Status breakdown:', statusBreakdown);
    // Will be used for future stats visualizations
}
