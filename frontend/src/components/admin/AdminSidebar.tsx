import { LogOut, LayoutDashboard, Briefcase, Users, Bell, Star, Settings, BarChart3, type LucideIcon } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { type Section } from './shared/adminTypes';

export interface NavItem {
  id: Section;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

interface Props {
  section: Section;
  setSection: (s: Section) => void;
  admin: { name: string; email: string };
  onLogout: () => void;
  newBookingsCount: number;
  expiringCount: number;
  lowRatingCount: number;
}

export function AdminSidebar({ section, setSection, admin, onLogout, newBookingsCount, expiringCount, lowRatingCount }: Props) {
  const navItems: NavItem[] = [
    { id: 'overview',      icon: LayoutDashboard, label: 'نظرة عامة' },
    { id: 'bookings',      icon: Briefcase,       label: 'الطلبات',       badge: newBookingsCount  || undefined },
    { id: 'users',         icon: Users,           label: 'المستخدمون' },
    { id: 'notifications', icon: Bell,            label: 'الإشعارات',     badge: expiringCount     || undefined },
    { id: 'reviews',       icon: Star,            label: 'التقييمات',     badge: lowRatingCount    || undefined },
    { id: 'services',      icon: Settings,        label: 'الخدمات' },
    { id: 'analytics',     icon: BarChart3,       label: 'التحليلات' },
  ];

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="p-5 border-b border-brand-gold-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
            <img src={logoImg} alt="ثرا نوفا" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-white font-black text-sm">ثرا نوفا</p>
            <p className="text-white/30 text-[10px]">لوحة التحكم</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => { setSection(item.id); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative ${section === item.id ? 'bg-brand-gold-500/15 text-brand-gold-500' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={17} />
              <span>{item.label}</span>
              {(item.badge ?? 0) > 0 && (
                <span className="absolute left-3 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {(item.badge ?? 0) > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-brand-gold-500/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-brand-gold-500/20 border border-brand-gold-500/30 flex items-center justify-center">
            <span className="text-brand-gold-500 font-black text-sm">{admin.name.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-black truncate">{admin.name}</p>
            <p className="text-white/30 text-[10px] truncate">{admin.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold" style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)' }}>
          <LogOut size={14} /> تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

export { type NavItem as AdminNavItem };
// Re-export navItems builder for use in topbar
export function buildNavItems(newBookingsCount: number, expiringCount: number, lowRatingCount: number): NavItem[] {
  return [
    { id: 'overview',      icon: LayoutDashboard, label: 'نظرة عامة' },
    { id: 'bookings',      icon: Briefcase,       label: 'الطلبات',   badge: newBookingsCount || undefined },
    { id: 'users',         icon: Users,           label: 'المستخدمون' },
    { id: 'notifications', icon: Bell,            label: 'الإشعارات', badge: expiringCount    || undefined },
    { id: 'reviews',       icon: Star,            label: 'التقييمات', badge: lowRatingCount   || undefined },
    { id: 'services',      icon: Settings,        label: 'الخدمات' },
    { id: 'analytics',     icon: BarChart3,       label: 'التحليلات' },
  ];
}
