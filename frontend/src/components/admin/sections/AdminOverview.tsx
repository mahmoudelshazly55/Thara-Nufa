import { motion } from 'motion/react';
import { type Booking, type Stats, type Review, arabicService } from '../shared/adminTypes';
import { StatusPill } from '../shared/StatusPill';

interface Props {
  stats: Stats;
  bookings: Booking[];
  reviews: Review[];
  avgRating: string;
  onBookingClick: (b: Booking) => void;
  onViewAll: () => void;
}

export function AdminOverview({ stats, bookings, reviews, avgRating, onBookingClick, onViewAll }: Props) {
  return (
    <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات',    value: stats.total,                                  color: 'text-brand-gold-500' },
          { label: 'قيد الانتظار',       value: stats.pending,                                 color: 'text-amber-400' },
          { label: 'مكتملة',             value: stats.completed,                               color: 'text-teal-400' },
          { label: 'المستخدمون',         value: stats.userCount,                               color: 'text-blue-400' },
          { label: 'متوسط التقييم',      value: avgRating,                                     color: 'text-yellow-400' },
          { label: 'إجمالي التقييمات',   value: reviews.length,                               color: 'text-purple-400' },
          { label: 'تقييمات منخفضة',     value: reviews.filter(r => r.rating <= 2).length,    color: 'text-red-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl p-4 border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.1)' }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-black text-sm">آخر الطلبات</h3>
          <button onClick={onViewAll} className="text-brand-gold-500 text-xs hover:underline">عرض الكل</button>
        </div>
        <div className="p-4 space-y-2">
          {bookings.slice(0, 5).map(b => (
            <div key={b.id} onClick={() => { onBookingClick(b); }}
              className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/4 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-brand-gold-500/50 text-[9px] font-black font-mono shrink-0">#{b.id.slice(0,8).toUpperCase()}</span>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{b.name}</p>
                  <p className="text-white/35 text-xs truncate">{arabicService(b.serviceType)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-white/30 text-xs hidden sm:block">{b.date}</span>
                <StatusPill status={b.status} />
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-center text-white/30 text-sm py-4">لا توجد طلبات</p>}
        </div>
      </div>
    </motion.div>
  );
}
