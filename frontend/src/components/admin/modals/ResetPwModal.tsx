import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Key } from 'lucide-react';
import { type SiteUser } from '../shared/adminTypes';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Props {
  user: SiteUser;
  token: string;
  onClose: () => void;
}

export function ResetPwModal({ user, token, onClose }: Props) {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (pw.length < 6) { setMsg('كلمة المرور 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/users/admin-reset-password/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: pw }),
      });
      const d = await r.json();
      if (d.success) { setMsg('تم التغيير بنجاح ✅'); setTimeout(onClose, 1800); }
      else setMsg(d.message || 'فشل');
    } catch { setMsg('خطأ في الاتصال'); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); } }}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        className="w-full max-w-sm rounded-3xl p-6" dir="rtl"
        style={{ background: '#042f2e', border: '1px solid rgba(197,160,89,0.25)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-black">إعادة تعيين كلمة المرور</h3>
            <p className="text-brand-gold-500/70 text-xs mt-0.5">{user.name}</p>
          </div>
          <button onClick={onClose}><X size={18} className="text-white/40" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-bold block mb-1.5">كلمة المرور الجديدة</label>
            <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); }} placeholder="••••••••" minLength={6}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(197,160,89,0.25)' }} />
          </div>
          {msg && <p className={`text-sm text-center ${msg.includes('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{msg}</p>}
          <button onClick={() => { void submit(); }} disabled={loading || pw.length < 6}
            className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-all"
            style={{ background: '#c5a059', color: '#042f2e' }}>
            {loading
              ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full" />
              : <><Key size={14} /><span>تغيير</span></>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
