import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_STATUSES, STATUS_COLORS, STATUS_LABELS, type Booking } from './adminTypes';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Props {
  booking: Booking;
  token: string;
  onUpdated: (b: Booking) => void;
}

export function StatusChanger({ booking, token, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => { document.removeEventListener('mousedown', handler); };
  }, []);

  const change = async (status: string) => {
    if (status === booking.status) { setOpen(false); return; }
    setOpen(false); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) onUpdated({ ...booking, status });
    } catch {}
    finally { setLoading(false); }
  };

  const c = STATUS_COLORS[booking.status] ?? STATUS_COLORS.PENDING_REVIEW;
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(v => !v); }} disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer hover:opacity-80 transition-opacity ${c.bg} ${c.text} ${c.border}`}>
        {loading
          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-3 h-3 border border-current border-t-transparent rounded-full" />
          : <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />}
        {STATUS_LABELS[booking.status]}
        <span className="opacity-50 text-[9px]">▼</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full mt-1 right-0 z-50 rounded-2xl shadow-2xl overflow-hidden min-w-[140px]"
            style={{ background: '#0a1f1e', border: '1px solid rgba(197,160,89,0.25)' }}>
            {ALL_STATUSES.map(s => {
              const sc = (s in STATUS_COLORS)
                ? STATUS_COLORS[s as keyof typeof STATUS_COLORS]
                : STATUS_COLORS.PENDING_REVIEW;
              return (
                <button key={s} onClick={() => { void change(s); }}
                  className={`w-full text-right px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-colors ${s === booking.status ? 'opacity-40 cursor-default' : 'hover:bg-brand-gold-500/10 text-white/80 hover:text-white'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
                  {(s in STATUS_LABELS) ? STATUS_LABELS[s as keyof typeof STATUS_LABELS] : s}
                  {s === booking.status && <span className="text-white/30 mr-auto text-[10px]">الحالية</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
