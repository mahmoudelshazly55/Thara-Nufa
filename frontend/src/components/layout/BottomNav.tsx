import { motion } from 'motion/react';
import { Home, Briefcase, User, Bell, Globe } from 'lucide-react';
import type { SiteUser, Page, Lang } from '../../types';

interface BottomNavProps {
  siteUser: SiteUser | null; isOnAdmin: boolean; lang: Lang; currentPage: string;
  setCurrentPage: (p: Page) => void; setLang: (l: Lang) => void; notifUnread: number;
}
const BottomNav = ({ siteUser, isOnAdmin, lang, currentPage, setCurrentPage, setLang, notifUnread }: BottomNavProps) => {
  if (!siteUser || isOnAdmin) return null;

  const navItems = [
    { icon: Briefcase, label: lang === 'ar' ? 'حجوزاتي' : 'Bookings', page: 'dashboard:bookings' },
    { icon: User,      label: lang === 'ar' ? 'حسابي'   : 'Account',  page: 'dashboard:account'  },
    { icon: Bell,      label: lang === 'ar' ? 'تنبيهات' : 'Alerts',   page: 'dashboard:notifications' },
    { icon: Globe,     label: lang === 'ar' ? 'EN'       : 'ع',        page: 'lang' },
  ] as const;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(to top, rgba(2,14,13,0.98) 60%, transparent)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      }}>
      <div className="flex justify-around items-end px-4 pt-2 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.page;
          return (
            <button key={item.page}
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              onClick={() => {
                if (item.page === 'lang') { setLang(lang === 'ar' ? 'en' : 'ar'); return; }
                setCurrentPage(item.page);
              }}
              className="flex flex-col items-center gap-1 flex-1 transition-all">
              {/* Icon bubble */}
              <div className={`relative flex items-center justify-center rounded-2xl transition-all ${
                active
                  ? 'bg-brand-gold-500 w-12 h-10 shadow-lg shadow-brand-gold-500/40 -translate-y-1'
                  : 'w-10 h-9'
              }`}>
                <Icon size={active ? 20 : 19}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-brand-green-950' : 'text-white/45'} />
                {item.page === 'dashboard:notifications' && notifUnread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-brand-gold-500 border border-brand-green-950 text-brand-green-950 text-[7px] font-black rounded-full flex items-center justify-center px-0.5"
                    style={{ background: active ? '#fff' : '#c5a059' }}>
                    {notifUnread > 9 ? '9+' : notifUnread}
                  </span>
                )}
              </div>
              <span className={`text-[8px] font-black transition-colors ${active ? 'text-brand-gold-500' : 'text-white/30'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { BottomNav };
