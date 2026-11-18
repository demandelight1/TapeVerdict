# Phase 0 proof notes

## Result

TapeKit successfully resolved and read active TapeOut sites on X Layer (chain ID 196). The X Layer site-store contract is the SiteRegistry proxy at `0xd6efb7adcc9c83dc4924ad56f6a8e4e969b9adb6`. “Site store” describes its role; SiteRegistry is the contract name, not a second address. It is distinct from the per-site container address, the container opener, and the DomainBinding contract.

The TapeKit configuration also lists the X Layer processor factory as `0x1f09daefa827f02cbb40967cc91b259763760761`, the container opener as `0x536add8f30f03b69f6fbf29d425a816a0dc50106`, and DomainBinding as `0x68809fd2fb343aa57d0aeb7f33defe477c9666f9`. During successful resolution, TapeKit reported the SiteRegistry proxy implementation `0xa85c4143d1d4a77f54b8e4ecc9e6d1418afea45f` and DomainBinding implementation `0x5ebf29b80789e548907c707530c3c7607c4347df`; both matched the kernel’s pinned expected implementations.

The verified method is the TapeKit kernel: resolve the canonical site name, open the resolved site, read its manifest paths, then retrieve `index.html`. The kernel verifies retrieved file bytes against the on-chain fingerprint.

## Verified site

- Name: `1.2.344.tape`
- Container: `0xc17315daccfd657a249c2bc8ba6576bafd06940e`
- Status: opened and paid
- Files discovered: 15
- Homepage: retrieved with status `ok`
- Homepage SHA-256: `0x758d3e839a784cdb4db6a74d9407b82ffe77c030965f582ff5fd4adf7f6d516f`
- Homepage text observed:

```html
<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TapePack · DeWEB 链上前端压缩</title>
<script>var TPK=["index.html",""]</script><script src="tpk-loader.js"></script>
</head><body><div id="tpk-loading">加载中… / Loading…<i></i></div></body></html>
```

The observed X Layer address format is `<circuitId>.2.<processorNumber>.tape`.

A second verified site, `1.2.387.tape`, resolved on chain 196 to container `0x1b07ea43d65ff914d33106325c4aa4cb704ca7d4`, with `paid=true` and `opened=true`. It returned 3 files and an `ok` homepage retrieval with SHA-256 `0x9fa1f88e0907373f01ac7030c8293965cccd43232e509549a79876fa2692847f`.

Run `npm run phase0` to repeat the X Layer proof. It prints the manifest paths and the full homepage text. Set `TAPEOUT_SITE` to test another site.

## PRD open items

- O1 (X Layer site store address): resolved as the SiteRegistry proxy above from TapeKit's X Layer configuration; its implementation matched the pinned expected implementation during site resolution.
- O2 (TapeKit X Layer support): resolved by successful resolution and verified file retrieval.
- O3 (deweb-index licence): unresolved; confirm before reusing its code.
- O4 (DeWEB operating cost): unresolved; still to confirm.
- O5 (hackathon eligibility): unresolved; still to confirm with the organisers.
