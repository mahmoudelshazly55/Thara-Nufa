import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, CheckCircle } from 'lucide-react';
import { type SiteUser } from '../shared/adminTypes';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Props {
  token: string;
  users: SiteUser[];
  onClose: () => void;
}

export function BroadcastModal({ token, users, onClose }: Props) {
  const [targetMode, setTargetMode] = useState<'all' | 'multi' | 'one'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const targets = targetMode === 'all'
        ? [{ title, message }]
        : selectedUserIds.map(uid => ({ title, message, userId: uid }));
      let total = 0;
      for (const body of targets) {
        const r = await fetch(`${API_URL}/notifications/broadcast`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const d = await r.json();
        if (d.success) total += d.count || 1;
      }
      setDone(total);
    } catch {} finally { setLoading(false); }
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); } }}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        className="w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar" dir="rtl"
        style={{ background: '#042f2e', border: '1px solid rgba(197,160,89,0.25)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-lg">إرسال إشعار</h3>
          <button onClick={onClose}><X size={20} className="text-white/40" /></button>
        </div>
        {done !== null ? (
          <div className="text-center py-6">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-black text-lg">تم الإرسال بنجاح</p>
            <p className="text-white/40 text-sm mt-1">أُرسل إلى {done} مستخدم</p>
            <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-2xl font-black text-sm" style={{ background: '#c5a059', color: '#042f2e' }}>إغلاق</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-white/50 text-xs font-bold mb-2">المستلمون</p>
              <div className="flex gap-2">
                {[{ v: 'all' as const, l: 'الجميع' }, { v: 'multi' as const, l: 'عدة مستخدمين' }, { v: 'one' as const, l: 'مستخدم واحد' }].map(opt => (
                  <button key={opt.v} onClick={() => { setTargetMode(opt.v); }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: targetMode === opt.v ? '#c5a059' : 'rgba(255,255,255,0.05)', color: targetMode === opt.v ? '#042f2e' : 'rgba(255,255,255,0.5)' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            {(targetMode === 'one' || targetMode === 'multi') && (
              <div className="max-h-40 overflow-y-auto rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,160,89,0.15)' }}>
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
                    <input type={targetMode === 'multi' ? 'checkbox' : 'radio'} name="user-select"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={() => { if (targetMode === 'multi') { toggleUser(u.id); } else { setSelectedUserIds([u.id]); } }}
                      className="accent-brand-gold-500" />
                    <div className="min-w-0">
                      <p className="text-white font-bold text-xs">{u.name}</p>
                      <p className="text-white/40 text-[10px] truncate">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div>
              <p className="text-white/50 text-xs font-bold mb-1.5">العنوان</p>
              <input value={title} onChange={(e) => { setTitle(e.target.value); }} placeholder="عنوان الإشعار"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)' }} />
            </div>
            <div>
              <p className="text-white/50 text-xs font-bold mb-1.5">الرسالة</p>
              <textarea rows={3} value={message} onChange={(e) => { setMessage(e.target.value); }} placeholder="نص الإشعار..."
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)' }} />
            </div>
            <button onClick={() => { void send(); }}
              disabled={loading || !title.trim() || !message.trim() || ((targetMode !== 'all') && selectedUserIds.length === 0)}
              className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-all"
              style={{ background: '#c5a059', color: '#042f2e' }}>
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full" />
                : <><Send size={15} /><span>إرسال</span></>}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
