import { expect, test } from "@playwright/test";

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

test("Catalog pages do not return server errors", async ({ page }) => {
  for (const path of ["/eshitish-moslamalari", "/ru/eshitish-moslamalari", "/filiallar", "/xizmatlar"]) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} status`).toBeLessThan(500);
    await expect(page.locator("main")).toBeVisible();
  }
});

test("SEO essentials exist", async ({ page }) => {
  await page.goto("/ru");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="uz"]')).toHaveCount(1);
});
