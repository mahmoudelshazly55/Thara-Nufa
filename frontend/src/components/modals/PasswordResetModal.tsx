import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Props {
  show: boolean; lang: string; onClose: () => void; onBackToLogin: () => void;
}

export function PasswordResetModal({ show, lang, onClose, onBackToLogin }: Props) {
  const [resetStep,    setResetStep]    = useState<'email' | 'otp' | 'pass'>('email');
  const [resetEmail,   setResetEmail]   = useState('');
  const [resetOtp,     setResetOtp]     = useState('');
  const [resetPass,    setResetPass]    = useState('');
  const [resetMsg,     setResetMsg]     = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const T = (ar: string, en: string) => lang === 'ar' ? ar : en;

  const handleClose = () => {
    setResetStep('email'); setResetEmail(''); setResetOtp('');
    setResetPass(''); setResetMsg('');
    onClose();
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) { setResetMsg(T('⚠ الرجاء إدخال البريد الإلكتروني', '⚠ Please enter your email')); return; }
    setResetLoading(true); setResetMsg('');
    try {
      const res = await fetch(`${API_URL}/password-reset/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
      });
      const d = await res.json();
      setResetStep('otp');
      setResetMsg(d.success
        ? T('✅ تم إرسال رمز التحقق على بريدك — تحقق من البريد الوارد والسبام', '✅ Verification code sent — check your inbox and spam folder')
        : T('✅ إذا كان البريد مسجلاً ستصل رسالة خلال دقيقة', '✅ If this email is registered, you will receive a message shortly'));
    } catch {
      setResetMsg(T('❌ تعذّر الاتصال بالخادم، تحقق من اتصالك وحاول مجدداً', '❌ Connection failed, please check your internet and try again'));
    } finally { setResetLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!resetOtp.trim() || resetOtp.trim().length !== 6) { setResetMsg(T('⚠ الرجاء إدخال الرمز المكوّن من 6 أرقام', '⚠ Please enter the 6-digit code')); return; }
    if (resetPass.length < 8) { setResetMsg(T('⚠ كلمة المرور الجديدة 8 أحرف على الأقل', '⚠ New password must be at least 8 characters')); return; }
    setResetLoading(true); setResetMsg('');
    try {
      const res = await fetch(`${API_URL}/password-reset/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase(), otp: resetOtp.trim(), newPassword: resetPass }),
      });
      const d = await res.json();
      if (d.success) {
        setResetMsg(T('✅ تم تغيير كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن', '✅ Password changed successfully! You can now sign in'));
        setTimeout(() => { handleClose(); onBackToLogin(); }, 2000);
      } else {
        const msg = d.message || '';
        if (msg.includes('منتهي') || msg.includes('expired'))
          setResetMsg(T('❌ انتهت صلاحية الرمز (10 دقائق) — اطلب رمزاً جديداً', '❌ Code expired (10 minutes) — request a new one'));
        else if (msg.includes('غير صحيح') || msg.includes('incorrect'))
          setResetMsg(T('❌ الرمز غير صحيح — تأكد من الأرقام وحاول مجدداً', '❌ Incorrect code — please check the digits and try again'));
        else
          setResetMsg(`❌ ${msg || T('حدث خطأ غير متوقع', 'An unexpected error occurred')}`);
      }
    } catch {
      setResetMsg(T('❌ تعذّر الاتصال بالخادم، حاول مجدداً', '❌ Connection failed, please try again'));
    } finally { setResetLoading(false); }
  };

  const STEPS = ['email', 'otp', 'pass'] as const;
  const STEP_LABELS = [T('البريد', 'Email'), T('الرمز', 'Code'), T('كلمة المرور', 'Password')];
  const stepIdx = STEPS.indexOf(resetStep);

  const iStyle = { background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(197,160,89,0.25)' };
  const iClass = "w-full rounded-2xl px-4 py-3.5 text-sm font-bold outline-none text-white placeholder:text-white/25";

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4"
          style={{ background: 'rgba(2,15,14,0.92)', backdropFilter: 'blur(20px)' }}
          onClick={handleClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); }}
            className="w-full max-w-md rounded-[2.5rem] overflow-hidden border border-brand-gold-500/20 shadow-2xl"
            style={{ background: '#042f2e' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="px-8 pt-8 pb-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-white">{T('استعادة كلمة المرور', 'Reset Password')}</h2>
                  <p className="text-xs text-brand-gold-500/70 font-bold mt-0.5">{T('سنرسل لك رمز تحقق على بريدك', "We'll send a verification code to your email")}</p>
                </div>
                <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0">✕</button>
              </div>

              {/* Step indicators */}
              <div className="pb-4">
                <div className="flex items-center gap-2">
                  {STEPS.map((step, i) => (
                    <div key={step} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        resetStep === step ? 'bg-brand-gold-500 text-brand-green-900' :
                        stepIdx > i ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/30'}`}>
                        {stepIdx > i ? '✓' : i + 1}
                      </div>
                      {i < 2 && <div className={`h-px flex-1 transition-all ${stepIdx > i ? 'bg-emerald-500' : 'bg-white/10'}`} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {STEP_LABELS.map((label, i) => (
                    <span key={i} className="text-[9px] font-bold text-white/30">{label}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {resetStep === 'email' && (
                  <>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1.5">{T('البريد الإلكتروني', 'Email Address')}</label>
                      <input type="email" value={resetEmail} onChange={(e) => { setResetEmail(e.target.value); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { void handleForgotPassword(); } }}
                        placeholder="your@email.com" dir="ltr" className={iClass} style={iStyle} />
                    </div>
                    <button onClick={() => { void handleForgotPassword(); }} disabled={resetLoading}
                      className="w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ background: '#c5a059', color: '#042f2e' }}>
                      {resetLoading ? T('⏳ جاري الإرسال...', '⏳ Sending...') : T('إرسال رمز التحقق', 'Send Verification Code')}
                    </button>
                  </>
                )}
                {resetStep === 'otp' && (
                  <>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1.5">{T('رمز التحقق (6 أرقام)', 'Verification Code (6 digits)')}</label>
                      <input type="text" value={resetOtp} onChange={(e) => { setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
                        placeholder="123456" dir="ltr" maxLength={6}
                        className={`${iClass} text-center tracking-[0.5em] placeholder:tracking-normal`} style={iStyle} />
                    </div>
                    <div>
                      <label className="text-xs font-black text-white/40 uppercase tracking-widest block mb-1.5">{T('كلمة المرور الجديدة', 'New Password')}</label>
                      <input type="password" value={resetPass} onChange={(e) => { setResetPass(e.target.value); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { void handleVerifyOtp(); } }}
                        placeholder={T('8 أحرف على الأقل', 'At least 8 characters')}
                        className={iClass} style={iStyle} />
                    </div>
                    <button onClick={() => { void handleVerifyOtp(); }} disabled={resetLoading}
                      className="w-full py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ background: '#c5a059', color: '#042f2e' }}>
                      {resetLoading ? T('⏳ جاري التحقق...', '⏳ Verifying...') : T('تأكيد وتغيير كلمة المرور', 'Confirm & Change Password')}
                    </button>
                    <button onClick={() => { setResetStep('email'); setResetMsg(''); }}
                      className="w-full text-white/40 text-xs font-bold hover:text-white/70 transition-colors">
                      {lang === 'ar' ? '← إعادة إرسال الرمز' : 'Resend Code →'}
                    </button>
                  </>
                )}
                {resetMsg && (
                  <p className={`text-sm font-bold text-center ${resetMsg.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {resetMsg}
                  </p>
                )}
                <button onClick={() => { handleClose(); onBackToLogin(); }}
                  className="w-full text-white/40 text-xs font-bold hover:text-white/70 transition-colors pb-2">
                  {T('العودة لتسجيل الدخول', 'Back to Sign In')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
