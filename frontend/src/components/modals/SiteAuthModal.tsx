import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from '../../assets/logo.png';
import type { SiteUser } from '../../types';
import type { FormData } from '../../hooks/useBooking';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Service names in both languages
const SERVICE_NAMES: ReadonlyMap<string, { ar: string; en: string }> = new Map([
  ['transport',    { ar: 'نقل وشحن',         en: 'Shipping & Transport' }],
  ['tourism',      { ar: 'سياحة وفنادق',      en: 'Tourism & Hotels' }],
  ['construction', { ar: 'مقاولات',           en: 'Construction' }],
  ['events',       { ar: 'تنظيم الفعاليات',   en: 'Events Management' }],
  ['recruitment',  { ar: 'استقدام عمالة',     en: 'Recruitment' }],
  ['training',     { ar: 'تدريب وتطوير',      en: 'Training & Development' }],
]);

interface Props {
  show: boolean; lang: string;
  onClose: () => void;
  onForgotPassword: (email: string) => void;
  onLoginSuccess: (token: string, user: SiteUser) => void;
  pendingBookingService: string;
  setPendingBookingService: (s: string) => void;
  setFormData: (fn: (p: FormData) => FormData) => void;
  setIsBookingModalOpen: (v: boolean) => void;
  setSelectedService: (s: string) => void;
  setIsMenuOpen: (v: boolean) => void;
  setNotifUnread: (n: number) => void;
}

