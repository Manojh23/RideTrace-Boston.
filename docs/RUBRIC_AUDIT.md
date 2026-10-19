# Project 2 Rubric Audit (280 points)

**Audit date:** 2026-10-19. **Scope:** integrated PR branch, not a claim that PR #1 is merged and not an instructor grade.

**Yes** means supporting source, automated checks, or specifically attributed local evidence is available. **No** means the requirement is not fully demonstrated yet, including matters requiring instructor judgment. It does not predict a final grade.

|   # | Rubric requirement                                              | Pts | Yes / No | Evidence or remaining action                                                                                                                                 |
| --: | --------------------------------------------------------------- | --: | :------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|   1 | Design document: description, personas, stories, mockups        |  50 |   Yes    | docs/DESIGN.md includes all components; live page URLs corrected; 3 mockups preserved.                                                                       |
|   2 | All professor-approved requirements completed                   |  15 |    No    | Approved Slack proposal/approval not supplied; remaining filter and validation browser checks are pending.                                                   |
|   3 | Usable app with instructions                                    |   5 |    No    | Guide exists and core CRUD was reported working. Responsive styles and pagination improved; real mobile/keyboard and remaining browser checks still pending. |
|   4 | Useful to a final user                                          |   5 |    No    | Concrete rider personas/use cases exist; independent rider feedback has not been supplied.                                                                   |
|   5 | ESLint configuration and zero errors                            |   5 |   Yes    | ESLint configuration exists and lint passes.                                                                                                                 |
|   6 | Organized pages, database code and CSS                          |   5 |   Yes    | Separate src, public, feature, database, script, test and documentation paths.                                                                               |
|   7 | JavaScript organized in modules                                 |  15 |   Yes    | ES modules and separate MongoDB connector.                                                                                                                   |
|   8 | Vanilla JavaScript client-side rendering                        |  15 |   Yes    | DOM/Fetch frontend; static HTML and JSON APIs; no React.                                                                                                     |
|   9 | At least one form                                               |  15 |   Yes    | Both features include entry forms; Manoj supplied successful local browser CRUD evidence.                                                                    |
|  10 | Working public deployment                                       |   5 |    No    | Only local-environment evidence supplied; public URL and production behavior not verified.                                                                   |
|  11 | Two Mongo collections with full CRUD                            |  15 |   Yes    | commuteLogs and transferReports routes support CRUD; user-supplied local browser results cover both.                                                         |
|  12 | Database has more than 1,000 records                            |   5 |   Yes    | Manoj supplied a terminal screenshot confirming 8,035 MBTA records locally; production DB must be checked separately.                                        |
|  13 | Node + Express                                                  |   5 |   Yes    | src/server.js, src/app.js and package.json.                                                                                                                  |
|  14 | Prettier formatting                                             |   5 |   Yes    | Prettier configuration exists and format check passes.                                                                                                       |
|  15 | Standard HTML controls and semantic elements                    |   5 |   Yes    | Forms, labels, buttons, links, inputs, selects and tables; no div/span action substitutes found.                                                             |
|  16 | CSS organized by module                                         |   5 |   Yes    | Shared base/home CSS plus separate Manoj and Kavya stylesheets.                                                                                              |
|  17 | README: authors, class link, objective, screenshot, build steps |  10 |   Yes    | README corrected for both features; actual user-supplied local screenshot added; build instructions and class links retained.                                |
|  18 | No exposed secret credentials                                   |  10 |   Yes    | Reviewed tracked files have no credential-pattern findings; .env, dependencies and local imports excluded.                                                   |
|  19 | package.json lists dependencies                                 |   5 |   Yes    | Express, native MongoDB driver, and development tooling listed; lockfile included.                                                                           |
|  20 | MIT license                                                     |   5 |   Yes    | LICENSE retained with both names.                                                                                                                            |
|  21 | No unused framework starter leftovers                           |   5 |   Yes    | No default users route, React template, or missing local JS imports found; not a claim of exhaustive runtime coverage.                                       |
|  22 | Correct Google Form, links and thumbnail                        |   5 |    No    | Course submission and reviewer access must be checked by the team.                                                                                           |
|  23 | Public narrated app demonstration video                         |  10 |    No    | Demo script exists; actual published narrated video not supplied.                                                                                            |
|  24 | Code freeze and deployment/slides/video by deadline             |   5 |    No    | Actual class deadline and timely completion need evidence.                                                                                                   |
|  25 | No backend CommonJS                                             |  10 |   Yes    | Backend/scripts use ES imports/exports; no require/module.exports/exports usage found.                                                                       |
|  26 | No Mongoose or template engines                                 |  20 |   Yes    | Native MongoDB driver, static HTML and no server template rendering.                                                                                         |
|  27 | Instructor code review completed                                |  20 |    No    | Requires professor/student participation; PR review is not a substitute.                                                                                     |
|     | Total possible                                                  | 280 |          |                                                                                                                                                              |

## Verification and its limits

- Automated verification after review fixes: 16 tests, ESLint, Prettier, and syntax checks for all 25 JavaScript files.
- Both final-page deletion tests fail on the original code and pass with the pagination fix. They simulate frontend DOM/API behavior; they do not certify browser layout or MongoDB integration.
- Manoj supplied local-browser evidence of both features creating, reading, editing, deleting, refreshing and displaying correct statistics, plus incognito privacy behavior.
- Manoj supplied local evidence of 8,035 MBTA stops and working stop suggestions. This is not a production database check.
- Responsive CSS reviewed/improved; real mobile/keyboard, remaining filter/invalid-input checks, public deployment, instructor approval, course submissions and deadline compliance remain pending.
- README includes an actual local screenshot; design mockups remain labeled as illustrative.

See `docs/TESTING.md` for exact remaining browser checks and distinguish local evidence from production verification. Both teammates must understand their own full-stack feature, retain truthful contribution/AI disclosure, confirm approved requirements and join the Canvas P2 group.
