import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, userAuthMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { io } from '../index';

const router = Router();

// GET /api/notifications — User notifications
router.get('/', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.userId, adminOnly: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: req.userId, adminOnly: false, read: false },
    }),
  ]);
  res.json({ success: true, data: notifications, unreadCount });
}));

// PATCH /api/notifications/read/all — Mark all user notifs as read (MUST be before /read/:id)
router.patch('/read/all', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  await prisma.notification.updateMany({
    where: { userId: req.userId, read: false },
    data: { read: true },
  });
  res.json({ success: true });
}));

// PATCH /api/notifications/read/:id — Mark single as read
router.patch('/read/:id', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.userId },
    data: { read: true },
  });
  res.json({ success: true });
}));

// GET /api/notifications/admin
router.get('/admin', authMiddleware, asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { adminOnly: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.notification.count({ where: { adminOnly: true, read: false } }),
  ]);
  res.json({ success: true, data: notifications, unreadCount });
}));

// PATCH /api/notifications/admin/read-all
router.patch('/admin/read-all', authMiddleware, asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({
    where: { adminOnly: true, read: false },
    data: { read: true },
  });
  res.json({ success: true });
}));

// GET /api/notifications/admin/expiring — Bookings 19-24h old (5h left)
router.get('/admin/expiring', authMiddleware, asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const cutoff19h = new Date(now.getTime() - 19 * 60 * 60 * 1000);
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const expiring = await prisma.booking.findMany({
    where: {
      createdAt: { gte: cutoff24h, lte: cutoff19h },
      status: { in: ['PENDING_REVIEW', 'UNDER_REVIEW'] },
    },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json({ success: true, data: expiring, count: expiring.length });
}));

// POST /api/notifications/admin/check-expiring — Trigger expiry alert creation
router.post('/admin/check-expiring', authMiddleware, asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const cutoff19h = new Date(now.getTime() - 19 * 60 * 60 * 1000);
  const cutoff24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const expiring = await prisma.booking.findMany({
    where: {
      createdAt: { gte: cutoff24h, lte: cutoff19h },
      status: { in: ['PENDING_REVIEW', 'UNDER_REVIEW'] },
    },
    orderBy: { createdAt: 'asc' },
  });
  let created = 0;
  for (const b of expiring) {
    const existing = await prisma.notification.findFirst({
      where: {
        bookingId: b.id,
        type: 'expiring_soon',
        createdAt: { gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
      },
    });
    if (!existing) {
      const hoursOld = Math.floor((now.getTime() - b.createdAt.getTime()) / 3600000);
      const hoursLeft = 24 - hoursOld;
      const notif = await prisma.notification.create({
        data: {
          adminOnly: true,
          type: 'expiring_soon',
          title: `⏰ طلب على وشك الانتهاء — باقي ${hoursLeft} ساعة`,
          message: `الطلب #${b.id.slice(0,8).toUpperCase()} — ${b.name} | ${b.phone} | ${b.serviceType}`,
          bookingId: b.id,
        },
      });
      io.to('admin').emit('notification:admin', notif);
      created++;
    }
  }
  res.json({ success: true, created, total: expiring.length });
}));

// POST /api/notifications/broadcast — Admin sends to all or specific user
router.post('/broadcast', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, message, type, userId } = req.body;
  if (!title || !message) {
    res.status(400).json({ success: false, message: 'Title and message required' }); return;
  }
  if (String(title).length > 200) {
    res.status(400).json({ success: false, message: 'Title too long (200 chars max)' }); return;
  }
  if (String(message).length > 1000) {
    res.status(400).json({ success: false, message: 'Message too long (1000 chars max)' }); return;
  }
  if (userId) {
    const notif = await prisma.notification.create({
      data: { userId, type: type || 'announcement', title, message, adminOnly: false },
    });
    io.to(`user:${userId}`).emit('notification', notif);
    res.json({ success: true, count: 1 });
  } else {
    const users = await prisma.user.findMany({ select: { id: true } });
    await prisma.notification.createMany({
      data: users.map((u: { id: string }) => ({
        userId: u.id, type: type || 'announcement', title, message, adminOnly: false,
      })),
    });
    for (const u of users) {
      io.to(`user:${u.id}`).emit('notification', { userId: u.id, type: type || 'announcement', title, message, read: false, createdAt: new Date() });
    }
    res.json({ success: true, count: users.length });
  }
}));

export default router;
