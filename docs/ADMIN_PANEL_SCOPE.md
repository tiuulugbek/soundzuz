# Admin Panel Scope

## Dashboard

- bugungi yangi leadlar;
- javobsiz leadlar;
- bugungi qabul;
- filial bo‘yicha leadlar;
- conversion funnel;
- notification failures;
- stock/price stale warnings;
- recent activity.

## Leads

- table va optional kanban;
- status, source, branch, owner, date filter;
- phone/name search;
- duplicate warning;
- lead detail timeline;
- note;
- call result;
- follow-up;
- appointment creation;
- product/service link;
- export.

## Appointments

- calendar va list;
- branch/specialist filter;
- create/reschedule/cancel;
- confirmation status;
- no-show;
- linked lead/customer;
- scheduling conflict warning.

## Catalog

- products;
- translations;
- categories;
- brands;
- attributes;
- price visibility;
- availability;
- branch stock;
- media/documents;
- SEO;
- alternatives;
- review/publish workflow.

## Branches and services

- branch info and contacts;
- localized address;
- schedules and closed days;
- services per branch;
- specialists;
- Telegram destination mapping;
- branch users.

## Content and SEO

- pages;
- articles;
- FAQ;
- reusable content blocks;
- menu/footer;
- redirects;
- SEO metadata;
- preview and publish.

## System

- users;
- roles and permissions;
- audit log;
- notification log;
- import batches;
- settings;
- integrations;
- backup status read-only view later.

## Role baseline

| Role | Main access |
|---|---|
| Super Admin | All |
| Content Manager | Catalog content, pages, media, SEO; no sensitive lead export by default |
| Sales Operator | Leads and appointments assigned/allowed branches |
| Branch Manager | Own branch leads, appointments, specialists, inventory |
| Inventory Manager | Product and branch stock/price |
| Audiologist | Own/branch appointments and clinical-safe notes scope |
| Marketing Manager | Read analytics, campaigns, content/SEO depending permission |

Permissions database-driven bo‘ladi; role nomiga hard-code qilinmaydi.
