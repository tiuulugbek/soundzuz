# Database Domain Model — Draft

Bu yakuniy Prisma schema emas; implementation oldidan entity va constraintlar tasdiqlanadi.

## Identity and access

- `User`
- `Session`
- `Role`
- `Permission`
- `UserRole`
- `RolePermission`
- `UserBranch`

## Locations and scheduling

- `Branch`
- `BranchTranslation`
- `BranchSchedule`
- `BranchClosure`
- `Specialist`
- `SpecialistBranch`
- `Service`
- `ServiceTranslation`
- `BranchService`
- `Appointment`
- `AppointmentStatusHistory`

## Catalog

- `Product`
- `ProductTranslation`
- `ProductCategory`
- `CategoryTranslation`
- `ProductCategoryLink`
- `Brand`
- `ProductVariant`
- `ProductPrice`
- `BranchInventory`
- `AttributeDefinition`
- `AttributeOption`
- `ProductAttributeValue`
- `ProductMedia`
- `ProductDocument`
- `ProductRelation`

## CRM-lite

- `Contact`
- `Lead`
- `LeadStatusHistory`
- `LeadAssignmentHistory`
- `LeadNote`
- `LeadProductInterest`
- `LeadServiceInterest`

## Content

- `Page`
- `PageTranslation`
- `Article`
- `ArticleTranslation`
- `FaqItem`
- `FaqTranslation`
- `SeoMetadata`
- `Redirect`
- `MediaAsset`

## Reliability and governance

- `OutboxEvent`
- `NotificationDelivery`
- `AuditLog`
- `ImportBatch`
- `LegacyRecord`
- `ImportIssue`
- `SystemSetting`

## Critical constraints

- normalized phone indexed;
- appointment overlapping protection at application + database locking level;
- product slug unique per locale/type strategy;
- one active price per product/variant/branch context;
- outbox event unique idempotency key;
- legacy source + legacy ID unique;
- status transitions appended to history;
- soft deletion only where retention is required; no blanket soft-delete policy.

## Lead key fields

- `id`
- `publicReference`
- `contactId`
- `type`
- `status`
- `branchId?`
- `assignedUserId?`
- `sourceUrl?`
- `referrer?`
- `utmSource?`, `utmMedium?`, `utmCampaign?`, `utmContent?`, `utmTerm?`
- `locale`
- `message?`
- `followUpAt?`
- `createdAt`, `updatedAt`

## Appointment key fields

- `id`
- `publicReference`
- `leadId`
- `contactId`
- `branchId`
- `serviceId`
- `specialistId?`
- `startsAt`
- `endsAt`
- `status`
- `createdByType`
- timestamps
