# Shared GitHub workflow

The existing private repository is `Manojh23/RideTrace-Boston.`. The final period is currently part of its name. Both teammates use this one repository; separate repositories are not required by the supplied project instructions.

## Test the integration branch

For a new local clone:

```bash
git clone --branch feature/kavya-transfers https://github.com/Manojh23/RideTrace-Boston..git RideTrace-Boston
cd RideTrace-Boston
npm ci
```

Create a local `.env` from `.env.example`, set a random `APP_SECRET`, and configure MongoDB. Follow the README to run the server and `docs/TESTING.md` to exercise both features. Never commit `.env` or imported data.

## Review and merge

Kavya's feature is submitted through PR #1. Manoj reviews the changes and verification results before merging. Use a normal merge commit to preserve both existing feature commits and add an integration commit. Merging is separate from CI passing.

After the PR is merged, each teammate updates their local checkout:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
```

Create new branches for follow-up work, review shared infrastructure edits together, and retain truthful authorship and AI disclosure. The branch may contain the entire application while each teammate owns a different full-stack feature.

## Access and final submission

GitHub previously confirmed `kavya-korem` has Write access. Ensure the instructor can access the private source repository for assessment. A GitHub PR review does not replace the instructor's course code review.

Deploy the app to a Node-compatible public host connected to MongoDB; GitHub Pages alone does not run this Express backend. Confirm production CRUD and import the MBTA catalog into the database actually used by the deployment.

If the repository is renamed to remove the trailing period, update clone instructions and local remote URLs to match the new name.
