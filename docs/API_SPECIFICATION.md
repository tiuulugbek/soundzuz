# API Specification — v1

Base URL: `/v1`

## Public

### Health

`GET /health`

### Lead yuborish

`POST /public/leads`

Header:

```text
X-Idempotency-Key: UUID
```

Body:

```json
{
  "name": "Akmal",
  "phone": "+998 90 123 45 67",
  "type": "HEARING_AID_CONSULTATION",
  "locale": "uz",
  "message": "Maslahat kerak",
  "sourceUrl": "https://soundz.uz/",
  "utmSource": "google",
  "utmCampaign": "hearing-aids",
  "consent": true
}
```

### Qabul filiallari

`GET /public/booking/branches`

### Filial xizmatlari

`GET /public/booking/services?branchId=...`

### Bo‘sh vaqtlar

`GET /public/booking/slots?branchId=...&serviceId=...&date=2026-07-22`

### Qabul yaratish

`POST /public/booking/appointments`

```json
{
  "name": "Akmal",
  "phone": "+998 90 123 45 67",
  "branchId": "...",
  "serviceId": "...",
  "startsAt": "2026-07-22T05:00:00.000Z",
  "locale": "uz",
  "consent": true
}
```

## Authentication

### Login

`POST /auth/login`

```json
{
  "email": "admin@soundz.uz",
  "password": "strong-password"
}
```

Admin endpointlarda:

```text
Authorization: Bearer <accessToken>
```

## Admin leads

- `GET /admin/leads`
- `GET /admin/leads/:id`
- `PATCH /admin/leads/:id/status`
- `POST /admin/leads/:id/notes`

Filterlar: `page`, `limit`, `status`, `search`.

## Admin appointments

- `GET /admin/appointments`
- `GET /admin/appointments/:id`
- `PATCH /admin/appointments/:id/status`

Filterlar: `page`, `limit`, `status`, `dateFrom`, `dateTo`.

## Admin settings

### Branches

- `GET /admin/settings/branches`
- `POST /admin/settings/branches`
- `PATCH /admin/settings/branches/:id`
- `PUT /admin/settings/branches/:id/schedules`
- `PUT /admin/settings/branches/:branchId/services/:serviceId`

### Services

- `GET /admin/settings/services`
- `POST /admin/settings/services`
- `PATCH /admin/settings/services/:id`

To‘liq interaktiv API hujjati runtime vaqtida `/docs` manzilida Swagger orqali chiqadi.
