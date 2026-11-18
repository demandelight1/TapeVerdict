# Phase 3. Read each site's files

## Goal

For every saved site, record its files and download the ones that can be checked.

## Start when

- Phase 2 is done.

## What to build

For every site in the Site table:

1. **List its files.** Save each file's path, type, size and fingerprint in the File table.
2. **Download only text files:** HTML, JavaScript, CSS, JSON and SVG. Skip images, video, audio and fonts, but still record them.
3. **Read the optional site info file** (`deweb.json`) when it exists. Save the site's name, description and category. If it is missing, use the home page title as the name.
4. **Detect changes.** Compare each file's fingerprint with the last run. Mark the site as changed only when a fingerprint is new or different. Do not download unchanged files again.
5. **Handle the GREY cases.** Mark a site as "could not check" when:
   - it is not active,
   - its files are incomplete,
   - its files fail TapeOut's integrity check.
6. **Set a size limit** for a single file. Record any file skipped for size.

## Done when

- Every site has its files recorded.
- Text files are downloaded and others are skipped.
- A second run downloads nothing when nothing changed.
- At least one GREY case is handled without a crash.

## Watch out

- One broken site must not stop the others. Record the problem and move on.
- SVG files can contain code. They count as text files.
- Keep the downloaded text somewhere the checks in Phase 4 can read it.

## Next

Open `phase-04-danger-checks.md`.
