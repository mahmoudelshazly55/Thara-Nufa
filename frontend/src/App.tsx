import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
import { BookingModal }      from './components/modals/BookingModal';
import { SiteAuthModal }     from './components/modals/SiteAuthModal';
import { PasswordResetModal } from './components/modals/PasswordResetModal';
import { NavBar }            from './components/layout/NavBar';
import { BottomNav }         from './components/layout/BottomNav';
import { HeroSection }       from './components/home/HeroSection';
import { ServicesSection }   from './components/home/ServicesSection';
import { MethodologySection } from './components/home/MethodologySection';
import { TestimonialsSection } from './components/home/TestimonialsSection';
import { FooterSection }     from './components/home/FooterSection';
import { FAQSection }        from './components/home/FAQSection';
import { AboutSection }      from './components/home/AboutSection';
import { TrackOrderPage }    from './components/TrackOrderPage';
import { useAppSocket }      from './hooks/useAppSocket';
import { useBooking }        from './hooks/useBooking';
import hereRiyadhNight        from './assets/hero/riyadh-night.jpg';
import hereMeccaKaaba         from './assets/hero/mecca-kaaba.jpg';
import hereMadinahUmbrellas   from './assets/hero/madinah-umbrellas.jpg';
import hereRiyadhKingdom      from './assets/hero/riyadh-kingdom-tower.jpg';
import logoImg                from './assets/logo.png';
import type { Page, SiteUser, Lang } from './types';

const UserDashboard = lazy(() => import('./components/UserDashboard'));

export const HERO_SLIDES = [
  hereRiyadhNight,
  hereMeccaKaaba,
  hereMadinahUmbrellas,
  hereRiyadhKingdom,
];

const LoadingScreen = ({ lang = 'ar' }: { lang?: string }) => (
  <motion.div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-brand-green-950">
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
      className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl mb-8">
      <img src={logoImg} alt="ثرا نوفا" className="w-full h-full object-contain" />
    </motion.div>
    <motion.div initial={{ width: 0 }} animate={{ width: 200 }} transition={{ duration: 2 }} className="h-1 bg-brand-gold-500 rounded-full" />
    <p className="mt-4 text-brand-gold-500 font-black uppercase tracking-[0.3em] text-xs">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
  </motion.div>
);

const ScrollProgressBar = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => { const d = document.documentElement; setP((d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100); };
    window.addEventListener('scroll', fn, { passive: true });
    return () => { window.removeEventListener('scroll', fn); };
  }, []);
  return <div className="fixed top-0 left-0 h-0.5 bg-brand-gold-500 z-[999] transition-all" style={{ width: `${p}%` }} />;
};

