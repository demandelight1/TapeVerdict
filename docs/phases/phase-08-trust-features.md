# Phase 8. Trust features and Chinese text

## Goal

Add what makes people trust the ratings: an open explanation of the checks, a way to report mistakes, a way to correct them, and Chinese text.

## Start when

- Phase 7 is done.

## What to build

1. **"How we check" page.** List every check from `03-DANGER-CHECKS.md` in simple words: what it looks for and why it matters. State clearly what the product does not check (PRD section 4).
2. **"Report a mistake" form.** Fields: the site, a message, an optional contact. Save it in the Mistake report table with a status.
3. **Hand override command.** A simple command to set or clear a site's colour by hand, with a note. The report page then shows "reviewed by hand" and the note. A later scan must not erase an override unless the site's files change.
4. **A way to see open mistake reports** so they can be reviewed.
5. **Chinese text for every page.** A language switch on each page. Use the draft sentences in `03-DANGER-CHECKS.md` as a start.
6. **Native review of the Chinese text** before release.

## Done when

- The "How we check" page lists every check.
- A submitted mistake report appears in the database.
- An override changes the colour and shows its note on the report.
- Every page switches between English and Chinese.
- A native speaker has reviewed the Chinese text.

## Watch out

- The mistake form is public. Protect it from spam with a simple limit.
- Collect no personal data beyond the optional contact.
- When a site's files change, the override should be cleared and the site rechecked, because the review no longer applies.

## Next

Open `phase-09-review-real-results.md`.
