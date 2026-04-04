// Job Application Tracker - JavaScript

class JobApplicationTracker {
    constructor() {
        this.applications = this.loadApplications();
        this.initializeEventListeners();
        this.renderApplications();
        this.updateStats();
        this.syncWithExtension();
    }

    loadApplications() {
        const stored = localStorage.getItem('jobApplications');
        return stored ? JSON.parse(stored) : [];
    }

    // Sync with Chrome extension if available
    async syncWithExtension() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            try {
                const result = await chrome.storage.local.get(['applications']);
                const extensionApps = result.applications || [];

                if (extensionApps.length > 0) {
                    // Merge extension apps with local storage
                    this.mergeApplications(extensionApps);
                }

                // Set up periodic sync
                setInterval(() => this.syncWithExtension(), 10000); // Sync every 10 seconds
            } catch (error) {
                console.log('Chrome extension not available, using local storage only');
            }
        }
    }

    mergeApplications(extensionApps) {
        const existingIds = new Set(this.applications.map(app => app.id));
        const newApps = extensionApps.filter(app => !existingIds.has(app.id));

        if (newApps.length > 0) {
            this.applications = [...newApps, ...this.applications];
            this.saveApplications();
            this.renderApplications();
            this.updateStats();
        }
    }

    saveApplications() {
        localStorage.setItem('jobApplications', JSON.stringify(this.applications));
    }

    initializeEventListeners() {
        // Add application form
        document.getElementById('applicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addApplication();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => this.renderApplications());
        document.getElementById('filterStatus').addEventListener('change', () => this.renderApplications());
        document.getElementById('filterSource').addEventListener('change', () => this.renderApplications());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToCSV());

        // Modal close
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.closeModal();
            }
        });

        // Edit form
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateApplication();
        });
    }

    addApplication() {
        const application = {
            id: Date.now(),
            company: document.getElementById('company').value,
            position: document.getElementById('position').value,
            location: document.getElementById('location').value,
            source: document.getElementById('source').value,
            status: document.getElementById('status').value,
            applicationUrl: document.getElementById('applicationUrl').value,
            notes: document.getElementById('notes').value,
            dateApplied: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        this.applications.unshift(application);
        this.saveApplications();
        this.renderApplications();
        this.updateStats();

        // Reset form
        document.getElementById('applicationForm').reset();

        // Show success message
        this.showNotification('Application added successfully!');
    }

    deleteApplication(id) {
        if (confirm('Are you sure you want to delete this application?')) {
            this.applications = this.applications.filter(app => app.id !== id);
            this.saveApplications();
            this.renderApplications();
            this.updateStats();
            this.showNotification('Application deleted successfully!');
        }
    }

    editApplication(id) {
        const app = this.applications.find(a => a.id === id);
        if (!app) return;

        // Populate edit form
        document.getElementById('editId').value = app.id;
        document.getElementById('editCompany').value = app.company;
        document.getElementById('editPosition').value = app.position;
        document.getElementById('editLocation').value = app.location || '';
        document.getElementById('editSource').value = app.source;
        document.getElementById('editStatus').value = app.status;
        document.getElementById('editApplicationUrl').value = app.applicationUrl || '';
        document.getElementById('editNotes').value = app.notes || '';

        // Show modal
        document.getElementById('editModal').style.display = 'block';
    }

    updateApplication() {
        const id = parseInt(document.getElementById('editId').value);
        const appIndex = this.applications.findIndex(a => a.id === id);

        if (appIndex === -1) return;

        this.applications[appIndex] = {
            ...this.applications[appIndex],
            company: document.getElementById('editCompany').value,
            position: document.getElementById('editPosition').value,
            location: document.getElementById('editLocation').value,
            source: document.getElementById('editSource').value,
            status: document.getElementById('editStatus').value,
            applicationUrl: document.getElementById('editApplicationUrl').value,
            notes: document.getElementById('editNotes').value,
            lastUpdated: new Date().toISOString()
        };

        this.saveApplications();
        this.renderApplications();
        this.updateStats();
        this.closeModal();
        this.showNotification('Application updated successfully!');
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
    }

    getFilteredApplications() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        const sourceFilter = document.getElementById('filterSource').value;

        return this.applications.filter(app => {
            const matchesSearch = app.company.toLowerCase().includes(search) ||
                                 app.position.toLowerCase().includes(search);
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            const matchesSource = sourceFilter === 'all' || app.source === sourceFilter;

            return matchesSearch && matchesStatus && matchesSource;
        });
    }

    renderApplications() {
        const container = document.getElementById('applicationsList');
        const filteredApps = this.getFilteredApplications();

        if (filteredApps.length === 0) {
            container.innerHTML = '<div class="no-applications">No applications found. Add your first application above!</div>';
            return;
        }

        container.innerHTML = filteredApps.map(app => `
            <div class="application-card">
                <div class="application-header">
                    <div>
                        <h3>${this.escapeHtml(app.company)}</h3>
                        <p class="position">${this.escapeHtml(app.position)}</p>
                    </div>
                    <div class="application-actions">
                        <button class="btn-icon" onclick="tracker.editApplication(${app.id})" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="tracker.deleteApplication(${app.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="application-details">
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="status-badge status-${app.status.toLowerCase().replace(/\s+/g, '-')}">${app.status}</span>
                    </div>
                    ${app.location ? `
                        <div class="detail-item">
                            <span class="detail-label">Location:</span>
                            <span>${this.escapeHtml(app.location)}</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="detail-label">Source:</span>
                        <span>${app.source}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Applied:</span>
                        <span>${this.formatDate(app.dateApplied)}</span>
                    </div>
                    ${app.applicationUrl ? `
                        <div class="detail-item">
                            <span class="detail-label">URL:</span>
                            <a href="${this.escapeHtml(app.applicationUrl)}" target="_blank" rel="noopener">View Application</a>
                        </div>
                    ` : ''}
                    ${app.notes ? `
                        <div class="detail-item notes">
                            <span class="detail-label">Notes:</span>
                            <p>${this.escapeHtml(app.notes)}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const total = this.applications.length;
        const pending = this.applications.filter(a => a.status === 'Pending' || a.status === 'Applied').length;
        const interview = this.applications.filter(a => a.status.includes('Interview')).length;
        const offer = this.applications.filter(a => a.status === 'Offer').length;
        const rejected = this.applications.filter(a => a.status === 'Rejected').length;

        document.getElementById('totalApps').textContent = total;
        document.getElementById('pendingApps').textContent = pending;
        document.getElementById('interviewApps').textContent = interview;
        document.getElementById('offerApps').textContent = offer;
        document.getElementById('rejectedApps').textContent = rejected;
    }

    exportToCSV() {
        if (this.applications.length === 0) {
            alert('No applications to export!');
            return;
        }

        const headers = ['Company', 'Position', 'Location', 'Status', 'Source', 'Date Applied', 'Application URL', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...this.applications.map(app => [
                this.csvEscape(app.company),
                this.csvEscape(app.position),
                this.csvEscape(app.location || ''),
                this.csvEscape(app.status),
                this.csvEscape(app.source),
                this.formatDate(app.dateApplied),
                this.csvEscape(app.applicationUrl || ''),
                this.csvEscape(app.notes || '')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        this.showNotification('Applications exported successfully!');
    }

    csvEscape(str) {
        if (str === null || str === undefined) return '';
        str = String(str);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the tracker
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new JobApplicationTracker();
});

    // Add keyboard shortcuts for power users
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }
            // Cmd/Ctrl + N for new application
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                document.getElementById('company')?.focus();
            }
        });
    }

    // Add sorting functionality
    sortApplications(field, direction = 'desc') {
        this.applications.sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            if (field === 'dateApplied' || field === 'lastUpdated') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });
        
        this.renderApplications();
    }

    // Add data validation before saving
    validateApplication(app) {
        if (!app.company || !app.position) {
            return { valid: false, error: 'Company and position are required' };
        }
        if (app.company.length > 200 || app.position.length > 200) {
            return { valid: false, error: 'Company or position name too long' };
        }
        return { valid: true };
    }
