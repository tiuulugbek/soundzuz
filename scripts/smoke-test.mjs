const base = process.env.API_BASE_URL ?? "http://localhost:4000/v1";

async function request(path, init) {
  const response = await fetch(`${base}${path}`, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

const health = await request("/health");
console.log("health", health);

const lead = await request("/public/leads", {
  method: "POST",
  headers: { "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() },
  body: JSON.stringify({
    name: "Smoke Test",
    phone: "+998 90 000 00 01",
    type: "GENERAL_CONTACT",
    locale: "uz",
    message: "Automated smoke test",
    consent: true,
  }),
});
console.log("lead", lead);
console.log("Smoke test passed");
