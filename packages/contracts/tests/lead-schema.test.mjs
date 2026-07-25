import test from "node:test";
import assert from "node:assert/strict";
import { publicLeadSchema, publicAppointmentSchema, loginSchema } from "../dist/index.js";

/**
 * Public lead sxemasi — saytdagi HAR BIR murojaat shu darvozadan o'tadi.
 * Bu yerdagi qoidalar buzilsa, formalar jimgina noto'g'ri ma'lumot qabul
 * qila boshlaydi yoki haqiqiy mijozni rad etadi.
 */

const validLead = {
  name: "Alisher Karimov",
  phone: "+998901234567",
  type: "GENERAL_CONTACT",
  consent: true,
};

test("to'g'ri to'ldirilgan forma qabul qilinadi", () => {
  const parsed = publicLeadSchema.parse(validLead);
  assert.equal(parsed.name, "Alisher Karimov");
  assert.equal(parsed.locale, "uz", "locale ko'rsatilmasa uz bo'lishi kerak");
});

test("rozilik (consent) majburiy", () => {
  assert.equal(publicLeadSchema.safeParse({ ...validLead, consent: false }).success, false);
  const { consent, ...withoutConsent } = validLead;
  assert.equal(publicLeadSchema.safeParse(withoutConsent).success, false);
});

test("noma'lum murojaat turi rad etiladi", () => {
  assert.equal(publicLeadSchema.safeParse({ ...validLead, type: "SPAM" }).success, false);
});

test("juda qisqa ism rad etiladi", () => {
  assert.equal(publicLeadSchema.safeParse({ ...validLead, name: "A" }).success, false);
});

test("ism atrofidagi bo'sh joy olib tashlanadi", () => {
  const parsed = publicLeadSchema.parse({ ...validLead, name: "  Alisher  " });
  assert.equal(parsed.name, "Alisher");
});

test("qo'llab-quvvatlanmaydigan til rad etiladi", () => {
  assert.equal(publicLeadSchema.safeParse({ ...validLead, locale: "de" }).success, false);
});

test("qabul formasi filial va xizmatsiz o'tmaydi", () => {
  assert.equal(
    publicAppointmentSchema.safeParse({ name: "Alisher Karimov", phone: "+998901234567" }).success,
    false,
  );
});

test("login sxemasi email'ni kichik harfga keltiradi va qisqa parolni rad etadi", () => {
  assert.equal(loginSchema.parse({ email: "Admin@Soundz.UZ", password: "kuchli-parol" }).email, "admin@soundz.uz");
  assert.equal(loginSchema.safeParse({ email: "admin@soundz.uz", password: "qisqa" }).success, false);
});