export default function App() {
  const [lang,         setLang]         = useState<Lang>('ar');
  const [currentPage,  setCurrentPage]  = useState<Page>('home');
  const [isLoading,    setIsLoading]    = useState(true);
  const [scrolled,     setScrolled]     = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen,   setIsMenuOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifUnread,  setNotifUnread]  = useState(0);
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep,   setResetStep]   = useState<'email'|'otp'|'pass'>('email');
  const [resetEmail,  setResetEmail]  = useState('');
  const [resetMsg,    setResetMsg]    = useState('');
  const [authMode,    setAuthMode]    = useState<'login'|'register'>('login');
  const [pendingSvc,  setPendingSvc]  = useState('');

  const [siteUser, setSiteUser] = useState<SiteUser | null>(
    () => { try { return JSON.parse(localStorage.getItem('site_user') || 'null'); } catch { return null; } }
  );
  const [siteToken, setSiteToken] = useState<string | null>(() => localStorage.getItem('site_token'));

  const booking   = useBooking(siteUser, siteToken, lang, setPendingSvc, setShowAuthModal);
  const socketRef = useAppSocket(siteUser, siteToken, currentPage, () => { setNotifUnread(c => c + 1); });

  const isAdminMode   = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('admin') === 'true';
  const isOnDashboard = currentPage.startsWith('dashboard');
  const isOnAdmin     = currentPage === 'admin';
  const isOnTrack     = currentPage === 'track';

  // ── Auto-redirect /?admin=true → admin page ──────────────────────────────
  useEffect(() => {
    if (isAdminMode && currentPage !== 'admin') { setCurrentPage('admin'); }
  }, [isAdminMode, currentPage]);

  useEffect(() => { const id = setInterval(() => { setCurrentSlide(p => (p + 1) % HERO_SLIDES.length); }, 5000); return () => { clearInterval(id); }; }, []);
  useEffect(() => { setTimeout(() => { setIsLoading(false); }, 2000); }, []);
  useEffect(() => { document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.documentElement.lang = lang; }, [lang]);
  useEffect(() => { document.documentElement.classList.add('dark'); }, []);
  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 50); };
    window.addEventListener('scroll', fn, { passive: true }); return () => { window.removeEventListener('scroll', fn); };
  }, []);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const ref = document.getElementById('user-menu-ref');
      if (ref && !ref.contains(e.target as Node)) { setUserMenuOpen(false); }
    };
    document.addEventListener('mousedown', fn); return () => { document.removeEventListener('mousedown', fn); };
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'home') { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); return; }
    if (currentPage !== 'home') { setCurrentPage('home'); setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); }
    else { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' }); }
    setIsMenuOpen(false);
  };

  const doLogout = () => {
    socketRef.current?.disconnect();
    setSiteUser(null); setSiteToken(null); setNotifUnread(0);
    setUserMenuOpen(false); setCurrentPage('home'); setIsMenuOpen(false);
    localStorage.removeItem('site_user'); localStorage.removeItem('site_token');
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-brand-gold-500 selection:text-white overflow-x-hidden ${isLoading ? 'h-screen overflow-hidden' : ''}`}>
      <AnimatePresence>{isLoading && <LoadingScreen key="loader" />}</AnimatePresence>
      {!isOnAdmin && !isOnDashboard && !isOnTrack && <ScrollProgressBar />}

      {!isOnAdmin && !isOnDashboard && !isOnTrack && (
        <NavBar lang={lang} setLang={setLang} scrolled={scrolled}
          isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen}
          siteUser={siteUser} notifUnread={notifUnread}
          currentPage={currentPage} setCurrentPage={setCurrentPage}
          setShowAuthModal={setShowAuthModal} doLogout={doLogout}
          userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen}
          scrollToSection={scrollToSection}
        />
      )}

      <AnimatePresence mode="wait">

        {currentPage === 'home' && (
          <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroSection lang={lang} currentSlide={currentSlide} setCurrentSlide={setCurrentSlide} setShowAuthModal={setShowAuthModal} scrollToSection={scrollToSection} />
            <ServicesSection lang={lang} openBooking={booking.open} />
            <MethodologySection lang={lang} siteUser={siteUser} setCurrentPage={setCurrentPage} setShowAuthModal={setShowAuthModal} />
            <TestimonialsSection lang={lang} openBooking={booking.open} />
            <FAQSection lang={lang} />
            <AboutSection lang={lang} />
            <FooterSection lang={lang} setCurrentPage={setCurrentPage} />
          </motion.main>
        )}

        {currentPage === 'track' && (
          <motion.div key="track" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TrackOrderPage onBack={() => { setCurrentPage('home'); }} onLogin={() => { setCurrentPage('home'); setShowAuthModal(true); }} lang={lang} />
          </motion.div>
        )}

        {currentPage === 'admin' && (
          <Suspense fallback={<LoadingScreen />}>
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminDashboard setCurrentPage={setCurrentPage} />
            </motion.div>
          </Suspense>
        )}

        {isOnDashboard && (
          <Suspense fallback={<LoadingScreen />}>
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UserDashboard siteUser={siteUser} siteToken={siteToken}
                setCurrentPage={setCurrentPage}
                setSiteUser={setSiteUser} setSiteToken={setSiteToken}
                onUnreadChange={setNotifUnread}
                activePage={
                  currentPage === 'dashboard:notifications' ? 'notifications' :
                  currentPage === 'dashboard:account' ? 'account' : 'bookings'
                }
                lang={lang}
              />
            </motion.div>
          </Suspense>
        )}

      </AnimatePresence>

      <BottomNav siteUser={siteUser} isOnAdmin={isOnAdmin} lang={lang}
        currentPage={currentPage} setCurrentPage={setCurrentPage}
        setLang={setLang} notifUnread={notifUnread}
      />

      <PasswordResetModal lang={lang} show={showResetModal}
        onClose={() => { setShowResetModal(false); setResetStep('email'); setResetMsg(''); }}
        onBackToLogin={() => { setShowAuthModal(true); setAuthMode('login'); }}
      />
      <BookingModal isOpen={booking.isOpen} onClose={booking.close}
        lang={lang} selectedService={booking.selectedService} siteUser={siteUser}
        formData={booking.formData} setFormData={booking.setFormData}
        isSubmitting={booking.isSubmitting} submittedBookingId={booking.submittedId}
        copiedId={booking.copiedId} onSubmit={(e) => { void booking.submit(e); }} onCopy={booking.copy}
        onViewBookings={() => { booking.close(); if (siteUser) setCurrentPage('dashboard:bookings'); }}
      />
      <SiteAuthModal lang={lang} show={showAuthModal} onClose={() => { setShowAuthModal(false); }}
        onForgotPassword={(email) => { setShowResetModal(true); setResetStep('email'); setResetEmail(email); setResetMsg(''); }}
        onLoginSuccess={(token, user) => { setSiteToken(token); setSiteUser(user); }}
        pendingBookingService={pendingSvc} setPendingBookingService={setPendingSvc}
        setFormData={booking.setFormData} setIsBookingModalOpen={() => { booking.open(); }}
        setSelectedService={booking.setSelectedService}
        setIsMenuOpen={setIsMenuOpen} setNotifUnread={setNotifUnread}
      />
    </div>
  );
}
