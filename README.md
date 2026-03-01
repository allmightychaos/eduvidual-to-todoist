# Eduvidual → Todoist Sync

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Netlify](https://img.shields.io/badge/Netlify-Edge%20Functions-00C7B7.svg)](https://netlify.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Scheduler-2088FF.svg)](https://github.com/features/actions)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](./LICENSE)

> **Note on the sync architecture**: Netlify's edge/server infrastructure cannot reach Eduvidual's servers (IP-level block). The sync therefore runs as a **GitHub Actions workflow** instead - GitHub's IP ranges are not blocked. Netlify is used only for the status dashboard and Todoist API calls are made directly from the workflow.

Tired of manually checking Moodle for deadlines? This tool pulls your Eduvidual calendar feed every 3 hours, grabs your upcoming assignments, shifts each deadline 24 hours earlier, and adds them to Todoist - all automatically. Set it up once and forget about it.

## Features

- **No secrets in code**: API keys, calendar URLs, and passwords all live in environment variables. The repo is fully public and safe to share.
- **Auto-sync every 3 hours**: Driven by GitHub Actions on a cron schedule - no manual intervention needed.
- **Force Sync button**: The status dashboard lets you trigger a sync on demand without touching any configuration.
- **No duplicate tasks**: Each assignment is tracked by its unique iCal ID. The same task will never appear in Todoist twice, even across multiple syncs.
- **Built-in 24h buffer**: Every deadline is shifted back by exactly 24 hours - because "due tomorrow" is already cutting it close.

## Setup & Deployment

### 1. Get your Eduvidual iCal link

1. Log into [Eduvidual](https://www.eduvidual.at/).
2. Go to the **Calendar** tab.
3. Scroll to the bottom and click **Export calendar**.
4. Choose **All events** and your preferred timeframe (e.g. **recent and next 60 days**).
5. Click **Get calendar URL** and copy the link.

### 2. Get your Todoist API token

1. Log into [Todoist](https://todoist.com/).
2. Go to **Settings** (top-left avatar) → **Integrations** → **Developer**.
3. Copy your **API token**.

### 3. Deploy to Netlify

Click the button below - it'll fork this repo to your GitHub and set up the Netlify project automatically.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/allmightychaos/eduvidual-to-todoist)

During setup you'll be asked for:
- `EDUVIDUAL_ICAL_URL` - the calendar URL from Step 1
- `TODOIST_API_TOKEN` - the API token from Step 2

### 4. Set up GitHub Actions secrets

The sync runs as a GitHub Actions workflow. You need to add five secrets to your forked repository:

1. Go to your repo on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** for each of the following:

| Secret name | Where to find it |
|---|---|
| `EDUVIDUAL_ICAL_URL` | The iCal URL from Step 1 |
| `TODOIST_API_TOKEN` | The API token from Step 2 |
| `TODOIST_PROJECT_ID` | See "Sync to a specific project" below (optional) |
| `NETLIFY_SITE_ID` | Netlify dashboard → your site → **Site configuration** → Site ID |
| `NETLIFY_AUTH_TOKEN` | Netlify dashboard → **User settings** → **Personal access tokens** → create one |

Once the secrets are set, the sync will run automatically every 3 hours via `.github/workflows/sync.yml`.

### 5. Enable the Force Sync button (optional)

The status dashboard includes a Force Sync button that triggers the GitHub Actions workflow on demand. To enable it:

1. Create a GitHub **Personal Access Token** with the **`workflow`** scope at [github.com/settings/tokens](https://github.com/settings/tokens).
2. In your Netlify dashboard → **Environment variables**, add:
   - `GITHUB_PAT` = the token you just created

Without this variable, the Force Sync button will return an error, but the automated schedule still works fine.

### 6. Lock down the status page

The status dashboard is public, but error details are hidden from anyone who doesn't know the password. Set a `STATUS_PASSWORD` environment variable in Netlify to enable the debug view - it shows full error logs, raw sync data, and the Force Sync button.

### 7. Optional: Sync to a specific Todoist project

By default, tasks land in your Todoist Inbox. To route them to a specific project, add `TODOIST_PROJECT_ID` as both a Netlify env var and a GitHub Actions secret. To find the project ID:

1. Open the project in the Todoist web app.
2. Look at the URL: `todoist.com/app/project/myproject-YOUR_PROJECT_ID`
3. Copy just the alphanumeric part at the end (e.g. `YOUR_PROJECT_ID`).
