import { motion } from 'motion/react';
import { type Booking, arabicService } from '../shared/adminTypes';

interface Props {
  bookings: Booking[];
}

export function AdminServices({ bookings }: Props) {
  const map = new Map<string, number>();
  bookings.forEach(b => { const ar = arabicService(b.serviceType); map.set(ar, (map.get(ar) || 0) + 1); });
  const total = bookings.length || 1;
  const sorted = Array.from(map.entries()).sort(([, a], [, b]) => b - a);
  const topService = sorted.at(0);

  return (
    <motion.div key="sv" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {topService && (
        <div className="rounded-2xl p-5 mb-5 flex items-center gap-4" style={{ background: 'rgba(197,160,89,0.08)', border: '2px solid rgba(197,160,89,0.3)' }}>
          <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/20 flex items-center justify-center shrink-0 text-2xl">🏆</div>
          <div>
            <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-1">أكثر خدمة إقبالاً</p>
            <p className="text-brand-gold-500 font-black text-lg">{topService[0]}</p>
            <p className="text-white/40 text-xs">{topService[1]} طلب ({Math.round(topService[1] / total * 100)}% من الإجمالي)</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.1)' }}>
        <h3 className="text-white font-black text-sm mb-4">توزيع الطلبات حسب الخدمة</h3>
        {sorted.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-4">لا توجد بيانات</p>
        ) : (
          sorted.map(([svc, cnt]) => (
            <div key={svc} className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/70 font-bold">{svc}</span>
                <span className="text-white/40">{cnt} طلب ({Math.round(cnt / total * 100)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(cnt / total) * 100}%` }} transition={{ duration: 0.7 }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#c5a059,#e8c97a)' }} />
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
