# Eduvidual (Moodle) to Todoist Sync

Automate your student life! This project is a Netlify Scheduled Function that fetches your Eduvidual (Moodle) calendar, shifts the deadlines 24 hours earlier (so you don't do it at the last minute), and pushes them securely to Todoist.

## Features
- **Zero Data Exposure**: No hardcoded API keys or personal URLs. Everything is securely managed via Environment Variables.
- **Hourly Sync**: Runs automatically every hour.
- **Deduplication**: Checks your active tasks to ensure duplicate assignments aren't created.
- **Proactive Deadlines**: Automatically shifts Moodle deadlines 24 hours backwards.

## Setup Instructions

### 1. Get your Eduvidual iCal Link
1. Log into your [Eduvidual (Moodle) Account](https://www.eduvidual.at/).
2. Navigate to your **Calendar**.
3. Scroll to the bottom and click **Export calendar**.
4. Select **All events** and **recent and next 60 days** (or whichever you prefer).
5. Click **Get calendar URL** and copy the resulting link.

### 2. Get your Todoist API Token
1. Log into [Todoist](https://todoist.com/) in your browser.
2. Click your avatar in the top left and go to **Settings** > **Integrations** > **Developer**.
3. Copy your **API token**.

### 3. Deploy to Netlify
The easiest way to get this running is by using the **Deploy to Netlify** button. This will automatically fork the repository and set up the Netlify project for you.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/allmightychaos/eduvidual-to-todoist)

During the deployment process, Netlify will ask you for two environment variables:
- `EDUVIDUAL_ICAL_URL`: The URL you copied in Step 1.
- `TODOIST_API_TOKEN`: The API token you copied in Step 2.

Once deployed, the function will run automatically in the background!

### 4. Optional: Secure the Status Page Details
If you want to view *detailed* error logs on your public status page (e.g. "missing env vars"), you can add a `STATUS_PASSWORD` environment variable in your Netlify dashboard. Once set, you can type this password into the bottom of your status page to unlock debugging details.
