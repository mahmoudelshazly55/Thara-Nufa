// ─── Shared app-wide types ────────────────────────────────────────────────────

export type Lang = 'ar' | 'en';

// Top-level page/route the app is currently showing.
export type Page =
  | 'home'
  | 'admin'
  | 'track'
  | 'dashboard:bookings'
  | 'dashboard:notifications'
  | 'dashboard:account';

// The logged-in site visitor (as opposed to an admin user).
export interface SiteUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// The logged-in admin user.
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// A piece of content that is either a plain string or a bilingual { ar, en } pair.
export type Localized = string | { ar: string; en?: string };
