import { expect, test } from "@playwright/test";

/** Uch tilda mavjud asosiy bo'limlar — uz prefikssiz, ru/en prefiksli. */
const SECTIONS = ["/hearing-aids", "/learn", "/faq", "/services", "/branches", "/iem", "/search"];

test("Uzbek home and booking load", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Soundz/i);
  await expect(page.locator("body")).toContainText(/eshit|Soundz/i);
  await expect(page.locator("#booking")).toBeVisible();
});

test("Russian storefront loads", async ({ page }) => {
  await page.goto("/ru");
  await expect(page).toHaveTitle(/Soundz/i);
  await expect(page.locator("body")).toContainText(/слух|Soundz/i);
  await expect(page.locator("#booking")).toBeVisible();
});

test("English storefront loads", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle(/Soundz/i);
  await expect(page.locator("main")).toBeVisible();
});

test("Public sections render without server errors", async ({ page }) => {
  for (const section of SECTIONS) {
    for (const path of [section, `/ru${section}`, `/en${section}`]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} status`).toBeLessThan(400);
      await expect(page.locator("main"), `${path} main`).toBeVisible();
    }
  }
});

test("Header and footer render on inner pages", async ({ page }) => {
  await page.goto("/learn");
  await expect(page.locator("header").first()).toBeVisible();
  await expect(page.locator("footer").first()).toBeVisible();
});

test("Catalog product links include the brand segment", async ({ page }) => {
  await page.goto("/hearing-aids");
  const links = page.locator('a[href*="/hearing-aids/"]');
  const count = await links.count();
  // Katalogda mahsulot bo'lmasa ham hub havolalari bor — shuning uchun >0 kutamiz.
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const href = await links.nth(i).getAttribute("href");
    // Regressiya qo'riqchisi: brandSlug yo'qolganda havolalar `/hearing-aids/brand/...` bo'lib qolgan edi.
    expect(href, "mahsulot havolasida 'brand' o'rniga haqiqiy brend slug bo'lishi kerak").not.toContain("/hearing-aids/brand/");
  }
});

test("Legacy paths redirect to the new structure", async ({ page }) => {
  const cases: Array<[string, RegExp]> = [
    ["/eshitish-moslamalari", /\/hearing-aids$/],
    ["/filiallar", /\/branches$/],
    ["/xizmatlar", /\/services$/],
    ["/savol-javob", /\/faq$/],
    ["/foydali-malumotlar", /\/learn$/],
    ["/qidiruv", /\/search$/],
  ];
  for (const [from, to] of cases) {
    const response = await page.goto(from);
    expect(response?.status(), `${from} status`).toBeLessThan(400);
    expect(page.url(), `${from} -> ${to}`).toMatch(to);
  }
});

test("SEO essentials exist", async ({ page }) => {
  await page.goto("/ru");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="uz-UZ"]')).toHaveCount(1);
});

test("Sitemap lists new-structure URLs only", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("/hearing-aids");
  for (const legacy of ["/eshitish-moslamalari", "/maqolalar/", "/filiallar", "/xizmatlar"]) {
    expect(body, `sitemap'da eski yo'l qolmasin: ${legacy}`).not.toContain(legacy);
  }
});

test("Sitemap includes dynamic content, not just static paths", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  const count = (body.match(/<loc>/g) ?? []).length;
  // Regressiya qo'riqchisi: sitemap CI'da build vaqtida render qilinganda
  // API mavjud bo'lmagani uchun faqat statik yo'llar qolib ketgan edi.
  expect(body, "maqola URL'lari sitemap'da bo'lishi kerak").toMatch(/\/learn\/[a-z0-9-]+\/[a-z0-9-]+/);
  expect(count, "sitemap faqat statik yo'llardan iborat bo'lib qolmasin").toBeGreaterThan(60);
});
