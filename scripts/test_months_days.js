// Quick validation script for calculateMonthsAndDays
// Run with: node scripts/test_months_days.js

function calculateMonthsAndDays(startDate, endDate) {
    if (!startDate || !endDate) return { months: 0, days: 0 };

    function toLocalDate(d) {
        if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (typeof d === 'string') {
            const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
            const parsed = new Date(d);
            return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }
        const parsed = new Date(d);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    const start = toLocalDate(startDate);
    const end = toLocalDate(endDate);

    if (start > end) return { months: 0, days: 0 };

    const inclusiveMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    const lastDayOfEndMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();

    if (start.getDate() === 1 && end.getDate() === lastDayOfEndMonth) {
        return { months: Math.min(inclusiveMonths, 6), days: 0 };
    }

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    let days = 0;

    if (end.getDate() >= start.getDate()) {
        days = end.getDate() - start.getDate();
    } else {
        months -= 1;
        const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        days = prevMonthLastDay - start.getDate() + end.getDate();
    }

    months = Math.min(Math.max(months, 0), 6);

    if (days >= 30) {
        const extraMonths = Math.floor(days / 30);
        months = Math.min(months + extraMonths, 6);
        days = days % 30;
    }

    return { months: months, days: days };
}

const cases = [
    { start: '2024-11-01', end: '2025-04-30', expect: { months: 6, days: 0 } },
    { start: '2024-11-15', end: '2025-04-30', expect: { months: 5, days: 15 } },
    { start: '2024-11-01', end: '2025-04-15', expect: { months: 5, days: 14 } },
    { start: '2025-01-01', end: '2025-06-30', expect: { months: 6, days: 0 } },
    { start: '2025-01-10', end: '2025-06-30', expect: { months: 5, days: 20 } },
    { start: '2025-01-01', end: '2025-01-01', expect: { months: 0, days: 0 } },
];

console.log('Testing calculateMonthsAndDays:\n');
for (const c of cases) {
    // Add debug info for failing cases
    // Use the same local-date normalization as the function under test
    function toLocalDate(d) {
        if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (typeof d === 'string') {
            const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
            const parsed = new Date(d);
            return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        }
        const parsed = new Date(d);
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    const start = toLocalDate(c.start);
    const end = toLocalDate(c.end);
    const lastDayOfEndMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    const inclusiveMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

    const result = calculateMonthsAndDays(c.start, c.end);
    const ok = result.months === c.expect.months && result.days === c.expect.days;
    console.log(`${c.start} -> ${c.end}  =>  got: ${result.months}m ${result.days}d  | expected: ${c.expect.months}m ${c.expect.days}d  | ${ok ? 'PASS' : 'FAIL'}`);
    console.log(`  debug: start.day=${start.getDate()} end.day=${end.getDate()} lastDayOfEndMonth=${lastDayOfEndMonth} inclusiveMonths=${inclusiveMonths}`);
}
