import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, Star, Loader2, ArrowRight } from 'lucide-react';
import { User, MessageSquare } from 'lucide-react';
import logoImg from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || '/api';

type Lang = 'ar' | 'en';

const STATUS_MAP: Record<string, { label: { ar: string; en: string }; color: string; icon: string }> = {
  PENDING_REVIEW: { label: { ar: 'انتظار',     en: 'Pending'     }, color: '#f59e0b', icon: '⏳' },
  UNDER_REVIEW:   { label: { ar: 'تواصل',      en: 'Under Review' }, color: '#3b82f6', icon: '📞' },
  CONFIRMED:      { label: { ar: 'مراجعة',     en: 'Confirmed'   }, color: '#10b981', icon: '🔍' },
  IN_PROGRESS:    { label: { ar: 'تنفيذ',      en: 'In Progress' }, color: '#8b5cf6', icon: '⚙️' },
  COMPLETED:      { label: { ar: 'اكتمال',     en: 'Completed'   }, color: '#22c55e', icon: '🎉' },
  CANCELLED:      { label: { ar: 'ملغي',       en: 'Cancelled'   }, color: '#ef4444', icon: '❌' },
};

const STEP_LABELS: Record<string, { ar: string; en: string }> = {
  PENDING_REVIEW: { ar: 'انتظار',  en: 'Pending'  },
  UNDER_REVIEW:   { ar: 'تواصل',   en: 'Review'   },
  CONFIRMED:      { ar: 'مراجعة',  en: 'Confirmed' },
  IN_PROGRESS:    { ar: 'تنفيذ',   en: 'Progress' },
  COMPLETED:      { ar: 'اكتمال',  en: 'Done'     },
};

const ORDER_STEPS = ['PENDING_REVIEW','UNDER_REVIEW','CONFIRMED','IN_PROGRESS','COMPLETED'];

type BookingStatus = 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
interface TrackResult {
  id: string; name: string; phone: string;
  serviceType: string; date: string; status: BookingStatus; createdAt: string; lang?: string;
}

