# Build guide: TapeVerdict

This guide tells you what to build, in what order, and how to know each part is finished. Each stage has its own file in the `phases` folder.

## How to follow this guide

- Build in the order given. Each phase sits on the one before it, like rows of bricks.
- Do not start a phase until every line under "Done when" in the previous phase is true.
- Build only what the current phase describes. Do not jump ahead.
- Save the project at the end of every phase.
- If a "Stop" rule triggers, stop and report before going further.

## The order

| Phase | What you build | Start when | When finished, go to |
| --- | --- | --- | --- |
| 0 | Proof that one X Layer site can be read | You have read the PRD | Phase 1 |
| 1 | The project foundation and database | Phase 0 passed | Phase 2 |
| 2 | The list of every site | Phase 1 done | Phase 3 |
| 3 | Reading each site's files | Phase 2 done | Phase 4 |
| 4 | The danger checks and the colour rule | Phase 3 done | Phase 5 |
| 5 | Scanning that runs on its own | Phase 4 done | Phase 6 |
| 6 | The website: home and report pages | Phase 5 done | Phase 7 |
| 7 | Public links and the badge | Phase 6 done | Phase 8 |
| 8 | Trust features and Chinese text | Phase 7 done | Phase 9 |
| 9 | Hand review of real results | Phase 8 done | Phase 10 |
| 10 | The DeWEB edition | Phase 9 done | Phase 11 |
| 11 | The submission pack | Phase 10 done | Finished |

## Why this order

1. **Phase 0 comes first** because everything depends on reading a site from X Layer. If that fails, nothing else matters.
2. **Phases 1 to 5 build the engine.** It finds sites, reads files, checks them and repeats on its own. No pages are needed yet.
3. **Phases 6 to 8 build what people see.** By then the database already holds real results to show.
4. **Phase 9 is quality.** Real results are compared with a human look before anyone else sees them.
5. **Phases 10 and 11 are the finish.** The product goes onto TapeOut itself and the submission is prepared.

## What each phase file contains

- **Goal:** what this phase achieves, in one or two sentences.
- **Start when:** what must already be true.
- **What to build:** the tasks, in order.
- **Done when:** the checks that prove the phase is finished.
- **Watch out:** common mistakes.
- **Stop:** only in some phases. The condition that means you must stop and report.
- **Next:** the phase to open after this one.

## Related documents

- `01-PRD.md` says what the product must do.
- `03-DANGER-CHECKS.md` describes every check in detail.
- `04-FACTS-AND-LINKS.md` holds confirmed technical facts and links.
- `05-GLOSSARY.md` explains the terms.
- `06-PROGRESS-CHECKLIST.md` is where you tick off finished work.
