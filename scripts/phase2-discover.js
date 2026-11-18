import "dotenv/config";

import { createKernel, createRpc, keccakHex } from "../TapeKit/kernel/src/index.js";
import { prisma } from "../lib/prisma.js";
import { xlayerSettings } from "../config/settings.js";
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
import { IMPL_SLOT, rpcOptionsFor, XLAYER_MAINNET } from "../TapeKit/kernel/src/config.js";
import { EVENT_SIG, SEL, TOPIC } from "../TapeKit/kernel/src/selectors.js";

const RPC_CALL_GROUP_SIZE = 40;
const RPC_GROUP_DELAY_MS = 150;
const RPC_GROUP_RETRY_COUNT = 2;
const RPC_GROUP_RETRY_DELAY_MS = 750;
const MAX_EVENT_WINDOWS = 2_000;
const MAX_CPU_COUNT = 10_000;
const MAX_ID_PER_CPU = 1_000_000n;
const MAX_CIRCUIT_CANDIDATES = 2_000_000n;
const ERROR_SAMPLE_LIMIT = 100;
const CHAIN = xlayerSettings.chainId;
const FILE_SET_TOPIC = keccakHex(EVENT_SIG.FileSet);
const NEXT_ID_SELECTOR = keccakHex("nextId()").slice(0, 10);
const IMPLEMENTATION_SLOT = IMPL_SLOT;
const KNOWN_SITES = new Map([
  ["1.2.344.tape", "0xc17315daccfd657a249c2bc8ba6576bafd06940e"],
  ["1.2.387.tape", "0x1b07ea43d65ff914d33106325c4aa4cb704ca7d4"],
]);

class ScanIssues {
  failures = 0;
  warnings = 0;
  samples = [];

  add(kind, context, reason) {
    if (kind === "failure") this.failures += 1;
    else this.warnings += 1;
    if (this.samples.length < ERROR_SAMPLE_LIMIT) {
      this.samples.push({ kind, context, reason: String(reason).slice(0, 300) });
    }
  }

