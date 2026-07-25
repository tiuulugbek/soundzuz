import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUzbekPhone } from "../dist/index.js";

// DIQQAT: haqiqiy implementatsiya import qilinadi. Ilgari bu fayl funksiyaning
// NUSXASINI saqlar edi — kod buzilsa ham test yashil qolaverardi.

test("mahalliy raqamni normalizatsiya qiladi", () => {
  assert.equal(normalizeUzbekPhone("90 123 45 67"), "998901234567");
});

test("xalqaro formatni normalizatsiya qiladi", () => {
  assert.equal(normalizeUzbekPhone("+998 (90) 123-45-67"), "998901234567");
});

test("0998 bilan boshlangan raqamni tuzatadi", () => {
  assert.equal(normalizeUzbekPhone("0998901234567"), "998901234567");
});

test("ajratgichlar natijaga ta'sir qilmaydi", () => {
  assert.equal(normalizeUzbekPhone("998-90-123-45-67"), normalizeUzbekPhone("998901234567"));
});

test("noto'g'ri uzunlikdagi raqamni rad etadi", () => {
  assert.throws(() => normalizeUzbekPhone("123"));
  assert.throws(() => normalizeUzbekPhone("9012345678"));
  assert.throws(() => normalizeUzbekPhone(""));
});

test("boshqa davlat kodini rad etadi", () => {
  assert.throws(() => normalizeUzbekPhone("+7 900 123 45 67"));
});
