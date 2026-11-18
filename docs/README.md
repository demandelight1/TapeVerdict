# TapeVerdict documentation pack

TapeVerdict is a working name. Rename it freely.

TapeVerdict is a safety checker for TapeOut websites. A visitor pastes the address of a TapeOut site and gets a colour (green, yellow, red or grey) with a one-sentence reason.

## What is in this pack

| File | What it is | When to read it |
| --- | --- | --- |
| `01-PRD.md` | What the product is and what it must do | First |
| `02-BUILD-GUIDE.md` | The build order and the rules for building | Second |
| `phases/phase-00` to `phase-11` | One file per building stage | One at a time, in order |
| `03-DANGER-CHECKS.md` | Every safety check in detail | During Phase 4 and Phase 8 |
| `04-FACTS-AND-LINKS.md` | Facts already confirmed, with links | Whenever a technical detail is needed |
| `05-GLOSSARY.md` | Simple meanings of the terms used | Whenever a word is unclear |
| `06-PROGRESS-CHECKLIST.md` | Tick boxes for every stage | After finishing each task |

## How to use it

1. Put this whole folder inside the project, in a folder named `docs`.
2. Read `01-PRD.md` and `02-BUILD-GUIDE.md` fully before building anything.
3. Open the phase file for the stage you are on. Build only what that file describes.
4. When every line under "Done when" is true, tick it in `06-PROGRESS-CHECKLIST.md`.
5. Only then open the next phase file.

## Working with a coding assistant

- Let the assistant read `01-PRD.md`, `02-BUILD-GUIDE.md` and the current phase file before it writes anything.
- Work on one phase at a time. Do not ask for two phases in one go.
- Check the "Done when" list yourself. Do not accept "it works" without seeing it.
- Save the project at the end of every phase.

## Rules that never change

- Never describe a site as "safe". Green means "no danger signs found".
- When unsure between red and yellow, choose yellow.
- No smart contracts, no wallet connection, no payments, no user accounts in version 1.
- If a phase has a "Stop" rule and it triggers, stop and report before building more.
