import { bookingLimiter } from '../middleware/rateLimiters';
import { sendBookingConfirmation, sendStatusUpdate } from '../services/email';
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { authMiddleware, userAuthMiddleware, AuthRequest } from '../middleware/auth';
import { JWT_SECRET } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { io } from '../index';

const router = Router();

const VALID_STATUSES = ['PENDING_REVIEW', 'UNDER_REVIEW', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

// GET /api/bookings/track/:id — Public track by short or full ID (no auth needed)
router.get('/track/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id.trim().toUpperCase();
  // Support both full UUID and 8-char prefix
  const booking = await prisma.booking.findFirst({
    where: id.length === 8
      ? { id: { startsWith: id, mode: 'insensitive' } }
      : { id: { equals: id, mode: 'insensitive' } },
    select: {
      id: true, name: true, phone: true, serviceType: true,
      date: true, status: true, createdAt: true, lang: true,
      // DO NOT expose email in public endpoint
    },
  });
  if (!booking) { res.status(404).json({ success: false, message: 'لم يتم العثور على الطلب' }); return; }
  res.json({ success: true, data: booking });
}));

// GET /api/bookings/user/my-bookings
router.get('/user/my-bookings', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const bookings = await prisma.booking.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    include: { review: true },
  });
  res.json({ success: true, data: bookings });
}));

// POST /api/bookings
router.post('/', bookingLimiter, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, serviceType, date, lang, notes, address } = req.body;
  if (!name || !phone || !serviceType || !date || !address) {
    res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' }); return;
  }
  // Validate phone — Saudi format
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (cleanPhone.length < 9 || cleanPhone.length > 15) {
    res.status(400).json({ success: false, message: 'رقم هاتف غير صحيح' }); return;
  }
  // Validate date — must be future
  const bookingDate = new Date(date);
  if (isNaN(bookingDate.getTime()) || bookingDate < new Date()) {
    res.status(400).json({ success: false, message: 'التاريخ يجب أن يكون في المستقبل' }); return;
  }
  if (name.trim().length > 100) {
    res.status(400).json({ success: false, message: 'الاسم طويل جداً (100 حرف كحد أقصى)' }); return;
  }
  if (serviceType.length > 100) {
    res.status(400).json({ success: false, message: 'نوع الخدمة طويل جداً' }); return;
  }
  if (address.length > 500) {
    res.status(400).json({ success: false, message: 'العنوان طويل جداً (500 حرف كحد أقصى)' }); return;
  }
  if (notes && notes.length > 1000) {
    res.status(400).json({ success: false, message: 'الملاحظات طويلة جداً' }); return;
  }

  let userId: string | null = null;
  const authHeader = req.headers.authorization?.split(' ')[1];
  if (authHeader) {
    try {
      const decoded = jwt.verify(authHeader, JWT_SECRET) as { userId?: string };
      userId = decoded.userId ?? null;
    } catch {}
  }

  const booking = await prisma.booking.create({
    data: {
      name: name.trim(), email: email?.trim().toLowerCase() || '',
      phone: phone.trim(), serviceType, date,
      address: address?.trim() || '', notes: notes?.trim() || '',
      status: 'PENDING_REVIEW', lang: lang || 'ar',
      ...(userId && { userId }),
    },
  });

  // Notify user
  if (userId) {
    const notif = await prisma.notification.create({
      data: {
        userId,
        type: 'booking_created',
        title: lang === 'ar' ? 'تم استلام طلبك ✅' : 'Request Received ✅',
        message: lang === 'ar'
          ? `رقم طلبك: #${booking.id.slice(0,8).toUpperCase()} — خدمة "${serviceType}" قيد المراجعة`
          : `Booking #${booking.id.slice(0,8).toUpperCase()} — "${serviceType}" is under review`,
        bookingId: booking.id,
      },
    });
    io.to(`user:${userId}`).emit('notification', notif);
    io.to(`user:${userId}`).emit('booking:created', booking);
  }

  // Notify admin
  const adminNotif = await prisma.notification.create({
    data: {
      adminOnly: true,
      type: 'new_booking',
      title: `حجز جديد — ${serviceType}`,
      message: `${name} | ${phone} | ${date}`,
      bookingId: booking.id,
    },
  });
  io.to('admin').emit('notification:admin', adminNotif);
  io.to('admin').emit('booking:new', booking);

  // Send confirmation email to client (non-blocking)
  sendBookingConfirmation(booking.email, {
    name: booking.name,
    service: booking.serviceType,
    date: booking.date,
    bookingId: booking.id.slice(0, 8).toUpperCase(),
  }).catch(() => {});

  res.status(201).json({ success: true, data: booking });
}));

