import rateLimit from 'express-rate-limit';

const msg = (ar: string) => ({ success: false, message: ar });

// Skip rate limiting only in development — staging and production are always protected
const isDev = () => process.env.NODE_ENV === 'development';

// Auth endpoints — 50 per 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: msg('محاولات كثيرة جداً، حاول بعد 15 دقيقة'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDev,
});

// Password reset: 10 per hour
export const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: msg('تجاوزت الحد المسموح لإعادة كلمة المرور، حاول بعد ساعة'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDev,
});

// Booking creation: 30 per hour
export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: msg('تجاوزت حد الطلبات المسموح، حاول بعد ساعة'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDev,
});

// General API: 300 per 15 min
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: msg('طلبات كثيرة جداً، حاول لاحقاً'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: isDev,
});
