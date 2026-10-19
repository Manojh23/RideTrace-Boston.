# Claude Code / team instructions

This is one application and one GitHub repository: `Manojh23/RideTrace-Boston`.

- Manoj works in `src/features/manoj/`, `public/manoj/`, and `tests/manoj-commutes.test.js`. CRUD collection: `commuteLogs`.
- Kavya works in `src/features/kavya/`, `public/kavya/`, and `tests/kavya-transfers.test.js`. CRUD collection: `transferReports`.
- Shared: `src/lib/`, `src/routes/stops.js`, `src/auth/`, `src/db/`, `src/app.js`, `public/js/api.js`, `public/css/base.css`, `scripts/`, and docs. Coordinate shared edits through PR review.

Keep **Node.js + Express + native MongoDB driver + vanilla ES6 JavaScript**; no React, Mongoose, CommonJS or template engines. Keep both editable collections independent. Do not commit `.env`, API tokens, secrets, or imported raw MBTA data. Run `npm run verify` and manually test forms and database before claiming completion.

**Collaboration:** Do not fabricate Git commit authorship. The initial archive is AI-assisted starter code; each person reviews/tests/improves their assigned module and transparently reports their contributions and AI use.
