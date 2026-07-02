import { motion, AnimatePresence } from "motion/react";
import { X, Lock, User, Phone, Mail } from "lucide-react";

interface Props {
  show: boolean;
  mode: "login" | "register";
  form: Record<string, string>;
  error: string;
  loading: boolean;
  lang: string;
  onClose: () => void;
  onModeChange: (m: "login" | "register") => void;
  onFormChange: (k: string, v: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  onForgotPassword: () => void;
  logoImg: string;
}

export function AuthModal({ show, mode, form, error, loading, lang, onClose, onModeChange, onFormChange, onLogin, onRegister, onForgotPassword, logoImg }: Props) {
  if (!show) return null;
  return (
    <AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(2,15,14,0.92)", backdropFilter: "blur(20px)" }}
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); }} dir={lang === "ar" ? "rtl" : "ltr"}
            className="w-full max-w-md rounded-[2.5rem] overflow-hidden border border-brand-gold-500/20 shadow-2xl"
            style={{ background: "#042f2e" }}>
            {/* Header */}
            <div className="px-8 pt-8 pb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden"><img src={logoImg} alt="ثرا نوفا" className="w-full h-full object-contain" /></div>
                <div>
                  <h2 className="text-xl font-black text-white">{mode === "login" ? (lang === "ar" ? "تسجيل الدخول" : "Sign In") : (lang === "ar" ? "إنشاء حساب" : "Create Account")}</h2>
                  <p className="text-xs text-brand-gold-500/70 font-bold">{lang === "ar" ? "ثرا نوفا — منصة الخدمات" : "Thara Nufa — Services Platform"}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">✕</button>
            </div>
            {/* Tabs */}
            <div className="flex mx-8 mb-5 p-1 rounded-2xl gap-1" style={{ background: "rgba(255,255,255,0.05)" }}>
              {(["login","register"] as const).map(t => (
                <button key={t} onClick={() => { onModeChange(t); }}
                  className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${mode===t ? "text-brand-green-900" : "text-white/50"}`}
                  style={{ background: mode===t ? "#c5a059" : "transparent" }}>
                  {t==="login" ? (lang==="ar" ? "دخول" : "Login") : (lang==="ar" ? "تسجيل" : "Register")}
                </button>
              ))}
            </div>
            {/* Form */}
            <div className="px-8 pb-8 space-y-3">
              {mode==="register" && (
                <div className="relative">
                  <User size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={form.name || ""} onChange={e => { onFormChange("name", e.target.value); }}
                    placeholder={lang==="ar"?"الاسم الكامل":"Full Name"}
                    className="w-full rounded-2xl pr-10 pl-5 py-3.5 text-white text-sm outline-none placeholder:text-white/25"
                    style={{background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(197,160,89,0.25)"}} />
                </div>
              )}
              <div className="relative">
                <Mail size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={form.email || ""} onChange={e => { onFormChange("email", e.target.value); }} type="email" dir="ltr"
                  placeholder="email@example.com"
                  className="w-full rounded-2xl pr-10 pl-5 py-3.5 text-white text-sm outline-none placeholder:text-white/25"
                  style={{background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(197,160,89,0.25)"}} />
              </div>
              {mode==="register" && (
                <div className="relative">
                  <Phone size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={form.phone || ""} onChange={e => { onFormChange("phone", e.target.value); }}
                    placeholder={lang==="ar"?"رقم الجوال (اختياري)":"Phone (optional)"} dir="ltr"
                    className="w-full rounded-2xl pr-10 pl-5 py-3.5 text-white text-sm outline-none placeholder:text-white/25"
                    style={{background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(197,160,89,0.25)"}} />
                </div>
              )}
              <div className="relative">
                <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={form.password || ""} onChange={e => { onFormChange("password", e.target.value); }} type="password"
                  placeholder={lang==="ar"?"كلمة المرور":"Password"}
                  onKeyDown={(e) => { if (e.key === 'Enter') { if (mode === 'login') { onLogin(); } else { onRegister(); } } }}
                  className="w-full rounded-2xl pr-10 pl-5 py-3.5 text-white text-sm outline-none placeholder:text-white/25"
                  style={{background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(197,160,89,0.25)"}} />
              </div>
              {error && <p className="text-red-400 text-xs font-bold px-1">⚠ {error}</p>}
              <button onClick={mode==="login"?onLogin:onRegister} disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all mt-1"
                style={{background:"#c5a059",color:"#042f2e"}}>
                {loading ? <span className="w-5 h-5 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full animate-spin"/> : (mode==="login" ? (lang==="ar"?"← دخول":"Sign In →") : (lang==="ar"?"← إنشاء الحساب":"Create Account →"))}
              </button>
              {mode==="login" && (
                <div className="space-y-2 pt-1">
                  <div className="text-center">
                    <button onClick={() => { onForgotPassword(); }} className="text-xs text-brand-gold-500/60 hover:text-brand-gold-500 transition-colors font-bold underline underline-offset-2">
                      {lang==="ar"?"نسيت كلمة المرور؟":"Forgot password?"}
                    </button>
                  </div>
                  <p className="text-center text-xs text-white/30 font-bold">
                    {lang==="ar"?"ليس لديك حساب؟ ":"No account? "}
                    <button onClick={() => { onModeChange("register"); }} className="text-brand-gold-500 hover:text-brand-gold-300 transition-colors">
                      {lang==="ar"?"أنشئ حساباً":"Register"}
                    </button>
                  </p>
                </div>
              )}
              {mode==="register" && (
                <p className="text-center text-xs text-white/30 font-bold">
                  {lang==="ar"?"لديك حساب؟ ":"Have an account? "}
                  <button onClick={() => { onModeChange("login"); }} className="text-brand-gold-500 hover:text-brand-gold-300 transition-colors">
                    {lang==="ar"?"سجل الدخول":"Sign in"}
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
    </AnimatePresence>
  );
}
