import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { io as socketIO, Socket } from 'socket.io-client';

// ── Shared types & helpers ────────────────────────────────────────────────────
import { type Booking, type SiteUser, type AdminNotif, type Review, type Stats, type Section, ALL_STATUSES } from './admin/shared/adminTypes';

// ── Sub-components ────────────────────────────────────────────────────────────
import { AdminLogin }         from './admin/AdminLogin';
import { AdminSidebar, buildNavItems } from './admin/AdminSidebar';
import { AdminOverview }      from './admin/sections/AdminOverview';
import { AdminBookings }      from './admin/sections/AdminBookings';
import { AdminUsers }         from './admin/sections/AdminUsers';
import { AdminNotifications } from './admin/sections/AdminNotifications';
import { AdminReviews }       from './admin/sections/AdminReviews';
import { AdminServices }      from './admin/sections/AdminServices';
import { AdminAnalytics }     from './admin/sections/AdminAnalytics';
import { BookingDetailModal } from './admin/modals/BookingDetailModal';
import { UserDetailModal }    from './admin/modals/UserDetailModal';
import { BroadcastModal }     from './admin/modals/BroadcastModal';
import { ResetPwModal }       from './admin/modals/ResetPwModal';
import type { Page, AdminUser } from '../types';

const API_URL    = import.meta.env.VITE_API_URL    || '/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
export default function AdminDashboard({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) {
  const [token, setToken] = useState<string>(() => sessionStorage.getItem('admin_token') ?? '');
  const [admin, setAdmin] = useState<AdminUser | null>(() => { try { return JSON.parse(sessionStorage.getItem('admin_user') || 'null'); } catch { return null; } });
  const [section, setSection] = useState<Section>('overview');

  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [users, setUsers]                     = useState<SiteUser[]>([]);
  const [notifs, setNotifs]                   = useState<AdminNotif[]>([]);
  const [reviews, setReviews]                 = useState<Review[]>([]);
  const [expiringBookings, setExpiringBookings] = useState<Booking[]>([]);
  const [stats, setStats]                     = useState<Stats>({ total: 0, pending: 0, under_review: 0, confirmed: 0, in_progress: 0, completed: 0, cancelled: 0, userCount: 0 });
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState('');
  const [statusFilter, setStatusFilter]       = useState('');
  const [adminUnread, setAdminUnread]         = useState(0);
  const [newBookingsCount, setNewBookingsCount] = useState(0);

  const [broadcastOpen, setBroadcastOpen]     = useState(false);
  const [detailBooking, setDetailBooking]     = useState<Booking | null>(null);
  const [viewUser, setViewUser]               = useState<SiteUser | null>(null);
  const [resetPwUser, setResetPwUser]         = useState<SiteUser | null>(null);

  const detailBookingRef  = useRef<Booking | null>(null);
  const fetchReviewsRef   = useRef<(() => Promise<void>) | null>(null);
  const socketRef         = useRef<Socket | null>(null);

  useEffect(() => { detailBookingRef.current = detailBooking; }, [detailBooking]);

  const hdrs = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const doLogin  = (t: string, a: AdminUser) => { setToken(t); setAdmin(a); sessionStorage.setItem('admin_token', t); sessionStorage.setItem('admin_user', JSON.stringify(a)); };
  const doLogout = () => { socketRef.current?.disconnect(); sessionStorage.removeItem('admin_token'); sessionStorage.removeItem('admin_user'); setToken(''); setAdmin(null); };

  // ── Socket.io ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const socket = socketIO(SOCKET_URL, {
      path: '/socket.io', transports: ['websocket', 'polling'],
      reconnection: true, reconnectionDelay: 2000, auth: { token },
    });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('join:admin'));

    socket.on('booking:new', (b: Booking) => {
      setBookings(p => [b, ...p]);
      setStats(s => ({ ...s, total: s.total + 1, pending: s.pending + 1 }));
      setNewBookingsCount(c => c + 1);
    });
    socket.on('booking:deleted', (data: { id: string }) => {
      setBookings(prev => prev.filter(x => x.id !== data.id));
      if (detailBookingRef.current?.id === data.id) setDetailBooking(null);
    });
    socket.on('booking:updated', (b: Booking) => {
      setBookings(p => p.map(x => x.id === b.id ? { ...x, ...b } : x));
      if (detailBookingRef.current?.id === b.id) setDetailBooking(prev => prev ? { ...prev, ...b } : prev);
    });
    socket.on('notification:admin', (n: AdminNotif) => {
      setNotifs(p => [n, ...p]);
      if (n.type !== 'new_booking') setAdminUnread(c => c + 1);
    });
    socket.on('review:new', () => { void fetchReviewsRef.current?.(); });

    return () => { socket.disconnect(); };
  }, [token]);

  useEffect(() => { if (section === 'bookings') setNewBookingsCount(0); }, [section]);

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (s = search, st = statusFilter) => {
    try {
      const url = new URL(`${API_URL}/bookings`, window.location.origin);
      url.searchParams.set('limit', '100');
      if (s)  url.searchParams.set('search', s.slice(0, 200));
      if (st && (ALL_STATUSES as string[]).includes(st)) url.searchParams.set('status', st);
      // API_URL is a fixed, build-time-configured base; only known, validated
      // query params (never the host/path) are attacker-influenceable here.
      const r = await fetch(url, { headers: hdrs() });
      const d = await r.json();
      if (d.success) { setBookings(d.data); if (d.stats) setStats(d.stats); }
    } catch {}
  }, [hdrs, search, statusFilter]);

  const fetchUsers     = useCallback(async () => { try { const r = await fetch(`${API_URL}/admin/users`, { headers: hdrs() }); const d = await r.json(); if (d.success) setUsers(d.data); } catch {} }, [hdrs]);
  const fetchNotifs    = useCallback(async () => { try { const r = await fetch(`${API_URL}/notifications/admin`, { headers: hdrs() }); const d = await r.json(); if (d.success) { setNotifs(d.data); setAdminUnread(d.unreadCount || 0); } } catch {} }, [hdrs]);
  const fetchReviews   = useCallback(async () => { try { const r = await fetch(`${API_URL}/reviews/admin`, { headers: hdrs() }); const d = await r.json(); if (d.success) setReviews(d.data); } catch {} }, [hdrs]);
  const fetchExpiring  = useCallback(async () => { try { const r = await fetch(`${API_URL}/notifications/admin/expiring`, { headers: hdrs() }); const d = await r.json(); if (d.success) setExpiringBookings(d.data); } catch {} }, [hdrs]);
  useEffect(() => { fetchReviewsRef.current = fetchReviews; }, [fetchReviews]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchBookings(), fetchUsers(), fetchNotifs(), fetchReviews(), fetchExpiring()]);
    setLoading(false);
  }, [fetchBookings, fetchUsers, fetchNotifs, fetchReviews, fetchExpiring]);

  useEffect(() => { if (token) { void fetchAll(); } }, [token, fetchAll]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => { void fetchExpiring(); }, 5 * 60 * 1000);
    return () => { clearInterval(interval); };
  }, [token, fetchExpiring]);

  // ── Mutations ───────────────────────────────────────────────────────────────
  const delBooking = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    if (!confirm('حذف هذا الطلب؟')) return;
    await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE', headers: hdrs() });
    setBookings(p => p.filter(b => b.id !== id));
    if (detailBooking?.id === id) setDetailBooking(null);
  };

  const delUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟ سيتم حذف جميع بياناته وطلباته.')) return;
    if (!confirm('حذف هذا المستخدم؟')) return;
    await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: hdrs() });
    setUsers(p => p.filter(u => u.id !== id));
  };

  const delReview = async (id: string) => {
    if (!confirm('حذف هذا التقييم؟')) return;
    await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE', headers: hdrs() });
    setReviews(p => p.filter(r => r.id !== id));
  };

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  const onBookingUpdated = (updated: Booking) => {
    setBookings(prev => prev.map(x => x.id === updated.id ? { ...x, ...updated } : x));
  };

  // ── Gate: show login if not authenticated ──────────────────────────────────
  if (!token || !admin) return <AdminLogin onLogin={doLogin} setCurrentPage={setCurrentPage} />;

  const navItems = buildNavItems(newBookingsCount, expiringBookings.length, reviews.filter(r => r.rating <= 2).length);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-main, #020e0d)' }} dir="rtl">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 h-screen sticky top-0 border-l border-brand-gold-500/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <AdminSidebar
          section={section} setSection={setSection}
          admin={admin} onLogout={doLogout}
          newBookingsCount={newBookingsCount}
          expiringCount={expiringBookings.length}
          lowRatingCount={reviews.filter(r => r.rating <= 2).length}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="shrink-0 px-4 md:px-6 h-14 flex items-center justify-between border-b border-brand-gold-500/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-3">
            <select value={section} onChange={(e) => { setSection(e.target.value as Section); }}
              className="lg:hidden rounded-xl px-3 py-1.5 text-sm font-bold outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)' }}>
              {navItems.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <h1 className="hidden lg:block text-white font-black text-sm">{navItems.find(n => n.id === section)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { void fetchAll(); }} className="p-2 text-white/40 hover:text-brand-gold-500 transition-colors" title="تحديث">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            {section === 'overview' && !loading && (
              <AdminOverview
                stats={stats} bookings={bookings} reviews={reviews} avgRating={avgRating}
                onBookingClick={(b) => { setSection('bookings'); setDetailBooking(b); }}
                onViewAll={() => { setSection('bookings'); }}
              />
            )}
            {section === 'bookings' && !loading && (
              <AdminBookings
                bookings={bookings} search={search} statusFilter={statusFilter} token={token}
                onSearchChange={(v) => { setSearch(v); void fetchBookings(v, statusFilter); }}
                onStatusFilterChange={(v) => { setStatusFilter(v); void fetchBookings(search, v); }}
                onViewDetail={setDetailBooking}
                onDelete={(id) => { void delBooking(id); }}
                onUpdated={onBookingUpdated}
              />
            )}
            {section === 'users' && !loading && (
              <AdminUsers
                users={users} token={token}
                onViewUser={setViewUser}
                onResetPw={setResetPwUser}
                onDelete={(id) => { void delUser(id); }}
              />
            )}
            {section === 'notifications' && !loading && (
              <AdminNotifications token={token} users={users} />
            )}
            {section === 'reviews' && !loading && (
              <AdminReviews
                reviews={reviews} avgRating={avgRating}
                onDelete={(id) => { void delReview(id); }}
              />
            )}
            {section === 'services' && !loading && (
              <AdminServices bookings={bookings} />
            )}
            {section === 'analytics' && !loading && (
              <AdminAnalytics bookings={bookings} />
            )}

            {loading && (
              <motion.div key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-24">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-brand-gold-500/30 border-t-brand-gold-500 rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {broadcastOpen && <BroadcastModal key="bc" token={token} users={users} onClose={() => { setBroadcastOpen(false); }} />}
        {detailBooking && (
          <BookingDetailModal key="detail" booking={detailBooking} token={token}
            onClose={() => { setDetailBooking(null); }}
            onUpdated={updated => { onBookingUpdated(updated); setDetailBooking(updated); }} />
        )}
        {viewUser && (
          <UserDetailModal key="user-detail" user={viewUser} token={token}
            onClose={() => { setViewUser(null); }}
            onResetPw={(u) => { setViewUser(null); setResetPwUser(u); }} />
        )}
        {resetPwUser && <ResetPwModal key="resetpw" user={resetPwUser} token={token} onClose={() => { setResetPwUser(null); }} />}
      </AnimatePresence>
    </div>
  );
}
