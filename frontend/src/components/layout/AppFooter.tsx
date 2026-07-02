import { motion } from "motion/react";
import logoImg from "../../assets/logo.png";
import { BRAND_NAME } from "../../constants";

interface Props { lang: string; }

export function AppFooter({ lang }: Props) {
  const t = (ar: string, en: string) => lang==="ar" ? ar : en;
  return (
    <footer dir={lang==="ar"?"rtl":"ltr"} style={{ background: "#010b0a", borderTop: "1px solid rgba(197,160,89,0.1)" }} className="pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 overflow-hidden"><img src={logoImg} alt={lang === 'ar' ? BRAND_NAME.ar : BRAND_NAME.en} className="w-full h-full object-contain" /></div>
              <span className="text-xl font-black text-white">{lang === 'ar' ? BRAND_NAME.ar : BRAND_NAME.en}</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">{t("منصة رقمية متكاملة لإدارة حجوزات العملاء ومتابعة تنفيذ الخدمات في الوقت الفعلي","An integrated digital platform for managing customer bookings and tracking service execution in real-time.")}</p>
          </div>
          {/* Services */}
          <div>
            <h4 className="text-brand-gold-500 font-black text-sm uppercase tracking-widest mb-5">{t("خدماتنا","Services")}</h4>
            <ul className="space-y-2.5">
              {[t("خدمات الإنشاءات","Construction"),t("خدمات المقاولات","Contracting"),t("خدمات النقل","Transportation"),t("خدمة العملاء","Customer Care"),t("خدمات التدريب","Training"),t("الخدمات الاستشارية","Consulting")].map((s,i) => (
                <li key={i} className="text-white/40 text-sm hover:text-brand-gold-500 transition-colors cursor-pointer">{s}</li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="text-brand-gold-500 font-black text-sm uppercase tracking-widest mb-5">{t("تواصل معنا","Contact Us")}</h4>
            <div className="space-y-3">
              {[
                { icon:"📍", label: t("مكة المكرمة، شارع محمد ياسين الفادانى","Makkah, Muhammad Yasin Al-Fadani St.") },
                { icon:"📧", label: "ceo@tharanufa.sa", href: "mailto:ceo@tharanufa.sa" },
                { icon:"📞", label: "+966 53 255 0332", href: "tel:+966532550332" },
              ].map((c,i) => (
                <a key={i} href={c.href} className="flex items-center gap-3 text-white/40 hover:text-brand-gold-500 transition-colors group">
                  <span className="text-base">{c.icon}</span>
                  <span className="text-sm font-bold" dir="ltr">{c.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">{t("© ٢٠٢٦ ثرا نوفا. جميع الحقوق محفوظة.","© 2026 Thara Nufa. All rights reserved.")}</p>
          <p className="text-white/15 text-xs">{t("صُنع بـ ❤ في المملكة العربية السعودية","Made with ❤ in Saudi Arabia")}</p>
        </div>
      </div>
    </footer>
  );
}
