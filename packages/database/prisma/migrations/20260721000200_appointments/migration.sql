CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CONTACTED', 'ARRIVED', 'NO_SHOW', 'CANCELLED', 'RESCHEDULED', 'COMPLETED');
CREATE TYPE "AppointmentCreatedBy" AS ENUM ('PUBLIC', 'ADMIN', 'TELEGRAM');

CREATE TABLE "Service" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "durationMinutes" INTEGER NOT NULL DEFAULT 30,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BranchSchedule" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "openMinute" INTEGER NOT NULL,
  "closeMinute" INTEGER NOT NULL,
  "isClosed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BranchSchedule_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BranchClosure" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BranchClosure_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BranchService" (
  "branchId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "slotCapacity" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "BranchService_pkey" PRIMARY KEY ("branchId", "serviceId")
);
CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "publicReference" TEXT NOT NULL,
  "idempotencyKey" TEXT,
  "leadId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
  "createdBy" "AppointmentCreatedBy" NOT NULL DEFAULT 'PUBLIC',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AppointmentStatusHistory" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "fromStatus" "AppointmentStatus",
  "toStatus" "AppointmentStatus" NOT NULL,
  "changedById" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppointmentStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Service_code_key" ON "Service"("code");
CREATE UNIQUE INDEX "BranchSchedule_branchId_weekday_key" ON "BranchSchedule"("branchId", "weekday");
CREATE UNIQUE INDEX "BranchClosure_branchId_date_key" ON "BranchClosure"("branchId", "date");
CREATE UNIQUE INDEX "Appointment_publicReference_key" ON "Appointment"("publicReference");
CREATE UNIQUE INDEX "Appointment_idempotencyKey_key" ON "Appointment"("idempotencyKey");
CREATE UNIQUE INDEX "Appointment_leadId_key" ON "Appointment"("leadId");
CREATE UNIQUE INDEX "Appointment_active_slot_key" ON "Appointment"("branchId", "serviceId", "startsAt") WHERE "status" NOT IN ('CANCELLED', 'RESCHEDULED');
CREATE INDEX "Appointment_branchId_startsAt_status_idx" ON "Appointment"("branchId", "startsAt", "status");
CREATE INDEX "Appointment_contactId_startsAt_idx" ON "Appointment"("contactId", "startsAt");
CREATE INDEX "AppointmentStatusHistory_appointmentId_createdAt_idx" ON "AppointmentStatusHistory"("appointmentId", "createdAt");

ALTER TABLE "BranchSchedule" ADD CONSTRAINT "BranchSchedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchClosure" ADD CONSTRAINT "BranchClosure_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchService" ADD CONSTRAINT "BranchService_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BranchService" ADD CONSTRAINT "BranchService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AppointmentStatusHistory" ADD CONSTRAINT "AppointmentStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BranchSchedule" ADD CONSTRAINT "BranchSchedule_weekday_check" CHECK ("weekday" BETWEEN 0 AND 6);
ALTER TABLE "BranchSchedule" ADD CONSTRAINT "BranchSchedule_minutes_check" CHECK ("openMinute" >= 0 AND "closeMinute" <= 1440 AND "openMinute" < "closeMinute");
ALTER TABLE "Service" ADD CONSTRAINT "Service_duration_check" CHECK ("durationMinutes" BETWEEN 10 AND 240);
ALTER TABLE "BranchService" ADD CONSTRAINT "BranchService_capacity_check" CHECK ("slotCapacity" = 1);
