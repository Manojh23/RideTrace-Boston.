# Testing and remaining checks

## Automated checks

Run `npm ci`, then `npm run verify`. The suite contains 16 tests: the original 14 tests plus two final-page deletion regressions. Regression tests import the real frontend modules and simulate page navigation and deletion using a minimal DOM and mock paginated API. They assert that the UI refetches the last valid page and correctly updates records, labels, and navigation buttons. They do not prove browser layout, server permissions, or live MongoDB behavior.

## Local evidence supplied by Manoj on October 19, 2026

- Both feature forms created, displayed, edited, and deleted records.
- Records remained after refreshing; statistics matched the supplied values.
- Normal-browser commute records were hidden in incognito.
- Transfer reports remained public in incognito without owner-only Edit/Delete controls.
- The configured database returned `8035` for `mbtaStops.countDocuments({})`.
- A browser screenshot shows MBTA stop suggestions in the transfer entry form.

This records user-supplied local evidence, not an independently repeated integration run. Recheck the final deployment separately.

## Remaining browser checks

- Commute filters: existing and nonexistent route text, weekday selection, Reset. These filters affect the history table; summary cards show overall personal statistics.
- Transfer filters: stop, connecting routes, time of day, no matches, Reset; statistics should match the selected filters.
- Validation: complete all other required fields, then separately try a missing field, negative duration, and a future date. Each invalid submission must add no record.
- Pagination: create 9 commutes or 7 transfers, go to the final page, delete its only record, and verify the previous valid page loads automatically. Also check Next/Previous after changing filters.
- Persistence: restart Node and refresh in the same browser identity.
- Older reports: submit a transfer dated more than 30 days ago; verify its old-report label and exclusion from the recent-report count.

## Mobile and keyboard verification (pending)

Use browser device emulation or a real phone at 320, 390, and 768 CSS-pixel widths. Check all four pages: `/`, `/manoj/`, `/kavya/`, `/guide.html`.

- Navigation should wrap; no page-wide horizontal overflow should hide controls. The commute table may scroll horizontally within its own panel.
- Narrow forms should stack fields; input text and action buttons should remain readable and reachable.
- Summary cards, report notes, long stop names, pagination, notices, and edit/cancel controls should fit.
- Use Tab and Shift+Tab to reach controls; submit via keyboard and confirm visible focus and validation.
- Repeat create, edit, filter, and delete from the phone-sized viewport.

Responsive CSS has been reviewed and improved; real mobile-browser behavior is not yet certified.

## Production and course checks (pending)

Repeat CRUD, ownership, persistence, input validation, and MBTA lookup on the public HTTPS deployment. Count records in its own database. Confirm the approved Slack proposal, Canvas group, submission form and thumbnail, public narrated video, code freeze deadline, slides, and instructor code review. Keep AI use disclosed.
