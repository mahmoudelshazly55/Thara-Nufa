import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Copy, CheckCheck, Loader2 } from 'lucide-react';
import type { SiteUser } from '../../types';

interface FormData {
  name: string; email: string; phone: string;
  date: string; notes: string; address: string;
}

interface Props {
  isOpen: boolean; onClose: () => void; lang: string;
  selectedService: string; siteUser: SiteUser | null; formData: FormData;
  setFormData: (fn: (p: FormData) => FormData) => void;
  isSubmitting: boolean; submittedBookingId: string | null;
  copiedId: boolean; onSubmit: (e: React.FormEvent) => void;
  onCopy: () => void; onViewBookings: () => void;
}

export function BookingModal({
  isOpen, onClose, lang, selectedService, siteUser,
  formData, setFormData, isSubmitting,
  submittedBookingId, copiedId, onSubmit, onCopy, onViewBookings,
}: Props) {
  const T = (ar: string, en: string) => lang === 'ar' ? ar : en;

  const FIELDS = [
    { label: T('الاسم الكامل *', 'Full Name *'),           key: 'name',    type: 'text',  placeholder: T('محمد عبدالله', 'John Smith') },
    { label: T('البريد الإلكتروني *', 'Email *'),         key: 'email',   type: 'email', placeholder: 'your@email.com' },
    { label: T('رقم الهاتف *', 'Phone Number *'),          key: 'phone',   type: 'tel',   placeholder: T('05xxxxxxxx', '+1234567890') },
    { label: T('العنوان *', 'Address *'),                  key: 'address', type: 'text',  placeholder: T('المدينة، الحي، الشارع', 'City, District, Street') },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-brand-green-950/85 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-brand-green-900 rounded-[2.5rem] border border-brand-gold-500/20 shadow-2xl overflow-hidden p-6 md:p-10 text-start max-h-[95vh] overflow-y-auto no-scrollbar"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <button onClick={onClose} className="absolute top-5 end-5 text-white/40 hover:text-brand-gold-500 transition-colors">
              <X size={28} />
            </button>

            {submittedBookingId ? (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
                  className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={44} />
                </motion.div>
                <h4 className="text-2xl md:text-3xl font-black mb-3 text-white">
                  {T('تم إرسال طلبك بنجاح!', 'Request Sent Successfully!')}
                </h4>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">
                  {T('سيتواصل معك فريقنا خلال ٢٤ ساعة.', 'Our team will contact you within 24 hours.')}<br />
                  {T('برجاء الاحتفاظ برقم الطلب التالي:', 'Please keep the following booking number:')}
                </p>
                <div className="mx-auto max-w-xs rounded-2xl p-4 mb-3"
                  style={{ background: 'rgba(197,160,89,0.1)', border: '2px dashed rgba(197,160,89,0.4)' }}>
                  <p className="text-white/50 text-xs font-bold mb-2">{T('رقم الطلب', 'Booking ID')}</p>
                  <p className="text-brand-gold-500 text-3xl font-black tracking-widest mb-3">{submittedBookingId}</p>
                  <button onClick={onCopy}
                    className="flex items-center gap-2 mx-auto text-xs font-bold transition-colors px-3 py-1.5 rounded-xl"
                    style={{ background: copiedId ? 'rgba(16,185,129,0.15)' : 'rgba(197,160,89,0.15)', color: copiedId ? '#34d399' : '#c5a059' }}>
                    {copiedId ? <CheckCheck size={14} /> : <Copy size={14} />}
                    {copiedId ? T('تم النسخ!', 'Copied!') : T('نسخ الرقم', 'Copy ID')}
                  </button>
                </div>
                <button onClick={onViewBookings}
                  className="mt-4 px-8 py-3 rounded-2xl font-black text-sm" style={{ background: '#c5a059', color: '#042f2e' }}>
                  {siteUser ? T('عرض حجوزاتي', 'My Bookings') : T('إغلاق', 'Close')}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h4 className="text-2xl md:text-3xl font-black mb-1 text-white">{T('طلب حجز', 'Booking Request')}</h4>
                  {selectedService && <p className="text-sm text-brand-gold-500 font-bold">{T('الخدمة: ', 'Service: ')}{selectedService}</p>}
                </div>
                <form onSubmit={(e) => { onSubmit(e); }} className="space-y-4">
                  {FIELDS.map(field => (
                    <div key={field.key}>
                      <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">{field.label}</label>
                      <input required type={field.type} placeholder={field.placeholder}
                        className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold outline-none"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(197,160,89,0.25)', color: 'white' }}
                        maxLength={field.key === 'phone' ? 11 : undefined}
                        value={formData[field.key]}
                        onChange={e => {
                          const val = field.key === 'phone' ? e.target.value.replace(/[^0-9+]/g, '').slice(0, 11) : e.target.value;
                          setFormData(p => ({ ...p, [field.key]: val }));
                        }} />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">
                      {T('التاريخ المفضل *', 'Preferred Date *')}
                    </label>
                    <input required type="date"
                      min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })()}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold outline-none [color-scheme:dark]"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(197,160,89,0.25)', color: 'white' }}
                      value={formData.date} onChange={(e) => { setFormData(p => ({ ...p, date: e.target.value })); }} />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-white/40 block mb-1.5">
                      {T('ملاحظات', 'Notes')}
                    </label>
                    <textarea rows={3} placeholder={T('أي تفاصيل إضافية...', 'Any additional details...')}
                      className="w-full rounded-2xl px-5 py-3.5 text-sm font-bold outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(197,160,89,0.25)', color: 'white' }}
                      value={formData.notes} onChange={(e) => { setFormData(p => ({ ...p, notes: e.target.value })); }} />
                  </div>
                  <button disabled={isSubmitting} type="submit"
                    className="w-full py-5 rounded-[1.5rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    style={{ background: '#c5a059', color: '#042f2e' }}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : T('تأكيد الطلب', 'Confirm Booking')}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
