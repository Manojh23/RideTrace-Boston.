# GitHub setup for Manoj + Kavya

**Recommended repository:** `Manojh23/RideTrace-Boston`, **Private** during coursework; one repo, two independent features.

## Step 1 — create the repository

On GitHub while signed in as `Manojh23`, open https://github.com/new.

- Repository name: `RideTrace-Boston`
- Description: `RideTrace Boston — MBTA Commute Reliability Dashboard and Transfer Experience Board. Web Development Project 2 by Manoj Harridoss and Kavya Kusuma Reddy Korem.`
- Visibility: **Private** (can change later as required for course review).
- **Do not** auto-add README, license, or .gitignore (included already).
- Click **Create repository**.

## Step 2 — push Manoj starter first

Extract `RideTrace-Boston-Manoj-Starter.zip`, open a terminal **inside its `RideTrace-Boston/` folder**, then run:

```bash
git init -b main
git add .
git commit -m "Initial AI-assisted project starter: Manoj commute feature and shared infrastructure"
git remote add origin https://github.com/Manojh23/RideTrace-Boston.git
git push -u origin main
```

Authenticate using GitHub Credential Manager / GitHub CLI when prompted. Never paste passwords or tokens into chat.

## Step 3 — invite Kavya

After repository creation visit `https://github.com/Manojh23/RideTrace-Boston/settings/access`.
Choose **Collaborators → Add people**, search for **`kavya-korem`**, grant **Write** access, and send the invitation. She must accept it. This step is not performed automatically by the ZIP.

## Step 4 — Kavya integration

Kavya can clone the repository and create a branch:

```bash
git clone https://github.com/Manojh23/RideTrace-Boston.git
cd RideTrace-Boston
git switch -c feature/kavya-transfers
```

Extract `RideTrace-Boston-Kavya-Feature.zip` and copy the `src/features/kavya/`, `public/kavya/`, and `tests/kavya-transfers.test.js` paths into the cloned project, preserving the paths. Follow `INSTALL_KAVYA.md` in that ZIP to mount the router and enable navigation (or use the combined ZIP to inspect the fully integrated version). Kavya reviews/tests/improves the module, commits on her branch, pushes, and opens a PR:

```bash
git add .
git commit -m "Integrate transfer experience board"
git push -u origin feature/kavya-transfers
```

Manoj reviews and merges the PR. After merging, the repository contains both independent parts.

## After push

Run `npm install`, configure `.env`, start MongoDB, import the official MBTA GTFS feed, run `npm run verify`, start the app, and verify both pages. Public deployment, demonstration video, final screenshot, and course submissions remain separate rubric deliverables.
