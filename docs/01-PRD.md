# PRD: TapeVerdict (working name)

Safety checker for TapeOut websites. Version 1.1.

## 1. Summary

A website that checks any TapeOut site and shows a clear colour: green, yellow, red or grey, with the reason in one sentence. It also lists all TapeOut sites with their colour.

## 2. Problem

TapeOut proves that a site's files were not changed. It does not tell a visitor whether those files are harmful. TapeOut sites cannot be taken down, so a warning label is the only protection a visitor has.

## 3. Goals

- G1. Every site on X Layer has a colour and a reason.
- G2. A visitor gets an answer in under 5 seconds.
- G3. Site owners can show a badge.
- G4. Other TapeOut apps can read the ratings.
- G5. A version of the product runs on X Layer DeWEB.

## 4. Not in scope (version 1)

- Smart contracts, wallet connection, payments, user accounts.
- Checking the smart contracts a site talks to.
- Running sites in a real browser to watch their behaviour.
- Any claim that a site is guaranteed safe.

## 5. Users

- **Visitor:** wants to know whether it is safe to connect a wallet.
- **Site owner:** wants to prove the site is clean.
- **App builder** (site lists, browsers): wants ratings to display.

## 6. User stories

- As a visitor, I paste a site address and see a colour and a reason.
- As a visitor, I browse all sites and filter by colour.
- As a site owner, I copy a badge for my site.
- As a site owner, I report a wrong result.
- As an app builder, I fetch a site's rating from a public link.

## 7. Ratings

| Colour | Meaning shown to the user |
| --- | --- |
| GREEN | No danger signs found. |
| YELLOW | Be careful. At least one caution sign. |
| RED | Dangerous. At least one danger sign. |
| GREY | Could not check. |

GREY is used when the site is not active, its files are incomplete, or its files fail TapeOut's own integrity check.

**Colour rule:** any RED sign gives RED. Otherwise any YELLOW sign gives YELLOW. Otherwise GREEN. A hand review can override the colour, and the report then says "reviewed by hand".

## 8. Danger checks (version 1)

Full detail for each check is in `03-DANGER-CHECKS.md`.

**RED**

- R1. Asks for a secret recovery phrase or private key.
- R2. Deliberately scrambled code that also uses the wallet.
- R3. Changes what the user copies or pastes (address swap).

**YELLOW**

- Y1. Asks permission to spend unlimited tokens or all NFTs.
- Y2. Asks the wallet to sign raw, unreadable data.
- Y3. Connects to servers outside TapeOut.
- Y4. Opens live socket connections to outside servers. The TapeOut gateway cannot block these.
- Y5. Scrambled code with no wallet use.
- Y6. Hidden frames or forced redirects.

Each check has an ID, a level, a one-sentence reason in English and Chinese, and the file where it was found. All checks live in one list so new ones can be added later.

Files checked: HTML, JavaScript, CSS, JSON, SVG. Images and media are skipped.

## 9. Features

### 9.1 Scanner (runs every 6 hours)

- a. **Site list.** X Layer first, BNB second.
  - Method 1: read the public "file added" records.
  - Method 2: walk through processors and circuits and ask which have an open site.
- b. **File list and download.** Use the TapeKit reader. Fallback: call the site store's public read functions directly.
- c. **Change detection.** Store each file's fingerprint. Skip sites with no changed files.
- d. **Checks.** Run all checks, save the signs and the final colour.
- e. **Site info.** Read the optional site info file (`deweb.json`) for the site's name, description and category.

### 9.2 Website

- Home: search box, site list, filters (chain, colour), totals per colour.
- Report page: colour, reasons, files checked, date checked, whether the site uses a wallet, whether it is fully on-chain, link to open the site.
- How we check: every check explained in simple words.
- Badge page: a copyable badge for owners.
- Report a mistake: a short form, stored for hand review.
- English and Chinese.
- Works well on phones.

### 9.3 Public links for app builders (read only)

- The list of sites with colours.
- One site's full report.
- A badge image for one site.

### 9.4 DeWEB edition

- One page with the site list and colours saved inside it, so it needs no outside connection.
- Published on X Layer. Republished when results change.

### 9.5 Hand review

- A simple command to set or clear an override with a note.

## 10. Data stored

| Table | Fields |
| --- | --- |
| Site | address, chain, name, category, active or not, colour, last checked, last changed, override note |
| File | site, path, type, size, fingerprint, last seen |
| Sign | site, file, check ID, level, short evidence |
| Scan | start, end, sites checked, sites changed, errors |
| Mistake report | site, message, contact, date, status |

## 11. Technology

- Next.js for the pages and the public links.
- One plain Node script for the scanner.
- PostgreSQL with Prisma.
- The TapeKit reader (MIT licence), copied from its repository.
- A scheduler: a server cron job or a scheduled GitHub Action.
- The scanner must not run inside a short-lived serverless function.

## 12. Facts already confirmed

- The TapeKit reader runs on Node 18 or newer and is not on npm yet.
- The site store offers public read functions for file lists, file details and file contents.
- Most public connections do not return past records.
- TapeOut's official spec lists only BNB contract addresses.

More detail and links are in `04-FACTS-AND-LINKS.md`.

## 13. Open items (resolve in Phase 0)

- O1. The X Layer site store address.
- O2. Whether the TapeKit reader accepts X Layer settings.
- O3. The licence of deweb-index, before reusing its code.
- O4. The cost of keeping the DeWEB edition active.
- O5. The builder's eligibility for the hackathon.

## 14. Quality rules

- Never write "safe". Green reads "no danger signs found".
- When unsure between red and yellow, choose yellow.
- Every report shows the date and what was checked.
- No personal data is collected, except an optional contact in a mistake report.

## 15. Done means

- All X Layer sites have a colour and a reason.
- Changed sites are rechecked within 24 hours.
- 10 sites reviewed by hand agree with the results.
- At least 3 planted test pages are caught.
- The DeWEB edition opens through the TapeOut gateway.
- The demo video is 3 minutes or less.

## 16. Revenue

- A paid "reviewed" badge for site owners.
- Paid higher-volume access for apps that show the ratings.
- Free for visitors.

## 17. Risks

| Risk | Answer |
| --- | --- |
| Wrong red results harm honest builders | Yellow by default, mistake form, hand override |
| X Layer reader support is unknown | Fallback in 9.1b |
| A rival adds scanning | Ship early and publish the check list |
| No scam has been recorded on TapeOut yet | Present it as protection before it happens, and show real findings from the first full scan |

## 18. Later

- Base chain.
- Alerts when a site's colour changes.
- Checking the contracts a site calls.
- A browser add-on that shows the colour on every site.
