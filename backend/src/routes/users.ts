import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../config/database';
import { authMiddleware, userAuthMiddleware, AuthRequest } from '../middleware/auth';
import { JWT_SECRET } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5,  message: { success: false, message: 'محاولات كثيرة، حاول بعد ساعة' } });
const loginLimiter    = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'محاولات كثيرة، حاول بعد 15 دقيقة' } });

// POST /api/users/register
router.post('/register', registerLimiter, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, phone, address } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ success: false, message: 'الاسم والبريد وكلمة المرور مطلوبة' });
    return;
  }
  if (name.trim().length > 100) {
    res.status(400).json({ success: false, message: 'الاسم طويل جداً (100 حرف كحد أقصى)' });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    res.status(400).json({ success: false, message: 'صيغة البريد الإلكتروني غير صحيحة' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ success: false, message: 'كلمة المرور 8 أحرف على الأقل' });
    return;
  }
  if (password.length > 128) {
    res.status(400).json({ success: false, message: 'كلمة المرور طويلة جداً' });
    return;
  }
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (exists) {
    res.status(400).json({ success: false, message: 'البريد الإلكتروني مستخدم بالفعل' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), passwordHash, phone: phone?.trim() || null, address: address?.trim() || null },
    select: { id: true, name: true, email: true, phone: true, address: true },
  });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ success: true, token, user });
}));

// POST /api/users/login
router.post('/login', loginLimiter, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, message: 'البريد وكلمة المرور مطلوبان' });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    res.status(401).json({ success: false, message: 'بيانات غير صحيحة' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ success: false, message: 'بيانات غير صحيحة' });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
}));

// GET /api/users/me
router.get('/me', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, phone: true },
  });
  res.json({ success: true, user });
}));

// PATCH /api/users/profile
router.patch('/profile', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const { name, phone } = req.body;
  if (name?.trim() && name.trim().length > 100) {
    res.status(400).json({ success: false, message: 'الاسم طويل جداً (100 حرف كحد أقصى)' });
    return;
  }
  const data: { name?: string; phone?: string | null } = {};
  if (name?.trim()) data.name = name.trim();
  if (phone !== undefined) data.phone = phone?.trim() || null;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data,
    select: { id: true, name: true, email: true, phone: true },
  });
  res.json({ success: true, user });
}));

// PATCH /api/users/password
router.patch('/password', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) {
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
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    return;
  }
  await prisma.user.update({ where: { id: req.userId }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  res.json({ success: true });
}));

// DELETE /api/users/account
router.delete('/account', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  // Delete all bookings first (schema uses SetNull, so we explicitly delete them)
  await prisma.booking.deleteMany({ where: { userId: req.userId } });
  // Then delete the user (cascades notifications + reviews automatically)
  await prisma.user.delete({ where: { id: req.userId } });
  res.json({ success: true });
}));

// PATCH /api/users/admin-reset-password/:id — Admin resets user password
router.patch('/admin-reset-password/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ success: false, message: 'كلمة المرور الجديدة 8 أحرف على الأقل' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    return;
  }
  await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } });
  res.json({ success: true });
}));

export default router;
