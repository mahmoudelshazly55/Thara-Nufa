-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS "notifications_bookingId_idx" ON "notifications"("bookingId");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");
