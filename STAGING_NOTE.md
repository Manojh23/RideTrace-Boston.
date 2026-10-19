# Integration status

Both Manoj's Commute Reliability Dashboard and Kavya's Transfer Experience Board are included on `feature/kavya-transfers`. PR #1 is the integration request into `main`; documentation on this branch does not imply that it has already been merged.

- Manoj: `commuteLogs`, `src/features/manoj/`, `public/manoj/`.
- Kavya: `transferReports`, `src/features/kavya/`, `public/kavya/`.
- Shared: Express application, MongoDB connector, signed browser identity, utility modules, and read-only MBTA stop data.

Both features have separate full-stack responsibilities and do not query the other feature's editable collection. Existing commits retain their recorded authors; the follow-up review fixes do not claim Kavya authored Manoj's starter.

Local browser tests and the 8,035-stop import were evidenced by Manoj. Public deployment, real mobile validation, final course deliverables, and instructor approval/review remain separate. See `docs/TESTING.md` and `docs/RUBRIC_AUDIT.md`.

See the concise [AI-use disclosure](README.md#ai-use-disclosure) and [design document](docs/DESIGN.md).
