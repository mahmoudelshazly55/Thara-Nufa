import { Linkedin, Package } from 'lucide-react';
import { NAV_LINKS } from '../../constants';
import logoImg from '../../assets/logo.png';
import { BRAND_NAME } from '../../constants';
import type { Localized, Page } from '../../types';

type Lang = 'ar' | 'en';
const t = (obj: Localized): string => typeof obj === 'string' ? obj : obj.ar;

interface FooterProps { lang: Lang; setCurrentPage: (p: Page) => void; }

/**
 * Disabled/placeholder button for App Store & Google Play.
 * Shown as coming-soon state — no href, no cursor-pointer.
 * Replace `disabled` prop with real store URLs when apps are live.
 */
function AppStoreButton({ label, icon, lang = 'ar' }: { label: string; icon: React.ReactNode; lang?: string }) {
  const comingSoon = lang === 'ar' ? 'قريباً' : 'Coming Soon';
  const comingSoonOn = lang === 'ar' ? 'قريباً على' : 'Coming soon on';
  return (
    <div
      title={comingSoon}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-not-allowed select-none"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: 0.45,
      }}>
      {icon}
      <div>
        <p className="text-white/40 text-[9px] font-bold leading-none mb-0.5">
          {comingSoonOn}
        </p>
        <p className="text-white/60 font-black text-xs">{label}</p>
      </div>
    </div>
  );
}

/** Real social link — only rendered when a real URL is provided. */
function SocialLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-white/50 hover:text-brand-gold-500 hover:scale-125 transition-all flex justify-center">
      {children}
    </a>
  );
}

/**
 * SOCIAL URLS — fill in real URLs before launch.
 * Set to null to hide the icon entirely.
 */
const SOCIAL_URLS = {
  facebook:  null as string | null,  // e.g. 'https://facebook.com/tharanufa'
  instagram: null as string | null,
  linkedin:  null as string | null,
  twitter:   null as string | null,
  snapchat:  null as string | null,
  discord:   null as string | null,
};

const hasSocialLinks = Object.values(SOCIAL_URLS).some(Boolean);