  toJson(metadata) {
    if (!this.failures && !this.warnings) return null;
    return {
      ...metadata,
      failureCount: this.failures,
      warningCount: this.warnings,
      samples: this.samples,
    };
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const shortError = (error) => String(error?.message || error).slice(0, 300);
const toHex = (value) => `0x${BigInt(value).toString(16)}`;
const hasCode = (outcome) => outcome?.ok && /^0x[0-9a-f]+$/i.test(outcome.value) && !/^0x0*$/i.test(outcome.value);
const request = (method, params, context) => ({ method, params, context });
const ethCall = (to, data, block, context) =>
  request("eth_call", [{ to, data }, block], context);

function implementationFromStorage(outcome, label) {
  if (!outcome?.ok || !/^0x0{24}[0-9a-f]{40}$/i.test(outcome.value)) {
    throw new Error(`${label} implementation slot could not be read`);
  }
  return `0x${outcome.value.slice(-40).toLowerCase()}`;
}

async function runRequests(rpc, requests, issues, label) {
  const outcomes = [];
  let completed = 0;
  let nextProgress = 500;
  async function runGroup(group) {
    let pending = group.map((item, index) => ({ item, index, outcome: null }));
    const outcomes = new Array(group.length);
    for (let attempt = 0; attempt <= RPC_GROUP_RETRY_COUNT; attempt += 1) {
      try {
        const results = await rpc.many(pending.map(({ item }) => item));
        if (results.length !== pending.length) {
          throw new Error(`RPC returned ${results.length} results for ${pending.length} requests`);
        }
        const retry = [];
        results.forEach((outcome, resultIndex) => {
          const entry = pending[resultIndex];
          if (!outcome || outcome.err) {
            retry.push({
              ...entry,
              outcome: outcome || { err: "RPC returned no outcome" },
            });
          } else {
            outcomes[entry.index] = outcome;
          }
        });
        pending = retry;
      } catch (error) {
        pending = pending.map((entry) => ({
          ...entry,
          outcome: { err: shortError(error) },
        }));
      }

      if (pending.length && attempt < RPC_GROUP_RETRY_COUNT) {
        await sleep(RPC_GROUP_RETRY_DELAY_MS * 2 ** attempt);
      }
    }

    if (pending.length > 4) {
      const midpoint = Math.ceil(pending.length / 2);
      const splitResults = [
        ...(await runGroup(pending.slice(0, midpoint).map(({ item }) => item))),
        ...(await runGroup(pending.slice(midpoint).map(({ item }) => item))),
      ];
      splitResults.forEach((outcome, index) => {
        outcomes[pending[index].index] = outcome;
      });
    } else {
      for (const { item, index, outcome } of pending) {
        const error = shortError(outcome?.err || "RPC request failed after retries");
        issues.add("failure", item.context, error);
        outcomes[index] = outcome || { err: error };
      }
    }
    return outcomes;
  }

  for (const group of chunked(requests, RPC_CALL_GROUP_SIZE)) {
    outcomes.push(...(await runGroup(group)));
    completed += group.length;
    if (completed >= nextProgress || completed === requests.length) {
      console.log(`${label}: ${completed}/${requests.length} results received`);
      while (nextProgress <= completed) nextProgress += 500;
    }
    if (requests.length > RPC_CALL_GROUP_SIZE) await sleep(RPC_GROUP_DELAY_MS);
  }
  return outcomes;
}

async function runCalls(rpc, calls, block, issues, label = "RPC calls") {
  return runRequests(
    rpc,
    calls.map((call) => ethCall(call.to, call.data, block, call.context)),
    issues,
    label,
  );
}

async function readSingle(rpc, method, params, context) {
  const [outcome] = await rpc.many([request(method, params, context)]);
  if (!outcome?.ok) throw new Error(`${context}: ${outcome?.err || "RPC read failed"}`);
  return outcome;
}

async function verifyNetwork(rpc, block, issues) {
  const chainResult = await readSingle(rpc, "eth_chainId", [], "chain ID");
  if (BigInt(chainResult.value) !== BigInt(CHAIN)) {
    throw new Error(`Expected X Layer chain ID ${CHAIN}, received ${BigInt(chainResult.value)}`);
  }

  const contracts = [
    ["factory", xlayerSettings.contracts.factory],
    ["opener", xlayerSettings.contracts.opener],
    ["site registry", xlayerSettings.contracts.siteRegistry],
    ["domain binding", xlayerSettings.contracts.domainBinding],
  ];
  const codeOutcomes = await Promise.all(
    contracts.map(([label, address]) =>
      readSingle(rpc, "eth_getCode", [address, block], `${label} code`),
    ),
  );
  codeOutcomes.forEach((outcome, index) => {
    if (!hasCode(outcome)) throw new Error(`${contracts[index][0]} has no code at pinned block ${block}`);
  });

  if (FILE_SET_TOPIC.toLowerCase() !== TOPIC.FileSet.toLowerCase()) {
    throw new Error("TapeKit FileSet event signature and configured topic do not match");
  }

  const proxies = [
    [xlayerSettings.contracts.siteRegistry, XLAYER_MAINNET.expectedImpl[xlayerSettings.contracts.siteRegistry]],
    [xlayerSettings.contracts.domainBinding, XLAYER_MAINNET.expectedImpl[xlayerSettings.contracts.domainBinding]],
  ];
  const proxyOutcomes = await Promise.all(
    proxies.map(([address]) => rpc.storageAt(address, IMPLEMENTATION_SLOT, block)),
  );
  const implementations = [];
  for (let index = 0; index < proxies.length; index += 1) {
    const [address, expectedImplementations] = proxies[index];
    const actual = implementationFromStorage(proxyOutcomes[index], address);
    if (!expectedImplementations?.some((expected) => expected.toLowerCase() === actual)) {
      throw new Error(`Unexpected implementation ${actual} for proxy ${address}`);
    }
    implementations.push(actual);
  }
  const factorySlot = await rpc.storageAt(
    xlayerSettings.contracts.factory,
    IMPLEMENTATION_SLOT,
    block,
  );
  const factoryImplementation = implementationFromStorage(factorySlot, "X Layer factory");
  if (factoryImplementation !== XLAYER_MAINNET.factorySeal.implementation.toLowerCase()) {
    issues.add(
      "warning",
      "factory implementation pin",
      `On-chain implementation ${factoryImplementation} differs from TapeKit's factory-seal reference ${XLAYER_MAINNET.factorySeal.implementation}`,
    );
  }
  implementations.push(factoryImplementation);
  const implementationCode = await Promise.all(
    implementations.map((address) =>
      readSingle(rpc, "eth_getCode", [address, block], `implementation ${address} code`),
    ),
  );
  implementationCode.forEach((outcome, index) => {
    if (!hasCode(outcome)) throw new Error(`Pinned implementation ${implementations[index]} has no code`);
  });

  return {
    chainId: CHAIN,
    fileSetTopic: FILE_SET_TOPIC,
    factoryImplementation,
  };
}

async function findRegistryDeploymentBlock(rpc, pinnedBlock) {
  const registry = xlayerSettings.contracts.siteRegistry;
  let low = 0n;
  let high = BigInt(pinnedBlock);
  while (low < high) {
    const middle = (low + high) / 2n;
    const code = await readSingle(
      rpc,
      "eth_getCode",
      [registry, toHex(middle)],
      `SiteRegistry code at block ${middle}`,
    );
    if (hasCode(code)) high = middle;
    else low = middle + 1n;
  }

  const codeAtStart = await readSingle(
    rpc,
    "eth_getCode",
    [registry, toHex(low)],
    `SiteRegistry code at deployment block ${low}`,
  );
  if (!hasCode(codeAtStart)) throw new Error("Could not establish the SiteRegistry deployment block");
  return low;
}

async function probeFileSetLogs(rpc, deploymentBlock, pinnedBlock) {
  const from = BigInt(deploymentBlock);
  const to = from + 99n > BigInt(pinnedBlock) ? BigInt(pinnedBlock) : from + 99n;
  const [outcome] = await rpc.many([
    request(
      "eth_getLogs",
      [{
        address: xlayerSettings.contracts.siteRegistry,
        fromBlock: toHex(from),
        toBlock: toHex(to),
        topics: [FILE_SET_TOPIC],
      }],
      "FileSet history probe",
    ),
  ]);
  if (!outcome?.ok || !Array.isArray(outcome.logs)) {
    throw new Error(outcome?.err || "FileSet history probe returned no valid logs");
  }
  return { from, to, logCount: outcome.logs.length };
}

async function discoverFromEvents(rpc, kernel, deploymentBlock, pinnedBlock, issues) {
  const containers = new Set();
  for (let from = BigInt(deploymentBlock); from <= BigInt(pinnedBlock); from += 100n) {
    const to = from + 99n > BigInt(pinnedBlock) ? BigInt(pinnedBlock) : from + 99n;
    const [outcome] = await rpc.many([
      request(
        "eth_getLogs",
        [{
          address: xlayerSettings.contracts.siteRegistry,
          fromBlock: toHex(from),
          toBlock: toHex(to),
          topics: [FILE_SET_TOPIC],
        }],
        `FileSet logs ${from}-${to}`,
      ),
    ]);
    if (!outcome?.ok || !Array.isArray(outcome.logs)) {
      throw new Error(`FileSet log read failed for ${from}-${to}: ${outcome?.err || "invalid result"}`);
    }
    for (const log of outcome.logs) {
      try {
        containers.add(fileSetContainer(log));
      } catch (error) {
        issues.add("failure", `FileSet log in ${from}-${to}`, shortError(error));
      }
    }
    if (containers.size && containers.size % 100 === 0) {
      console.log(`FileSet containers found: ${containers.size}; through block ${to}`);
    }
  }

  const sites = [];
  for (const containerAddress of containers) {
    try {
      const resolution = await kernel.resolve(containerAddress, {
        chainId: CHAIN,
        block: toHex(pinnedBlock),
        fresh: true,
      });
      if (!["ok", "unpaid"].includes(resolution.status) || !resolution.opened) {
        issues.add("failure", containerAddress, `TapeKit could not resolve an opened site (${resolution.status})`);
        continue;
      }
      const manifest = await kernel.manifest(resolution, { block: toHex(pinnedBlock) });
      if (!manifest.paths.length) {
        issues.add("failure", containerAddress, "SiteRegistry returned no files for the FileSet container");
        continue;
      }
      sites.push({
        address: resolution.name,
        containerAddress: containerAddress.toLowerCase(),
        cpu: BigInt(resolution.cpu),
        tokenId: BigInt(resolution.tokenId),
      });
    } catch (error) {
      issues.add("failure", containerAddress, shortError(error));
    }
  }
  return sites;
}

async function discoverFromProcessors(rpc, block, issues) {
  const [countOutcome] = await runCalls(
    rpc,
    [{ to: xlayerSettings.contracts.factory, data: SEL.cpuCount, context: "factory cpuCount()" }],
    block,
    issues,
  );
  const cpuCount = Number(decodeUint(countOutcome, "factory cpuCount()"));
  if (!Number.isSafeInteger(cpuCount) || cpuCount < 1 || cpuCount > MAX_CPU_COUNT) {
    throw new Error(`Unexpected processor count: ${cpuCount}`);
  }
  console.log(`Processors reported by factory: ${cpuCount}`);

  const cpuIndexes = Array.from({ length: cpuCount }, (_, index) => index);
  const cpuCalls = cpuIndexes.map((index) => ({
    to: xlayerSettings.contracts.factory,
    data: encodeUintCall(SEL.cpuAt, index),
    context: `factory cpuAt(${index})`,
  }));
  const cpuOutcomes = await runCalls(rpc, cpuCalls, block, issues, "factory cpuAt");
  const processors = [];
  cpuOutcomes.forEach((outcome, index) => {
    try {
      processors.push({ index, address: decodeAddress(outcome, `cpuAt(${index})`) });
    } catch (error) {
      issues.add("failure", `cpuAt(${index})`, shortError(error));
    }
  });

  const nextIdCalls = processors.map(({ index, address }) => ({
    to: address,
    data: NEXT_ID_SELECTOR,
    context: `processor ${index} nextId()`,
  }));
  const nextIdOutcomes = await runCalls(rpc, nextIdCalls, block, issues, "processor nextId");
  const bounds = [];
  nextIdOutcomes.forEach((outcome, position) => {
    try {
      const nextId = decodeUint(outcome, `processor ${processors[position].index} nextId()`);
      if (nextId > MAX_ID_PER_CPU) throw new Error(`nextId exceeds safety bound (${nextId})`);
      bounds.push({ ...processors[position], nextId });
    } catch (error) {
      issues.add("failure", `processor ${processors[position].index} nextId()`, shortError(error));
    }
  });

  const boundaryCalls = [];
  for (const processor of bounds) {
    const firstFutureId = processor.nextId === 0n ? 1n : processor.nextId + 1n;
    if (processor.nextId > 0n) {
      boundaryCalls.push({
        to: processor.address,
        data: encodeUintCall(SEL.ownerOf, processor.nextId),
        context: `processor ${processor.index} ownerOf(nextId=${processor.nextId})`,
        expected: "exists",
        processor,
      });
    }
    boundaryCalls.push({
      to: processor.address,
      data: encodeUintCall(SEL.ownerOf, firstFutureId),
      context: `processor ${processor.index} ownerOf(nextId+1=${firstFutureId})`,
      expected: "missing",
      processor,
    });
  }
  const boundaryOutcomes = await runCalls(rpc, boundaryCalls, block, issues, "processor token bounds");
  const boundaryOk = new Set(bounds.map(({ index }) => index));
  boundaryOutcomes.forEach((outcome, index) => {
    const check = boundaryCalls[index];
    if (check.expected === "exists") {
      try {
        decodeAddress(outcome, check.context);
      } catch (error) {
        boundaryOk.delete(check.processor.index);
        issues.add("failure", check.context, shortError(error));
      }
    } else if (!outcome?.revert) {
      boundaryOk.delete(check.processor.index);
      issues.add("failure", check.context, "nextId() did not identify the highest existing token ID");
    }
  });

  const verifiedBounds = bounds.filter(({ index }) => boundaryOk.has(index));
  const totalCandidates = verifiedBounds.reduce((total, processor) => total + processor.nextId, 0n);
  if (totalCandidates > MAX_CIRCUIT_CANDIDATES) {
    throw new Error(`Candidate circuit count exceeds safety bound (${totalCandidates})`);
  }
  console.log(`Circuit IDs to inspect: ${totalCandidates}`);

  const circuitCalls = [];
  for (const processor of verifiedBounds) {
    for (let tokenId = 1n; tokenId <= processor.nextId; tokenId += 1n) {
      circuitCalls.push({
        to: xlayerSettings.contracts.opener,
        data: encodeAddressUintCall(SEL.isOpened, processor.address, tokenId),
        context: `${processor.index}.${tokenId} isOpened`,
        processor,
        tokenId,
      });
    }
  }
  const openedOutcomes = await runCalls(rpc, circuitCalls, block, issues, "isOpened circuit checks");
  const openedCalls = [];
  openedOutcomes.forEach((outcome, index) => {
    const call = circuitCalls[index];
    const opened = decodeBool(outcome);
    if (opened === null) {
      issues.add("failure", call.context, outcome?.err || "isOpened() returned an invalid result");
    } else if (opened) {
      openedCalls.push({
        to: xlayerSettings.contracts.opener,
        data: encodeAddressUintCall(SEL.accountOf, call.processor.address, call.tokenId),
        context: `${call.context} accountOf`,
        processor: call.processor,
        tokenId: call.tokenId,
      });
    }
  });
  const accountOutcomes = await runCalls(rpc, openedCalls, block, issues, "opened-site account checks");
  const accounts = [];
  accountOutcomes.forEach((outcome, index) => {
    try {
      const call = openedCalls[index];
      accounts.push({
        ...call,
        containerAddress: decodeAddress(outcome, call.context),
      });
    } catch (error) {
      issues.add("failure", openedCalls[index].context, shortError(error));
    }
  });

  const pathCalls = accounts.map((account) => ({
    to: xlayerSettings.contracts.siteRegistry,
    data: encodeAddressCall(SEL.pathCount, account.containerAddress),
    context: `${account.processor.index}.${account.tokenId} pathCount`,
    account,
  }));
  const pathOutcomes = await runCalls(rpc, pathCalls, block, issues, "site path-count checks");
  const sites = [];
  pathOutcomes.forEach((outcome, index) => {
    const call = pathCalls[index];
    try {
      const pathCount = decodeUint(outcome, call.context);
      if (pathCount > 0n) {
        const { index: processorIndex } = call.account.processor;
        const address = `${call.account.tokenId}.2.${processorIndex}.tape`;
        sites.push({
          address,
          containerAddress: call.account.containerAddress,
          cpu: BigInt(processorIndex),
          tokenId: call.account.tokenId,
        });
      }
    } catch (error) {
      issues.add("failure", call.context, shortError(error));
    }
  });
  return { sites, candidates: totalCandidates, processors: cpuCount };
}

async function checkActivity(rpc, sites, block, issues) {
  const calls = [];
  for (const site of sites) {
    calls.push({
      to: xlayerSettings.contracts.domainBinding,
      data: encodeStringAddressCall(SEL.isLive, site.address, site.containerAddress),
      context: `${site.address} isLive`,
      site,
      check: "isLive",
    });
    calls.push({
      to: xlayerSettings.contracts.domainBinding,
      data: encodeAddressCall(SEL.isContainerLive, site.containerAddress),
      context: `${site.address} isContainerLive`,
      site,
      check: "isContainerLive",
    });
  }
  const outcomes = await runCalls(rpc, calls, block, issues, "site activity checks");
  const byContainer = new Map();
  outcomes.forEach((outcome, index) => {
    const call = calls[index];
    const state = byContainer.get(call.site.containerAddress) || {};
    state[call.check] = outcome;
    byContainer.set(call.site.containerAddress, state);
  });

  const checked = [];
  for (const site of sites) {
    const state = byContainer.get(site.containerAddress) || {};
    const activity = classifySiteActivity(state.isLive, state.isContainerLive);
    if (activity.active === null) {
      issues.add("failure", `${site.address} activity`, "Could not verify both site-store activity checks");
      continue;
    }
    checked.push({ ...site, active: activity.active });
  }
  return checked;
}

async function persistSites(sites, checkedAt, issues) {
  let added = 0;
  let updated = 0;
  for (const site of sites) {
    try {
      const byAddress = await prisma.site.findUnique({
        where: { chain_address: { chain: CHAIN, address: site.address } },
        select: { id: true },
      });
      const byContainer = await prisma.site.findUnique({
        where: { chain_containerAddress: { chain: CHAIN, containerAddress: site.containerAddress } },
        select: { address: true },
      });
      if (byContainer && byContainer.address !== site.address) {
        throw new Error(`Container is already attached to another site name (${byContainer.address})`);
      }

      await prisma.site.upsert({
        where: { chain_address: { chain: CHAIN, address: site.address } },
        create: {
          address: site.address,
          chain: CHAIN,
          containerAddress: site.containerAddress,
          active: site.active,
          lastChecked: checkedAt,
        },
        update: {
          containerAddress: site.containerAddress,
          active: site.active,
          lastChecked: checkedAt,
        },
      });
      if (byAddress) updated += 1;
      else added += 1;
    } catch (error) {
      issues.add("failure", `persist ${site.address}`, shortError(error));
    }
  }
  return { added, updated };
}

async function runDiscovery(scan) {
  const rpc = createRpc({
    ...rpcOptionsFor(XLAYER_MAINNET, xlayerSettings.rpcUrls),
    timeoutMs: 20_000,
    retries: 2,
    backoffMs: 500,
    shuffle: false,
  });
  const issues = new ScanIssues();
  let metadata = { method: "not-started" };
  let sites = [];
  let sitesChecked = 0;
  let added = 0;
  let updated = 0;
  let fatalError = null;

  try {
    const chain = await readSingle(rpc, "eth_chainId", [], "chain ID");
    if (BigInt(chain.value) !== BigInt(CHAIN)) {
      throw new Error(`Expected X Layer chain ID ${CHAIN}, received ${BigInt(chain.value)}`);
    }
    const block = await rpc.pinBlock();
    const blockNumber = BigInt(block);
    console.log(`Scanning X Layer at pinned block ${blockNumber}`);
    const network = await verifyNetwork(rpc, block, issues);
    const deploymentBlock = await findRegistryDeploymentBlock(rpc, block);
    const windowCount = (blockNumber - deploymentBlock + 100n) / 100n;
    let probe = null;
    try {
      probe = await probeFileSetLogs(rpc, deploymentBlock, blockNumber);
    } catch (error) {
      issues.add("warning", "FileSet log support probe", shortError(error));
    }

    metadata = {
      method: "method-2-processors",
      chainId: network.chainId,
      pinnedBlock: blockNumber.toString(),
      registryDeploymentBlock: deploymentBlock.toString(),
      fileSetTopic: network.fileSetTopic,
      factoryImplementation: network.factoryImplementation,
      fileSetProbe: probe
        ? { fromBlock: probe.from.toString(), toBlock: probe.to.toString(), logCount: probe.logCount }
        : null,
      method1WindowCount: windowCount.toString(),
    };

    if (probe && windowCount <= BigInt(MAX_EVENT_WINDOWS)) {
      try {
        metadata.method = "method-1-fileset-events";
        const kernel = createKernel({ rpcUrls: { [CHAIN]: xlayerSettings.rpcUrls } });
        sites = await discoverFromEvents(rpc, kernel, deploymentBlock, blockNumber, issues);
      } catch (error) {
        issues.add("warning", "Method 1 full scan", `${shortError(error)}; falling back to processor enumeration`);
        metadata.method = "method-2-processors";
      }
    } else {
      issues.add(
        "warning",
        "Method 1",
        probe
          ? `${windowCount} 100-block windows exceed the configured limit of ${MAX_EVENT_WINDOWS}; using processor enumeration`
          : "Historical FileSet log query was unavailable; using processor enumeration",
      );
    }

    if (metadata.method === "method-2-processors") {
      const result = await discoverFromProcessors(rpc, block, issues);
      sites = result.sites;
      metadata.processors = result.processors;
      metadata.circuitCandidates = result.candidates.toString();
    }

    const uniqueSites = new Map();
    for (const site of sites) {
      const key = site.containerAddress.toLowerCase();
      const previous = uniqueSites.get(key);
      if (previous && previous.address !== site.address) {
        issues.add("failure", site.address, `Duplicate container also resolved as ${previous.address}`);
      } else {
        uniqueSites.set(key, site);
      }
    }
    sites = [...uniqueSites.values()];

    for (const [name, containerAddress] of KNOWN_SITES) {
      const found = sites.find((site) => site.address === name);
      if (!found) {
        issues.add("failure", `known site ${name}`, "Known Phase 0 site was not found");
      } else if (found.containerAddress.toLowerCase() !== containerAddress) {
        issues.add("failure", `known site ${name}`, `Container mismatch: ${found.containerAddress}`);
      }
    }

    const checkedSites = await checkActivity(rpc, sites, block, issues);
    sitesChecked = checkedSites.length;
    const checkedAt = new Date();
    const saved = await persistSites(checkedSites, checkedAt, issues);
    added = saved.added;
    updated = saved.updated;
    return {
      sitesFound: sites.length,
      sitesChecked,
      added,
      updated,
      errors: issues.toJson(metadata),
    };
  } catch (error) {
    fatalError = error;
    issues.add("failure", "discovery run", shortError(error));
    throw error;
  } finally {
    const endedAt = new Date();
    const status = fatalError ? "FAILED" : issues.failures ? "PARTIAL" : "COMPLETE";
    if (!interrupted) {
      await prisma.scan.update({
        where: { id: scan.id },
        data: {
          endedAt,
          sitesChecked,
          sitesFound: sites.length,
          sitesAdded: added,
          sitesUpdated: updated,
          status,
          errors: issues.toJson(metadata),
        },
      });
    }
  }
}

const scan = await prisma.scan.create({
  data: { startedAt: new Date(), status: "RUNNING" },
});

let interrupted = false;
async function markInterrupted(signal) {
  if (interrupted) return;
  interrupted = true;
  try {
    await prisma.scan.update({
      where: { id: scan.id },
      data: {
        endedAt: new Date(),
        status: "PARTIAL",
        errors: {
          method: "interrupted",
          failureCount: 1,
          warningCount: 0,
          samples: [{
            kind: "failure",
            context: "discovery run",
            reason: `Process received ${signal} before discovery completed`,
          }],
        },
      },
    });
  } catch (error) {
    console.error(`Could not record interrupted Scan #${scan.id}: ${shortError(error)}`);
  } finally {
    await prisma.$disconnect();
    process.exit(signal === "SIGINT" ? 130 : 143);
  }
}

process.once("SIGINT", () => void markInterrupted("SIGINT"));
process.once("SIGTERM", () => void markInterrupted("SIGTERM"));

try {
  const result = await runDiscovery(scan);
  console.log(
    `Discovery ${result.errors?.failureCount ? "finished with errors" : "complete"}: ` +
      `${result.sitesFound} sites found, ${result.added} added, ${result.updated} updated.`,
  );
  if (result.errors) {
    console.log(
      `Warnings: ${result.errors.warningCount}; failures: ${result.errors.failureCount}. ` +
        `See Scan #${scan.id} for bounded error samples.`,
    );
  }
  if (result.errors?.failureCount) process.exitCode = 1;
} catch (error) {
  console.error(`Discovery failed: ${shortError(error)} (Scan #${scan.id})`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
