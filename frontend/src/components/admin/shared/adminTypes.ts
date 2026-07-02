// ─── Shared types for AdminDashboard ─────────────────────────────────────────

export interface Booking {
  id: string; name: string; email: string; phone: string;
  serviceType: string; date: string; status: string;
  createdAt: string; notes?: string; address?: string;
  user?: { id: string; name: string; email: string } | null;
  review?: { rating: number; comment?: string } | null;
}

export interface SiteUser {
  id: string; name: string; email: string; phone?: string; address?: string;
  createdAt: string; _count: { bookings: number };
}

export interface AdminNotif {
  id: string; type: string; title: string; message: string;
  read: boolean; createdAt: string;
}

export interface Review {
  id: string; bookingId?: string; rating: number; comment?: string;
  createdAt: string; userId: string;
  user?: { id: string; name: string; email: string; phone?: string };
  booking?: { id: string; serviceType: string; name: string };
}

export interface Stats {
  total: number; pending: number; under_review: number; confirmed: number;
  in_progress: number; completed: number; cancelled: number; userCount: number;
}

export type Section = 'overview' | 'bookings' | 'users' | 'notifications' | 'reviews' | 'services' | 'analytics';

// ─── Status config ────────────────────────────────────────────────────────────

export const ALL_STATUSES = ['PENDING_REVIEW', 'UNDER_REVIEW', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'انتظار',
  UNDER_REVIEW:   'تواصل',
  CONFIRMED:      'مراجعة',
  IN_PROGRESS:    'تنفيذ',
  COMPLETED:      'اكتمال',
  CANCELLED:      'ملغى',
};

export const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  PENDING_REVIEW: { dot: 'bg-amber-400',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30' },
  UNDER_REVIEW:   { dot: 'bg-blue-400',    bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30' },
  CONFIRMED:      { dot: 'bg-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  IN_PROGRESS:    { dot: 'bg-purple-400',  bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30' },
  COMPLETED:      { dot: 'bg-teal-400',    bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/30' },
  CANCELLED:      { dot: 'bg-red-400',     bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30' },
};

// ─── Arabic service names ──────────────────────────────────────────────────────

const SERVICE_NAMES_AR: Record<string, string> = {
  logistics:    'خدمات الشحن واللوجستيات',
  events:       'حجز المؤتمرات والفعاليات',
  hotels:       'خدمات الضيافة والفنادق',
  construction: 'خدمات المقاولات والإنشاءات',
  managed:      'الخدمات المُدارة والدعم',
  training:     'التدريب والتطوير',
  advisory:     'الاستشارات الاستراتيجية',
};

export const arabicService = (s: string): string =>
  (s in SERVICE_NAMES_AR) ? SERVICE_NAMES_AR[s as keyof typeof SERVICE_NAMES_AR] : s;

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(d: string): string {
  return new Date(d).toLocaleString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
