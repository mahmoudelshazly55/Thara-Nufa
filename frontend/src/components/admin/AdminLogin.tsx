import { useState } from 'react';
import { motion } from 'motion/react';
import logoImg from '../../assets/logo.png';
import type { AdminUser, Page } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Props {
  onLogin: (token: string, admin: AdminUser) => void;
  setCurrentPage: (p: Page) => void;
}

export function AdminLogin({ onLogin, setCurrentPage: _setCurrentPage }: Props) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
      });
      const contentType = r.headers.get('content-type') ?? '';
      if (!contentType.includes('application/json')) {
        throw new Error('تعذّر الاتصال بالخادم — يرجى التحقق من الاتصال بالإنترنت');
      }
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || 'بيانات غير صحيحة');
      onLogin(d.token, d.admin);
    } catch (err: unknown) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('تعذّر الاتصال بالخادم — يرجى التحقق من الاتصال بالإنترنت');
      } else {
        setError(err instanceof Error ? err.message : 'بيانات غير صحيحة');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-main, #020e0d)' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,160,89,0.2)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4">
              <img src={logoImg} alt="ثرا نوفا" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-white font-black text-2xl">لوحة التحكم</h1>
            <p className="text-white/40 text-sm mt-1">ثرا نوفا — للإدارة فقط</p>
          </div>
          <form onSubmit={(e) => { void submit(e); }} className="space-y-4" dir="rtl">
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1.5">البريد الإلكتروني</label>
              <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); }} placeholder="admin@tharanufa.sa"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)' }} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1.5">كلمة المرور</label>
              <input type="password" required value={pw} onChange={(e) => { setPw(e.target.value); }} placeholder="••••••••"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)' }} />
            </div>
            {error && (
              <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-red-400 text-sm font-bold">{error}</p>
                {error.includes('الاتصال') && (
                  <p className="text-white/30 text-[10px] mt-1.5 leading-relaxed">
                    تأكد أن المشروع يعمل عبر Docker Compose
                  </p>
                )}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              style={{ background: '#c5a059', color: '#042f2e' }}>
              {loading
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full" />
                : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
