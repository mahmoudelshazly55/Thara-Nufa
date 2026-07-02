import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Globe, Bell, LogOut, User, Briefcase, MessageSquare, type LucideIcon } from 'lucide-react';
import { NAV_LINKS, BRAND_NAME } from '../../constants';
import logoImg from '../../assets/logo.png';
import type { SiteUser, Page } from '../../types';

type Lang = 'ar' | 'en';

import { useRef } from 'react';

interface NavBarProps {
  lang: Lang; setLang: (l: Lang) => void;
  scrolled: boolean;
  isMenuOpen: boolean; setIsMenuOpen: (v: boolean) => void;
  siteUser: SiteUser | null;
  notifUnread: number;
  currentPage: string; setCurrentPage: (p: Page) => void;
  setShowAuthModal: (v: boolean) => void;
  doLogout: () => void;
  userMenuOpen: boolean; setUserMenuOpen: (v: boolean) => void;
  scrollToSection: (id: string) => void;
}

export function NavBar({
  lang, setLang, scrolled, isMenuOpen, setIsMenuOpen,
  siteUser, notifUnread, currentPage, setCurrentPage,
  setShowAuthModal, doLogout, userMenuOpen, setUserMenuOpen,
  scrollToSection,
}: NavBarProps) {
  const isRtl = lang === 'ar';
  const userMenuRef = useRef<HTMLDivElement>(null);
  return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-brand-green-950/95 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}
          style={{ height: scrolled ? '72px' : '96px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

            {/* Logo */}
            <motion.div initial={{ opacity: 0, x: isRtl ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => { scrollToSection('home'); }}>
              <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 overflow-hidden flex items-center justify-center drop-shadow-[0_0_12px_rgba(197,160,89,0.35)]">
                <img src={logoImg} alt="ثرا نوفا" className="w-full h-full object-contain" loading="lazy" />
              </motion.div>
              <span className="text-xl font-black tracking-tighter text-white hidden sm:block">{lang === 'ar' ? BRAND_NAME.ar : BRAND_NAME.en}</span>
            </motion.div>

            {/* Desktop center: nav + lang (lang separated right of nav) */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-1">
                {NAV_LINKS.map(link => (
                  <button key={link.id}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    onPointerDown={e => { e.preventDefault(); scrollToSection(link.id); }}
                    onClick={() => { scrollToSection(link.id); }}
                    className="text-sm font-bold text-white/60 hover:text-brand-gold-500 px-4 py-2 rounded-xl hover:bg-white/5 transition-all">
                    {lang === 'ar' ? link.ar : link.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop right: auth + lang */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language toggle — next to user */}
              <button onClick={() => { setLang(lang === 'ar' ? 'en' : 'ar'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-gold-500/30 text-xs font-black uppercase tracking-widest hover:bg-brand-gold-500 hover:text-brand-green-900 transition-all text-brand-gold-500">
                <Globe size={12} />
                {lang === 'ar' ? 'English' : 'العربية'}
              </button>
              {siteUser ? (
                <div ref={userMenuRef} className="relative">
                  <button onClick={() => { setUserMenuOpen(!userMenuOpen); }}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-white/10 hover:border-brand-gold-500/40 transition-all">
                    <div className="w-7 h-7 rounded-full bg-brand-gold-500 flex items-center justify-center shrink-0">
                      <span className="text-brand-green-900 font-black text-xs">{siteUser.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-white text-sm font-black">{siteUser.name.split(' ')[0]}</span>
                    {notifUnread > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{notifUnread > 9 ? '9+' : notifUnread}</span>
                    )}
                    <div className="flex flex-col gap-1 ms-1">{[0, 1, 2].map(i => <div key={i} className="w-4 h-0.5 bg-white/50 rounded-full" />)}</div>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        className="absolute top-full mt-2 end-0 w-52 rounded-2xl shadow-2xl overflow-hidden z-50"
                        style={{ background: '#042f2e', border: '1px solid rgba(197,160,89,0.25)' }}>
                        {(
                          [
                            { icon: Briefcase, label: lang === 'ar' ? 'حجوزاتي' : 'My Bookings', action: () => { setCurrentPage('dashboard:bookings'); setUserMenuOpen(false); } },
                            { icon: Bell, label: lang === 'ar' ? 'الإشعارات' : 'Notifications', action: () => { setCurrentPage('dashboard:notifications'); setUserMenuOpen(false); }, badge: notifUnread },
                            { icon: User, label: lang === 'ar' ? 'الحساب' : 'Account', action: () => { setCurrentPage('dashboard:account'); setUserMenuOpen(false); } },
                            { icon: LogOut, label: lang === 'ar' ? 'تسجيل الخروج' : 'Logout', action: doLogout, red: true },
                          ] satisfies Array<{ icon: LucideIcon; label: string; action: () => void; badge?: number; red?: boolean }>
                        ).map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <button key={i} onClick={item.action}
                              className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold transition-colors ${item.red ? 'text-red-400 hover:bg-red-500/10' : 'text-white/70 hover:bg-white/5 hover:text-white'} ${i < 3 ? 'border-b border-white/5' : ''}`}>
                              <Icon size={16} /><span>{item.label}</span>
                              {(item.badge ?? 0) > 0 && <span className="ms-auto w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{(item.badge ?? 0) > 9 ? '9+' : item.badge}</span>}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => { setShowAuthModal(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-gold-500 text-brand-gold-500 text-sm font-black hover:bg-brand-gold-500 hover:text-brand-green-900 transition-all">
                  <User size={14} />{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </button>
              )}

            </div>

            {/* Mobile: logo right + (login btn OR menu icon) left */}
            <div className="lg:hidden flex items-center gap-2">
              {!siteUser && (
                <button onClick={() => { setShowAuthModal(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-gold-500/50 text-brand-gold-500 text-xs font-black">
                  <User size={14} />{lang === 'ar' ? 'دخول' : 'Login'}
                </button>
              )}
              {siteUser && (
                <button className="text-white p-2" onClick={() => { setIsMenuOpen(!isMenuOpen); }}>
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu — nav links only */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-brand-green-950/98 border-b border-brand-gold-500/20 px-6 py-6 flex flex-col gap-3">
                {NAV_LINKS.map(link => (
                  <button key={link.id}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                    onPointerDown={e => { e.preventDefault(); scrollToSection(link.id); }}
                    onClick={() => { scrollToSection(link.id); }}
                    className="text-lg font-black text-white text-start py-2 border-b border-white/5 last:border-0 hover:text-brand-gold-500 transition-colors">
                    {lang === 'ar' ? link.ar : link.en}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
  );
}
