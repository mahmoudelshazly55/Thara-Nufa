import { motion } from "motion/react";

export function NotFound({ onHome, lang = 'ar' }: { onHome: () => void; lang?: string }) {
  const T = (ar: string, en: string) => lang === 'ar' ? ar : en;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{ background: "#020e0d" }}>
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-8xl mb-6">🔍</motion.div>
      <h1 className="text-6xl font-black mb-4" style={{ color: "#c5a059" }}>404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">{T('الصفحة غير موجودة', 'Page Not Found')}</h2>
      <p className="text-slate-400 mb-8 max-w-sm">
        {T('الرابط الذي تبحث عنه غير موجود أو تم نقله.', 'The link you are looking for does not exist or has been moved.')}
      </p>
      <button
        onClick={onHome}
        className="px-8 py-3 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95"
        style={{ background: "#c5a059", color: "#020e0d" }}>
        {T('العودة للرئيسية', 'Back to Home')}
      </button>
    </motion.div>
  );
}
