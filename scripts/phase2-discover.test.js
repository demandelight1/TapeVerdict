import assert from "node:assert/strict";
import test from "node:test";

import {
  chunked,
  classifySiteActivity,
  encodeAddressCall,
  decodeAddress,
  decodeBool,
  decodeUint,
  encodeAddressUintCall,
  encodeStringAddressCall,
  encodeUintCall,
  fileSetContainer,
} from "../lib/phase2-discovery.js";

const address = "0xc17315daccfd657a249c2bc8ba6576bafd06940e";
const trueWord = `0x${"0".repeat(63)}1`;
const falseWord = `0x${"0".repeat(64)}`;

test("encodes dynamic string and address arguments for isLive", () => {
  const encoded = encodeStringAddressCall("0xd6b062cd", "1.2.344.tape", address);
  assert.equal(encoded.slice(0, 10), "0xd6b062cd");
  assert.equal(BigInt(`0x${encoded.slice(10, 74)}`), 64n);
  assert.equal(`0x${encoded.slice(98, 138)}`, address);
  assert.equal(BigInt(`0x${encoded.slice(138, 202)}`), 12n);
});

test("encodes static address and integer arguments", () => {
  const cpuAt = encodeUintCall("0x4bc7cbbd", 344n);
  assert.equal(BigInt(`0x${cpuAt.slice(10)}`), 344n);
  const pathCount = encodeAddressCall("0xb554782b", address);
  assert.equal(`0x${pathCount.slice(34)}`, address);

  const encoded = encodeAddressUintCall("0x8b508494", address, 344n);
  assert.equal(encoded.slice(0, 10), "0x8b508494");
  assert.equal(`0x${encoded.slice(34, 74)}`, address);
  assert.equal(BigInt(`0x${encoded.slice(74)}`), 344n);
});

test("decodes strict ABI booleans and nullable RPC outcomes", () => {
  assert.equal(decodeBool({ ok: true, value: trueWord }), true);
  assert.equal(decodeBool({ ok: true, value: falseWord }), false);
  assert.equal(decodeBool({ revert: true }), null);
  assert.equal(decodeBool({ ok: true, value: `0x${"0".repeat(62)}02` }), null);
});

test("classifies activity only when TapeOut activation results are adequate", () => {
  assert.equal(classifySiteActivity({ ok: true, value: trueWord }, { revert: true }).active, true);
  assert.equal(classifySiteActivity({ ok: true, value: falseWord }, { ok: true, value: falseWord }).active, false);
  assert.equal(classifySiteActivity({ ok: true, value: falseWord }, { err: "timeout" }).active, null);
});

test("validates decoded addresses and unsigned integer outputs", () => {
  assert.equal(decodeAddress({ ok: true, value: `0x${"0".repeat(24)}${address.slice(2)}` }, "cpuAt"), address);
  assert.equal(decodeUint({ ok: true, value: `0x${"0".repeat(63)}9` }, "cpuCount"), 9n);
  assert.throws(() => decodeAddress({ ok: true, value: falseWord }, "cpuAt"), /zero address/);
  assert.throws(() => decodeAddress({ ok: true, value: `0x${"1".repeat(24)}${address.slice(2)}` }, "cpuAt"), /did not return an address/);
});

test("extracts indexed containers and chunks without dropping entries", () => {
  const topic = `0x${"0".repeat(24)}${address.slice(2)}`;
  assert.equal(fileSetContainer({ topics: ["0xabc", topic] }), address);
  assert.deepEqual(chunked([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.throws(() => fileSetContainer({ topics: ["0xabc"] }), /indexed container/);
});
