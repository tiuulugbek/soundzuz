import { config, request, timestamp, writeJson } from './lib.mjs';

const endpoints = [
  ['pages', '/wp-json/wp/v2/pages'],
  ['posts', '/wp-json/wp/v2/posts'],
  ['media', '/wp-json/wp/v2/media'],
  ['categories', '/wp-json/wp/v2/categories'],
  ['tags', '/wp-json/wp/v2/tags'],
  ['products-cpt', '/wp-json/wp/v2/product'],
  ['product-categories', '/wp-json/wp/v2/product_cat'],
  ['store-products', '/wp-json/wc/store/v1/products'],
  ['store-product-categories', '/wp-json/wc/store/v1/products/categories'],
];

function withPage(path, page, perPage) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}page=${page}&per_page=${perPage}`;
}

async function fetchCollection(name, path) {
  const perPage = 100;
  const items = [];
  const errors = [];
  let page = 1;
  let totalPages = null;

  while (page <= 1000) {
    const url = `${config.baseUrl}${withPage(path, page, perPage)}`;
    const response = await request(url);

    if (!response.ok) {
      if (page === 1 && [400, 401, 403, 404].includes(response.status)) {
        return { name, endpoint: path, available: false, items: [], errors: [{ page, status: response.status, error: response.error || response.text.slice(0, 300) }] };
      }
      errors.push({ page, status: response.status, error: response.error || response.text.slice(0, 300) });
      break;
    }

    const body = response.json;
    if (!Array.isArray(body)) {
      errors.push({ page, status: response.status, error: 'Expected an array response.' });
      break;
    }

    items.push(...body);
    totalPages ??= Number(response.headers['x-wp-totalpages'] || 0) || null;
    console.log(`${name}: page ${page}${totalPages ? `/${totalPages}` : ''}, total ${items.length}`);

    if (body.length < perPage || (totalPages && page >= totalPages)) break;
    page += 1;
  }

  return { name, endpoint: path, available: true, count: items.length, items, errors };
}

const runId = timestamp();
const manifest = {
  runId,
  generatedAt: new Date().toISOString(),
  baseUrl: config.baseUrl,
  collections: [],
};

for (const [name, path] of endpoints) {
  const result = await fetchCollection(name, path);
  const outputPath = `${config.outputDir}/raw/${runId}/${name}.json`;
  await writeJson(outputPath, {
    source: config.baseUrl,
    extractedAt: new Date().toISOString(),
    endpoint: path,
    available: result.available,
    count: result.items.length,
    errors: result.errors,
    items: result.items,
  });
  manifest.collections.push({
    name,
    endpoint: path,
    available: result.available,
    count: result.items.length,
    errors: result.errors.length,
    outputPath,
  });
}

const manifestPath = await writeJson(`${config.outputDir}/raw/${runId}/manifest.json`, manifest);
console.log(`Extraction manifest written to ${manifestPath}`);

if (!manifest.collections.some((collection) => collection.available)) {
  console.error('No public WordPress collections were available. Use authenticated API, XML export, database dump, or staging restore.');
  process.exitCode = 2;
}
