import { motion } from 'motion/react';
import { Truck, Calendar, Hotel, HardHat, Headphones, GraduationCap, BookOpen, type LucideIcon } from 'lucide-react';
import { SERVICES, BOOKING_SERVICES } from '../../constants';

const Icons: Record<string, LucideIcon> = { Truck, Calendar, Hotel, HardHat, Headphones, GraduationCap, BookOpen };
type Lang = 'ar' | 'en';
type Service = (typeof SERVICES)[number];
const getTitle = (service: Service, lang: Lang): string => {
  if (lang === 'ar') return service.ar.title;
  return service.en.title;
};

interface ServicesProps { lang: Lang; openBooking: (id?: string) => void; }

export function ServicesSection({ lang, openBooking }: ServicesProps) {
  return (
<section id="services" className="py-20 md:py-40 relative min-h-screen flex flex-col justify-center overflow-hidden">
  <div className="absolute inset-0 scrolling-cityscape opacity-80" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=3000")' }}>
    <div className="absolute inset-0 bg-brand-green-950/80 backdrop-blur-sm" />
  </div>
  <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
    <div className="text-center mb-16">
      <h2 className="text-brand-gold-500 text-xs font-black tracking-widest uppercase mb-4">{lang === 'ar' ? 'خدماتنا' : 'Our Services'}</h2>
      <p className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase">{lang === 'ar' ? 'خدماتنا' : 'Our Services'}</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-4 md:mb-8">
      {SERVICES.slice(0, 4).map((service, idx: number) => {
        const Icon = Icons[service.icon];
        return (
          <motion.button key={idx} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={() => { openBooking(service.id); }}
            className="bg-white/5 backdrop-blur-lg p-6 md:p-12 rounded-[2rem] border border-brand-gold-500/20 hover:border-brand-gold-500/50 hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all group flex flex-col items-center cursor-pointer w-full text-center"
            style={{ WebkitTapHighlightColor: 'transparent' }}>
            <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-brand-green-900 border-2 border-brand-gold-500/20 flex items-center justify-center mb-4 md:mb-8 group-hover:border-brand-gold-500 transition-colors">
              <Icon className="text-brand-gold-500" size={28} />
            </div>
            <h3 className="text-sm md:text-xl font-black text-white text-center">{getTitle(service, lang)}</h3>
          </motion.button>
        );
      })}
    </div>
    <div className="flex flex-wrap justify-center gap-4 md:gap-8">
      {SERVICES.slice(4).map((service, idx: number) => {
        const Icon = Icons[service.icon];
        return (
          <motion.button key={idx} whileHover={{ y: -8, scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={() => { openBooking(service.id); }}
            className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-2rem)] bg-white/5 backdrop-blur-lg p-6 md:p-12 rounded-[2rem] border border-brand-gold-500/20 hover:border-brand-gold-500/50 hover:shadow-[0_0_20px_rgba(197,160,89,0.4)] transition-all group flex flex-col items-center cursor-pointer text-center"
            style={{ WebkitTapHighlightColor: 'transparent' }}>
            <div className="w-14 h-14 md:w-24 md:h-24 rounded-full bg-brand-green-900 border-2 border-brand-gold-500/20 flex items-center justify-center mb-4 md:mb-8 group-hover:border-brand-gold-500 transition-colors">
              <Icon className="text-brand-gold-500" size={28} />
            </div>
            <h3 className="text-sm md:text-xl font-black text-white text-center">{getTitle(service, lang)}</h3>
          </motion.button>
        );
      })}
    </div>
  </div>
</section>
  );
}
