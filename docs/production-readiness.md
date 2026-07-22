# Soundz production readiness

## Launch gate

Before public launch confirm:

- PR CI is green.
- `.env.production` contains strong unique secrets.
- Cloudflare R2 bucket and `media.soundz.uz` are active.
- PostgreSQL backup completes and restore is tested on a disposable environment.
- Grafana opens through an SSH tunnel: `ssh -L 3002:127.0.0.1:3002 user@server`.
- GA4, Meta Pixel and Yandex Metrika IDs are configured where required.
- Production E2E workflow passes for Uzbek and Russian routes.
- k6 smoke test stays below 1% failures and p95 below 800 ms.

## Start application and monitoring

```bash
cp .env.production.example .env.production
# Fill every CHANGE_ME value.
pnpm prod:up
pnpm monitoring:up
```

## Backup schedule

Run daily from cron as the deployment user:

```cron
15 1 * * * cd /opt/soundzuz && BACKUP_DIR=/srv/backups/soundz ./scripts/production/backup.sh >> /var/log/soundz-backup.log 2>&1
```

Copy encrypted backups to a second provider or object-storage bucket. A backup that has never been restored is not considered valid.

## Restore drill

Use a staging server or a separate database:

```bash
./scripts/production/restore.sh /srv/backups/soundz/20260722T010000Z
```

After restore, check API health, admin login, catalog and booking creation.

## Monitoring

Prometheus watches API availability, PostgreSQL, Redis, host memory and disk. Loki receives Docker logs through Promtail. Grafana has Prometheus and Loki provisioned automatically.

Alertmanager ships with a safe local receiver. Configure a verified Telegram/webhook receiver directly in `deploy/monitoring/alertmanager.yml`, then restart Alertmanager.

## Browser smoke tests

The `Production E2E` GitHub workflow runs every day and can be started manually against staging or production. Failed runs retain screenshots, videos and traces.

## Load test

Run outside peak hours:

```bash
docker run --rm -i grafana/k6 run -e BASE_URL=https://soundz.uz -e API_URL=https://api.soundz.uz/v1 - < tests/load/smoke.js
```

Do not load-test third-party services or production booking POST endpoints.

## Incident response

1. Check Grafana health panels and Loki logs.
2. Stop the affected public service if data integrity is at risk.
3. Roll back the application image using the documented rollback script.
4. Do not roll back a database migration blindly; restore a verified backup when schema/data integrity requires it.
5. Record impact, start/end time, root cause and corrective action.
