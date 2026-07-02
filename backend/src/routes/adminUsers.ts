import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.use(authMiddleware);

router.get('/', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');
  const search = (req.query.search as string) || '';
  const skip = (page - 1) * limit;

  const where = search ? {
    OR: [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ],
  } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true, createdAt: true,
        _count: { select: { bookings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, data: users, pagination: { total, page, limit } });
}));

router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

router.get('/:id/bookings', asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.params.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  res.json({ success: true, data: bookings });
}));

export default router;
