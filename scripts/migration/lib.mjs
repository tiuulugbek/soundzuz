import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const config = {
  baseUrl: (process.env.SOURCE_BASE_URL || 'https://soundz.uz').replace(/\/$/, ''),
  outputDir: resolve(process.env.MIGRATION_OUTPUT_DIR || './data/migration'),
  timeoutMs: Number(process.env.HTTP_TIMEOUT_MS || 20_000),
  userAgent: process.env.HTTP_USER_AGENT || 'SoundzMigrationBot/0.1 (+https://soundz.uz)',
};

export async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      ...options,
      headers: {
        accept: 'application/json,text/html,application/xml,text/xml;q=0.9,*/*;q=0.8',
        'user-agent': config.userAgent,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    let json = null;
    if (contentType.includes('json')) {
      try { json = JSON.parse(text); } catch { /* keep raw text */ }
    }

    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      elapsedMs: Date.now() - startedAt,
      headers: Object.fromEntries(response.headers.entries()),
      contentType,
      text,
      json,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      finalUrl: url,
      elapsedMs: Date.now() - startedAt,
      headers: {},
      contentType: '',
      text: '',
      json: null,
      error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export async function writeJson(path, value) {
  const fullPath = resolve(path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, JSON.stringify(value, null, 2) + '\n', 'utf8');
  return fullPath;
}

export function summarize(result) {
  return {
    ok: result.ok,
    status: result.status,
    finalUrl: result.finalUrl,
    elapsedMs: result.elapsedMs,
    contentType: result.contentType,
    contentLength: result.text?.length || 0,
    error: result.error || null,
    server: result.headers?.server || null,
    poweredBy: result.headers?.['x-powered-by'] || null,
  };
}
