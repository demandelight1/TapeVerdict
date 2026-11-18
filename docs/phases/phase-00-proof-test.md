# Phase 0. Prove the hard part first

## Goal

Before building any app, prove that you can read one TapeOut site from X Layer on your own machine. Everything else depends on this.

## Start when

- You have read `01-PRD.md` and `02-BUILD-GUIDE.md`.

## What to build

1. **Find the X Layer site store address.** It is not in TapeOut's official spec. Look in the open code of TapeBrowser, deweb-index or TapeOut Audit (links in `04-FACTS-AND-LINKS.md`). Confirm the address answers on X Layer, chain ID 196.
2. **Get the TapeKit reader.** Copy the `kernel` folder from the TapeKit repository. Run it on Node 18 or newer.
3. **Read one site with the reader.** Point it at X Layer. Open one known X Layer site. Print its list of files. Download its home page.
4. **If the reader will not accept X Layer,** read the site store directly through its public read functions: `pathCount`, `pathsRange`, `fileInfo`, `read`, `readRange`.
5. **Write down the address format** X Layer sites use.
6. **Write down the open items** from PRD section 13 that you resolved.

## Done when

- You can print the file list of one X Layer site.
- You can print the text of that site's home page.
- You have a short note with: the site store address, the method that worked (reader or direct), and the address format.

## Watch out

- The reader's documentation only describes BNB Chain. Do not assume it works on X Layer until you see it.
- The function names come from the BNB spec. Confirm they are the same on X Layer.
- Use a small test folder for this. Do not start the real project yet.

## Stop

If neither the reader nor the direct method can read a site from X Layer, stop here and report. Do not build anything else.

## Next

Open `phase-01-foundation.md`.
