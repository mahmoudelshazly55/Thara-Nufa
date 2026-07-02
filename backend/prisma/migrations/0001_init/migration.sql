-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM (
    'PENDING_REVIEW', 'UNDER_REVIEW', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable users
CREATE TABLE IF NOT EXISTS "users" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email"        TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "phone"        TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateTable admins
CREATE TABLE IF NOT EXISTS "admins" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email"        TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");

-- CreateTable bookings
CREATE TABLE IF NOT EXISTS "bookings" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "phone"       TEXT NOT NULL,
  "serviceType" TEXT NOT NULL,
  "date"        TEXT NOT NULL,
  "address"     TEXT NOT NULL DEFAULT '',
  "notes"       TEXT NOT NULL DEFAULT '',
  "status"      "BookingStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "lang"        TEXT NOT NULL DEFAULT 'ar',
  "userId"      TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable reviews
CREATE TABLE IF NOT EXISTS "reviews" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "bookingId" TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "rating"    INTEGER NOT NULL,
  "comment"   TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateTable notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"    TEXT,
  "bookingId" TEXT,
  "adminOnly" BOOLEAN NOT NULL DEFAULT false,
  "type"      TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "message"   TEXT NOT NULL,
  "read"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable password_reset_tokens
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email"     TEXT NOT NULL,
  "token"     TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "used"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- Foreign Keys
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "bookings_userId_idx"             ON "bookings"("userId");
CREATE INDEX IF NOT EXISTS "bookings_status_idx"             ON "bookings"("status");
CREATE INDEX IF NOT EXISTS "bookings_createdAt_idx"          ON "bookings"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx"   ON "notifications"("userId", "read");
CREATE INDEX IF NOT EXISTS "notifications_adminOnly_read_idx" ON "notifications"("adminOnly", "read");
CREATE INDEX IF NOT EXISTS "reviews_userId_idx"              ON "reviews"("userId");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_email_idx" ON "password_reset_tokens"("email");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");