// GET /api/bookings (admin)
router.get('/', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
  const pageNum = parseInt(page), limitNum = parseInt(limit);
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { id: { contains: search, mode: 'insensitive' } },
    { name: { contains: search, mode: 'insensitive' } },
    { email: { contains: search, mode: 'insensitive' } },
    { serviceType: { contains: search, mode: 'insensitive' } },
    { phone: { contains: search, mode: 'insensitive' } },
  ];

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum, take: limitNum,
      include: {
        user: { select: { id: true, name: true, email: true } },
        review: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  const [statusGroups, userCount] = await Promise.all([
    prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.user.count(),
  ]);
  type StatusGroup = { status: string; _count: { _all: number } };
  const cnt = Object.fromEntries((statusGroups as StatusGroup[]).map((g) => [g.status, g._count._all]));
  const tot = (statusGroups as StatusGroup[]).reduce((s, g) => s + g._count._all, 0);
  const pending      = cnt['PENDING_REVIEW'] ?? 0;
  const under_review = cnt['UNDER_REVIEW']   ?? 0;
  const confirmed    = cnt['CONFIRMED']       ?? 0;
  const in_progress  = cnt['IN_PROGRESS']     ?? 0;
  const completed    = cnt['COMPLETED']       ?? 0;
  const cancelled    = cnt['CANCELLED']       ?? 0;

  res.json({
    success: true, data: bookings,
    pagination: { total, page: pageNum, limit: limitNum },
    stats: { total: tot, pending, under_review, confirmed, in_progress, completed, cancelled, userCount },
  });
}));

// PATCH /api/bookings/:id/status (admin)
router.patch('/:id/status', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const bookingId = req.params.id;
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ success: false, message: 'حالة غير صحيحة' }); return;
  }
  const booking = await prisma.booking.update({
    where: { id: bookingId }, data: { status },
    include: { user: true },
  });

  // Push real-time update to admin and user
  io.to('admin').emit('booking:updated', booking);
  if (booking.userId) {
    io.to('user:' + booking.userId).emit('booking:updated', booking);
  }

  if (booking.userId) {
    const isAr = (booking.lang ?? 'ar') === 'ar';
    const svc = booking.serviceType;
    const msgs: Record<string, { title: string; message: string }> = {
      UNDER_REVIEW: {
        title: isAr ? '📞 فريقنا يتواصل معك قريباً' : '📞 Our team will contact you soon',
        message: isAr
          ? `تم استلام طلبك لخدمة "${svc}" وسيتواصل معك أحد ممثلي خدمة العملاء لدينا في أقرب وقت لمناقشة التفاصيل.`
          : `Your request for "${svc}" has been received. A customer service representative will contact you shortly to discuss the details.`,
      },
      CONFIRMED: {
        title: isAr ? '🔍 طلبك قيد المراجعة والتقييم' : '🔍 Your request is under review',
        message: isAr
          ? `طلبك لخدمة "${svc}" يتم مراجعته وتقييمه من قِبل فريق المختصين. سنُبلغك بالنتيجة قريباً.`
          : `Your request for "${svc}" is being reviewed and evaluated by our specialists. We will notify you of the outcome shortly.`,
      },
      IN_PROGRESS: {
        title: isAr ? '⚙️ بدأ تنفيذ خدمتك' : '⚙️ Your service has started',
        message: isAr
          ? `انطلق فريقنا في تنفيذ خدمة "${svc}". نعمل بجد لإنجاز طلبك بأعلى جودة ممكنة.`
          : `Our team has started executing the "${svc}" service. We are working hard to complete your request at the highest quality.`,
      },
      COMPLETED: {
        title: isAr ? '🎉 اكتملت خدمتك بنجاح' : '🎉 Your service is complete',
        message: isAr
          ? `تم إتمام خدمة "${svc}" بنجاح. شكراً لثقتك بثرا نوفا — يسعدنا سماع رأيك بتقييم الخدمة.`
          : `The "${svc}" service has been completed successfully. Thank you for trusting Thara Nova — we'd love to hear your feedback.`,
      },
      CANCELLED: {
        title: isAr ? '❌ تم إلغاء الطلب' : '❌ Booking Cancelled',
        message: isAr
          ? `تم إلغاء طلبك لخدمة "${svc}". لأي استفسار أو إعادة حجز يسعدنا مساعدتك.`
          : `Your request for "${svc}" has been cancelled. For any inquiries or rebooking, we are happy to assist.`,
      },
    };

    const msgEntry = (status in msgs) ? msgs[status as keyof typeof msgs] : null;

    if (msgEntry) {
      const notif = await prisma.notification.create({
        data: {
          userId: booking.userId,
          type: `booking_${status.toLowerCase()}`,
          title: msgEntry.title,
          message: msgEntry.message,
          bookingId,
        },
      });
      // Real-time push to user
      io.to(`user:${booking.userId}`).emit('notification', notif);
      io.to(`user:${booking.userId}`).emit('booking:updated', booking);

      // Send email notification (non-blocking)
      if (booking.email) {
        sendStatusUpdate(booking.email, {
          name: booking.name,
          service: booking.serviceType,
          status,
          bookingId: booking.id,
        }).catch(() => {});
      }
    }
  }

  res.json({ success: true, data: booking });
}));

// DELETE /api/bookings/:id (admin)
router.delete('/:id', authMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.booking.delete({ where: { id: req.params.id } });
  io.to('admin').emit('booking:deleted', { id: req.params.id });
  res.json({ success: true });
}));

// PATCH /api/bookings/:id/cancel — User cancels their own pending booking
router.patch('/:id/cancel', userAuthMiddleware, asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!booking) { res.status(404).json({ success: false, message: 'الطلب غير موجود' }); return; }

  if (!['PENDING_REVIEW', 'UNDER_REVIEW'].includes(booking.status)) {
    res.status(400).json({ success: false, message: 'لا يمكن إلغاء هذا الطلب في مرحلته الحالية' }); return;
  }

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' as const },
  });

  io.to('admin').emit('booking:updated', updated);
  res.json({ success: true, data: updated });
}));

export default router;
