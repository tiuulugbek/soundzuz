# Infrastructure

Current `compose.yaml` is for local development only.

Production plan:

- Ubuntu Server;
- Docker Compose or an agreed orchestrator;
- Nginx reverse proxy;
- TLS;
- firewall;
- staging and production separated;
- automated PostgreSQL backup with off-server copy;
- media backup/versioning;
- CI/CD from protected branch;
- health monitoring and rollback procedure.
