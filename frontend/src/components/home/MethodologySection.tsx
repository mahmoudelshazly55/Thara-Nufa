import { motion } from 'motion/react';
import { Clock, PhoneCall, ScanSearch, Hammer, BadgeCheck } from 'lucide-react';
import { BOOKING_STATUS_STAGES } from '../../constants';
import type { SiteUser, Page } from '../../types';

type Lang = 'ar' | 'en';

interface MethodologyProps {
  lang: Lang;
  siteUser: SiteUser | null;
  setCurrentPage: (p: Page) => void;
  setShowAuthModal: (v: boolean) => void;
}

const STAGE_ICONS = [Clock, PhoneCall, ScanSearch, Hammer, BadgeCheck];

const STAGE_COLORS = ['#c5a059', '#3b82f6', '#8b5cf6', '#f97316', '#10b981'] as const;

const STAGE_DESCRIPTIONS: { ar: string; en: string }[] = [
  { ar: 'يصل طلبك لفريقنا فور إرساله',           en: 'Your request reaches our team instantly'     },
  { ar: 'نتواصل معك لمناقشة التفاصيل',            en: 'We contact you to discuss the details'        },
  { ar: 'نراجع ونقيّم احتياجاتك بدقة',            en: 'We carefully review and assess your needs'    },
  { ar: 'ينطلق فريقنا في تنفيذ الخدمة',           en: 'Our team begins executing the service'        },
  { ar: 'تُسلَّم الخدمة بأعلى معايير الجودة',      en: 'Service delivered at the highest quality'     },
];

export function MethodologySection({ lang, siteUser, setCurrentPage, setShowAuthModal }: MethodologyProps) {
  return (
    <section id="methodology" className="py-20 md:py-32 bg-brand-green-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #c5a059 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-brand-gold-500 text-xs font-black tracking-widest uppercase block mb-4">
            {lang === 'ar' ? 'رحلة طلبك' : 'YOUR ORDER JOURNEY'}
          </motion.span>
          <motion.h3
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="text-3xl md:text-5xl font-black tracking-tighter mb-4 text-white">
            {lang === 'ar' ? 'مراحل تنفيذ الطلب' : 'Order Execution Stages'}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="text-white/50 leading-relaxed text-sm md:text-base">
            {lang === 'ar'
              ? 'نتابع كل طلب عبر خمس مراحل واضحة — وتتلقى إشعاراً فورياً عند كل تحديث.'
              : 'Every request goes through 5 clear stages — you receive instant notifications at each update.'}
          </motion.p>
        </div>

        {/* Stages grid */}
        <div className="grid grid-cols-5 gap-1 md:gap-4 relative">

          {/* Connecting line behind cards */}
          <div className="absolute top-8 md:top-10 left-[10%] right-[10%] h-px hidden md:block"
            style={{ background: 'linear-gradient(90deg, #c5a059, #3b82f6, #8b5cf6, #f97316, #10b981)', opacity: 0.2 }} />

          {BOOKING_STATUS_STAGES.map((stage, idx: number) => {
            const Icon = STAGE_ICONS.at(idx) ?? Clock;
            const color = STAGE_COLORS.at(idx) ?? '#c5a059';
            const desc = STAGE_DESCRIPTIONS.at(idx) ?? { ar: '', en: '' };

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                className="flex flex-col items-center text-center px-1 md:px-3 relative group">

                {/* Step number — desktop only */}
                <span className="hidden md:block text-[10px] font-black mb-2 opacity-30 tabular-nums"
                  style={{ color }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Icon circle */}
                <motion.div
                  whileHover={{ scale: 1.1, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 relative z-10 cursor-default"
                  style={{
                    background: `${color}18`,
                    border: `2px solid ${color}50`,
                    boxShadow: `0 0 0 0 ${color}`,
                  }}>
                  {/* Subtle glow on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `radial-gradient(circle, ${color}25 0%, transparent 70%)` }} />
                  <Icon
                    size={20}
                    style={{ color }}
                    strokeWidth={2}
                    className="relative z-10 md:w-6 md:h-6" />
                </motion.div>

                {/* Stage name */}
                <h4 className="text-white font-black text-[9px] md:text-sm leading-tight mb-1">
                  {lang === 'ar' ? stage.ar : stage.en}
                </h4>

                {/* Description — desktop only */}
                <p className="hidden md:block text-[10px] leading-snug opacity-40 text-white">
                  {lang === 'ar' ? desc.ar : desc.en}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          className="text-center mt-12 md:mt-16">
          {siteUser
            ? <button
                onClick={() => { setCurrentPage('dashboard:bookings'); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                style={{ background: '#c5a059', color: '#042f2e' }}>
                {lang === 'ar' ? 'حجوزاتي' : 'My Bookings'}
              </button>
            : <button
                onClick={() => { setShowAuthModal(true); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                style={{ background: '#c5a059', color: '#042f2e' }}>
                {lang === 'ar' ? 'سجل الآن' : 'Sign Up'}
              </button>
          }
        </motion.div>
      </div>
    </section>
  );
}
