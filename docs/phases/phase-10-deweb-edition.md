# Phase 10. DeWEB edition

## Goal

Put a version of the product on TapeOut itself, on X Layer, so it runs where its users are and passes its own checks.

## Start when

- Phase 9 is done.

## What to build

1. **One self-contained page.** It shows the site list with colours and reasons. The results are saved inside the page, so it needs no outside connection.
2. **A build step** that takes the latest results from the database and produces that page.
3. **Use relative paths only.** No outside scripts, styles, fonts or images.
4. **A place to publish it.** You need a circuit on X Layer with an open site space, and some OKB for fees. See the reported costs in `04-FACTS-AND-LINKS.md` and confirm them.
5. **Publish the page** to that site space.
6. **Check it through the TapeOut gateway** in a normal browser.
7. **Write down the republishing steps** so the page can be refreshed when results change.
8. **Link the two versions.** The DeWEB page points to the full website for live search. The website points to the DeWEB page.

## Done when

- The page opens through the TapeOut gateway.
- It shows as fully on-chain.
- The product rates its own page GREEN.
- The republishing steps are written and have been followed once.

## Watch out

- Every outside reference removes the "fully on-chain" status. Check the built page for stray links to outside files.
- Each publish costs fees. Republish when results change in a way that matters, not on every scan.
- Confirm the cost of keeping the site space active (PRD open item O4).

## Next

Open `phase-11-submission-pack.md`.
