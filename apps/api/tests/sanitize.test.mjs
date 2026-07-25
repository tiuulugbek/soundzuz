import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeArticleContent } from "../dist/content/sanitize.js";

/**
 * Maqola matni public saytda `dangerouslySetInnerHTML` bilan chiqariladi —
 * ya'ni bu tozalagich XSS'ga qarshi yagona to'siq. Shu sabab test qilinadi.
 */

test("oddiy formatlash saqlanadi", () => {
  const html = "<h2>Sarlavha</h2><p>Matn <strong>qalin</strong> va <em>kursiv</em>.</p><ul><li>Bir</li></ul>";
  assert.equal(sanitizeArticleContent(html), html);
});

test("<script> olib tashlanadi", () => {
  const out = sanitizeArticleContent('<p>Salom</p><script>alert("xss")</script>');
  assert.ok(!out.includes("<script"), out);
  assert.ok(!out.includes("alert"), out);
  assert.ok(out.includes("Salom"));
});

test("hodisa (event) atributlari olib tashlanadi", () => {
  const out = sanitizeArticleContent('<p onclick="steal()">Matn</p><img src="/a.png" onerror="steal()">');
  assert.ok(!out.includes("onclick"), out);
  assert.ok(!out.includes("onerror"), out);
});

test("javascript: sxemasidagi havola o'tmaydi", () => {
  const out = sanitizeArticleContent('<a href="javascript:alert(1)">bosing</a>');
  assert.ok(!out.includes("javascript:"), out);
});

test("iframe va style bloklari o'tmaydi", () => {
  const out = sanitizeArticleContent('<iframe src="https://evil.example"></iframe><style>body{display:none}</style><p>ok</p>');
  assert.ok(!out.includes("<iframe"), out);
  assert.ok(!out.includes("<style"), out);
  assert.ok(out.includes("ok"));
});

test("tashqi havolaga rel=noopener qo'shiladi", () => {
  const out = sanitizeArticleContent('<a href="https://example.com" target="_blank">havola</a>');
  assert.ok(out.includes('rel="noopener noreferrer"'), out);
});

test("rasmga loading=lazy qo'shiladi", () => {
  const out = sanitizeArticleContent('<img src="https://example.com/a.png" alt="rasm">');
  assert.ok(out.includes('loading="lazy"'), out);
});

test("bo'sh va null qiymatlar bo'sh satr beradi", () => {
  assert.equal(sanitizeArticleContent(null), "");
  assert.equal(sanitizeArticleContent(undefined), "");
  assert.equal(sanitizeArticleContent(""), "");
});