export function FooterSection({ lang, setCurrentPage }: FooterProps) {
  return (
    <footer id="contact" className="bg-brand-green-900 text-white/50 pt-32 pb-44 lg:pb-32 border-t border-brand-gold-500/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-20 mb-32">

          {/* Brand + CTA + App Download */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <img src={logoImg} alt="ثرا نوفا" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white">{t(BRAND_NAME)}</span>
            </div>
            <p className="text-2xl font-bold text-white max-w-sm mb-10 leading-tight">
              {lang === 'ar' ? 'هل أنتم جاهزون لبناء مستقبل أعمالكم؟' : 'Ready to build the future of your enterprise?'}
            </p>
            <button
              onClick={() => { setCurrentPage('track'); }}
              className="bg-brand-gold-500 text-brand-green-900 px-8 py-4 rounded-xl font-black hover:scale-105 transition-all flex items-center gap-2">
              <Package size={18} />
              {lang === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
            </button>

            {/* App download — disabled until apps are live */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-white/30 text-xs font-black uppercase tracking-widest mb-4">
                {lang === 'ar' ? 'التطبيق — قريباً' : 'App — Coming Soon'}
              </p>
              <div className="flex items-center gap-3">
                <AppStoreButton lang={lang} label="App Store" icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                } />
                <AppStoreButton lang={lang} label="Google Play" icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                    <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.84 5.84 0 0 0 12 1.5c-.96 0-1.86.23-2.66.63L7.85.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.954 5.954 0 0 0 6 8h12a5.96 5.96 0 0 0-2.47-5.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
                  </svg>
                } />
              </div>
            </div>
          </div>

          {/* Company nav links */}
          <div>
            <h5 className="text-white text-xs font-black uppercase tracking-widest mb-10">
              {lang === 'ar' ? 'الشركة' : 'Company'}
            </h5>
            <ul className="space-y-6 text-sm font-bold">
              {NAV_LINKS.map(link => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="hover:text-brand-gold-500 transition-colors uppercase">
                    {t(link)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            {/* Social icons — only rendered if real URLs are configured */}
            {hasSocialLinks && (
              <>
                <h5 className="text-white text-xs font-black uppercase tracking-widest mb-8">
                  {lang === 'ar' ? 'تابعنا على' : 'Follow Us'}
                </h5>
                <div className="grid grid-cols-3 gap-5 mb-10">
                  <SocialLink href={SOCIAL_URLS.facebook}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2zm1.75 14.5h-2.5v-5h-1.5v-2h1.5v-1.5c0-1.5 1-2.5 2.5-2.5h1.5v2H14.5c-.5 0-.75.25-.75.75v1.25h1.75l-.25 2H13.75v5z"/></svg>
                  </SocialLink>
                  <SocialLink href={SOCIAL_URLS.instagram}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </SocialLink>
                  <SocialLink href={SOCIAL_URLS.linkedin}>
                    <Linkedin size={22} />
                  </SocialLink>
                  <SocialLink href={SOCIAL_URLS.twitter}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </SocialLink>
                  <SocialLink href={SOCIAL_URLS.snapchat}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.166 2c2.417 0 4.847 1.634 5.51 4.61.047.209.07.427.07.649 0 .278-.025.55-.07.815l.01.006c.097.044.2.075.307.075.33 0 .644-.2.88-.428l.01-.01c.157-.147.35-.22.54-.22.38 0 .73.3.73.71 0 .67-.7 1.14-1.34 1.37-.09.03-.19.06-.29.08-.05.01-.1.02-.14.03-.23.05-.44.14-.56.36-.04.07-.06.16-.06.25 0 .08.02.15.05.22.56 1.44 1.77 2.63 3.23 3.28.09.04.18.08.28.1.1.03.18.08.18.2 0 .52-1.12.84-1.81.97-.23.04-.45.08-.68.11-.21.03-.38.14-.45.34-.04.1-.06.22-.08.34-.02.09-.08.24-.29.24-.1 0-.23-.03-.41-.07-.5-.12-1.12-.27-1.83-.27-.37 0-.74.04-1.09.13-.51.13-.95.43-1.38.7-.65.41-1.26.8-2.11.8-.87 0-1.47-.39-2.12-.8-.43-.27-.87-.57-1.38-.7-.35-.09-.72-.13-1.09-.13-.71 0-1.33.15-1.83.27-.18.04-.31.07-.41.07-.21 0-.27-.15-.29-.24-.02-.12-.04-.24-.08-.34-.07-.2-.24-.31-.45-.34-.23-.03-.45-.07-.68-.11-.69-.13-1.81-.45-1.81-.97 0-.12.08-.17.18-.2.1-.02.19-.06.28-.1 1.46-.65 2.67-1.84 3.23-3.28.03-.07.05-.14.05-.22 0-.09-.02-.18-.06-.25-.12-.22-.33-.31-.56-.36-.04-.01-.09-.02-.14-.03-.1-.02-.2-.05-.29-.08-.64-.23-1.34-.7-1.34-1.37 0-.41.35-.71.73-.71.19 0 .38.07.54.22l.01.01c.24.23.55.43.88.43.1 0 .2-.03.29-.07l.01-.006c-.045-.265-.07-.537-.07-.815 0-.222.023-.44.07-.649C7.319 3.634 9.749 2 12.166 2z"/></svg>
                  </SocialLink>
                  <SocialLink href={SOCIAL_URLS.discord}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                  </SocialLink>
                </div>
              </>
            )}

            {/* Contact info */}
            <h5 className="text-white text-xs font-black uppercase tracking-widest mb-6">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h5>
            <div className="flex flex-col gap-4">
              <a href="https://maps.google.com/?q=مكة+المكرمة" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/50 hover:text-brand-gold-500 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand-gold-500/15"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <span className="text-sm font-bold leading-tight">
                  {lang === 'ar' ? 'مكة المكرمة، شارع محمد ياسين الفادانى' : 'Makkah, Muhammad Yasin Al-Fadani St.'}
                </span>
              </a>
              <a href="mailto:ceo@tharanufa.sa"
                className="flex items-center gap-3 text-white/50 hover:text-brand-gold-500 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand-gold-500/15"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <span className="text-sm font-bold">ceo@tharanufa.sa</span>
              </a>
              <a href="tel:+966532550332"
                className="flex items-center gap-3 text-white/50 hover:text-brand-gold-500 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-brand-gold-500/15"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <span className="text-sm font-bold" dir="ltr">+966 53 255 0332</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar — removed dead Privacy/Terms/Cookies links */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest">
          <p>© {new Date().getFullYear()} {t(BRAND_NAME)}. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <p className="text-white/20">
            {lang === 'ar' ? 'سياسة الخصوصية والشروط — قريباً' : 'Privacy Policy & Terms — Coming Soon'}
          </p>
        </div>
      </div>
    </footer>
  );
}
