# Phase 1. Foundation

## Goal

Set up the empty project that every later phase will fill in: the website, the scanner and the database.

## Start when

- Phase 0 passed and its notes are written.

## What to build

1. **One project with two parts.**
   - The website, built with Next.js.
   - The scanner, a plain Node script that lives beside the website.
2. **The database.** PostgreSQL with Prisma. Create the five tables from PRD section 10: Site, File, Sign, Scan, Mistake report.
3. **A settings file** for the blockchain connections and the database address. Keep secrets out of the saved code.
4. **Bring in the reader.** Place the TapeKit reader (or your direct-read code from Phase 0) where the scanner can use it.
5. **A simple first page** on the website, and a first scanner command that writes one test row to the database and reads it back.
6. **Put the `docs` folder** (this pack) inside the project.

## Done when

- The website runs on your machine and shows its first page.
- The scanner command writes and reads one test row.
- The five tables exist in the database.
- Secrets are not in the saved code.

## Watch out

- Do not add logins, payments, user accounts or extra tools. Version 1 has none.
- Do not put the scanner inside the website's request handlers. It is a separate script.
- Keep the structure simple. Two parts, one database.

## Next

Open `phase-02-find-sites.md`.
