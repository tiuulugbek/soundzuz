import { config, request, summarize, timestamp, writeJson } from './lib.mjs';

const checks = [
  { name: 'homepage', path: '/' },
  { name: 'robots', path: '/robots.txt' },
  { name: 'sitemap-index', path: '/sitemap_index.xml' },
  { name: 'wp-sitemap', path: '/wp-sitemap.xml' },
  { name: 'wp-json-root', path: '/wp-json/' },
  { name: 'wp-types', path: '/wp-json/wp/v2/types' },
  { name: 'wp-pages', path: '/wp-json/wp/v2/pages?per_page=1' },
  { name: 'wp-posts', path: '/wp-json/wp/v2/posts?per_page=1' },
  { name: 'wp-media', path: '/wp-json/wp/v2/media?per_page=1' },
  { name: 'wp-products-cpt', path: '/wp-json/wp/v2/product?per_page=1' },
  { name: 'woo-store-products', path: '/wp-json/wc/store/v1/products?per_page=1' },
  { name: 'shop', path: '/shop/' },
];

console.log(`Discovering ${config.baseUrl}`);

const results = [];
for (const check of checks) {
  const url = `${config.baseUrl}${check.path}`;
  const response = await request(url);
  const summary = { name: check.name, requestedUrl: url, ...summarize(response) };

  if (check.name === 'wp-json-root' && response.json && typeof response.json === 'object') {
    summary.namespaces = Array.isArray(response.json.namespaces) ? response.json.namespaces : [];
    summary.routesCount = response.json.routes ? Object.keys(response.json.routes).length : 0;
  }

  if (check.name === 'homepage' && response.text) {
    summary.signals = {
      wordpressGenerator: /<meta[^>]+name=["']generator["'][^>]+WordPress/i.test(response.text),
      wpContent: response.text.includes('/wp-content/'),
      woocommerce: /woocommerce/i.test(response.text),
      title: response.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || null,
    };
  }

  console.log(`${String(summary.status ?? 'ERR').padStart(3)} ${check.name} ${summary.error || ''}`);
  results.push(summary);
}

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: config.baseUrl,
  config: { timeoutMs: config.timeoutMs, userAgent: config.userAgent },
  results,
  recommendations: [
    'If wp-json is available, run extract-wordpress.mjs.',
    'If the source returns 502, obtain SSH, database dump, WordPress XML export, or a restored staging copy.',
    'Do not publish extracted products automatically; import with PENDING_REVIEW.',
  ],
};

const path = await writeJson(`${config.outputDir}/discovery/discovery-${timestamp()}.json`, report);
console.log(`Discovery report written to ${path}`);

if (!results.some((item) => item.ok)) {
  process.exitCode = 2;
}
