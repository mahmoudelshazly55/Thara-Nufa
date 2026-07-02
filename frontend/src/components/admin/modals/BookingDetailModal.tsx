import { motion } from 'motion/react';
import { X, MessageCircle, Phone, Star } from 'lucide-react';
import { type Booking, arabicService, fmtDateTime } from '../shared/adminTypes';
import { StatusChanger } from '../shared/StatusChanger';

interface Props {
  booking: Booking;
  token: string;
  onClose: () => void;
  onUpdated: (b: Booking) => void;
}

export function BookingDetailModal({ booking, token, onClose, onUpdated }: Props) {
  const shortId = booking.id.slice(0, 8).toUpperCase();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); } }}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
        style={{ background: '#042f2e', border: '1px solid rgba(197,160,89,0.2)' }} dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gold-500/10">
          <div>
            <h3 className="text-white font-black text-base">تفاصيل الطلب</h3>
            <p className="text-brand-gold-500 text-xs font-black mt-0.5">#{shortId}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`https://wa.me/${booking.phone.replace(/[^0-9]/g,'').replace(/^0/,'966')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
              style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}>
              <MessageCircle size={13} /> واتساب
            </a>
            <a href={`tel:${booking.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
              <Phone size={13} /> اتصال
            </a>
            <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* Status changer */}
          <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-white/60 text-sm font-bold">حالة الطلب</span>
            <StatusChanger booking={booking} token={token} onUpdated={onUpdated} />
          </div>
          {/* Client info */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">بيانات العميل</p>
            {[
              { label: 'الاسم',    value: booking.name },
              { label: 'البريد',   value: booking.email },
              { label: 'الهاتف',   value: booking.phone },
              { label: 'العنوان',  value: booking.address || '—' },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between py-2 ${i < 3 ? 'border-b border-white/5' : ''}`}>
                <span className="text-white/40 text-sm">{item.label}</span>
                <span className="text-white font-bold text-sm">{item.value}</span>
              </div>
            ))}
          </div>
          {/* Service info */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">بيانات الخدمة</p>
            {[
              { label: 'الخدمة',         value: arabicService(booking.serviceType) },
              { label: 'التاريخ المطلوب', value: booking.date },
              { label: 'تاريخ الطلب',    value: fmtDateTime(booking.createdAt) },
            ].map((item, i) => (
              <div key={i} className={`flex justify-between py-2 ${i < 2 ? 'border-b border-white/5' : ''}`}>
                <span className="text-white/40 text-sm">{item.label}</span>
                <span className="text-white font-bold text-sm text-left">{item.value}</span>
              </div>
            ))}
            {booking.notes && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-white/40 text-xs font-bold block mb-1">ملاحظات</span>
                <p className="text-white/70 text-sm leading-relaxed">{booking.notes}</p>
              </div>
            )}
          </div>
          {/* Review if exists */}
          {booking.review && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(197,160,89,0.06)', border: '1px solid rgba(197,160,89,0.15)' }}>
              <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-2">تقييم العميل</p>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} strokeWidth={1.5} fill={s <= (booking.review?.rating ?? 0) ? '#c5a059' : 'transparent'} stroke={s <= (booking.review?.rating ?? 0) ? '#c5a059' : 'rgba(255,255,255,0.2)'} />)}
              </div>
              {booking.review.comment && <p className="text-white/60 text-sm">{booking.review.comment}</p>}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
