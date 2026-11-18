# Danger checks

Every check looks at the text of a site's files. Files checked: HTML, JavaScript, CSS, JSON, SVG.

Each check below gives:

- **Meaning:** what it is, in simple words.
- **What to look for:** the clues in the files.
- **Honest uses:** why a clean site might trigger it. This is why most checks are YELLOW.
- **Reason shown:** the sentence the user reads.
- **Test page:** what to plant in a test page to prove the check works.

The Chinese sentences are drafts. A native speaker must review them before release.

## RED checks

### R1. Asks for a secret recovery phrase or private key

- **Meaning:** the site has a place for the user to type the secret words or key that control their wallet. No honest site needs this.
- **What to look for:** input boxes, labels or placeholder text mentioning "seed phrase", "recovery phrase", "secret phrase", "mnemonic", "private key", "12 words", "24 words", 助记词, 私钥. A grid of 12 or 24 small input boxes is a strong clue.
- **Honest uses:** almost none. A wallet tool that creates a new wallet may display words, but it should not ask the user to type existing ones.
- **Reason shown (EN):** This site asks for your secret recovery phrase or private key. No honest site needs this.
- **Reason shown (ZH, draft):** 此网站要求输入助记词或私钥。任何正规网站都不会这样做。
- **Test page:** a form with a text box labelled "Enter your recovery phrase".

### R2. Scrambled code that also uses the wallet

- **Meaning:** a file is deliberately made unreadable (see Y5) and the same file talks to the wallet. Hiding wallet code is a strong warning.
- **What to look for:** the Y5 clues, plus wallet use in the same file: `window.ethereum`, `eth_requestAccounts`, `eth_sendTransaction`, signing calls, or a wallet library.
- **Honest uses:** rare. Normal compressed code (minified) is not scrambled code and must not trigger this.
- **Reason shown (EN):** This site hides its code on purpose, and that hidden code uses your wallet.
- **Reason shown (ZH, draft):** 此网站含有刻意混淆的代码，并且会调用钱包。
- **Test page:** a script that builds its code from an encoded string and runs it, and also requests wallet accounts.

### R3. Changes what the user copies or pastes

- **Meaning:** the site rewrites the clipboard. Attackers use this to swap a wallet address the user copied for their own.
- **What to look for:** code that listens for copy, cut or paste and then writes different text to the clipboard, especially near a pattern that matches wallet addresses (`0x` followed by 40 characters).
- **Honest uses:** a "copy" button that copies exactly what is shown is fine. Only flag code that changes the content during copy or paste.
- **Reason shown (EN):** This site changes what you copy or paste. It may swap a wallet address for another one.
- **Reason shown (ZH, draft):** 此网站会修改你复制或粘贴的内容，可能替换钱包地址。
- **Test page:** a script that replaces any copied wallet address with a fixed address.

## YELLOW checks

### Y1. Asks to spend unlimited tokens or all NFTs

- **Meaning:** the site asks the wallet for permission to move an unlimited amount of the user's tokens, or all of their NFTs.
- **What to look for:** approval calls using the largest possible number (`MaxUint256`, `maxUint256`, `2**256-1`, or a long run of `f` characters), `setApprovalForAll` set to true, `increaseAllowance` with a maximum value, and "Permit" or "Permit2" signing requests.
- **Honest uses:** many trading and marketplace sites do this for convenience. That is why it is YELLOW, not RED.
- **Reason shown (EN):** This site can ask for permission to spend unlimited tokens or all of your NFTs.
- **Reason shown (ZH, draft):** 此网站会请求无限额度的代币授权或全部 NFT 的授权。
- **Test page:** a button that requests an unlimited token approval.

### Y2. Asks the wallet to sign raw, unreadable data

- **Meaning:** the site asks the user to sign data they cannot read. A signature on unknown data can be misused.
- **What to look for:** the `eth_sign` method.
- **Honest uses:** rare in modern sites. Readable message signing for login is normal and must not trigger this.
- **Reason shown (EN):** This site can ask your wallet to sign data you cannot read.
- **Reason shown (ZH, draft):** 此网站会请求钱包签署无法读懂的原始数据。
- **Test page:** a button that calls `eth_sign`.

### Y3. Connects to servers outside TapeOut

- **Meaning:** the site loads things from, or sends things to, servers that are not on TapeOut. Those servers can change at any time.
- **What to look for:** outside web addresses (`http://`, `https://`, or addresses starting with `//`) used to load scripts, styles, images, frames or data, or as the target of a form. Also `url()` and `@import` in CSS, and meta refresh tags.
- **Do not count:** ordinary links a user chooses to click, and connections to public chain nodes used to read the blockchain.
- **Honest uses:** price feeds, fonts, analytics. Common, so YELLOW.
- **Reason shown (EN):** This site connects to servers outside TapeOut.
- **Reason shown (ZH, draft):** 此网站会连接 TapeOut 之外的服务器。
- **Test page:** a page that loads a script from an outside address.

### Y4. Opens live socket connections to outside servers

- **Meaning:** the site opens a constant two-way connection to an outside server. The TapeOut gateway cannot block this kind of connection.
- **What to look for:** `new WebSocket(`, addresses starting with `ws://` or `wss://`, and `RTCPeerConnection`.
- **Honest uses:** live games, chat, live prices.
- **Reason shown (EN):** This site opens a live connection to an outside server. The TapeOut gateway cannot block this kind of connection.
- **Reason shown (ZH, draft):** 此网站会与外部服务器建立实时连接，网关无法拦截这类连接。
- **Test page:** a script that opens a socket connection to an outside address.

### Y5. Scrambled code with no wallet use

- **Meaning:** code made unreadable on purpose. It is not proof of harm, but it stops anyone checking what the code does.
- **What to look for:** `eval(`, `new Function(`, code built from encoded strings and then run, long chains of `String.fromCharCode`, very long encoded text blocks, and variable names in the style `_0x1a2b`.
- **Do not count:** normal compressed code (minified). Short variable names alone are not a clue.
- **Reason shown (EN):** This site hides some of its code on purpose.
- **Reason shown (ZH, draft):** 此网站含有刻意混淆的代码。
- **Test page:** a script that decodes an encoded string and runs it, with no wallet use.

### Y6. Hidden frames or forced redirects

- **Meaning:** the site loads another page invisibly, or sends the user somewhere else without a click.
- **What to look for:** frames with zero size, hidden style or placed off-screen; meta refresh tags; code that changes the page address or opens a new window as soon as the page loads.
- **Honest uses:** some login and embed features.
- **Reason shown (EN):** This site uses hidden frames or sends you to another page without asking.
- **Reason shown (ZH, draft):** 此网站含有隐藏框架或强制跳转。
- **Test page:** a page with an invisible frame, and a page that redirects on load.

## Colour texts

| Colour | English | Chinese (draft) |
| --- | --- | --- |
| GREEN | No danger signs found. | 未发现危险迹象。 |
| YELLOW | Be careful. | 请小心。 |
| RED | Dangerous. | 危险。 |
| GREY | Could not check. | 无法检查。 |

## Extra facts shown on every report

These are not signs. They are plain facts that help the visitor.

- Whether the site uses a wallet.
- Whether the site is fully on-chain (no outside references).
- How many files were checked and their total size.
- When the site last changed and when it was last checked.

## Rules for every check

- A check must point to the file where the clue was found.
- A check must save a short piece of evidence, so a human can confirm it.
- When a clue is weak or unclear, do not raise a sign.
- When unsure between RED and YELLOW, choose YELLOW.
