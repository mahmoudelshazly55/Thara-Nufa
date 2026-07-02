import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../../constants';

type Lang = 'ar' | 'en';

export const FAQSection = ({ lang }: { lang: Lang }) => {
  const [open, setOpen] = useState<number | null>(null);
  const t = (item: { ar: { q: string; a: string }; en: { q: string; a: string } }) =>
    lang === 'ar' ? item.ar : item.en;
  return (
    <section id="faq" className="py-20 md:py-32 relative bg-brand-green-950/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-brand-gold-500 text-xs font-black tracking-[0.3em] uppercase mb-4">
            {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
            {lang === 'ar' ? 'كل ما تريد معرفته' : 'Everything You Need to Know'}
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i: number) => {
            const { q, a } = t(item);
            const isOpen = open === i;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border transition-all overflow-hidden ${isOpen ? 'border-brand-gold-500/40 bg-brand-gold-500/8' : 'border-white/10 bg-white/3 hover:border-white/20'}`}>
                <button onClick={() => { setOpen(isOpen ? null : i); }}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-start gap-4">
                  <span className={`font-bold text-sm md:text-base leading-snug transition-colors ${isOpen ? 'text-brand-gold-500' : 'text-white/85'}`}>{q}</span>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-brand-gold-500/20 text-brand-gold-500' : 'bg-white/8 text-white/40'}`}>
                    <ChevronDown size={14} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden">
                      <p className="px-5 md:px-6 pb-5 md:pb-6 text-white/60 text-sm leading-relaxed border-t border-white/10 pt-4">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

