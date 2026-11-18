import "dotenv/config";
import { XLAYER_MAINNET } from "../TapeKit/kernel/src/config.js";

export const tapeoutSite = process.env.TAPEOUT_SITE || "1.2.344.tape";

export const xlayerSettings = Object.freeze({
  chainId: XLAYER_MAINNET.chainId,
  rpcUrls: XLAYER_MAINNET.rpcs,
  contracts: Object.freeze({
    factory: XLAYER_MAINNET.factory,
    opener: XLAYER_MAINNET.opener,
    siteRegistry: XLAYER_MAINNET.registries[0],
    domainBinding: XLAYER_MAINNET.binding,
  }),
});

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing");
  }

  return databaseUrl;
}
