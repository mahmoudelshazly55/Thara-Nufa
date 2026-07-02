import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import type { Localized } from '../../types';

type Lang = 'ar' | 'en';
const t = (obj: Localized): string => typeof obj === 'string' ? obj : obj.ar;

export const AboutSection = ({ lang }: { lang: Lang }) => (
  <section id="about" className="py-20 md:py-32 relative">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="text-brand-gold-500 text-xs font-black tracking-[0.3em] uppercase mb-4">{lang === 'ar' ? 'من نحن' : 'About Us'}</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            {lang === 'ar' ? 'ثرا نوفا\nمجموعة متكاملة' : 'Thara Nufa\nIntegrated Group'}
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-6">
            {lang === 'ar'
              ? 'تأسست مجموعة ثرا نوفا لتكون الشريك الاستراتيجي الأمثل في مجال المقاولات والتشطيبات وتنظيم الفعاليات في المملكة العربية السعودية.'
              : 'Thara Nufa Group was established to be the ideal strategic partner in contracting, finishing, and event management in Saudi Arabia.'}
          </p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { num: '+500', label: lang === 'ar' ? 'مشروع منجز' : 'Completed Projects' },
              { num: '+15', label: lang === 'ar' ? 'سنة خبرة' : 'Years Experience' },
              { num: '+200', label: lang === 'ar' ? 'عميل راضٍ' : 'Happy Clients' },
              { num: '98%', label: lang === 'ar' ? 'رضا العملاء' : 'Client Satisfaction' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-brand-gold-500/20 bg-brand-gold-500/5">
                <div className="text-3xl font-black text-brand-gold-500 mb-1">{s.num}</div>
                <div className="text-white/50 text-xs font-bold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800"
              alt="About" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-green-950/60 to-transparent" />
          </div>
          <div className="absolute -bottom-6 -start-6 bg-brand-gold-500 text-brand-green-900 p-6 rounded-2xl shadow-2xl">
            <div className="text-3xl font-black">#1</div>
            <div className="text-xs font-black uppercase tracking-widest">{lang === 'ar' ? 'في المملكة' : 'In KSA'}</div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

