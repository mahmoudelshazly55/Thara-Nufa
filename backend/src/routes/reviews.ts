import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, userAuthMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { io } from '../index';

const router = Router();

// POST /api/reviews
router.post('/', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  const { bookingId, rating, comment } = req.body;
  if (!bookingId || !rating || rating < 1 || rating > 5) {
    res.status(400).json({ success: false, message: 'بيانات غير صحيحة' }); return;
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId: req.userId, status: 'COMPLETED' },
  });
  if (!booking) {
    res.status(403).json({ success: false, message: 'لا يمكن تقييم هذا الطلب' }); return;
  }

  const review = await prisma.review.upsert({
    where: { bookingId },
    update: { rating, comment: comment?.trim() || null },
    create: { bookingId, userId: req.userId, rating, comment: comment?.trim() || null },
  });

  // Notify admin
  const adminNotif = await prisma.notification.create({
    data: {
      adminOnly: true,
      type: rating <= 2 ? 'low_rating' : 'new_review',
      title: rating <= 2
        ? `⚠️ تقييم منخفض — ${rating}/5 نجوم`
        : `⭐ تقييم جديد — ${rating}/5 نجوم`,
      message: `العميل ${booking.name} قيّم خدمة "${booking.serviceType}"`,
      bookingId: booking.id,
    },
  });
  io.to('admin').emit('notification:admin', adminNotif);
  io.to('admin').emit('review:new', { ...review, booking });

  res.status(201).json({ success: true, data: review });
}));

// GET /api/reviews/admin
router.get('/admin', authMiddleware, asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      booking: { select: { id: true, serviceType: true, name: true } },
    },
  });
  res.json({ success: true, data: reviews });
}));

// DELETE /api/reviews/:id (admin)
router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

export default router;