export function TrackOrderPage({ onBack, onLogin, lang = 'ar' }: {
  onBack: () => void; onLogin: () => void; lang?: Lang;
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState('');

  const T = (ar: string, en: string) => lang === 'ar' ? ar : en;

  const search = async () => {
    const id = query.trim().replace(/^#/, '');
    if (!id) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await fetch(`${API_URL}/bookings/track/${id}`);
      if (!r.ok || r.headers.get('content-type')?.includes('text/html')) {
        setError(T('حدث خطأ في الاتصال، تحقق من رقم الطلب', 'Connection error, please check your booking number'));
        return;
      }
      const d = await r.json();
      if (d.success) setResult(d.data);
      else setError(T('لم يتم العثور على طلب بهذا الرقم', 'No booking found with this number'));
    } catch { setError(T('حدث خطأ، حاول مرة أخرى', 'An error occurred, please try again')); }
    finally { setLoading(false); }
  };

  const st = result ? STATUS_MAP[result.status] : null;
  const stepIdx = result ? ORDER_STEPS.indexOf(result.status) : -1;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className="min-h-screen" style={{ background: 'linear-gradient(135deg, #010b0a 0%, #021a18 100%)' }}>

      {/* ── Header ── */}
      <div className="px-4 py-4 flex items-center border-b" style={{ borderColor: 'rgba(197,160,89,0.1)' }}>
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img src={logoImg} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-black text-sm">{lang === 'ar' ? 'ثرا نوفا' : 'Thara Nufa'}</span>
          </div>

          {/* Back button */}
          <button
            onClick={() => { onBack(); }}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm font-bold px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            <ArrowRight size={15} />
            {T('رجوع', 'Back')}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-12 pb-20">
        {/* Icon + title */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(197,160,89,0.15)', border: '1px solid rgba(197,160,89,0.3)' }}>
            <Search size={28} className="text-brand-gold-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{T('تتبع طلبك', 'Track Your Order')}</h1>
          <p className="text-white/45 text-sm text-center leading-relaxed">
            {T('أدخل رقم الحجز الذي وصلك عبر الإشعار لمعرفة حالة طلبك',
               'Enter your booking number from the confirmation notification')}
          </p>
        </div>

        {/* Search input */}
        <div className="flex gap-3 mb-2">
          <button
            onClick={() => { void search(); }}
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shrink-0"
            style={{
              background: query.trim() ? '#c5a059' : 'rgba(197,160,89,0.2)',
              color: query.trim() ? '#042f2e' : 'rgba(255,255,255,0.3)',
            }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {T('تتبع', 'Track')}
          </button>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { void search(); } }}
            placeholder={T('مثال: AB12CD34 #', 'e.g. AB12CD34')}
            dir="ltr"
            className="flex-1 px-4 py-3 rounded-2xl text-sm text-white font-bold outline-none placeholder:text-white/25"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)', textAlign: lang === 'ar' ? 'right' : 'left' }}
          />
        </div>
        <p className="text-white/25 text-xs mb-8" style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}>
          {T('الرقم يوجد في إشعار تأكيد الحجز', 'Found in your booking confirmation notification')}
        </p>

        {/* Error */}
        {error && (
          <div className="rounded-2xl p-4 mb-6 text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && st && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Status card */}
            <div className="rounded-3xl p-6"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,160,89,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/40 text-xs font-bold mb-1">{T('رقم الطلب', 'Booking ID')}</p>
                  <p className="text-brand-gold-500 font-black text-lg font-mono">#{result.id.slice(0,8).toUpperCase()}</p>
                </div>
                <div className="text-3xl">{st.icon}</div>
              </div>
              <div className="px-3 py-2 rounded-xl inline-flex items-center gap-2"
                style={{ background: `${st.color}18`, border: `1px solid ${st.color}40` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: st.color }} />
                <span className="font-black text-sm" style={{ color: st.color }}>
                  {lang === 'ar' ? st.label.ar : st.label.en}
                </span>
              </div>
            </div>

            {/* Progress steps */}
            {result.status !== 'CANCELLED' && (
              <div className="rounded-3xl p-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.1)' }}>
                <p className="text-white/40 text-xs font-bold mb-4">{T('مراحل الطلب', 'Order Progress')}</p>
                <div className="space-y-3">
                  {ORDER_STEPS.map((s, i) => {
                    const done   = i <= stepIdx;
                    const active = i === stepIdx;
                    const lbl = Object.prototype.hasOwnProperty.call(STEP_LABELS, s) ? STEP_LABELS[s as keyof typeof STEP_LABELS] : STEP_LABELS.PENDING_REVIEW;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-all"
                          style={{
                            background: done ? '#c5a059' : 'rgba(255,255,255,0.06)',
                            color: done ? '#042f2e' : 'rgba(255,255,255,0.2)',
                            boxShadow: active ? '0 0 12px rgba(197,160,89,0.5)' : 'none',
                          }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span className="text-sm font-bold"
                          style={{ color: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}>
                          {lang === 'ar' ? lbl.ar : lbl.en}
                        </span>
                        {active && (
                          <span className="ms-auto text-[10px] font-black px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(197,160,89,0.2)', color: '#c5a059' }}>
                            {T('الآن', 'Now')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking details */}
            <div className="rounded-3xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.1)' }}>
              <p className="text-white/40 text-xs font-bold mb-3">{T('تفاصيل الطلب', 'Booking Details')}</p>
              <div className="space-y-2.5">
                {[
                  { ar: 'الاسم',     en: 'Name',    value: result.name },
                  { ar: 'الخدمة',    en: 'Service', value: result.serviceType },
                  { ar: 'التاريخ',   en: 'Date',    value: result.date },
                  { ar: 'رقم الهاتف', en: 'Phone',   value: result.phone },
                ].map(f => (
                  <div key={f.en} className="flex justify-between items-center">
                    <span className="text-white/80 text-sm font-bold">{f.value}</span>
                    <span className="text-white/30 text-xs">{lang === 'ar' ? f.ar : f.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Hints — no result yet */}
        {!result && !error && !loading && (
          <div className="space-y-3">
            <p className="text-white/30 text-xs font-bold text-center mb-4">
              {T('كيف أجد رقم حجزي؟', 'How do I find my booking number?')}
            </p>
            {[
              { icon: Bell,         ar: 'في إشعار تأكيد الحجز',              en: 'In your booking confirmation notification' },
              { icon: MessageSquare, ar: 'في البريد الإلكتروني الذي أُرسل إليك', en: 'In the email sent to you' },
              { icon: User,         ar: 'أو سجّل دخولك لرؤية كل طلباتك',    en: 'Or log in to see all your bookings' },
            ].map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h.icon size={16} className="text-white/30 shrink-0" />
                <span className="text-white/45 text-sm">{lang === 'ar' ? h.ar : h.en}</span>
              </div>
            ))}
            <button
              onClick={() => { onLogin(); }}
              className="w-full mt-4 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(197,160,89,0.12)', border: '1px solid rgba(197,160,89,0.3)', color: '#c5a059' }}>
              <Star size={15} />
              {T('تسجيل الدخول لرؤية كل طلباتك', 'Log in to view all your bookings')}
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
