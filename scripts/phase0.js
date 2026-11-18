import { createKernel } from '../TapeKit/kernel/src/index.js';
import { tapeoutSite } from '../config/settings.js';

const siteName = tapeoutSite;
const kernel = createKernel();

const result = await kernel.resolve(siteName);

if (result.status !== 'ok') {
  throw new Error(`Resolution failed for ${siteName}: ${result.status}`);
}

const site = await kernel.openSite(result);
const homepage = await site.get('index.html');

if (homepage.status !== 'ok') {
  throw new Error(`Homepage retrieval failed for ${siteName}: ${homepage.status}`);
}

const homepageBytes = homepage.bytes ?? homepage.data ?? homepage;
const homepageText = new TextDecoder().decode(homepageBytes);

console.log(JSON.stringify({
  ok: true,
  siteName: result.name,
  chainId: result.chainId,
  container: result.container,
  storeVerification: result.stores,
  paid: result.paid,
  opened: result.opened,
  files: site.manifest.paths,
  homepageStatus: homepage.status,
  homepageSha256: homepage.sha256,
  contentType: homepage.contentType ?? null,
  homepageText,
}, null, 2));
