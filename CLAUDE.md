# Claude Code / team instructions

This is one application and one GitHub repository: `Manojh23/RideTrace-Boston.` (the current repository name ends in a period).

- Manoj works in `src/features/manoj/`, `public/manoj/`, and `tests/manoj-commutes.test.js`. CRUD collection: `commuteLogs`.
- Kavya works in `src/features/kavya/`, `public/kavya/`, and `tests/kavya-transfers.test.js`. CRUD collection: `transferReports`.
- Shared: `src/lib/`, `src/routes/stops.js`, `src/auth/`, `src/db/`, `src/app.js`, `public/js/api.js`, `public/css/base.css`, `scripts/`, and docs. Coordinate shared edits through PR review.

Keep **Node.js + Express + native MongoDB driver + vanilla ES6 JavaScript**; no React, Mongoose, CommonJS or template engines. Keep both editable collections independent. Do not commit `.env`, API tokens, secrets, or imported raw MBTA data. Run `npm run verify` and manually test forms and database before claiming completion.

**Collaboration:** Preserve truthful Git authorship and the [AI-use disclosure](README.md#ai-use-disclosure). Each teammate must review, test, and understand their assigned full-stack feature.
