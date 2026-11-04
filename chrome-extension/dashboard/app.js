// Job Hunt Pro - dashboard logic.
// Runs in two places:
//   1. Inside the Chrome extension (chrome-extension://.../dashboard/index.html):
//      reads and writes the same chrome.storage.local the extension auto-tracks into.
//   2. As a plain web page (e.g. the live demo): uses the browser's localStorage.
// No inline handlers and no remote scripts, so it satisfies the MV3 extension CSP.

(function () {
    'use strict';

    const STATUSES = [
        'Applied', 'Resume Screening', 'Phone Screen', 'Interview Scheduled',
        'Interview Completed', 'Offer', 'Rejected', 'Withdrawn',
    ];
    const PENDING = new Set(['Applied', 'Resume Screening', 'Pending']);
    const INTERVIEWING = new Set(['Phone Screen', 'Interview Scheduled', 'Interview Completed']);
    const BASE_SOURCES = [
        'LinkedIn', 'Indeed', 'GitHub', 'Glassdoor', 'Company Website', 'ZipRecruiter',
        'Dice', 'Referral', 'Recruiter', 'Manual Entry', 'Other',
    ];
    const STATUS_COLORS = {
        'Applied': '#6366f1', 'Resume Screening': '#8b5cf6', 'Phone Screen': '#0ea5e9',
        'Interview Scheduled': '#10b981', 'Interview Completed': '#14b8a6', 'Offer': '#f59e0b',
        'Rejected': '#ef4444', 'Withdrawn': '#94a3b8', 'Pending': '#6366f1',
    };
    const DAY = 24 * 60 * 60 * 1000;
    const LS_KEY = 'jobApplications';
    const MAX_RESUME_BYTES = 5 * 1024 * 1024;

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // ---------- storage ----------
    const isExtension = typeof chrome !== 'undefined' && !!(chrome.storage && chrome.storage.local);

    function safeLS(fn, fallback) {
        try { return fn(); } catch (e) { return fallback; }
    }

    const store = {
        async load() {
            if (isExtension) {
                const r = await chrome.storage.local.get(['applications']);
                return Array.isArray(r.applications) ? r.applications : [];
            }
            return safeLS(() => JSON.parse(localStorage.getItem(LS_KEY) || '[]'), []);
        },
        async save(apps) {
            if (isExtension) {
                await chrome.storage.local.set({ applications: apps });
                return;
            }
            safeLS(() => localStorage.setItem(LS_KEY, JSON.stringify(apps)));
        },
    };

    // ---------- state ----------
    let apps = [];
    let charts = {};
    let currentView = 'dashboard';

    // ---------- helpers ----------
    function esc(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function safeUrl(url) {
        return /^https?:\/\//i.test(url || '') ? url : '';
    }
    function fmtDate(iso, opts) {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('en-US', opts || { year: 'numeric', month: 'short', day: 'numeric' });
    }
    function relTime(iso) {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60 * 1000) return 'just now';
        if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + ' min ago';
        if (diff < DAY) return Math.floor(diff / 3600000) + ' h ago';
        const days = Math.floor(diff / DAY);
        return days === 1 ? 'yesterday' : days + ' days ago';
    }
    function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
    function toLocalInput(iso, withTime) {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d)) return '';
        const pad = (n) => String(n).padStart(2, '0');
        const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        return withTime ? `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}` : date;
    }
    function toast(msg) {
        const t = $('#toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => t.classList.remove('show'), 2600);
    }
    function sameId(a, b) { return String(a) === String(b); }
    function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

    // ---------- theme ----------
    function applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        $('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
        $('.theme-text').textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        if (currentView === 'analytics') renderAnalytics();
    }
    function initTheme() {
        const saved = safeLS(() => localStorage.getItem('jhp-theme'), null);
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(saved || (prefersDark ? 'dark' : 'light'));
        $('#themeToggle').addEventListener('click', () => {
            const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            safeLS(() => localStorage.setItem('jhp-theme', next));
            applyTheme(next);
        });
    }

    // ---------- views ----------
    function showView(view) {
        if (!document.getElementById(view + 'View')) view = 'dashboard';
        currentView = view;
        $$('.view').forEach((v) => v.classList.toggle('active', v.id === view + 'View'));
        $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.view === view));
        if (location.hash !== '#' + view) history.replaceState(null, '', location.pathname + location.search + '#' + view);
        if (view === 'analytics') renderAnalytics();
        if (view === 'resume') renderResumes();
        if (view === 'calendar') renderCalendar();
        window.scrollTo(0, 0);
    }

    // ---------- render ----------
    function renderAll() {
        renderStats();
        renderActivity();
        renderTimeline();
        renderFilters();
        renderApplications();
        renderCalendar();
        if (currentView === 'analytics') renderAnalytics();
        renderDemoBanner();
    }

    function renderStats() {
        const weekAgo = Date.now() - 7 * DAY;
        const total = apps.length;
        const thisWeek = apps.filter((a) => new Date(a.dateApplied).getTime() >= weekAgo).length;
        const pending = apps.filter((a) => PENDING.has(a.status)).length;
        const interviewing = apps.filter((a) => INTERVIEWING.has(a.status)).length;
        const offers = apps.filter((a) => a.status === 'Offer').length;
        const upcoming = apps.filter((a) => a.interviewDate && new Date(a.interviewDate).getTime() >= Date.now()).length;
        const responded = apps.filter((a) => !PENDING.has(a.status) && a.status !== 'Withdrawn').length;
        const responseRate = total ? Math.round((responded / total) * 100) : 0;

        $('#totalApps').textContent = total;
        $('#pendingApps').textContent = pending;
        $('#interviewApps').textContent = interviewing;
        $('#offerApps').textContent = offers;
        $('#appCount').textContent = total;

        $('#totalTrend').textContent = `${thisWeek} added this week`;
        $('#totalTrend').classList.toggle('positive', thisWeek > 0);
        $('#pendingTrend').textContent = total ? `${responseRate}% heard back` : 'Waiting on feedback';
        $('#interviewTrend').textContent = `${upcoming} upcoming`;
        $('#interviewTrend').classList.toggle('positive', upcoming > 0);
        $('#offerTrend').textContent = offers ? 'Nice work!' : 'Keep going!';
        $('#offerTrend').classList.toggle('positive', offers > 0);
    }

    function renderActivity() {
        const list = $('#recentActivity');
        const recent = [...apps]
            .sort((a, b) => new Date(b.lastUpdated || b.dateApplied) - new Date(a.lastUpdated || a.dateApplied))
            .slice(0, 5);
        if (!recent.length) {
            list.innerHTML = `<div class="activity-item"><span class="activity-icon">📝</span>
                <div class="activity-content"><p>No activity yet</p>
                <span class="activity-time">Add your first application to get started.</span></div></div>`;
            return;
        }
        list.innerHTML = recent.map((a) => `
            <div class="activity-item">
                <span class="activity-icon">${a.autoTracked ? '🤖' : '📝'}</span>
                <div class="activity-content">
                    <p><strong>${esc(a.company)}</strong> · ${esc(a.position)}</p>
                    <span class="activity-time"><span class="status-dot" style="background:${STATUS_COLORS[a.status] || '#94a3b8'}"></span>${esc(a.status)} · ${relTime(a.lastUpdated || a.dateApplied)}</span>
                </div>
            </div>`).join('');
    }

    function renderTimeline() {
        const el = $('#timeline');
        if (!apps.length) {
            el.innerHTML = `<div class="timeline-empty"><span>📊</span><p>Your timeline appears here once you start tracking applications.</p></div>`;
            return;
        }
        const days = [];
        const today = new Date(); today.setHours(0, 0, 0, 0);
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today.getTime() - i * DAY);
            const count = apps.filter((a) => {
                const ad = new Date(a.dateApplied); ad.setHours(0, 0, 0, 0);
                return ad.getTime() === d.getTime();
            }).length;
            days.push({ d, count });
        }
        const max = Math.max(1, ...days.map((x) => x.count));
        el.innerHTML = `<div class="spark">${days.map((x) => `
            <div class="spark-col" title="${fmtDate(x.d.toISOString(), { month: 'short', day: 'numeric' })}: ${x.count} application${x.count === 1 ? '' : 's'}">
                <div class="spark-count">${x.count || ''}</div>
                <div class="spark-bar" style="height:${Math.max(4, (x.count / max) * 100)}%"></div>
                <div class="spark-label">${x.d.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
            </div>`).join('')}</div>`;
    }

    function fillSelect(sel, values, keepFirst) {
        const current = sel.value;
        const first = keepFirst ? sel.options[0].outerHTML : '';
        sel.innerHTML = first + values.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
        if ([...sel.options].some((o) => o.value === current)) sel.value = current;
    }

    function renderFilters() {
        const sources = [...new Set([...BASE_SOURCES, ...apps.map((a) => a.source).filter(Boolean)])];
        const statuses = [...new Set([...STATUSES, ...apps.map((a) => a.status).filter(Boolean)])];
        fillSelect($('#filterStatus'), statuses, true);
        fillSelect($('#filterSource'), sources.filter((s) => apps.some((a) => a.source === s)), true);
        fillSelect($('#source'), sources, false);
        fillSelect($('#status'), STATUSES, false);
    }

    function filtered() {
        const q = $('#globalSearch').value.trim().toLowerCase();
        const st = $('#filterStatus').value;
        const src = $('#filterSource').value;
        const sort = $('#sortBy').value;
        const list = apps.filter((a) => {
            const hay = [a.company, a.position, a.location, a.notes, a.source].join(' ').toLowerCase();
            return (!q || hay.includes(q)) && (st === 'all' || a.status === st) && (src === 'all' || a.source === src);
        });
        const byDate = (a, b) => new Date(b.dateApplied) - new Date(a.dateApplied);
        if (sort === 'date-asc') list.sort((a, b) => -byDate(a, b));
        else if (sort === 'company') list.sort((a, b) => String(a.company).localeCompare(b.company));
        else if (sort === 'status') list.sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || byDate(a, b));
        else list.sort(byDate);
        return list;
    }

    function renderApplications() {
        const el = $('#applicationsList');
        const list = filtered();
        $('#resultCount').textContent = `${list.length} of ${apps.length} application${apps.length === 1 ? '' : 's'}`;
        if (!apps.length) {
            el.innerHTML = `<div class="empty-state"><span class="empty-icon">📭</span><h3>No applications yet</h3>
                <p>Click "Quick Add", or install the Chrome extension to auto-track applications as you submit them.</p>
                <button type="button" class="btn-primary" data-action="quick-add">Add your first application</button></div>`;
            return;
        }
        if (!list.length) {
            el.innerHTML = `<div class="empty-state"><span class="empty-icon">🔎</span><h3>No matches</h3><p>Try a different search or filter.</p></div>`;
            return;
        }
        el.innerHTML = list.map((a) => {
            const url = safeUrl(a.applicationUrl);
            const statusOpts = [...new Set([...STATUSES, a.status])].map((s) =>
                `<option value="${esc(s)}"${s === a.status ? ' selected' : ''}>${esc(s)}</option>`).join('');
            return `
            <article class="application-card" data-id="${esc(a.id)}" style="--accent:${STATUS_COLORS[a.status] || '#94a3b8'}">
                <div class="application-header">
                    <div class="company-avatar" aria-hidden="true">${esc(String(a.company || '?').trim().charAt(0).toUpperCase())}</div>
                    <div class="application-title">
                        <h3>${esc(a.company)}</h3>
                        <p class="position">${esc(a.position)}</p>
                    </div>
                    <div class="application-actions">
                        <button type="button" class="btn-icon" data-action="edit" data-id="${esc(a.id)}" title="Edit" aria-label="Edit">✏️</button>
                        <button type="button" class="btn-icon" data-action="delete" data-id="${esc(a.id)}" title="Delete" aria-label="Delete">🗑️</button>
                    </div>
                </div>
                <div class="application-meta">
                    <select class="status-select status-${slug(a.status)}" data-action="status" data-id="${esc(a.id)}" aria-label="Status">${statusOpts}</select>
                    ${a.source ? `<span class="chip">${esc(a.source)}</span>` : ''}
                    ${a.autoTracked ? '<span class="chip chip-auto" title="Captured by the Chrome extension">auto-tracked</span>' : ''}
                </div>
                <ul class="application-details">
                    ${a.location ? `<li>📍 ${esc(a.location)}</li>` : ''}
                    <li>🗓️ Applied ${fmtDate(a.dateApplied)}</li>
                    ${a.interviewDate ? `<li>🎤 Interview ${fmtDate(a.interviewDate, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</li>` : ''}
                    ${a.salary ? `<li>💰 ${esc(a.salary)}</li>` : ''}
                    ${url ? `<li>🔗 <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Job posting</a></li>` : ''}
                </ul>
                ${a.notes ? `<p class="notes">${esc(a.notes)}</p>` : ''}
            </article>`;
        }).join('');
    }

    function renderCalendar() {
        const el = $('#calendarList');
        const withDates = apps.filter((a) => a.interviewDate && !isNaN(new Date(a.interviewDate)))
            .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));
        if (!withDates.length) {
            el.innerHTML = `<div class="empty-state"><span class="empty-icon">📅</span><h3>No interviews scheduled</h3>
                <p>Edit an application and set an "Interview Date" to add it here.</p></div>`;
            return;
        }
        const now = Date.now();
        const upcoming = withDates.filter((a) => new Date(a.interviewDate).getTime() >= now);
        const past = withDates.filter((a) => new Date(a.interviewDate).getTime() < now).reverse();
        const item = (a) => {
            const d = new Date(a.interviewDate);
            return `<div class="cal-item${d.getTime() < now ? ' past' : ''}">
                <div class="cal-date"><span>${d.toLocaleDateString('en-US', { month: 'short' })}</span><strong>${d.getDate()}</strong></div>
                <div class="cal-body"><h4>${esc(a.company)}</h4><p>${esc(a.position)}</p>
                <span class="activity-time">${d.toLocaleDateString('en-US', { weekday: 'long' })} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · ${esc(a.status)}</span></div>
                <button type="button" class="btn-icon" data-action="edit" data-id="${esc(a.id)}" aria-label="Edit">✏️</button>
            </div>`;
        };
        el.innerHTML = `<h3 class="cal-heading">Upcoming (${upcoming.length})</h3>${upcoming.map(item).join('') || '<p class="muted">Nothing upcoming.</p>'}
            ${past.length ? `<h3 class="cal-heading">Past (${past.length})</h3>${past.map(item).join('')}` : ''}`;
    }

    function renderAnalytics() {
        const funnel = $('#funnel');
        const total = apps.length;
        const reached = (set) => apps.filter((a) => set.includes(a.status)).length;
        const steps = [
            ['Applied', total],
            ['Heard back', apps.filter((a) => !PENDING.has(a.status) && a.status !== 'Withdrawn').length],
            ['Interviewing+', reached(['Phone Screen', 'Interview Scheduled', 'Interview Completed', 'Offer'])],
            ['Offers', reached(['Offer'])],
        ];
        funnel.innerHTML = steps.map(([label, n]) => `
            <div class="funnel-row"><span>${label}</span>
            <div class="funnel-bar"><div style="width:${total ? Math.max(2, (n / total) * 100) : 0}%"></div></div>
            <strong>${n}</strong></div>`).join('');

        if (typeof Chart === 'undefined') return;
        const text = cssVar('--text-secondary') || '#64748b';
        const grid = cssVar('--border-color') || '#e2e8f0';
        Chart.defaults.color = text;
        Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;

        const byStatus = {};
        apps.forEach((a) => { byStatus[a.status] = (byStatus[a.status] || 0) + 1; });
        const sLabels = Object.keys(byStatus).sort((a, b) => (STATUSES.indexOf(a) + 99) % 99 - (STATUSES.indexOf(b) + 99) % 99);
        draw('statusChart', {
            type: 'doughnut',
            data: { labels: sLabels, datasets: [{ data: sLabels.map((l) => byStatus[l]), backgroundColor: sLabels.map((l) => STATUS_COLORS[l] || '#94a3b8'), borderWidth: 0 }] },
            options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right' } } },
        });

        const weeks = [];
        const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - start.getDay());
        for (let i = 7; i >= 0; i--) {
            const from = new Date(start.getTime() - i * 7 * DAY);
            const to = from.getTime() + 7 * DAY;
            weeks.push({
                label: fmtDate(from.toISOString(), { month: 'short', day: 'numeric' }),
                n: apps.filter((a) => { const t = new Date(a.dateApplied).getTime(); return t >= from.getTime() && t < to; }).length,
            });
        }
        draw('timeChart', {
            type: 'bar',
            data: { labels: weeks.map((w) => w.label), datasets: [{ label: 'Applications', data: weeks.map((w) => w.n), backgroundColor: '#6366f1', borderRadius: 6 }] },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: grid } }, x: { grid: { display: false } } } },
        });

        const bySource = {};
        apps.forEach((a) => { const s = a.source || 'Other'; bySource[s] = (bySource[s] || 0) + 1; });
        const src = Object.entries(bySource).sort((a, b) => b[1] - a[1]);
        draw('sourceChart', {
            type: 'bar',
            data: { labels: src.map((s) => s[0]), datasets: [{ label: 'Applications', data: src.map((s) => s[1]), backgroundColor: '#8b5cf6', borderRadius: 6 }] },
            options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: grid } }, y: { grid: { display: false } } } },
        });
    }
    function draw(id, config) {
        if (charts[id]) charts[id].destroy();
        charts[id] = new Chart(document.getElementById(id), config);
    }

    // ---------- demo banner ----------
    function renderDemoBanner() {
        const banner = $('#demoBanner');
        const hasSample = apps.some((a) => a.sample);
        $('#storageNote').textContent = isExtension
            ? '🔒 Synced with the extension (chrome.storage, on this device only)'
            : '🔒 Saved in this browser only (localStorage)';
        if (isExtension && !hasSample) { banner.hidden = true; return; }
        banner.hidden = false;
        $('#demoBannerText').textContent = hasSample
            ? 'You are viewing sample data (fictional companies). Your own entries are saved only in this browser.'
            : (isExtension ? '' : 'Live demo: everything you add is saved only in this browser. Install the Chrome extension for auto-tracking.');
        $('[data-action="load-sample"]').hidden = hasSample;
        $('[data-action="clear-sample"]').hidden = !hasSample;
    }

    // ---------- CRUD ----------
    async function persist() {
        await store.save(apps);
        renderAll();
    }

    function openModal(app) {
        const form = $('#applicationForm');
        form.reset();
        $('#editId').value = app ? app.id : '';
        $('#modalTitle').textContent = app ? 'Edit Application' : 'Add New Application';
        $('#submitBtn').textContent = app ? 'Save Changes' : 'Add Application';
        $('#source').value = app && app.source ? app.source : 'LinkedIn';
        $('#status').value = app && STATUSES.includes(app.status) ? app.status : 'Applied';
        $('#dateApplied').value = toLocalInput(app ? app.dateApplied : new Date().toISOString(), false);
        if (app) {
            ['company', 'position', 'location', 'salary', 'applicationUrl', 'notes'].forEach((k) => { $('#' + k).value = app[k] || ''; });
            $('#interviewDate').value = toLocalInput(app.interviewDate, true);
        }
        $('#appModal').classList.add('open');
        setTimeout(() => $('#company').focus(), 50);
    }
    function closeModal() { $('#appModal').classList.remove('open'); }

    async function submitForm(e) {
        e.preventDefault();
        const company = $('#company').value.trim();
        const position = $('#position').value.trim();
        if (!company || !position) { toast('Company and position are required'); return; }
        const dateVal = $('#dateApplied').value;
        const intVal = $('#interviewDate').value;
        const now = new Date().toISOString();
        const fields = {
            company, position,
            location: $('#location').value.trim(),
            source: $('#source').value,
            status: $('#status').value,
            salary: $('#salary').value.trim(),
            applicationUrl: $('#applicationUrl').value.trim(),
            notes: $('#notes').value.trim(),
            interviewDate: intVal ? new Date(intVal).toISOString() : '',
            lastUpdated: now,
        };
        const editId = $('#editId').value;
        if (editId) {
            const i = apps.findIndex((a) => sameId(a.id, editId));
            if (i === -1) return;
            const keepTime = apps[i].dateApplied && toLocalInput(apps[i].dateApplied, false) === dateVal;
            apps[i] = { ...apps[i], ...fields, dateApplied: keepTime ? apps[i].dateApplied : (dateVal ? new Date(dateVal + 'T12:00').toISOString() : apps[i].dateApplied) };
            toast('Application updated');
        } else {
            apps.unshift({
                id: Date.now(), ...fields,
                dateApplied: dateVal && dateVal !== toLocalInput(now, false) ? new Date(dateVal + 'T12:00').toISOString() : now,
                autoTracked: false,
            });
            toast('Application added');
        }
        closeModal();
        await persist();
    }

    async function deleteApp(id) {
        const a = apps.find((x) => sameId(x.id, id));
        if (!a || !confirm(`Delete ${a.company} - ${a.position}?`)) return;
        apps = apps.filter((x) => !sameId(x.id, id));
        toast('Application deleted');
        await persist();
    }

    async function setStatus(id, status) {
        const a = apps.find((x) => sameId(x.id, id));
        if (!a) return;
        a.status = status;
        a.lastUpdated = new Date().toISOString();
        toast(`${a.company}: ${status}`);
        await persist();
    }

    function exportCSV() {
        if (!apps.length) { toast('No applications to export yet'); return; }
        const cell = (v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const headers = ['Company', 'Position', 'Location', 'Status', 'Source', 'Date Applied', 'Interview Date', 'Salary', 'Application URL', 'Notes', 'Auto-tracked'];
        const rows = apps.map((a) => [a.company, a.position, a.location, a.status, a.source, fmtDate(a.dateApplied), a.interviewDate ? new Date(a.interviewDate).toLocaleString('en-US') : '', a.salary, a.applicationUrl, a.notes, a.autoTracked ? 'Yes' : 'No'].map(cell).join(','));
        const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast('Exported CSV');
    }

    async function loadSample() {
        const sample = window.SAMPLE_APPLICATIONS ? window.SAMPLE_APPLICATIONS() : [];
        apps = [...apps.filter((a) => !a.sample), ...sample];
        safeLS(() => localStorage.setItem('jhp-demo-seen', '1'));
        await persist();
        toast('Loaded sample data');
    }
    async function clearSample() {
        apps = apps.filter((a) => !a.sample);
        safeLS(() => localStorage.setItem('jhp-demo-seen', '1'));
        await persist();
        toast('Sample data removed');
    }

    // ---------- resume vault (IndexedDB, local only) ----------
    function idb() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
            const req = indexedDB.open('jobHuntPro', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('resumes', { keyPath: 'id' });
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
    async function idbDo(mode, fn) {
        const db = await idb();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('resumes', mode);
            const result = fn(tx.objectStore('resumes'));
            tx.oncomplete = () => resolve(result && result.result !== undefined ? result.result : undefined);
            tx.onerror = () => reject(tx.error);
        });
    }
    async function renderResumes() {
        const el = $('#resumeList');
        let items = [];
        try { items = (await idbDo('readonly', (s) => s.getAll())) || []; } catch (e) {
            el.innerHTML = '<p class="muted">Resume storage is not available in this browser mode.</p>'; return;
        }
        items.sort((a, b) => b.added - a.added);
        if (!items.length) { el.innerHTML = '<p class="muted">No resumes yet. Upload one to keep versions handy.</p>'; return; }
        el.innerHTML = items.map((r) => `
            <div class="resume-item">
                <span class="resume-icon">${/pdf$/i.test(r.name) ? '📕' : '📘'}</span>
                <div class="resume-info"><strong>${esc(r.name)}</strong>
                <span class="activity-time">${(r.size / 1024).toFixed(0)} KB · added ${fmtDate(new Date(r.added).toISOString())}</span></div>
                <button type="button" class="btn-secondary btn-sm" data-action="resume-download" data-id="${esc(r.id)}">Download</button>
                <button type="button" class="btn-icon" data-action="resume-delete" data-id="${esc(r.id)}" aria-label="Delete">🗑️</button>
            </div>`).join('');
    }
    async function uploadResume(file) {
        if (!file) return;
        if (file.size > MAX_RESUME_BYTES) { toast('File is larger than 5 MB'); return; }
        if (!/\.(pdf|docx?|DOCX?|PDF)$/.test(file.name)) { toast('Use a PDF, DOC or DOCX file'); return; }
        try {
            await idbDo('readwrite', (s) => s.put({ id: 'r' + Date.now(), name: file.name, size: file.size, type: file.type, added: Date.now(), blob: file }));
            toast('Resume saved');
        } catch (e) { toast('Could not save the file in this browser'); }
        renderResumes();
    }
    async function resumeAction(action, id) {
        if (action === 'resume-delete') {
            if (!confirm('Delete this resume?')) return;
            await idbDo('readwrite', (s) => s.delete(id));
            renderResumes();
            return;
        }
        const r = await idbDo('readonly', (s) => s.get(id));
        if (!r) return;
        const url = URL.createObjectURL(r.blob);
        const link = document.createElement('a');
        link.href = url; link.download = r.name;
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    // ---------- events ----------
    function bindEvents() {
        document.addEventListener('click', (e) => {
            const nav = e.target.closest('.nav-item');
            if (nav) { e.preventDefault(); showView(nav.dataset.view); return; }
            const go = e.target.closest('[data-goto]');
            if (go) { showView(go.dataset.goto); return; }
            const btn = e.target.closest('[data-action]');
            if (!btn || btn.tagName === 'SELECT') {
                if (e.target === $('#appModal')) closeModal();
                return;
            }
            const { action, id } = btn.dataset;
            if (action === 'quick-add') openModal(null);
            else if (action === 'close-modal') closeModal();
            else if (action === 'export') exportCSV();
            else if (action === 'edit') openModal(apps.find((a) => sameId(a.id, id)));
            else if (action === 'delete') deleteApp(id);
            else if (action === 'load-sample') loadSample();
            else if (action === 'clear-sample') clearSample();
            else if (action === 'resume-download' || action === 'resume-delete') resumeAction(action, id);
        });
        document.addEventListener('change', (e) => {
            const sel = e.target.closest('select[data-action="status"]');
            if (sel) setStatus(sel.dataset.id, sel.value);
        });
        $('#applicationForm').addEventListener('submit', submitForm);
        ['#filterStatus', '#filterSource', '#sortBy'].forEach((s) => $(s).addEventListener('change', renderApplications));
        $('#globalSearch').addEventListener('input', () => {
            if (currentView !== 'applications') showView('applications');
            renderApplications();
        });
        $('#resumeUpload').addEventListener('change', (e) => { uploadResume(e.target.files[0]); e.target.value = ''; });
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#globalSearch').focus(); }
            if (e.key === 'Escape') closeModal();
        });
        window.addEventListener('hashchange', () => showView(location.hash.slice(1)));

        if (isExtension && chrome.storage.onChanged) {
            chrome.storage.onChanged.addListener(async (changes, area) => {
                if (area === 'local' && changes.applications) {
                    apps = await store.load();
                    renderAll();
                }
            });
        }
    }

    // ---------- boot ----------
    async function init() {
        initTheme();
        bindEvents();
        apps = await store.load();
        const params = new URLSearchParams(location.search);
        const firstVisit = !safeLS(() => localStorage.getItem('jhp-demo-seen'), '1');
        // Live demo: show sample data on a first visit (or with ?demo=1) so there is something to explore.
        if (!isExtension && ((firstVisit && !apps.length) || params.get('demo') === '1') && !apps.some((a) => a.sample)) {
            apps = [...apps, ...(window.SAMPLE_APPLICATIONS ? window.SAMPLE_APPLICATIONS() : [])];
            safeLS(() => localStorage.setItem('jhp-demo-seen', '1'));
            await store.save(apps);
        }
        renderAll();
        showView(location.hash.slice(1) || 'dashboard');
    }

    document.addEventListener('DOMContentLoaded', init);
})();
