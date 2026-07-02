-- AddColumn address
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "address" TEXT NOT NULL DEFAULT '';
-- AddColumn notes (in case it didn't exist)
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "notes" TEXT NOT NULL DEFAULT '';
