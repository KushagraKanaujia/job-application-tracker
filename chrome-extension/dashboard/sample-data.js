// Sample applications for demo mode.
// All companies are fictional placeholders; nothing here is real user data.
// Dates are generated relative to "now" so the timeline and charts always look current.
(function () {
    const DAY = 24 * 60 * 60 * 1000;
    const rows = [
        // [company, position, location, source, status, daysAgo, interviewInDays, salary, notes]
        ['Acme Corp', 'Software Engineer, New Grad', 'San Francisco, CA', 'LinkedIn', 'Interview Scheduled', 2, 3, '$130k - $150k', 'Recruiter reached out after Easy Apply. Onsite loop: 4 rounds.'],
        ['Globex', 'Frontend Engineer', 'Remote', 'Company Website', 'Applied', 1, null, '', 'Applied via Greenhouse.'],
        ['Initech', 'Backend Engineer (Go)', 'Austin, TX', 'Indeed', 'Rejected', 20, null, '', 'Generic rejection email after 2 weeks.'],
        ['Hooli', 'ML Engineer', 'Mountain View, CA', 'Referral', 'Phone Screen', 6, 1, '$160k+', 'Referred by a classmate. 30 min recruiter call.'],
        ['Umbrella Labs', 'Full Stack Developer', 'Remote', 'GitHub', 'Applied', 0, null, '', 'Found on a GitHub new-grad list.'],
        ['Vandelay Industries', 'Data Engineer', 'New York, NY', 'LinkedIn', 'Resume Screening', 9, null, '', ''],
        ['Stark Systems', 'Platform Engineer', 'Seattle, WA', 'Company Website', 'Offer', 30, null, '$145k + equity', 'Offer deadline in 2 weeks. Negotiate signing bonus.'],
        ['Wayne Analytics', 'Software Engineer II', 'Chicago, IL', 'Recruiter', 'Interview Completed', 14, null, '', 'Final round done, waiting on decision.'],
        ['Soylent Co', 'iOS Engineer', 'Los Angeles, CA', 'Indeed', 'Applied', 4, null, '', ''],
        ['Cyberdyne', 'Infrastructure Engineer', 'Remote', 'LinkedIn', 'Withdrawn', 25, null, '', 'Withdrew: role moved to on-call heavy.'],
        ['Tyrell Robotics', 'Robotics Software Engineer', 'Boston, MA', 'GitHub', 'Applied', 11, null, '', ''],
        ['Pied Piper', 'Compression Engineer', 'Palo Alto, CA', 'Referral', 'Interview Scheduled', 8, 6, '', 'Take-home due before the onsite.'],
    ];

    window.SAMPLE_APPLICATIONS = function makeSample() {
        const now = Date.now();
        return rows.map((r, i) => {
            const applied = new Date(now - r[5] * DAY);
            let interviewDate = '';
            if (r[6] !== null) {
                const d = new Date(now + r[6] * DAY);
                d.setHours(10 + (i % 5), 0, 0, 0);
                interviewDate = d.toISOString();
            }
            return {
                id: 'sample-' + (i + 1),
                company: r[0],
                position: r[1],
                location: r[2],
                source: r[3],
                status: r[4],
                salary: r[7],
                notes: r[8],
                applicationUrl: '',
                interviewDate,
                dateApplied: applied.toISOString(),
                lastUpdated: new Date(applied.getTime() + Math.min(r[5], 3) * DAY / 2).toISOString(),
                autoTracked: r[3] === 'LinkedIn' || r[3] === 'GitHub' || r[3] === 'Indeed',
                sample: true,
            };
        });
    };
})();
