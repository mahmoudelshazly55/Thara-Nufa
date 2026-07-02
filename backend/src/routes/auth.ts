import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiters';
import { JWT_SECRET } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// ─── POST /api/auth/login ───
router.post('/login', authLimiter, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password required' });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name },
  });
}));

// ─── GET /api/auth/me ───
router.get('/me', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.adminId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: { id: true, email: true, name: true },
  });
  res.json({ success: true, data: admin });
}));

// PATCH /api/auth/admin/change-password
router.patch('/admin/change-password', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.adminId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, message: 'كلمة المرور الحالية والجديدة مطلوبتان' });
    return;
  }
  if (newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'كلمة المرور الجديدة 8 أحرف على الأقل' });
    return;
  }
  const admin = await prisma.admin.findUnique({ where: { id: req.adminId } });
  if (!admin || !(await bcrypt.compare(currentPassword, admin.passwordHash))) {
    res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    return;
  }
  await prisma.admin.update({
    where: { id: req.adminId },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
}));

export default router;
