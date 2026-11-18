# Phase 6. Website: home and report pages

## Goal

Build the pages people see: a home page to search and browse, and a report page for each site.

## Start when

- Phase 5 is done, so the database already holds real results.

## What to build

1. **Home page.**
   - A search box for a site address.
   - The list of all sites with their colour, name and chain.
   - Filters by chain and by colour.
   - Totals for each colour.
2. **Report page**, one per site.
   - The colour and its meaning.
   - The reasons, one sentence each, with the file where each was found.
   - The extra facts: uses a wallet or not, fully on-chain or not, files checked, total size.
   - When the site last changed and when it was last checked.
   - A link to open the site.
   - "Reviewed by hand" and the note, when an override exists.
3. **Search that understands every address form** noted in Phase 0, including the gateway form.
4. **A clear message** when an address is unknown or not yet checked.
5. **A phone layout.** Most visitors will be on phones.

## Done when

- Pasting an address shows its report in under 5 seconds.
- The filters and totals work.
- An unknown address shows a clear message, not an error.
- Both pages read well on a phone.
- The word "safe" appears nowhere.

## Watch out

- GREEN must read "no danger signs found". Never "safe".
- The pages only read from the database. They never start a scan.
- Keep the design plain and clear. The colour and the reason are what matter.

## Next

Open `phase-07-public-links-and-badge.md`.
