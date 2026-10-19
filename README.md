# RideTrace Boston

A web app for tracking MBTA commute delays and sharing transfer experiences.

**Authors:** Manoj Harridoss (`@Manojh23`) and Kavya Kusuma Reddy Korem (`@kavya-korem`)  
**Course:** Northeastern University Web Development — Project 2  
**Class links:** [Course project thread](https://webdev-online-neu.slack.com/archives/C09DCBJP2BU/p1759790564109799) · [Architecture video](https://www.youtube.com/watch?v=GqW1K1jHJCc&list=PLmRfPZr9-VoHJ6K1g3URENMAVYPXCQFyw&index=30)  
**License:** [MIT](LICENSE)

## Project objective

RideTrace helps riders compare planned and actual travel times and learn from other riders’ transfers. This branch includes Manoj’s commute dashboard. Kavya’s transfer board is supplied separately for her pull request:

- **Manoj’s commute dashboard:** private journey logs, route and weekday filters, delay statistics, and a suggested departure buffer.
- **Kavya’s planned transfer board:** public transfer reports, stop/route/time filters, median transfer times, and owner-only editing and deletion.

The app uses Node.js, Express, the native MongoDB driver, and vanilla JavaScript ES modules. The commute feature uses `commuteLogs`. The planned transfer feature uses its own collection and shares the server and database connector.

## Screenshot

Commute dashboard wireframe with a local page screenshot.

![Commute dashboard and local screenshot](docs/mockups/commutes-wireframe.png)

## Design document

[Read the design document](docs/DESIGN.md) for the project description, user personas, user stories, and mockups.

| Manoj’s dashboard                                                                                                               | Kavya’s transfer board                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [![Commute dashboard wireframe and local screenshot](docs/mockups/commutes-wireframe.png)](docs/mockups/commutes-wireframe.png) | [![Transfer board wireframe and local screenshot](docs/mockups/transfers-wireframe.png)](docs/mockups/transfers-wireframe.png) |

## Build and run

Requirements: Node.js 20.12+, npm, and MongoDB 6+ or MongoDB Atlas. Docker is optional.

```bash
npm ci
cp .env.example .env
```

Set these values in `.env`:

- `MONGODB_URI`: MongoDB connection string.
- `MONGODB_DB`: database name; default `ridetrace_boston`.
- `APP_SECRET`: a random secret of at least 32 characters.
- `PORT`: app port; default `3000`.

Generate a secret with:

```bash
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"
```

For the included Docker MongoDB setup:

```bash
docker compose up -d
```

Skip that command if MongoDB is already running locally or in Atlas. The app connects to the database specified in `.env`. Keep `.env` and credentials out of Git.

Import the official stop catalog, then start the app:

```bash
npm run seed:mbta
npm start
```

The importer downloads [MBTA GTFS data](https://cdn.mbta.com/MBTA_GTFS.zip), checks for more than 1,000 stop/platform records, and prints the imported count. Manoj’s local import contained 8,035 records. A downloaded archive can also be imported with `node --env-file=.env scripts/seed-mbta.js --file=/path/to/MBTA_GTFS.zip`.

## Using the app

| Page         | Address                          | Main actions                                  |
| ------------ | -------------------------------- | --------------------------------------------- |
| Overview     | http://localhost:3000/           | Open either feature                           |
| My commutes  | http://localhost:3000/manoj/     | Add, filter, edit, or delete private journeys |
| How it works | http://localhost:3000/guide.html | Read calculation and privacy details          |

Commute history belongs to an anonymous browser identity stored in a signed cookie. Clearing cookies may make earlier records inaccessible. Transfer reports are public, but only the original browser can edit or delete them. Reports are unverified and are not live MBTA predictions.

The commute buffer uses the nearest-rank 80th percentile of non-negative delays, rounded up to five minutes, after at least three logs. On-time means no more than two minutes late. Transfer statistics show the median duration and missed-connection percentage for matching reports. Statistics analyze up to the latest 2,500 matching records.

## Project structure

| Location                               | Contents                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `public/manoj/`, `src/features/manoj/` | Manoj’s HTML, CSS, JavaScript, API, validation, and statistics; `commuteLogs` collection |
| `src/db/`, `src/auth/`, `src/lib/`     | Shared database connection, browser identity, and helpers                                |
| `src/routes/stops.js`, `scripts/`      | Read-only `mbtaStops` lookup and GTFS importer                                           |
| `tests/`                               | Validation, statistics, and frontend pagination tests                                    |
| `docs/`                                | Design document, mockups, and screenshots                                                |

## Tests and formatting

```bash
npm run verify
```

This runs 21 tests, ESLint, and Prettier. Individual commands are `npm test`, `npm run lint`, and `npm run format:check`. Tests cover validation, statistics, pagination, session startup, connection reuse, and the hosted HTTP entry point. Automated tests use mock database and DOM implementations. Separate live checks confirmed database health, stop lookup, and commute creation and editing on Vercel. Manoj checked local CRUD and incognito behavior. The automated suite does not verify browser layout or complete live CRUD.

## Hosting

The repository includes Vercel’s Express preset in `vercel.json`. Vercel uses the default Express export in `src/app.js` for the API and serves `public/` through its CDN. The frontend starts a browser session before making parallel API requests. MongoDB connections are reused within each function instance.

| Host environment variable | Value                                            |
| ------------------------- | ------------------------------------------------ |
| `MONGODB_URI`             | Atlas connection string, stored as a secret      |
| `MONGODB_DB`              | Hosted database name, such as `ridetrace_boston` |
| `APP_SECRET`              | A stable random secret of at least 32 characters |
| `NODE_ENV`                | `production`                                     |

These variables are needed for both Production and Preview deployments. The Atlas network access list must allow connections from the deployment. The stop catalog belongs in that hosted database; a local import does not populate Atlas. The existing seed command can import it when `.env` points to Atlas.

The production website is [RideTrace Boston](https://ridetrace-boston.vercel.app). Vercel hosts the app, and MongoDB Atlas stores its data. The database health check and stop lookup return successful responses. The local server still runs through `npm start`.

The Atlas database is `ridetrace_boston`. Manoj’s feature uses `commuteLogs`, and the stop lookup uses `mbtaStops`. The transfer-board PR adds `transferReports`. Atlas contains 8,035 distinct official stop IDs. The importer updates records by stop ID, removes identical duplicates, and creates a unique stop-ID index.

The current deployment was uploaded directly. Deployment is manual; GitHub pushes do not currently trigger a Vercel deployment.

## Data source and attribution

Stop data: [MBTA / MassDOT GTFS feed](https://cdn.mbta.com/MBTA_GTFS.zip) and [MBTA GTFS documentation](https://github.com/mbta/gtfs-documentation/blob/master/reference/gtfs.md). Data rights remain with the provider. The MIT license covers application code. RideTrace is not affiliated with the MBTA.

## AI-use disclosure

AI tools helped with MBTA research, planning, starter code, tests, and documentation.