export function SiteAuthModal({
  show, lang, onClose, onForgotPassword, onLoginSuccess,
  pendingBookingService, setPendingBookingService,
  setFormData, setIsBookingModalOpen, setSelectedService,
  setIsMenuOpen, setNotifUnread,
}: Props) {
  const [authMode,    setAuthMode]    = useState<'login' | 'register'>('login');
  const [authForm,    setAuthForm]    = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', address: '' });
  const [authError,   setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const T = (ar: string, en: string) => lang === 'ar' ? ar : en;
  const handleClose = () => { setAuthError(''); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    try {
      if (authMode === 'register') {
        if (authForm.password !== authForm.confirmPassword) { setAuthError(T('كلمات المرور غير متطابقة', 'Passwords do not match')); return; }
        if (authForm.password.length < 6) { setAuthError(T('كلمة المرور 6 أحرف على الأقل', 'Password must be at least 6 characters')); return; }
        const ph = authForm.phone.replace(/\D/g, '');
        if (ph.length < 9) { setAuthError(T('رقم هاتف غير صحيح', 'Invalid phone number')); return; }
      }
      const fullName = authMode === 'register' ? `${authForm.firstName.trim()} ${authForm.lastName.trim()}`.trim() : '';
      const body = authMode === 'login'
        ? { email: authForm.email, password: authForm.password }
        : { name: fullName || authForm.firstName, email: authForm.email, password: authForm.password, phone: authForm.phone, address: authForm.address };

      const r = await fetch(`${API_URL}/users/${authMode === 'login' ? 'login' : 'register'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || T('حدث خطأ', 'An error occurred'));

      localStorage.setItem('site_token', d.token);
      localStorage.setItem('site_user', JSON.stringify(d.user));
      onLoginSuccess(d.token, d.user);

      try {
        const nr = await fetch(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${d.token}` } });
        const nd = await nr.json();
        if (nd.success) setNotifUnread(nd.unreadCount || 0);
      } catch {}

      handleClose();
      setIsMenuOpen(false);
      setFormData((p: FormData) => ({ ...p, name: d.user.name, email: d.user.email, phone: d.user.phone || p.phone }));

      if (pendingBookingService) {
        const svcInfo = SERVICE_NAMES.get(pendingBookingService);
        setSelectedService(svcInfo ? (lang === 'ar' ? svcInfo.ar : svcInfo.en) : pendingBookingService);
        setPendingBookingService('');
        setIsBookingModalOpen(true);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthLoading(false);
    }
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const iStyle = { background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(197,160,89,0.25)' };
  const iClass = "w-full rounded-2xl px-5 py-3.5 text-white text-sm font-bold outline-none placeholder:text-white/25";

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(2,15,14,0.88)', backdropFilter: 'blur(20px)' }}
          onClick={handleClose}>
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); }}
            className="w-full max-w-md rounded-[2.5rem] overflow-hidden border border-brand-gold-500/20 shadow-2xl max-h-[95vh] overflow-y-auto no-scrollbar"
            style={{ background: '#042f2e' }} dir={dir}>
            <div className="px-8 pt-8 pb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden">
                    <img src={logoImg} alt="Thara Nova" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {authMode === 'login' ? T('تسجيل الدخول', 'Sign In') : T('إنشاء حساب', 'Create Account')}
                    </h2>
                    <p className="text-xs text-brand-gold-500/70 font-bold">
                      {authMode === 'login' ? T('مرحباً بعودتك', 'Welcome back') : T('انضم إلى عملاء ثرا نوفا', 'Join Thara Nova clients')}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">✕</button>
              </div>
            </div>

            <div className="px-8 mb-5">
              <div className="flex rounded-2xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {(['login', 'register'] as const).map(m => (
                  <button key={m} onClick={() => { setAuthMode(m); setAuthError(''); }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
                    style={{ background: authMode === m ? '#c5a059' : 'transparent', color: authMode === m ? '#042f2e' : 'rgba(255,255,255,0.5)' }}>
                    {m === 'login' ? T('تسجيل الدخول', 'Sign In') : T('حساب جديد', 'New Account')}
                  </button>
                ))}
              </div>
            </div>

            <form className="px-8 pb-8 space-y-4" onSubmit={(e) => { void handleSubmit(e); }}>
              {authMode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{T('الاسم الأول *', 'First Name *')}</label>
                    <input required value={authForm.firstName} onChange={(e) => { setAuthForm(p => ({ ...p, firstName: e.target.value })); }}
                      placeholder={T('محمد', 'John')} className={`${iClass} px-4 py-3.5`} style={iStyle} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{T('اسم العائلة *', 'Last Name *')}</label>
                    <input required value={authForm.lastName} onChange={(e) => { setAuthForm(p => ({ ...p, lastName: e.target.value })); }}
                      placeholder={T('العبدالله', 'Smith')} className={`${iClass} px-4 py-3.5`} style={iStyle} />
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{T('البريد الإلكتروني *', 'Email *')}</label>
                <input required type="email" value={authForm.email} onChange={(e) => { setAuthForm(p => ({ ...p, email: e.target.value })); }}
                  placeholder="example@company.com" className={iClass} style={iStyle} />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{T('كلمة المرور *', 'Password *')}</label>
                <input required type="password" value={authForm.password} onChange={(e) => { setAuthForm(p => ({ ...p, password: e.target.value })); }}
                  placeholder="••••••••" minLength={6} className={iClass} style={iStyle} />
              </div>
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{T('تأكيد كلمة المرور *', 'Confirm Password *')}</label>
                    <input required type="password" value={authForm.confirmPassword} onChange={(e) => { setAuthForm(p => ({ ...p, confirmPassword: e.target.value })); }}
                      placeholder="••••••••" className={iClass} style={iStyle} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{T('رقم الهاتف *', 'Phone Number *')}</label>
                    <input required type="tel" value={authForm.phone}
                      onChange={(e) => { setAuthForm(p => ({ ...p, phone: e.target.value.replace(/[^0-9+]/g, '').slice(0, 11) })); }}
                      placeholder={T('05xxxxxxxx', '+1234567890')} maxLength={11} className={iClass} style={iStyle} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{T('العنوان *', 'Address *')}</label>
                    <input required value={authForm.address} onChange={(e) => { setAuthForm(p => ({ ...p, address: e.target.value })); }}
                      placeholder={T('المدينة، الحي، الشارع', 'City, District, Street')} className={iClass} style={iStyle} />
                  </div>
                </>
              )}
              {authError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  ⚠ {authError}
                </div>
              )}
              <button type="submit" disabled={authLoading}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                style={{ background: '#c5a059', color: '#042f2e' }}>
                {authLoading
                  ? <span className="w-5 h-5 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full animate-spin" />
                  : (authMode === 'login' ? T('← تسجيل الدخول', 'Sign In →') : T('← إنشاء الحساب', 'Create Account →'))}
              </button>
              {authMode === 'login' && (
                <div className="space-y-2">
                  <div className="text-center">
                    <button type="button" onClick={() => { handleClose(); onForgotPassword(authForm.email); }}
                      className="text-xs text-brand-gold-500/60 hover:text-brand-gold-500 transition-colors font-bold underline underline-offset-2">
                      {T('نسيت كلمة المرور؟', 'Forgot password?')}
                    </button>
                  </div>
                  <p className="text-center text-xs text-white/30 font-bold">
                    {T('ليس لديك حساب؟', "Don't have an account?")}{' '}
                    <button type="button" onClick={() => { setAuthMode('register'); }} className="text-brand-gold-500 hover:text-brand-gold-300 transition-colors">
                      {T('أنشئ حساباً الآن', 'Create one now')}
                    </button>
                  </p>
                </div>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
