import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Calendar, CheckCircle, Clock, XCircle,
  Briefcase, Home, HardHat, Truck, Headphones, GraduationCap, Hotel,
  FileText, Star, X, User, LogOut,
  ChevronRight, ArrowLeft, Key, Save, Search, ArrowRight,
  PhoneCall, ScanSearch, Hammer, BadgeCheck, Ban,
  type LucideIcon,
} from 'lucide-react';
import { io as socketIO, Socket } from 'socket.io-client';
import { BOOKING_STATUS_STAGES, STATUS_ORDER } from '../constants';
import logoImg from '../assets/logo.png';
import { BookingCardSkeleton, NotificationSkeleton } from './Skeletons';
import type { SiteUser, Page, Lang } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

interface Booking {
  id: string; serviceType: string; date: string;
  status: string; createdAt: string; name: string; email: string;
  review?: { rating: number; comment?: string } | null;
}
interface Notification {
  id: string; type: string; title: string;
  message: string; read: boolean; createdAt: string;
}

const STATUS_MAP: Record<string, { label: { ar: string; en: string }; bg: string; text: string; border: string; icon: LucideIcon }> = {
  PENDING_REVIEW: { label: { ar: 'قيد الانتظار', en: 'Pending'     }, bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/30',   icon: Clock },
  UNDER_REVIEW:   { label: { ar: 'قيد المراجعة', en: 'Under Review' }, bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/30',    icon: Search },
  CONFIRMED:      { label: { ar: 'مؤكد',           en: 'Confirmed'   }, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: CheckCircle },
  IN_PROGRESS:    { label: { ar: 'جاري التنفيذ',  en: 'In Progress' }, bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/30',  icon: HardHat },
  COMPLETED:      { label: { ar: 'مكتمل',          en: 'Completed'   }, bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/30',    icon: CheckCircle },
  CANCELLED:      { label: { ar: 'ملغى',           en: 'Cancelled'   }, bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/30',     icon: XCircle },
};



// ─── Shared Header for all sub-pages ─────────────────────────────────────────
function DashHeader({
  siteUser, unread, onHome, onDrawer, activePage, logoImg, lang = 'ar'
}: {
  siteUser: SiteUser | null; unread: number;
  onHome: () => void; onDrawer: () => void;
  activePage: string; logoImg: string; lang?: string;
}) {
  const titles: Record<string, string> = {
    bookings: lang === 'ar' ? 'حجوزاتي' : 'My Bookings',
    notifications: lang === 'ar' ? 'الإشعارات' : 'Notifications',
    account: lang === 'ar' ? 'حسابي' : 'My Account',
  };
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-brand-gold-500/10"
      style={{ background: 'rgba(4,47,46,0.97)' }}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Right (RTL start): logo */}
        <div className="flex items-center shrink-0">
          <img src={logoImg} alt="ثرا نوفا" className="w-9 h-9 object-contain" />
        </div>

        {/* Center: page title */}
        <span className="text-white font-black text-sm">
          {(activePage in titles) ? titles[activePage as keyof typeof titles] : lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </span>

        {/* Left (RTL end): back button */}
        <button onClick={onHome}
          className="flex items-center gap-1.5 text-white/50 hover:text-brand-gold-500 transition-colors text-xs font-bold shrink-0 px-2 py-1.5 rounded-lg hover:bg-white/5">
          <ArrowRight size={16} />
          <span className="hidden sm:inline text-sm">{lang === 'ar' ? 'رجوع' : 'Back'}</span>
        </button>
      </div>
    </header>
  );
}

// ─── Booking Stages — premium cinematic stepper ─────────────────────────────

function BookingStages({ status, lang = 'ar' }: { status: string; lang?: string }) {
  const STAGE_ICONS = [Clock, PhoneCall, ScanSearch, Hammer, BadgeCheck];
  const STAGE_COLORS = ['#c5a059', '#3b82f6', '#8b5cf6', '#f97316', '#10b981'];
  const STAGE_NAMES = [
    { ar: 'استلام الطلب', en: 'Received'    },
    { ar: 'تواصل',        en: 'Contact'     },
    { ar: 'مراجعة',       en: 'Review'      },
    { ar: 'تنفيذ',        en: 'In Progress' },
    { ar: 'اكتمال',       en: 'Completed'   },
  ];

  const ORDER_KEYS = ['PENDING_REVIEW','UNDER_REVIEW','CONFIRMED','IN_PROGRESS','COMPLETED'];
  const currentIdx = ORDER_KEYS.indexOf(status);

  // Cancelled state
  if (status === 'CANCELLED') return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="mt-3 pt-3 border-t border-red-500/20">
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <Ban size={15} className="text-red-400 shrink-0" />
        <span className="text-red-400 text-xs font-black">
          {lang === 'ar' ? 'تم إلغاء الطلب' : 'Booking Cancelled'}
        </span>
      </div>
    </motion.div>
  );

  const activeColor = (currentIdx >= 0 ? STAGE_COLORS.at(currentIdx) : undefined) ?? '#c5a059';
  const ActiveIcon = (currentIdx >= 0 ? STAGE_ICONS.at(currentIdx) : undefined) ?? Clock;

  return (
    <div className="mt-3 pt-3 border-t border-white/8">

      {/* Active stage pill */}
      <div className="flex items-center gap-2.5 mb-3 px-3 py-2 rounded-2xl"
        style={{ background: `${activeColor}12`, border: `1px solid ${activeColor}35` }}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${activeColor}20` }}>
          <ActiveIcon size={14} style={{ color: activeColor }} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black" style={{ color: activeColor }}>
            {(() => {
              const stage = (currentIdx >= 0 ? STAGE_NAMES.at(currentIdx) : undefined) ?? STAGE_NAMES[0];
              return lang === 'ar' ? stage.ar : stage.en;
            })()}
          </p>
        </div>
        <span className="text-[10px] text-white/20 font-bold shrink-0">{currentIdx + 1}/{ORDER_KEYS.length}</span>
      </div>

      {/* Steps row — same icons/colors as MethodologySection */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-3.5 right-3.5 h-px"
          style={{ background: 'rgba(255,255,255,0.06)' }} />
        {/* Progress line */}
        <div className="absolute top-4 left-3.5 h-px transition-all duration-700"
          style={{
            width: currentIdx > 0 ? `calc(${(currentIdx / (ORDER_KEYS.length - 1)) * 100}% - 1.75rem)` : 0,
            background: `linear-gradient(90deg, #10b981, ${activeColor})`
          }} />

        <div className="relative flex justify-between">
          {STAGE_ICONS.map((Icon, idx) => {
            const done   = idx < currentIdx;
            const active = idx === currentIdx;
            const color = STAGE_COLORS.at(idx) ?? '#c5a059';
            const name = STAGE_NAMES.at(idx) ?? STAGE_NAMES[0];
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                {/* Icon circle */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center relative transition-all duration-300"
                  style={{
                    background: done ? 'linear-gradient(135deg, #10b981, #059669)'
                                     : active ? `linear-gradient(135deg, ${color}, ${color}cc)`
                                              : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${done ? '#10b981' : active ? color : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: active ? `0 0 14px ${color}55` : done ? '0 0 8px rgba(16,185,129,0.3)' : 'none',
                  }}>
                  {/* Pulse ring on active */}
                  {active && (
                    <div className="absolute inset-0 rounded-xl"
                      style={{ border: `2px solid ${color}`, opacity: 0.6 }} />
                  )}
                  <AnimatePresence mode="wait">
                    {done ? (
                      <span key="chk">
                        <CheckCircle size={13} className="text-white" strokeWidth={2.5} />
                      </span>
                    ) : (
                      <span key="ic">
                        <Icon size={13}
                          style={{ color: active ? '#042f2e' : 'rgba(255,255,255,0.2)' }}
                          strokeWidth={2} />
                      </span>
                    )}
                  </AnimatePresence>
                </div>
                {/* Label */}
                <span className="text-[8px] font-bold text-center leading-tight"
                  style={{
                    color: done ? 'rgba(16,185,129,0.6)' : active ? color : 'rgba(255,255,255,0.15)',
                    maxWidth: 34,
                  }}>
                  {(lang === 'ar' ? name.ar : name.en).split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ─── ReviewModal ─────────────────────────────────────────────────────────────
function ReviewModal({ booking, token, onDone, onClose, lang = 'ar' }: {
  booking: Booking; token: string; onDone: () => void; onClose: () => void; lang?: string;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!rating) { setError(lang === 'ar' ? 'يرجى اختيار تقييم' : 'Please select a rating'); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking.id, rating, comment }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || (lang === 'ar' ? 'خطأ' : 'Error'));
      onDone();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); } }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="w-full max-w-sm rounded-3xl p-6" dir="rtl"
        style={{ background: '#042f2e', border: '1px solid rgba(197,160,89,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-black text-lg">{lang === 'ar' ? 'قيّم خدمتك' : 'Rate Your Service'}</h3>
            <p className="text-brand-gold-500/70 text-xs mt-0.5">{booking.serviceType}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <p className="text-white/50 text-sm mb-5">{lang === 'ar' ? 'رأيك يساعدنا على التطور المستمر' : 'Your feedback helps us improve'}</p>
        <div className="flex justify-center gap-3 mb-5">
          {[1,2,3,4,5].map(s => (
            <button key={s} onMouseEnter={() => { setHover(s); }} onMouseLeave={() => { setHover(0); }} onClick={() => { setRating(s); }}
              className="transition-transform hover:scale-110 active:scale-95">
              <Star size={34} strokeWidth={1.5}
                fill={(hover || rating) >= s ? '#c5a059' : 'transparent'}
                stroke={(hover || rating) >= s ? '#c5a059' : 'rgba(255,255,255,0.2)'} />
            </button>
          ))}
        </div>
        <textarea rows={3} value={comment} onChange={(e) => { setComment(e.target.value); }}
          placeholder={lang === 'ar' ? "اكتب تعليقك هنا (اختياري)..." : "Write your comment (optional)..."}
          className="w-full rounded-2xl p-3 text-sm resize-none outline-none mb-3"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)', color: 'white' }} />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button onClick={() => { void submit(); }} disabled={loading}
          className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#c5a059', color: '#042f2e' }}>
          {loading
            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full" />
            : <><Star size={14} fill="#042f2e" /><span>{lang === 'ar' ? 'إرسال التقييم' : 'Submit Review'}</span></>}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── AccountTab ───────────────────────────────────────────────────────────────
function AccountTab({ siteUser, siteToken, onUserUpdate, onLogout, bookings, lang = 'ar' }: {
  siteUser: SiteUser | null; siteToken: string;
  onUserUpdate: (u: SiteUser) => void;
  onLogout: () => void;
  bookings: Booking[];
  lang?: string;
}) {
  const T = (ar: string, en: string) => lang === 'ar' ? ar : en;
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: siteUser?.name || '', phone: siteUser?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pwMode, setPwMode] = useState(false);
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [delConfirm, setDelConfirm] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const hdrs = () => ({ Authorization: `Bearer ${siteToken}`, 'Content-Type': 'application/json' });

  const saveProfile = async () => {
    if (!form.name.trim()) return;
    setSaving(true); setSaveMsg('');
    try {
      const r = await fetch(`${API_URL}/users/profile`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ name: form.name, phone: form.phone }) });
      const d = await r.json();
      if (d.success) { onUserUpdate(d.user); setEditMode(false); setSaveMsg(lang === 'ar' ? 'تم الحفظ بنجاح ✅' : 'Saved successfully ✅'); setTimeout(() => { setSaveMsg(''); }, 3000); }
      else setSaveMsg(d.message || (lang === 'ar' ? 'فشل الحفظ' : 'Save failed'));
    } catch { setSaveMsg(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error'); }
    finally { setSaving(false); }
  };

  const changePw = async () => {
    if (pw.newPw.length < 8) { setPwMsg(lang === 'ar' ? 'كلمة المرور الجديدة 8 أحرف على الأقل' : 'New password must be at least 8 characters'); return; }
    if (pw.newPw !== pw.confirm) { setPwMsg(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'); return; }
    setPwLoading(true); setPwMsg('');
    try {
      const r = await fetch(`${API_URL}/users/password`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPw }) });
      const d = await r.json();
      if (d.success) { setPwMsg(lang === 'ar' ? 'تم تغيير كلمة المرور ✅' : 'Password changed ✅'); setPw({ current: '', newPw: '', confirm: '' }); setTimeout(() => { setPwMode(false); setPwMsg(''); }, 2500); }
      else setPwMsg(d.message || (lang === 'ar' ? 'فشل التغيير' : 'Change failed'));
    } catch { setPwMsg(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error'); }
    finally { setPwLoading(false); }
  };

  const iStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(197,160,89,0.25)', color: 'white' };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="flex flex-col items-center pt-4 pb-2">
        <div className="w-20 h-20 rounded-3xl bg-brand-gold-500 flex items-center justify-center mb-3">
          <span className="text-brand-green-900 font-black text-4xl">{siteUser?.name.charAt(0).toUpperCase()}</span>
        </div>
        <h2 className="text-white font-black text-xl">{siteUser?.name}</h2>
        <p className="text-white/40 text-sm">{siteUser?.email}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-2xl font-black text-brand-gold-500 mb-1">{bookings.length}</div>
          <div className="text-white/40 text-xs">{T('إجمالي الطلبات', 'Total Bookings')}</div>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-2xl font-black text-emerald-400 mb-1">{bookings.filter(b => b.status === 'COMPLETED').length}</div>
          <div className="text-white/40 text-xs">{T('مكتملة', 'Completed')}</div>
        </div>
      </div>
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-sm">{T('بيانات الحساب', 'Account Info')}</h3>
          <button onClick={() => { setEditMode(!editMode); setForm({ name: siteUser?.name || '', phone: siteUser?.phone || '' }); setSaveMsg(''); }}
            className="text-brand-gold-500 text-xs font-bold hover:underline">{editMode ? T('إلغاء', 'Cancel') : T('تعديل', 'Edit')}</button>
        </div>
        {editMode ? (
          <div className="space-y-3">
            <div><label className="text-white/40 text-xs font-bold block mb-1">{T('الاسم الكامل', 'Full Name')}</label>
              <input value={form.name} onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); }}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-bold" style={iStyle} /></div>
            <div><label className="text-white/40 text-xs font-bold block mb-1">{T('رقم الهاتف', 'Phone Number')}</label>
              <input value={form.phone} onChange={(e) => { setForm(p => ({ ...p, phone: e.target.value })); }} placeholder="+966 5x xxx xxxx"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-bold" style={iStyle} /></div>
            {saveMsg && <p className={`text-xs text-center ${saveMsg.includes('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg}</p>}
            <button onClick={() => { void saveProfile(); }} disabled={saving}
              className="w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ background: '#c5a059', color: '#042f2e' }}>
              {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full" /> : <><Save size={14} /> {T('حفظ', 'Save')}</>}
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {[{ l: T('الاسم', 'Name'), v: siteUser?.name }, { l: T('البريد', 'Email'), v: siteUser?.email }, { l: T('الهاتف', 'Phone'), v: siteUser?.phone || T('غير محدد', 'Not set') }].map((item, i, arr) => (
              <div key={i} className={`flex justify-between py-3 ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                <span className="text-white/40 text-sm">{item.l}</span>
                <span className="text-white font-bold text-sm">{item.v}</span>
              </div>
            ))}
            {saveMsg && <p className="text-emerald-400 text-xs text-center mt-2">{saveMsg}</p>}
          </div>
        )}
      </div>
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-black text-sm">{T('كلمة المرور', 'Password')}</h3>
          <button onClick={() => { setPwMode(!pwMode); setPw({ current: '', newPw: '', confirm: '' }); setPwMsg(''); }}
            className="text-brand-gold-500 text-xs font-bold hover:underline">{pwMode ? T('إلغاء', 'Cancel') : T('تغيير', 'Change')}</button>
        </div>
        {pwMode ? (
          <div className="space-y-3">
            {[
              { label: T('كلمة المرور الحالية', 'Current Password'), key: 'current' as const },
              { label: T('كلمة المرور الجديدة', 'New Password'), key: 'newPw' as const },
              { label: T('تأكيد كلمة المرور', 'Confirm Password'), key: 'confirm' as const },
            ].map(item => (
              <div key={item.key}><label className="text-white/40 text-xs font-bold block mb-1">{item.label}</label>
                <input type="password" value={pw[item.key]} onChange={(e) => { setPw(p => ({ ...p, [item.key]: e.target.value })); }}
                  placeholder="••••••••" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none font-bold" style={iStyle} /></div>
            ))}
            {pwMsg && <p className={`text-xs text-center ${pwMsg.includes('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{pwMsg}</p>}
            <button onClick={() => { void changePw(); }} disabled={pwLoading}
              className="w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ background: '#c5a059', color: '#042f2e' }}>
              {pwLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full" /> : <><Key size={14} /> {T('تغيير', 'Change')}</>}
            </button>
          </div>
        ) : <p className="text-white/30 text-sm">••••••••</p>}
      </div>
      <button onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
        <LogOut size={16} /> {T('تسجيل الخروج', 'Log Out')}
      </button>
      {!delConfirm
        ? <button onClick={() => { setDelConfirm(true); }} className="w-full text-center text-xs text-white/20 hover:text-red-400/60 transition-colors py-2 font-bold">{T('حذف الحساب نهائياً', 'Delete Account Permanently')}</button>
        : <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p className="text-red-400 text-sm font-bold text-center">{T('هل أنت متأكد من حذف حسابك نهائياً؟', 'Are you sure you want to permanently delete your account?')}</p>
            <div className="flex gap-3">
              <button onClick={() => { setDelConfirm(false); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:bg-white/5">{T('إلغاء', 'Cancel')}</button>
              <button onClick={() => { void (async () => { setDelLoading(true); await fetch(`${API_URL}/users/account`, { method: 'DELETE', headers: hdrs() }); onLogout(); })(); }}
                disabled={delLoading} className="flex-1 py-2.5 rounded-xl text-sm font-bold active:scale-95" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                {delLoading ? T('جاري...', 'Deleting...') : T('نعم، احذف', 'Yes, Delete')}
              </button>
            </div>
          </div>
      }
    </div>
  );
}


// ─── Service icon map ─────────────────────────────────────────────────────────
// Arabic and English keyword → icon mapping (covers both lang modes)
const SERVICE_ICON_KEYWORDS: Array<[string, LucideIcon]> = [
  ['إنشاء',        HardHat],   ['مقاول',      HardHat],
  ['Construction', HardHat],   ['Contracting', HardHat],
  ['نقل',          Truck],      ['Transport',  Truck],   ['Shipping', Truck],
  ['عميل',         Headphones], ['Customer',   Headphones], ['Support', Headphones],
  ['تدريب',        GraduationCap], ['Training', GraduationCap],
  ['استشار',       FileText],   ['Advisory',  FileText], ['Consulting', FileText],
  ['Events',       Calendar],   ['فعالية',    Calendar], ['مؤتمر', Calendar],
  ['Hospitality',  Hotel],      ['ضيافة',     Hotel],    ['فنادق', Hotel],
];
function getServiceIcon(serviceType: string) {
  for (const [key, Icon] of SERVICE_ICON_KEYWORDS) {
    if (serviceType.includes(key)) return Icon;
  }
  return Briefcase;
}

// ─── Memoized booking card body — prevents re-render during scroll ────────────
type BookingWithUi = Booking & { canCancel: boolean; onCancel: (id: string) => Promise<void>; cancelling: boolean };

interface BookingCardInnerProps {
  b: BookingWithUi;
  st: (typeof STATUS_MAP)[string];
  StIcon: LucideIcon;
  canReview: boolean;
  fmt: (d: string) => string;
  onReview: () => void;
  isHistory: boolean;
  lang?: Lang;
}

const BookingCardInner = React.memo(({ b, st, StIcon, canReview, fmt, onReview, isHistory, lang = 'ar' }: BookingCardInnerProps) => {
  const ServiceIcon = getServiceIcon(b.serviceType || '');
  return (
    <>
      {/* ── Top row ── */}
      <div className="flex items-start gap-3">
        {/* Service icon bubble */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
          isHistory ? 'bg-white/4 border border-white/8' : `${st.bg} border ${st.border}`
        }`}>
          <ServiceIcon size={20} className={isHistory ? 'text-white/25' : st.text} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-black text-sm leading-tight truncate ${isHistory ? 'text-white/40' : 'text-white'}`}>
              {b.serviceType}
            </h3>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold shrink-0 ${
              isHistory ? 'bg-white/3 border-white/8 text-white/30' : `${st.bg} ${st.text} ${st.border}`
            }`}>
              <StIcon size={9} />{lang === 'ar' ? st.label.ar : st.label.en}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-[10px] font-bold flex items-center gap-1 ${isHistory ? 'text-white/20' : 'text-white/40'}`}>
              <Calendar size={9} />{b.date}
            </span>
            <span className={`text-[9px] font-bold font-mono ${isHistory ? 'text-white/15' : 'text-brand-gold-500/40'}`}>
              #{b.id.slice(0,8).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stages (hidden for history to keep it clean) ── */}
      {!isHistory && <BookingStages status={b.status} />}

      {/* ── History: compact review display ── */}
      {isHistory && b.review && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={10} strokeWidth={1.5}
                fill={s <= (b.review?.rating ?? 0) ? 'rgba(197,160,89,0.5)' : 'transparent'}
                stroke={s <= (b.review?.rating ?? 0) ? 'rgba(197,160,89,0.5)' : 'rgba(255,255,255,0.1)'} />
            ))}
          </div>
          <span className="text-white/20 text-[9px]">{fmt(b.createdAt)}</span>
        </div>
      )}

      {/* ── Active: action buttons ── */}
      {!isHistory && (
        <>
          {canReview && (
            <motion.button
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              onClick={onReview} whileTap={{ scale: 0.96 }}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all"
              style={{ background: 'rgba(197,160,89,0.12)', border: '1px solid rgba(197,160,89,0.3)', color: '#c5a059' }}>
              <Star size={12} fill="#c5a059" />
              {/* rating prompt */}
              {lang === 'ar' ? 'قيّم خدمتك الآن' : 'Rate This Service'}
              <ChevronRight size={11} />
            </motion.button>
          )}
          {b.review && (
            <div className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={11} strokeWidth={1.5}
                    fill={s <= (b.review?.rating ?? 0) ? '#c5a059' : 'transparent'}
                    stroke={s <= (b.review?.rating ?? 0) ? '#c5a059' : 'rgba(255,255,255,0.15)'} />
                ))}
              </div>
              <span className="text-white/30 text-[10px]">{lang === 'ar' ? 'تقييمك' : 'Your Rating'}</span>
            </div>
          )}
          {b.canCancel && (
            <button onClick={() => { void b.onCancel(b.id); }} disabled={b.cancelling}
              className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30">
              <XCircle size={11} /><span>{b.cancelling ? (lang === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...') : (lang === 'ar' ? 'إلغاء الطلب' : 'Cancel Booking')}</span>
            </button>
          )}
        </>
      )}
    </>
  );
});

// ─── Main UserDashboard ───────────────────────────────────────────────────────
export default function UserDashboard({
  siteUser, siteToken, setCurrentPage, setSiteUser, setSiteToken, onUnreadChange, activePage = 'bookings', lang = 'ar'
}: {
  siteUser: SiteUser | null; siteToken: string | null;
  setCurrentPage: (p: Page) => void;
  setSiteUser: (u: SiteUser | null) => void;
  setSiteToken: (t: string | null) => void;
  onUnreadChange?: (count: number) => void;
  activePage?: 'bookings' | 'notifications' | 'account';
  lang?: 'ar' | 'en';
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const onUnreadChangeRef = useRef(onUnreadChange);
  useEffect(() => { onUnreadChangeRef.current = onUnreadChange; }, [onUnreadChange]);
  // Track IDs of bookings already rendered — prevents re-animation on status update
  const renderedBookingIds = useRef<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [notifSearch, setNotifSearch] = useState('');
  const [bookingTab, setBookingTab] = useState<'active'|'history'>('active');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const T = (ar: string, en: string) => lang === 'ar' ? ar : en;

  // ── Socket.io real-time ────────────────────────────────────────────────────
  useEffect(() => {
    if (!siteUser?.id || !siteToken) return;
    if (socketRef.current?.connected) return;

    const socket = socketIO(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 20,
      auth: { token: siteToken },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join:user', siteUser.id);
    });

    // Real-time notification → update badge + list instantly
    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => {
        const exists = prev.some(n => n.id === notif.id);
        if (exists) return prev;
        return [{ ...notif, read: false }, ...prev];
      });
      setUnread(c => {
        const n = c + 1;
        onUnreadChangeRef.current?.(n);
        return n;
      });
    });

    // Real-time booking status update
    socket.on('booking:created', (newBooking: Booking) => {
      setBookings(prev => [newBooking, ...prev]);
    });
    socket.on('booking:updated', (updated: Booking) => {
      setBookings(prev => {
        return prev.map(b => b.id === updated.id ? { ...b, ...updated } : b);
      });
      if (updated.status === 'COMPLETED' && !updated.review) {
        // Switch to history tab and show review modal immediately
        setBookingTab('history');
        setReviewBooking(updated);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [siteUser?.id, siteToken]);

  // ── Fetch data (once on mount) ─────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    if (!siteToken) return;
    try {
      const r = await fetch(`${API_URL}/bookings/user/my-bookings`, {
        headers: { Authorization: `Bearer ${siteToken}` }
      });
      const d = await r.json();
      if (d.success) setBookings(d.data);
    } catch {}
  }, [siteToken]);

  const fetchNotifications = useCallback(async () => {
    if (!siteToken) return;
    try {
      const r = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${siteToken}` }
      });
      const d = await r.json();
      if (d.success) {
        setNotifications(d.data);
        const c = d.unreadCount || 0;
        setUnread(c);
        onUnreadChange?.(c);
      }
    } catch {}
  }, [siteToken, onUnreadChange]);

  useEffect(() => {
    // Fetch once on mount — socket handles real-time updates after that
    setLoading(true);
    void Promise.all([fetchBookings(), fetchNotifications()]).finally(() => { setLoading(false); });
  }, [fetchBookings, fetchNotifications]);

  // Socket handles real-time updates — no polling needed

  // ── Mark one notification read ─────────────────────────────────────────────
  const markRead = useCallback(async (n: Notification) => {
    if (n.read) return;
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
    const nc = Math.max(0, unread - 1);
    setUnread(nc);
    onUnreadChange?.(nc);
    try {
      await fetch(`${API_URL}/notifications/read/${n.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${siteToken}` }
      });
    } catch {}
  }, [unread, siteToken, onUnreadChange]);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    socketRef.current?.disconnect();
    setSiteUser(null); setSiteToken(null);
    sessionStorage.removeItem('site_user');
    sessionStorage.removeItem('site_token');
    setCurrentPage('home');
  };


  const cancelBooking = async (bookingId: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${siteToken}` },
      });
      const d = await res.json();
      if (d.success) {
        setBookings(p => p.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      } else {
        alert(d.message || (lang === 'ar' ? 'لا يمكن إلغاء هذا الطلب' : 'This booking cannot be cancelled'));
      }
    } catch { alert(lang === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again'); }
    finally { setCancelling(null); }
  };

  const goPage = (p: 'bookings' | 'notifications' | 'account') => {
    setDrawerOpen(false);
    setCurrentPage(`dashboard:${p}`);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main, #020e0d)' }} dir="rtl">

      {/* Header */}
      <DashHeader
        siteUser={siteUser} unread={unread}
        onHome={() => { setCurrentPage('home'); }}
        onDrawer={() => { setDrawerOpen(true); }}
        activePage={activePage}
        logoImg={logoImg}
        lang={lang}
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-10">
        <AnimatePresence mode="wait">

          {/* ── BOOKINGS PAGE ──────────────────────────────────────────────── */}
          {activePage === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="flex justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-brand-gold-500/40 border-t-brand-gold-500 rounded-full" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={28} className="text-white/20" />
                  </div>
                  <p className="text-white/50 font-bold mb-2">{T('لا توجد حجوزات بعد', 'No bookings yet')}</p>
                  <p className="text-white/30 text-sm mb-6">{T('احجز أول خدمة من الصفحة الرئيسية', 'Book your first service from the home page')}</p>
                  <button onClick={() => { setCurrentPage('home'); }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all"
                    style={{ background: '#c5a059', color: '#042f2e' }}>
                    {T('الصفحة الرئيسية', 'Home Page')} <ArrowLeft size={16} />
                  </button>
                </div>
              ) : (
                <>
                {/* Active / History tabs */}
                <div className="flex gap-2 mb-4">
                  {(['active','history'] as const).map(tab => {
                    // History = CANCELLED or (COMPLETED with review). Active = everything else
                    const isHistory = (b: Booking) =>
                      b.status === 'CANCELLED' || (b.status === 'COMPLETED' && !!b.review);
                    const cnt = tab === 'active'
                      ? bookings.filter(b => !isHistory(b)).length
                      : bookings.filter(b => isHistory(b)).length;
                    return (
                      <button key={tab} onClick={() => { setBookingTab(tab); setPage(1); }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all"
                        style={{ background: bookingTab===tab ? '#c5a059' : 'rgba(255,255,255,0.05)', color: bookingTab===tab ? '#042f2e' : 'rgba(255,255,255,0.4)' }}>
                        {tab==='active' ? lang === 'ar' ? '🟢 النشطة' : '🟢 Active' : lang === 'ar' ? '📁 السجل' : '📁 History'}
                        <span className="mr-1 opacity-60">({cnt})</span>
                      </button>
                    );
                  })}
                </div>
                {(() => {
                  const isHistoryFn = (b: Booking) =>
                    b.status === 'CANCELLED' || (b.status === 'COMPLETED' && !!b.review);
                  const filtered = bookings.filter(b => bookingTab==='active' ? !isHistoryFn(b) : isHistoryFn(b));
                  const paginated = filtered.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE);
                  return (
                    <>
                    <div className="space-y-2" style={{ contain: 'content' }}>
                      {paginated.map((b, i) => {
                        const st = STATUS_MAP[b.status] ?? STATUS_MAP.PENDING_REVIEW;
                        const StIcon = st.icon;
                        const canReview = b.status === 'COMPLETED' && !b.review;
                        const isHistory = isHistoryFn(b);
                        const isNew = !renderedBookingIds.current.has(b.id);
                        if (isNew) renderedBookingIds.current.add(b.id);

                        const cardClass = isHistory
                          ? 'rounded-2xl border border-white/6 p-4 opacity-60 hover:opacity-80 transition-opacity'
                          : `rounded-2xl sm:rounded-3xl border p-4 sm:p-5 ${st.bg} ${st.border}`;

                        const inner = (
                          <BookingCardInner
                            b={{ ...b, canCancel: ['PENDING_REVIEW','UNDER_REVIEW'].includes(b.status), onCancel: cancelBooking, cancelling: cancelling === b.id }}
                            st={st} StIcon={StIcon} canReview={canReview} fmt={fmt}
                            onReview={() => { setReviewBooking(b); }} isHistory={isHistory} />
                        );

                        return isNew ? (
                          <motion.div key={b.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.035 }}
                            className={cardClass}
                            style={isHistory ? { background: 'rgba(255,255,255,0.02)' } : {}}>
                            {inner}
                          </motion.div>
                        ) : (
                          <div key={b.id} className={cardClass}
                            style={isHistory ? { background: 'rgba(255,255,255,0.02)' } : {}}>
                            {inner}
                          </div>
                        );
                      })}
                    </div>
                    {filtered.length === 0 && (
                      <div className="text-center py-10 text-white/25">
                        <p className="text-3xl mb-2">{bookingTab==='active' ? '📋' : '📭'}</p>
                        <p className="text-sm font-bold">{bookingTab==='active' ? T('لا توجد طلبات نشطة','No active bookings') : T('السجل فارغ','History is empty')}</p>
                      </div>
                    )}
                    {/* Pagination */}
                    {filtered.length > ITEMS_PER_PAGE && (
                      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/8">
                        <button disabled={page === 1} onClick={() => { setPage(p => p - 1); }}
                          className="px-3 py-1.5 rounded-xl text-xs font-black disabled:opacity-30 text-white/60 hover:text-brand-gold-500 transition-colors">
                          ‹ {T('السابق','Prev')}
                        </button>
                        <span className="text-white/30 text-xs">{page} / {Math.ceil(filtered.length/ITEMS_PER_PAGE)}</span>
                        <button disabled={page >= Math.ceil(filtered.length/ITEMS_PER_PAGE)} onClick={() => { setPage(p => p + 1); }}
                          className="px-3 py-1.5 rounded-xl text-xs font-black disabled:opacity-30 text-white/60 hover:text-brand-gold-500 transition-colors">
                          {T('التالي','Next')} ›
                        </button>
                      </div>
                    )}
                    </>
                  );
                })()}
              </>
            )}
            </motion.div>
          )}

          {/* ── NOTIFICATIONS PAGE ─────────────────────────────────────────── */}
          {activePage === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-black text-lg">{T('الإشعارات', 'Notifications')}</h2>
                {unread > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/15 text-red-400 border border-red-500/25">
                    {unread} {T('غير مقروء', 'unread')}
                  </span>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-brand-gold-500/40 border-t-brand-gold-500 rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Bell size={28} className="text-white/20" />
                  </div>
                  <p className="text-white/50 font-bold">{T('لا توجد إشعارات حتى الآن', 'No notifications yet')}</p>
                  <p className="text-white/30 text-sm mt-1">{T('ستصلك الإشعارات هنا فوراً', 'You will receive notifications here instantly')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n, i) => (
                    <motion.div key={n.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={() => { void markRead(n); }}
                      className={`rounded-2xl border p-4 flex items-start gap-3 cursor-pointer transition-all ${
                        n.read
                          ? 'border-white/8 bg-white/2 hover:bg-white/4'
                          : 'border-brand-gold-500/30 bg-brand-gold-500/8 hover:bg-brand-gold-500/12'
                      }`}>
                      <div className={`w-2 h-2 rounded-full mt-2 shrink-0 transition-colors ${n.read ? 'bg-white/15' : 'bg-brand-gold-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-bold text-sm ${n.read ? 'text-white/55' : 'text-white'}`}>{n.title}</p>
                          {!n.read && (
                            <span className="text-[9px] font-black shrink-0 mt-0.5 px-1.5 py-0.5 rounded-full bg-brand-gold-500/20 text-brand-gold-500">
                              {T('جديد', 'New')}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-0.5 leading-relaxed ${n.read ? 'text-white/35' : 'text-white/65'}`}>{n.message}</p>
                        <p className="text-white/20 text-xs mt-1.5">
                          {new Date(n.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ACCOUNT PAGE ──────────────────────────────────────────────── */}
          {activePage === 'account' && (
            <motion.div key="account" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AccountTab
                siteUser={siteUser} siteToken={siteToken ?? ''}
                onUserUpdate={u => { setSiteUser(u); sessionStorage.setItem('site_user', JSON.stringify(u)); }}
                onLogout={logout} bookings={bookings} lang={lang}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Hamburger Drawer ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => { setDrawerOpen(false); }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-64 z-50 flex flex-col"
              style={{ background: '#042f2e', borderLeft: '1px solid rgba(197,160,89,0.15)' }}>
              {/* Drawer header */}
              <div className="flex items-center justify-between p-5 border-b border-brand-gold-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-gold-500 flex items-center justify-center">
                    <span className="text-brand-green-900 font-black">{siteUser?.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{siteUser?.name}</p>
                    <p className="text-white/40 text-xs truncate max-w-[120px]">{siteUser?.email}</p>
                  </div>
                </div>
                <button onClick={() => { setDrawerOpen(false); }} className="text-white/40 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              {/* Nav items */}
              <nav className="flex-1 p-4 space-y-1">
                {(
                  [
                    { id: 'bookings',       icon: Briefcase, label: T('حجوزاتي', 'Bookings') },
                    { id: 'notifications',  icon: Bell,      label: T('الإشعارات', 'Notifications'), badge: unread },
                    { id: 'account',        icon: User,      label: T('حسابي', 'Account') },
                  ] satisfies Array<{ id: 'bookings' | 'notifications' | 'account'; icon: LucideIcon; label: string; badge?: number }>
                ).map(item => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button key={item.id} onClick={() => { goPage(item.id); }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all relative ${
                        isActive ? 'bg-brand-gold-500/15 text-brand-gold-500' : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {(item.badge ?? 0) > 0 && (
                        <span className="absolute left-4 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                          {(item.badge ?? 0) > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              {/* Footer */}
              <div className="p-4 border-t border-brand-gold-500/10 space-y-1">
                <button onClick={() => { setDrawerOpen(false); setCurrentPage('home'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-white/50 hover:bg-white/5 hover:text-white transition-all">
                  <Home size={17} /><span>{T('الرئيسية', 'Home')}</span>
                </button>
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all"
                  style={{ color: '#f87171' }}>
                  <LogOut size={17} /><span>{T('تسجيل الخروج', 'Log Out')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewBooking && (
          <ReviewModal key="review" booking={reviewBooking} token={siteToken ?? ''} lang={lang}
            onDone={() => { setReviewBooking(null); void fetchBookings(); }}
            onClose={() => { setReviewBooking(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
