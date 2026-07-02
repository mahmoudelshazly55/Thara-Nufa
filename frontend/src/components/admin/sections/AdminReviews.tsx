import { motion } from 'motion/react';
import { Star, AlertTriangle, Trash2 } from 'lucide-react';
import { type Review, arabicService, fmtDate } from '../shared/adminTypes';

interface Props {
  reviews: Review[];
  avgRating: string;
  onDelete: (id: string) => void;
}

export function AdminReviews({ reviews, avgRating, onDelete }: Props) {
  return (
    <motion.div key="rv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'إجمالي التقييمات',    value: reviews.length,                          color: 'text-brand-gold-500' },
          { label: 'متوسط التقييم',        value: `${avgRating}/5`,                       color: 'text-yellow-400' },
          { label: 'تقييمات منخفضة (≤2)', value: reviews.filter(r => r.rating <= 2).length, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Star size={36} className="mx-auto mb-3 opacity-30" />
          <p>لا توجد تقييمات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`rounded-2xl border p-5 ${r.rating <= 2 ? 'border-red-500/25 bg-red-500/5' : 'border-brand-gold-500/10 bg-white/2'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-black text-sm">{r.user?.name || r.booking?.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{arabicService(r.booking?.serviceType || '')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} strokeWidth={1.5}
                        fill={s <= r.rating ? '#c5a059' : 'transparent'}
                        stroke={s <= r.rating ? '#c5a059' : 'rgba(255,255,255,0.2)'} />
                    ))}
                  </div>
                  {r.rating <= 2 && <AlertTriangle size={14} className="text-red-400" />}
                  <button onClick={() => { onDelete(r.id); }} className="p-1 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
                {(r.booking?.id || r.bookingId) && (
                  <span className="text-brand-gold-500/60 text-[10px] font-mono font-bold">
                    رقم الطلب: #{((r.booking?.id ?? r.bookingId) ?? '').slice(0,8).toUpperCase()}
                  </span>
                )}
                {r.user?.email && <span className="text-white/35 text-[10px]">✉ {r.user.email}</span>}
                {r.user?.phone && <span className="text-white/35 text-[10px]">📞 {r.user.phone}</span>}
              </div>
              {r.comment && <p className="text-white/55 text-sm mt-2 leading-relaxed">{r.comment}</p>}
              <p className="text-white/20 text-xs mt-2">{fmtDate(r.createdAt)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
