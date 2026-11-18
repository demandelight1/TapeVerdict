# Phase 9. Review real results

## Goal

Compare the product's ratings with a human look at real sites, and fix whatever is wrong before others rely on it.

## Start when

- Phase 8 is done.

## What to do

1. **Pick ten real sites.** Include every RED site, several YELLOW and several GREEN.
2. **Look at each one by hand.** Open the site and read the files that were flagged. Decide for yourself what the colour should be.
3. **Compare** your view with the product's rating.
4. **Fix the checks that got it wrong.**
   - A check that fires on honest code needs to be narrower.
   - A check that missed something needs a new clue.
   - After each fix, rerun the test pages from Phase 4 so nothing else broke.
5. **Use overrides** only for single sites that are special cases. Fix the check when the problem is general.
6. **Keep notes.** Record what you changed and any interesting findings, such as how many sites connect to outside servers. These notes feed the demo.

## Done when

- Ten hand reviews agree with the product's ratings.
- No RED remains that you cannot explain in one sentence.
- The Phase 4 test pages still pass.
- Your notes list the changes and the findings.

## Watch out

- A wrong RED harms an honest builder. Treat every RED as a claim you must be able to defend.
- Do not loosen a check just to turn the list green. The aim is correct results.
- If most sites are YELLOW for the same reason, check whether that reason is too broad.

## Next

Open `phase-10-deweb-edition.md`.
