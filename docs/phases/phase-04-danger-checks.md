# Phase 4. Danger checks and the colour rule

## Goal

Build the checks that look for danger signs in a site's files, then turn the signs into one colour per site.

## Start when

- Phase 3 is done.
- You have read `03-DANGER-CHECKS.md`.

## What to build

1. **A place for all checks.** One list where each check has its ID, level, English reason and Chinese reason. New checks must be easy to add.
2. **A folder of test pages.** One small page per check with that danger planted in it, plus one clean page.
3. **The checks, one at a time, easiest first.** For each one: build it, run it on its test page, confirm it is caught, run it on the clean page, confirm it is not caught. Then move to the next.

   | Order | Check | What it finds |
   | --- | --- | --- |
   | 1 | Y3 | Connects to outside servers |
   | 2 | Y4 | Live socket connections to outside servers |
   | 3 | Y6 | Hidden frames or forced redirects |
   | 4 | Y1 | Unlimited token or NFT permission |
   | 5 | Y2 | Raw, unreadable signing |
   | 6 | R1 | Asks for secret phrase or private key |
   | 7 | Y5 | Scrambled code |
   | 8 | R2 | Scrambled code that also uses the wallet |
   | 9 | R3 | Changes what the user copies or pastes |

4. **Save every sign** in the Sign table with the site, the file, the check ID, the level and a short piece of evidence.
5. **The extra facts** for each site: uses a wallet or not, fully on-chain or not, number of files, total size.
6. **The colour rule** from PRD section 7. Save the colour on the site.
7. **Run everything on the real sites** saved in Phase 3.

## Done when

- Every check catches its own test page.
- The clean test page comes out GREEN.
- Every real site has a colour and its reasons.
- Each sign points to a file and shows evidence.

## Watch out

- Honest sites also ask for spending permission. That is why Y1 is YELLOW. When unsure, choose YELLOW.
- Normal compressed code is not scrambled code. Y5 and R2 must not fire on it.
- Ordinary links a user clicks are not outside connections for Y3.
- Do not build all nine checks at once. One at a time, each proven on its test page.

## Next

Open `phase-05-run-on-its-own.md`.
