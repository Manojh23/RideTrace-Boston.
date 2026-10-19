# RideTrace Boston

A web app for tracking MBTA commute delays and sharing transfer experiences.

**Authors:** Manoj Harridoss (`@Manojh23`) and Kavya Kusuma Reddy Korem (`@kavya-korem`)  
**Course:** Northeastern University Web Development — Project 2  
**Class links:** [Course project thread](https://webdev-online-neu.slack.com/archives/C09DCBJP2BU/p1759790564109799) · [Architecture video](https://www.youtube.com/watch?v=GqW1K1jHJCc&list=PLmRfPZr9-VoHJ6K1g3URENMAVYPXCQFyw&index=30)  
**License:** [MIT](LICENSE)

## Project objective

RideTrace helps riders compare planned and actual travel times and learn from other riders’ transfers. It has two separate full-stack features:

- **Manoj’s commute dashboard:** private journey logs, route and weekday filters, delay statistics, and a suggested departure buffer.
- **Kavya’s transfer board:** public transfer reports, stop/route/time filters, median transfer times, and owner-only editing and deletion.

The app uses Node.js, Express, the native MongoDB driver, and vanilla JavaScript ES modules. Both features share the server and database connection but use separate editable collections.

## Screenshot

Local transfer page showing imported MBTA stop suggestions. The visible reports are test entries.

![Transfer form with MBTA stop suggestions](docs/screenshots/transfers-live.png)

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

| Page           | Address                          | Main actions                                            |
| -------------- | -------------------------------- | ------------------------------------------------------- |
| Overview       | http://localhost:3000/           | Open either feature                                     |
| My commutes    | http://localhost:3000/manoj/     | Add, filter, edit, or delete private journeys           |
| Transfer board | http://localhost:3000/kavya/     | Browse reports, publish one, or change your own reports |
| How it works   | http://localhost:3000/guide.html | Read calculation and privacy details                    |

Commute history belongs to an anonymous browser identity stored in a signed cookie. Clearing cookies may make earlier records inaccessible. Transfer reports are public, but only the original browser can edit or delete them. Reports are unverified and are not live MBTA predictions.

The commute buffer uses the nearest-rank 80th percentile of non-negative delays, rounded up to five minutes, after at least three logs. On-time means no more than two minutes late. Transfer statistics show the median duration and missed-connection percentage for matching reports. Statistics analyze up to the latest 2,500 matching records.

## Project structure

| Location                               | Contents                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `public/manoj/`, `src/features/manoj/` | Manoj’s HTML, CSS, JavaScript, API, validation, and statistics; `commuteLogs` collection     |
| `public/kavya/`, `src/features/kavya/` | Kavya’s HTML, CSS, JavaScript, API, validation, and statistics; `transferReports` collection |
| `src/db/`, `src/auth/`, `src/lib/`     | Shared database connection, browser identity, and helpers                                    |
| `src/routes/stops.js`, `scripts/`      | Read-only `mbtaStops` lookup and GTFS importer                                               |
| `tests/`                               | Validation, statistics, and frontend pagination tests                                        |
| `docs/`                                | Design document, mockups, and screenshots                                                    |

## Tests and formatting

```bash
npm run verify
```

This runs 16 tests, ESLint, and Prettier. Individual commands are `npm test`, `npm run lint`, and `npm run format:check`. Pagination tests use a mock DOM and API; they do not test a live database or browser layout. Local CRUD and incognito behavior were checked by Manoj. Real mobile testing and public deployment have not been verified.

## Hosting

The app needs a Node-compatible host and a reachable MongoDB database. GitHub Pages alone cannot run its backend. The production start command is `node src/server.js`; environment variables are supplied by the host. HTTPS is needed for production cookies, with `NODE_ENV=production`. No public deployment URL is recorded here.

## Data source and attribution

Stop data: [MBTA / MassDOT GTFS feed](https://cdn.mbta.com/MBTA_GTFS.zip) and [MBTA GTFS documentation](https://github.com/mbta/gtfs-documentation/blob/master/reference/gtfs.md). Data rights remain with the provider. The MIT license covers application code. RideTrace is not affiliated with the MBTA.

## AI-use disclosure

AI tools helped with MBTA research, planning, starter code, tests, and documentation.
