import { motion, AnimatePresence } from 'motion/react';
import { HERO_CONTENT } from '../../constants';
import { ParticleSystem } from './ParticleSystem';
import { HERO_SLIDES } from '../../App';
import type { Localized } from '../../types';

type Lang = 'ar' | 'en';
const t = (obj: Localized): string => typeof obj === 'string' ? obj : obj.ar;

interface HeroProps {
  lang: Lang; currentSlide: number;
  setCurrentSlide: (i: number) => void;
  setShowAuthModal: (v: boolean) => void;
  scrollToSection: (id: string) => void;
}

export function HeroSection({ lang, currentSlide, setCurrentSlide, setShowAuthModal, scrollToSection }: HeroProps) {
  const currentHero = HERO_SLIDES.at(currentSlide >= 0 ? currentSlide : 0) ?? HERO_SLIDES.at(0);
  return (
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  <AnimatePresence mode="wait">
    <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 z-10" />
      <img src={currentHero} alt="Hero" loading="eager" fetchPriority="high" className="w-full h-full object-cover animate-ken-burns" referrerPolicy="no-referrer" />
    </motion.div>
  </AnimatePresence>
  <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-8 z-30">
    <div className="w-px h-20 bg-brand-gold-500/50" />
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold-500/70 vertical-text py-4">
      {lang === 'ar' ? 'رؤية المملكة 2030 | عام الذكاء الاصطناعي' : 'Saudi Vision 2030 | Year of AI'}
    </p>
    <div className="w-px h-20 bg-brand-gold-500/50" />
  </div>
  <div className="relative z-20 text-center px-6">
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="flex flex-col items-center">
      <h1 className="text-6xl sm:text-7xl md:text-9xl font-black text-white tracking-tighter uppercase mb-4">{lang === 'ar' ? 'ثرا نوفا' : 'THARA NUFA'}</h1>
      <h2 className="text-lg md:text-3xl font-black text-white tracking-[0.4em] opacity-90 mb-8">THARA NUFA</h2>
      {/* Only explore button — no book now */}
      <button onClick={() => { scrollToSection('services'); }}
        className="px-8 py-4 border border-white/30 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
        {lang === 'ar' ? 'استكشف خدماتنا' : 'Explore Services'}
      </button>
    </motion.div>
  </div>
  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
    {HERO_SLIDES.map((_, i) => (
      <button key={i} onClick={() => { setCurrentSlide(i); }}
        className={`h-2 transition-all duration-500 rounded-full ${currentSlide === i ? 'w-8 bg-brand-gold-500' : 'w-2 bg-white/30'}`} />
    ))}
  </div>
  <ParticleSystem />
</section>
  );
}
