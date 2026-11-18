# Phase 7. Public links and the badge

## Goal

Let other TapeOut apps read the ratings, and let site owners show a badge.

## Start when

- Phase 6 is done.

## What to build

1. **Three read-only public links.**
   - The list of sites with their colours.
   - One site's full report.
   - A badge image for one site.
2. **A badge.** A small image showing the product name and the site's colour. It must update when the colour changes.
3. **A badge page** where an owner enters their site address and copies a ready snippet that shows the badge and links to the report.
4. **A basic limit** on how often the public links can be called, so one caller cannot overload the service.
5. **A short page** that explains the public links to app builders: what each returns and how often it updates.

## Done when

- Each of the three links returns the right data.
- A separate test page can show a site's rating using only the public link.
- The badge shows the right colour and changes when the rating changes.
- Calling a link too often is refused politely.

## Watch out

- The links are read only. Nothing can be changed through them.
- The badge on a TapeOut site loads from outside, which removes that site's "fully on-chain" status. Say this plainly on the badge page so owners can choose.
- Keep the returned data simple and stable. Other builders will depend on it.

## Next

Open `phase-08-trust-features.md`.
