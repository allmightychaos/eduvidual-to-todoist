# Project Roadmap

This file tracks upcoming features, optimizations, and known issues for the Eduvidual to Todoist Sync project.

## Completed

- [x] **Rich task content**: Extract descriptions and URLs from the Moodle iCal feed and include them in the Todoist task body.
- [x] **Skip past events**: Ignore assignments whose original deadline has already passed - no ghost tasks.
- [x] **Incremental state saving**: Write the processed-UID list to Netlify Blobs after each successful task creation, so progress isn't lost if the function times out.
- [x] **Custom iCal parser**: Replaced `node-ical` with a lightweight built-in parser - no unnecessary dependencies.
- [x] **Direct Todoist API calls**: Replaced the `@doist/todoist-api-typescript` SDK with plain `fetch()` calls for a leaner setup.

## Planned

### Customization

- [ ] **Configurable sync interval** - instead of a fixed hourly cron, let the user choose how often syncs happen (e.g. every 1h, 2h, 6h, 12h, or once a day).
- [ ] **Configurable deadline shift** - set your own buffer instead of the hardcoded 24 hours. Want 12h? 48h? Your call.
- [ ] **Custom due time** - for all-day assignments, let the user set a specific time (e.g. always at 09:00) instead of leaving it as an all-day task.
- [ ] **Per-course Todoist project routing** - automatically send tasks from different Moodle courses to different Todoist projects or sections.
- [ ] **Priority mapping** - assign Todoist priority levels (P1-P4) based on assignment type, course, or how close the deadline is.
- [ ] **Course-based filtering** - ignore specific Moodle courses you don't want synced (e.g. electives you don't track in Todoist).
- [ ] **Task title templates** - customize what the Todoist task title looks like (e.g. `[CourseName] AssignmentTitle`).
- [ ] **Multi-feed support** - sync from multiple iCal URLs at once, useful if you have accounts across multiple Moodle instances.

### Quality of Life

- [ ] **Todoist labels/tags** - automatically apply labels based on the Moodle course category.
- [ ] **Status dashboard: task count** - show how many tasks were created in the last sync run.
- [ ] **Status dashboard: dark mode** - because staring at a white screen at midnight is painful.
- [ ] **Completion sync** - when a Moodle assignment's original deadline passes, optionally mark the Todoist task as complete.
- [ ] **Sync notifications** - optional push/email notification when new tasks are added to Todoist.
