import test from "node:test";
import assert from "node:assert/strict";

function normalizeUzbekPhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return `998${digits}`;
  if (digits.length === 12 && digits.startsWith("998")) return digits;
  if (digits.length === 13 && digits.startsWith("0998")) return digits.slice(1);
  throw new Error("invalid");
}

test("normalizes local Uzbek number", () => {
  assert.equal(normalizeUzbekPhone("90 123 45 67"), "998901234567");
});

test("normalizes international Uzbek number", () => {
  assert.equal(normalizeUzbekPhone("+998 (90) 123-45-67"), "998901234567");
});

test("rejects invalid phone", () => {
  assert.throws(() => normalizeUzbekPhone("123"));
});
