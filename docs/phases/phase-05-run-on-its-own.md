# Phase 5. Make it run on its own

## Goal

Join the earlier steps into one scan that repeats on a schedule without anyone touching it.

## Start when

- Phase 4 is done.

## What to build

1. **One scan command** that runs, in order: find sites (Phase 2), read files (Phase 3), run checks and set colours (Phase 4).
2. **A record of every scan** in the Scan table: start, end, sites checked, sites changed, errors.
3. **Safe failure.** One failing site must not stop the scan. Log it and continue.
4. **Skip unchanged sites.** A site whose files did not change keeps its colour and is not rechecked.
5. **A schedule** that runs the scan every 6 hours. Use a server cron job or a scheduled GitHub Action.
6. **A guard against overlap.** A new scan must not start while the previous one is still running.

## Done when

- One command runs the full scan from start to finish.
- Each run appears in the Scan table.
- A deliberately broken site is logged and skipped.
- Two scheduled runs finish without you touching anything.

## Watch out

- The scan can take minutes. It must not run inside a short-lived serverless function.
- Be gentle with public connections. Too many requests at once get refused.
- Keep the logs readable. You will need them when something fails.

## Next

Open `phase-06-website.md`.
