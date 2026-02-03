const title = `fix: normalize dates and correct months/days calculation; add radio-toggle UI & tests`;
const body = `Fixes calculateMonthsAndDays bug where full-month ranges (e.g., Nov 1 - Apr 30) were computed as 5 months 29 days due to UTC date parsing.

Changes included:
- fix: normalize date inputs to local calendar in \`calculateMonthsAndDays\` to avoid timezone shifts
- test: add \`scripts/test_months_days.js\` and validate edge cases (Nov 1 → Apr 30, etc.)
- ui: convert health insurance to radio-toggle inputs and styles
- docs: note UI change in \`README.md\`
- ci: add GitHub Pages deploy workflow and copilot instructions

Validation: ran local script \`node scripts/test_months_days.js\` and all test cases pass.`;

console.log(encodeURIComponent(title));
console.log(encodeURIComponent(body));
