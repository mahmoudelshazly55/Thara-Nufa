import { useState } from 'react';
import type { SiteUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SERVICE_NAMES: ReadonlyMap<string, { ar: string; en: string }> = new Map([
  ['transport',    { ar: 'نقل وشحن',           en: 'Shipping & Transport'   }],
  ['tourism',      { ar: 'سياحة وفنادق',        en: 'Tourism & Hotels'       }],
  ['construction', { ar: 'مقاولات',             en: 'Construction'           }],
  ['events',       { ar: 'تنظيم الفعاليات',     en: 'Events Management'      }],
  ['recruitment',  { ar: 'استقدام عمالة',       en: 'Recruitment'            }],
  ['training',     { ar: 'تدريب وتطوير',        en: 'Training & Development' }],
]);

export interface FormData { name: string; email: string; phone: string; date: string; notes: string; address: string; }

export function useBooking(
  siteUser: SiteUser | null,
  siteToken: string | null,
  lang: string,
  setPendingBookingService: (s: string) => void,
  setShowAuthModal: (v: boolean) => void,
) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId,  setSubmittedId]  = useState<string | null>(null);
  const [copiedId,     setCopiedId]     = useState(false);
  const [formData,     setFormData]     = useState<FormData>({ name: '', email: '', phone: '', date: '', notes: '', address: '' });

  const open = (serviceId = '') => {
    if (!siteUser) { setPendingBookingService(serviceId); setShowAuthModal(true); return; }
    const entry = SERVICE_NAMES.get(serviceId);
    const serviceName = entry
      ? (lang === 'ar' ? entry.ar : entry.en)
      : (serviceId || (lang === 'ar' ? 'استفسار عام' : 'General Inquiry'));
    setSelectedService(serviceName);
    setFormData(p => ({ ...p, name: siteUser.name, email: siteUser.email, phone: siteUser.phone ?? p.phone }));
    setSubmittedId(null);
    setIsOpen(true);
  };

  const close = () => { setIsOpen(false); setSubmittedId(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0);
    if (!formData.date || new Date(formData.date) < tomorrow) {
      alert(lang === 'ar' ? 'يرجى اختيار تاريخ مستقبلي' : 'Please select a future date'); return;
    }
    const p = formData.phone.replace(/\D/g, '');
    // Accept: 05XXXXXXXX (10 digits), 5XXXXXXXX (9 digits), or +966XXXXXXXXX
    const saudiPhone = /^(966)?0?5\d{8}$/.test(p) || (p.length >= 9 && p.length <= 15);
    if (!saudiPhone) {
      alert(lang === 'ar' ? 'رقم هاتف غير صحيح (مثال: 0512345678)' : 'Invalid phone number'); return;
    }
    setIsSubmitting(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (siteToken) headers['Authorization'] = `Bearer ${siteToken}`;
      const res  = await fetch(`${API_URL}/bookings`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...formData, serviceType: selectedService, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Server error');
      setSubmittedId(data.data?.id?.slice(0,8).toUpperCase() || 'N/A');
      setFormData({ name: '', email: '', phone: '', date: '', notes: '', address: '' });
    } catch {
      alert(lang === 'ar' ? 'حدث خطأ أثناء الإرسال. حاول مجدداً.' : 'Error submitting. Try again.');
    } finally { setIsSubmitting(false); }
  };

  const copy = () => {
    if (!submittedId) return;
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = submittedId; ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand('copy'); setCopiedId(true); setTimeout(() => { setCopiedId(false); }, 2000); } catch {}
      document.body.removeChild(ta);
    };
    if (window.isSecureContext)
      navigator.clipboard.writeText(submittedId).then(() => { setCopiedId(true); setTimeout(() => { setCopiedId(false); }, 2000); }).catch(fallback);
    else fallback();
  };

  return { isOpen, open, close, submit, copy, selectedService, setSelectedService,
           formData, setFormData, isSubmitting, submittedId, copiedId };
}
