import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { sendPasswordResetOTP } from '../services/email';
import { resetLimiter } from '../middleware/rateLimiters';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// POST /api/password-reset/forgot-password
router.post('/forgot-password', resetLimiter, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Cleanup expired tokens on every request (keeps DB tidy)
  await prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});

  const { email } = req.body;
  if (!email?.trim()) {
    res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' }); return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    // Return same success message to prevent email enumeration
    res.json({ success: true, message: 'تم إرسال رمز التحقق إذا كان البريد مسجلاً' }); return;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always return success to prevent email enumeration
  if (!user) {
    res.json({ success: true, message: 'تم إرسال رمز التحقق إذا كان البريد مسجلاً' }); return;
  }

  // Invalidate any existing unused tokens for this email
  await prisma.passwordResetToken.updateMany({
    where: { email: user.email, used: false },
    data: { used: true },
  });

  // Generate 6-digit OTP and store in DB (expires in 10 minutes)
  const otp = crypto.randomInt(100000, 999999).toString();
  await prisma.passwordResetToken.create({
    data: {
      email: user.email,
      token: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendPasswordResetOTP(user.email, otp, user.name);

  res.json({ success: true, message: 'تم إرسال رمز التحقق إذا كان البريد مسجلاً' });
}));

// POST /api/password-reset/reset-password
router.post('/reset-password', resetLimiter, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' }); return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'كلمة المرور 8 أحرف على الأقل' }); return;
  }

  // Look up token in DB
  const record = await prisma.passwordResetToken.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      token: otp.trim(),
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) {
    // Check if expired (token exists but expired)
    const expired = await prisma.passwordResetToken.findFirst({
      where: { email: email.toLowerCase().trim(), token: otp.trim(), used: false },
    });
    if (expired) {
      res.status(400).json({ success: false, message: 'الرمز منتهي الصلاحية — اطلب رمزاً جديداً' }); return;
    }
    res.status(400).json({ success: false, message: 'الرمز غير صحيح' }); return;
  }

  // Mark token as used
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });

  // Update password
  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user) { res.status(404).json({ success: false, message: 'المستخدم غير موجود' }); return; }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });

  // Clean up old tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email: record.email, used: true } });

  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
}));

export default router;
