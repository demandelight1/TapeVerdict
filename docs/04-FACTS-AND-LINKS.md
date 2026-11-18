# Facts and links

Everything here was read from the linked sources. Items marked **confirm** come from a single community source or could not be fully checked, so confirm them during Phase 0.

## The TapeKit reader

- It is the `kernel` folder of the TapeKit repository, named `@tapekit/kernel`.
- It is a plain ES module with no dependencies. It runs in browsers and in Node 18 or newer.
- It is not on npm yet. Copy it from the repository.
- Documented use: create a kernel, resolve a site name, open the site, read the list of file paths, get a file. Files come back already checked against the fingerprint stored on-chain.
- A file's status is `ok`, `no-hash` or `incomplete`. Only `ok` counts as verified.
- Licence: MIT for the code, CC0 for the spec text.
- The README and the spec document BNB Chain only. They do not mention X Layer.

## The site store (SiteRegistry)

Public read functions listed in the spec:

- **Finding sites:** `cpuCount()`, `cpuAt(i)`, `isCPU(addr)`, `accountOf(processor, id)`, `isOpened(processor, id)`, `ownerOf(id)`, and `token()` on the site space for reverse lookup.
- **File details:** `fileInfo(container, path)` returns size, content type, fingerprint (SHA-256), last update and chunk count. A chunk count of 0 means the file does not exist.
- **File list:** `pathCount`, `pathsRange` (paged), `paths` (avoid on large sites), `fallbackPath`.
- **File contents:** `read` for files up to 96 KB, `readRange(container, path, offset, len)` for larger files.
- **Active or not:** `isLive(name, container)`, `paidUntil`, `isContainerLive(container)`, `containerPaidUntil`, `monthlyFee`.

Records (events) the site store emits:

- `FileSet(container, path, size, sha256Hash, contentType)`
- `FileRemoved(container, path)`
- `FallbackSet(container, path)`
- `OperatorSet(container, operator, setBy, until)`

Other facts:

- Each file is split into chunks of at most 24,000 bytes. A file can have at most 350 chunks (8,400,000 bytes).
- The spec says most public connections do not return past records. The official reader polls read functions instead.
- **Confirm:** that these function names are the same on X Layer.

## Chains and addresses

- X Layer is chain ID 196. BNB Chain is chain ID 56.
- BNB Chain addresses from the spec:
  - Processor factory: `0x68224F668083c29e9800Be2a646d42d18cedF7e2`
  - Container opener: `0x021745DE2f42A7839d96f2d3634d0294487D81F1`
  - SiteRegistry (proxy): `0xd006ffdd5Ae313B17729621A00999cD3C71CE5e6`
  - DomainBinding (proxy): `0x861EE183de2BBE4a6ecf9D15812C123b566a3DB7`
- **The X Layer addresses are not in the official spec.** Take them from the open code of TapeBrowser, deweb-index or TapeOut Audit, then confirm on-chain.
- **Confirm:** TapeBrowser's README says X Layer and Base use the same contract addresses as each other.

## Site addresses

- BNB Chain form: `circuit.processor.tape`, for example `4246.0.tape`.
- **Confirm:** X Layer form, per TapeBrowser: `circuit.2.processor`, for example `1.2.344` (circuit 1 on processor 344). The `2` marks X Layer. Base uses `3`.
- Gateway form, seen in public links: `1-2-387.tapekit.org`.

## Gateway rules that matter for the checks

- The gateway blocks and records outside requests for data, images, scripts, styles and frames by default.
- WebSocket and WebRTC connections bypass that blocking. This is why check Y4 exists.
- A site earns the "100% on-chain" badge only if its HTML and CSS reference nothing outside, and no outside request was blocked while it ran.
- Reading the blockchain through a wallet or the configured public nodes is allowed.

## The optional site info file (deweb.json)

- A proposal (TAP idea 57), not a finished standard.
- Fields, all optional: `category`, `name`, `description`, `logo`, `cover`, `author`, `generator`, `paid`.
- Where it can be: `/deweb.json`, `/deweb.yml`, `/.well-known/deweb.json`, or inside `index.html` as a script tag of type `application/deweb+json`.
- Proposed categories: `game`, `finance`, `tool`, `social`, `infra`, `other`.
- Only TapeBrowser is described as reading it today, and only the category.

## Existing projects that help

- **deweb-index:** builds a list of sites from "file added" records. BNB by default. Its README says X Layer can be added by a setting. **Confirm its licence before reusing code.**
- **TapeBrowser:** a desktop browser with an "all sites" list across chains. Useful for the X Layer addresses and for comparing site counts.
- **TapeOut Audit:** checks file integrity on X Layer. An earlier public count found 68 open site spaces and 31 sites with 417 files. It does not check for harmful content.
- **TapeWeb:** a web list of sites on BNB Chain and X Layer. Useful for comparing site counts.

## Costs reported by one builder on X Layer (confirm)

- Create a processor: 0.0066 OKB
- Mint one NAND: 0.00066 OKB
- Tape out a one-gate circuit: 0.0013 OKB
- Open the circuit's site space: 0.08 OKB
- Bind the site name: free on X Layer

## Hackathon submission facts

- Projects must use TapeOut circuits, contracts or on-chain data on X Layer, or run on X Layer DeWEB.
- Websites and tools submit an access link and an explanation of which TapeOut features they use.
- The description covers the product, target users, revenue model and why users would pay.
- The demo video should be 3 minutes or less and cover the problem, core features, users, business model and how the project uses TapeOut.
- Judging: user value and commercial potential, innovation, ecosystem integration, product readiness and user experience, demo video.
- Submission is through the form on the hackathon page. Support is through the Telegram channel linked there.
- The page does not list restricted regions. Confirm eligibility in the Telegram channel.

## Links

- TapeKit: https://github.com/TapeOutProtocol/TapeKit
- TapeKit spec: https://github.com/TapeOutProtocol/TapeKit/blob/main/SPEC.md
- TapeBrowser: https://github.com/trytotapeout/TapeBrowser
- deweb-index: https://github.com/yy54816464/deweb-index
- TapeOut Audit: https://github.com/Arindam5294/tapeout-audit
- TapeWeb: https://web.tapeout.link/
- Site info proposal (TAP idea 57): https://github.com/TapeOutProtocol/TAPs/issues/57
- Community project list: https://github.com/trytotapeout/awesome-tapeout
- One builder's X Layer site steps and fees: https://github.com/Fizzl13/x402-doctor/pull/428
- Hackathon page: https://web3.okx.com/xlayer/build-x-series
