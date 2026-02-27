# Project Roadmap

This file tracks the upcoming features, optimizations, and known issues for the Eduvidual to Todoist Sync project.

## Completed Optimizations
- [x] **Rich Tasks**: Extract descriptions and URLs from the Moodle iCal feed and map them to the Todoist task description.
- [x] **Filter Past Events**: Prevent "Ghost" events by ignoring assignments whose original deadlines have already passed.
- [x] **Incremental State Saving**: Save the Netlify Blob state incrementally after each successful task creation to prevent data loss if the function times out (10s limit).

## Future Ideas
- [ ] Allow custom time-shifting values (e.g., subtract 48 hours instead of 24).
- [ ] Map Moodle course categories to specific Todoist labels/tags.
