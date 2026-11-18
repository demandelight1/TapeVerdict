const WORD_BYTES = 32;

function word(value) {
  return BigInt(value).toString(16).padStart(WORD_BYTES * 2, "0");
}

export function encodeAddressWord(address) {
  const value = String(address).toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(value)) {
    throw new Error(`Invalid EVM address: ${address}`);
  }

  return value.slice(2).padStart(WORD_BYTES * 2, "0");
}

export function encodeUintCall(selector, value) {
  return `${selector}${word(value)}`;
}

export function encodeAddressCall(selector, address) {
  return `${selector}${encodeAddressWord(address)}`;
}

export function encodeAddressUintCall(selector, address, value) {
  return `${selector}${encodeAddressWord(address)}${word(value)}`;
}

export function encodeStringAddressCall(selector, text, address) {
  const bytes = Buffer.from(text, "utf8");
  const paddedBytes = Math.ceil(bytes.length / WORD_BYTES) * WORD_BYTES;
  const hex = bytes.toString("hex").padEnd(paddedBytes * 2, "0");

  return `${selector}${word(WORD_BYTES * 2)}${encodeAddressWord(address)}${word(bytes.length)}${hex}`;
}

export function decodeUint(outcome, label) {
  if (!outcome?.ok || !/^0x[0-9a-f]{64}$/i.test(outcome.value)) {
    throw new Error(`${label} did not return a uint256`);
  }

  return BigInt(outcome.value);
}

export function decodeAddress(outcome, label) {
  if (!outcome?.ok || !/^0x0{24}[0-9a-f]{40}$/i.test(outcome.value)) {
    throw new Error(`${label} did not return an address`);
  }

  const address = `0x${outcome.value.slice(-40).toLowerCase()}`;
  if (/^0x0{40}$/.test(address)) {
    throw new Error(`${label} returned the zero address`);
  }

  return address;
}

export function decodeBool(outcome) {
  if (!outcome?.ok || !/^0x[0-9a-f]{64}$/i.test(outcome.value)) {
    return null;
  }

  const value = BigInt(outcome.value);
  return value === 0n ? false : value === 1n ? true : null;
}

export function classifySiteActivity(isLiveOutcome, isContainerLiveOutcome) {
  const isLive = decodeBool(isLiveOutcome);
  const isContainerLive = decodeBool(isContainerLiveOutcome);

  if (isLive === true || isContainerLive === true) {
    return { active: true, isLive, isContainerLive };
  }

  if (isLive === false && isContainerLive === false) {
    return { active: false, isLive, isContainerLive };
  }

  return { active: null, isLive, isContainerLive };
}

export function fileSetContainer(log) {
  const topic = log?.topics?.[1];
  if (typeof topic !== "string" || !/^0x[0-9a-f]{64}$/i.test(topic)) {
    throw new Error("FileSet log has no valid indexed container");
  }

  return `0x${topic.slice(-40).toLowerCase()}`;
}

export function chunked(values, size) {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error("Chunk size must be a positive integer");
  }

  const chunks = [];
  for (let offset = 0; offset < values.length; offset += size) {
    chunks.push(values.slice(offset, offset + size));
  }
  return chunks;
}
