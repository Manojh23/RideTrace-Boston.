# RideTrace Boston — Design Document

**Understand commute delays. Learn from real transfer experiences.**

| Project        | Details                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| Team           | Manoj Harridoss (`@Manojh23`) and Kavya Kusuma Reddy Korem (`@kavya-korem`) |
| Course         | Northeastern University · Web Development · Project 2                       |
| Design version | October 19, 2026 · integrated feature branch                                |
| Implementation | Node.js + Express + native MongoDB driver + vanilla JavaScript ES modules   |

[Project description](#1-project-description) · [User personas](#2-user-personas) · [User stories](#3-user-stories-and-acceptance-criteria) · [Design mockups](#4-design-mockups-and-interface-rationale)

## 1. Project description

RideTrace Boston helps MBTA riders understand everyday travel uncertainty through personal commute history and community transfer experiences. A rider records planned and actual journey times in a private commute dashboard, then reviews weekday delay patterns, on-time percentage, and a historical departure-buffer suggestion. Independently, a rider can publish a transfer report or explore other riders’ reported connection times by stop, route pair, and time of day. An official MBTA GTFS stop catalog supplies reference names, while commute logs and transfer reports remain separate editable MongoDB collections. Together, the two tools help riders plan with more context while clearly identifying self-reported information as historical and unverified.

### Problem, value, and scope

Arrival predictions describe the next vehicle; they do not summarize a rider’s own recurring delays or explain what a particular transfer felt like. RideTrace preserves that experience for later reflection. The personal dashboard answers **“How much extra time have my trips needed?”** The community board answers **“What have other riders experienced at this connection?”**

The app is not a live timetable, official service-alert channel, journey planner, or verified accessibility or safety guide. Small samples and unverified observations can be misleading; the interface links to official MBTA information and explains calculation limits.

## 2. User personas

These are **fictional design personas**, not claims of completed interviews or user research.

### Maya — the student with a fixed morning schedule

| Attribute             | Design context                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Situation             | Travels to university several mornings a week and needs to arrive before class.                  |
| Frustration           | A route can look reasonable in an arrival app but repeatedly take longer than her plan.          |
| Goal                  | Understand her own delay patterns and choose a more realistic departure buffer.                  |
| Typical use           | Logs a completed trip on her phone; reviews weekday patterns and past entries on her laptop.     |
| Privacy need          | Wants personal journeys kept separate from the public community board.                           |
| Successful experience | Can save and correct a trip, find earlier entries, and understand how the buffer was calculated. |

**Scenario:** Maya planned a 35-minute journey but arrived after 46 minutes. After class, she records the route, date, planned and actual duration, and delay reason. After several trips, she checks whether a similar journey often needs extra time. She treats the buffer as a summary of her history, not a guarantee about tomorrow.

### Daniel — the rider making an unfamiliar connection

| Attribute             | Design context                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Situation             | Uses connecting buses and trains, sometimes at an unfamiliar interchange or time of day.         |
| Frustration           | A connection that appears possible may involve a longer walk or wait than he expected.           |
| Goal                  | Compare reported transfer durations and missed connections, then share his own observation.      |
| Typical use           | Searches the public board before a trip and posts a short report afterward.                      |
| Trust need            | Needs dates, route pairs, and clear labels showing that reports are unverified.                  |
| Successful experience | Can find relevant reports, publish one without an account, and correct or delete his own report. |

**Scenario:** Daniel is planning a Red-to-Orange connection at Downtown Crossing in the evening. He filters for that stop, those routes, and that time of day, then compares the matching reports. After making the transfer, he submits his own duration and notes. He later corrects a typo using the same browser; another browser can read his public report but cannot edit it.

## 3. User stories and acceptance criteria

Each teammate owns the frontend, Express routes, validation, statistics, and MongoDB CRUD for their feature. Story ownership describes responsibility; recorded Git authorship and the AI disclosure remain separate. These stories document the current intended scope and do not substitute for the professor’s approval of the team’s Slack proposal.

### Manoj — Commute Reliability Dashboard

- **M1 · Record a journey.** As Maya, I want to save my route, date, planned minutes, actual minutes, delay reason, and optional notes so I can build a personal record of what happened.
- **M2 · Maintain my history.** As Maya, I want to browse and filter my journeys, edit mistakes, and delete unwanted entries so my private history stays accurate and useful.
- **M3 · Understand recurring delays.** As Maya, I want to see average delay, on-time percentage, weekday patterns, and an explained departure buffer so I can plan using my past experience.

| Story | Acceptance criteria                                                                                                                                                                                                                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1    | A valid submission creates a `commuteLogs` document and updates the displayed history. Required fields and invalid durations are rejected. Refreshing the same browser retains saved entries.                                                                                                                                                 |
| M2    | Route and weekday filters narrow the history; Reset clears them. Edit saves changes, Cancel abandons editing, and confirmed Delete removes an entry. Pagination remains on a valid page after deletion. A separate browser cannot read or change those private logs.                                                                          |
| M3    | Summary and weekday values come from the owner’s saved journeys. Positive delay is `max(0, actual − planned)`; on-time means no more than two minutes late. The buffer is the nearest-rank 80th percentile of non-negative delays, rounded up to five minutes; it is shown only after at least three logs. Empty states explain missing data. |

### Kavya — Transfer Experience Board

- **K1 · Share a transfer.** As Daniel, I want to publish a stop, connecting routes, date, time of day, transfer duration, missed-connection indicator, and optional notes so other riders can learn from my experience.
- **K2 · Find relevant experiences.** As Daniel, I want to browse public reports and filter by stop, routes, and time of day so I can compare connections relevant to my trip.
- **K3 · Correct my contribution.** As Daniel, I want to edit or delete reports submitted in my browser so I can fix mistakes and remove my own unwanted reports.

| Story | Acceptance criteria                                                                                                                                                                                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K1    | A valid submission creates a `transferReports` document and shows it in the public feed. Required fields and invalid durations are rejected. Imported MBTA stops are suggested in the entry form; a rider can also type a stop name.                                                                                                 |
| K2    | Reports are readable from a separate browser. Apply filters and Reset update the feed and matching-report statistics. The median duration and missed-connection percentage reflect the matching set. Reports display dates, an unverified label, and an old-report label where applicable. Pagination handles empty and final pages. |
| K3    | The originating browser sees Edit and Delete; other browsers see an anonymous-rider label without those controls. The backend also enforces ownership. Editing updates the report and statistics; confirmed deletion removes it.                                                                                                     |

### Independence and shared infrastructure

| Owner / role     | Page and client files                 | Express API and server files             | MongoDB collection                                        |
| ---------------- | ------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| Manoj · M1–M3    | `/manoj/` · `public/manoj/`           | `/api/commutes` · `src/features/manoj/`  | `commuteLogs` · private CRUD                              |
| Kavya · K1–K3    | `/kavya/` · `public/kavya/`           | `/api/transfers` · `src/features/kavya/` | `transferReports` · public read; owner-controlled changes |
| Shared reference | Stop suggestions in the transfer form | `/api/stops` · `src/routes/stops.js`     | `mbtaStops` · read-only lookup                            |

Both features reuse the Express server, MongoDB connector, signed browser identity, shared styles, and request helpers. **Neither feature queries the other feature’s editable collection.** Each has its own HTML, JavaScript, CSS, routes, validation, statistics, and feature tests. The application may run from one shared repository while the two full-stack features remain independent.

## 4. Design mockups and interface rationale

The boards below pair simplified wireframes with interface pictures and explain the main design decisions. Open an image for its full resolution.

- **Overview:** the picture is an original concept rendering with illustrative data.
- **Commute and transfer boards:** the pictures are partial screenshots supplied by Manoj from the locally running app on October 19, 2026. Browser chrome is excluded, and visible records are test data. These captures predate the latest pagination/mobile styling changes.
- **Mobile:** this is a responsive layout plan, not a captured or verified phone session.

### 4.1 Overview — two independent entry points

![Overview wireframe next to its interface concept, showing the headline, independent feature links, and historical-data disclaimer](mockups/overview-wireframe.png)

**Purpose:** explain the value quickly and give equal access to either feature. The two calls to action lead directly to `/manoj/` and `/kavya/`; neither requires completing the other. The “How it works” page provides instructions and calculation/privacy explanations.

### 4.2 Manoj’s dashboard — private recording and reflection

![Commute dashboard wireframe beside a real local screenshot, annotated with privacy, summary cards, entry form, weekday chart, and history](mockups/commutes-wireframe.png)

**Reading order:** privacy and purpose → summary cards → commute form and weekday chart → buffer explanation → filterable history and pagination. The form uses specific labels rather than relying on placeholders. History rows provide standard Edit and Delete buttons, and a save/delete notice gives feedback after an action.

### 4.3 Kavya’s board — public discovery and contribution

![Transfer board wireframe beside a real local screenshot, annotated with unverified labels, summary cards, contribution form, and filtered public feed](mockups/transfers-wireframe.png)

**Reading order:** community context and disclaimer → matching-report statistics → contribution form and public feed → report ownership controls and pagination. The form and feed filters are visually distinct: entering a report creates data, while feed filters only change the displayed results. Routes, dates, durations, and missed-connection labels make reports scannable; owner controls appear only in the original browser.

**Reference-data detail:** the existing [local stop-suggestion screenshot](screenshots/transfers-live.png) shows suggestions from the imported MBTA catalog. The import was reported to contain 8,035 local records; the catalog does not make community reports official or verified.

### 4.4 Mobile — preserve the same task order

![Responsive wireframes for the commute and transfer pages, with stacked forms, two-column summary cards, and layout rules](mockups/mobile-wireframe.png)

The source styles stack each workspace at widths up to 990 px. Navigation wraps at phone widths, form field pairs become one column at widths up to 480 px, and summary cards use one column at widths up to 360 px. The commute table scrolls within its panel, while long transfer text and pagination controls can wrap. Phone action buttons have a minimum height of 44 px and small-screen inputs use 16 px text. Check the result in actual browsers at 320, 390, and 768 px; the wireframes describe intent rather than certifying that testing is complete.

### Visual language and accessibility

| Decision                                                      | Reason                                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Deep navy headings, teal actions, pale backgrounds            | Establish hierarchy and keep both independent features visually consistent.             |
| White panels and generous spacing                             | Separate recording, reading, filtering, and feedback tasks.                             |
| Labels, units, and text status indicators                     | Explain required inputs and outcomes without depending on color alone.                  |
| Standard HTML forms, buttons, links, and tables               | Preserve expected browser and keyboard behavior.                                        |
| Semantic headings, skip link, visible focus, and live notices | Support navigation and feedback; manual keyboard/screen-reader checks remain necessary. |
| Written privacy and unverified-data labels                    | Explain the difference between private history and publicly readable community reports. |

Original concept mockups are retained for design history: [overview](mockups/overview-concept.png), [commute dashboard](mockups/commutes-concept.png), and [transfer board](mockups/transfers-concept.png).

## 5. Architecture, data, and limitations

Static HTML/CSS and vanilla JavaScript ES modules render the frontend in the browser. Fetch calls exchange JSON with Express routes. The native MongoDB Node driver connects the routes to the database; there is no React, server-side template engine, Mongoose, or backend CommonJS.

| Document  | Main fields                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commute   | `_id`, `ownerId`, `route`, `date`, `expectedMinutes`, `actualMinutes`, `delayReason`, `notes`, `createdAt`, `updatedAt`                                 |
| Transfer  | `_id`, `ownerId`, `stopName`, `fromRoute`, `toRoute`, `observedAt`, `daypart`, `transferMinutes`, `missedConnection`, `notes`, `createdAt`, `updatedAt` |
| MBTA stop | `stopId`, `stopName`, `locationType`, `parentStation`, `latitude`, `longitude`                                                                          |

Browser ownership uses a signed, anonymous HttpOnly cookie, not an account login. Server routes check ownership for private reads and protected changes. Clearing or losing the cookie can make earlier owned records inaccessible; public transfer reports remain readable. Statistics analyze at most the latest 2,500 matching documents, and API responses expose that limit. Do not enter personal information in public report notes.

## 6. Design acceptance and verification

| Required design-document component | Location                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| Project description                | Section 1: five-sentence description, problem, value, and scope                        |
| User personas                      | Section 2: two fictional rider profiles, needs, and scenarios                          |
| User stories                       | Section 3: six stories with full-stack owners and acceptance criteria                  |
| Design mockups                     | Section 4: overview, both feature boards with local screenshots, and mobile wireframes |

These four document components are present. Their inclusion does not guarantee a grade or confirm completion of every acceptance test. The two feature groups preserve the previously documented functionality; the professor-approved Slack proposal must still be compared with the final submission.

Automated checks cover validation/statistics and the pagination regression (16 tests), plus ESLint and Prettier. Manoj supplied local evidence of both features’ create/read/update/delete flows, refresh persistence, displayed statistics, incognito behavior, and stop suggestions. Full filter/invalid-input browser coverage, real mobile/keyboard checks, public deployment, and course deliverables remain pending. Exact checks are in [TESTING.md](TESTING.md); the full course checklist is in [RUBRIC_AUDIT.md](RUBRIC_AUDIT.md).

## 7. Sources and AI-use disclosure

**Data:** MBTA / MassDOT, [official GTFS feed](https://cdn.mbta.com/MBTA_GTFS.zip). Application code uses the MIT license; data rights remain with the provider. RideTrace is independent of the MBTA.

**AI use:** Generative AI assisted with MBTA resource research, planning, starter code, tests, and documentation. Each teammate is responsible for reviewing, understanding, testing, and explaining their assigned feature.
