import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, MessageCircle, Key } from 'lucide-react';
import { type SiteUser, type Booking, STATUS_LABELS } from '../shared/adminTypes';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Props {
  user: SiteUser;
  token: string;
  onClose: () => void;
  onResetPw: (u: SiteUser) => void;
}

export function UserDetailModal({ user, token, onClose, onResetPw }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const hdrs = useCallback(() => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }), [token]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const r = await fetch(`${API_URL}/admin/users/${user.id}/bookings`, { headers: hdrs() });
        const d = await r.json();
        if (d.success) setBookings(d.data || []);
      } catch {}
      setLoading(false);
    };
    void fetchUserBookings();
  }, [user.id, hdrs]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(2,15,14,0.88)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        onClick={(e) => { e.stopPropagation(); }}
        className="w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: '#042f2e', border: '1px solid rgba(197,160,89,0.2)' }} dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gold-500/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg"
              style={{ background: 'rgba(197,160,89,0.15)', color: '#c5a059' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-white font-black text-sm">{user.name}</h3>
              <p className="text-brand-gold-500/60 text-xs font-mono">{user.id.slice(0,8).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.phone && (
              <a href={`https://wa.me/${user.phone.replace(/[^0-9]/g,'').replace(/^0/,'966')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black"
                style={{ background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)', color: '#25d366' }}>
                <MessageCircle size={12} /> واتساب
              </a>
            )}
            <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white"><X size={18} /></button>
          </div>
        </div>
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Info */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(197,160,89,0.12)' }}>
            {[
              { label: 'الاسم الكامل',       value: user.name,          icon: '👤' },
              { label: 'البريد الإلكتروني',   value: user.email,         icon: '✉️' },
              { label: 'رقم الهاتف',          value: user.phone || '—',  icon: '📞' },
              { label: 'العنوان',             value: user.address || '—', icon: '📍' },
              { label: 'تاريخ التسجيل',       value: new Date(user.createdAt).toLocaleDateString('ar-SA'), icon: '📅' },
              { label: 'عدد الطلبات',         value: `${user._count.bookings} طلب`, icon: '📋' },
            ].map((item, i, arr) => (
              <div key={item.label}
                className={`flex items-center justify-between px-4 py-3 ${i < arr.length-1 ? 'border-b border-white/5' : ''}`}
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <span className="text-white font-bold text-sm">{item.value}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-xs">{item.label}</span>
                  <span className="text-sm">{item.icon}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Password reset row */}
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <button onClick={() => { onClose(); onResetPw(user); }}
              className="flex items-center gap-2 text-red-400 text-sm font-black hover:text-red-300 transition-colors">
              <Key size={14} /> إعادة تعيين كلمة المرور
            </button>
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />)}
            </div>
          </div>
          {/* Recent bookings */}
          <div>
            <p className="text-white/40 text-xs font-bold mb-2">آخر الطلبات</p>
            {loading
              ? <div className="text-white/20 text-xs text-center py-4">جاري التحميل...</div>
              : bookings.length === 0
                ? <div className="text-white/20 text-xs text-center py-4">لا توجد طلبات</div>
                : <div className="space-y-2">
                    {bookings.slice(0,5).map(b => (
                      <div key={b.id} className="rounded-xl px-3 py-2.5 flex items-center justify-between"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <p className="text-white text-xs font-bold">{b.serviceType}</p>
                          <p className="text-white/30 text-[10px]">{b.date}</p>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(197,160,89,0.15)', color: '#c5a059' }}>
                          {STATUS_LABELS[b.status] || b.status}
                        </span>
                      </div>
                    ))}
                  </div>
            }
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
