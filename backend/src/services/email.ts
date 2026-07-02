import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// ── HTML escape — prevents injection of user-supplied values into email HTML ──
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Singleton transporter — created once, reused for all emails ───────────────
let _transporter: Transporter | null = null;
function getTransporter(): Transporter {
  if (_transporter) return _transporter;
  if (process.env.EMAIL_HOST) {
    _transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } else {
    // Fallback: Gmail with app password
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return _transporter;
}

const FROM = process.env.EMAIL_FROM || `"ثرا نوفا" <${process.env.EMAIL_USER}>`;

// ── Send booking confirmation email ───────────────────────────────────────────
export async function sendBookingConfirmation(to: string, opts: {
  name: string; service: string; date: string; bookingId: string;
}): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const name      = escapeHtml(opts.name);
  const service   = escapeHtml(opts.service);
  const date      = escapeHtml(opts.date);
  const bookingId = escapeHtml(opts.bookingId.slice(0, 8).toUpperCase());
  try {
    await getTransporter().sendMail({
      from: FROM, to,
      subject: `✅ تأكيد طلبك — ثرا نوفا`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#020e0d;color:#fff;padding:32px;border-radius:16px">
          <div style="text-align:center;margin-bottom:24px">
            <h2 style="color:#c5a059;margin:0">ثرا نوفا</h2>
            <p style="color:#94a3b8;margin:4px 0">تم استلام طلبك بنجاح</p>
          </div>
          <div style="background:#0a1f1e;border:1px solid rgba(197,160,89,0.2);border-radius:12px;padding:20px;margin-bottom:20px">
            <p style="margin:0 0 8px 0">مرحباً <strong style="color:#c5a059">${name}</strong>،</p>
            <p style="color:#94a3b8;margin:0">شكراً لتواصلك مع ثرا نوفا. تم استلام طلبك وسيتواصل معك فريقنا خلال ٢٤ ساعة.</p>
          </div>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#94a3b8">رقم الطلب</td><td style="color:#c5a059;font-weight:bold;font-family:monospace">${bookingId}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8">الخدمة</td><td style="color:#fff">${service}</td></tr>
            <tr><td style="padding:8px 0;color:#94a3b8">التاريخ</td><td style="color:#fff">${date}</td></tr>
          </table>
          <hr style="border-color:rgba(255,255,255,0.1);margin:20px 0"/>
          <p style="color:#475569;font-size:12px;text-align:center">مكة المكرمة، شارع محمد ياسين الفادانى | ceo@tharanufa.sa | +966 53 255 0332</p>
        </div>`,
    });
  } catch (err) {
    console.error('[Email] Failed to send booking confirmation:', err);
  }
}

// ── Send password reset OTP ───────────────────────────────────────────────────
export async function sendPasswordResetOTP(to: string, otp: string, name: string): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const safeName = escapeHtml(name);
  const safeOtp  = escapeHtml(otp);
  try {
    await getTransporter().sendMail({
      from: FROM, to,
      subject: `🔐 رمز إعادة تعيين كلمة المرور — ثرا نوفا`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#020e0d;color:#fff;padding:32px;border-radius:16px">
          <h2 style="color:#c5a059;text-align:center">إعادة تعيين كلمة المرور</h2>
          <p>مرحباً <strong style="color:#c5a059">${safeName}</strong>،</p>
          <p style="color:#94a3b8">استخدم الرمز التالي لإعادة تعيين كلمة مرورك. الرمز صالح لمدة <strong>١٠ دقائق</strong> فقط.</p>
          <div style="background:#0a1f1e;border:2px solid #c5a059;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <span style="font-size:36px;font-weight:bold;color:#c5a059;letter-spacing:8px;font-family:monospace">${safeOtp}</span>
          </div>
          <p style="color:#ef4444;font-size:13px">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
        </div>`,
    });
  } catch (err) {
    console.error('[Email] Failed to send OTP:', err);
  }
}

// ── Status label maps ─────────────────────────────────────────────────────────
const STATUS_LABELS_AR: Record<string, string> = {
  PENDING_REVIEW: 'قيد المراجعة', UNDER_REVIEW: 'تحت المراجعة',
  CONFIRMED: 'تم التأكيد',        IN_PROGRESS: 'جاري التنفيذ',
  COMPLETED: 'مكتمل',             CANCELLED: 'ملغي',
};
const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#10b981', IN_PROGRESS: '#c5a059', COMPLETED: '#22c55e', CANCELLED: '#ef4444',
  PENDING_REVIEW: '#f59e0b', UNDER_REVIEW: '#8b5cf6',
};

// ── Send status change email ──────────────────────────────────────────────────
export async function sendStatusUpdate(to: string, opts: {
  name: string; service: string; status: string; bookingId: string;
}): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  const name      = escapeHtml(opts.name);
  const service   = escapeHtml(opts.service);
  const bookingId = escapeHtml(opts.bookingId.slice(0, 8).toUpperCase());
  const label = escapeHtml(STATUS_LABELS_AR[opts.status] || opts.status);
  const color = STATUS_COLORS[opts.status] || '#c5a059';
  try {
    await getTransporter().sendMail({
      from: FROM, to,
      subject: `🔔 تحديث حالة طلبك — ${label}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#020e0d;color:#fff;padding:32px;border-radius:16px">
          <h2 style="color:#c5a059;text-align:center;margin-bottom:4px">ثرا نوفا</h2>
          <p style="color:#94a3b8;text-align:center;margin-bottom:24px;font-size:13px">تحديث حالة طلبك</p>
          <div style="background:#0a1f1e;border:1px solid rgba(197,160,89,0.2);border-radius:12px;padding:20px;margin-bottom:20px">
            <p>مرحباً <strong style="color:#c5a059">${name}</strong>،</p>
            <p style="color:#94a3b8">تم تحديث حالة طلبك للخدمة <strong style="color:#fff">${service}</strong> إلى:</p>
            <div style="background:${color}20;border:1px solid ${color}40;border-radius:8px;padding:12px 20px;margin-top:12px;text-align:center">
              <span style="color:${color};font-weight:bold;font-size:18px">${label}</span>
            </div>
          </div>
          <p style="color:#475569;font-size:11px">رقم الطلب: <code style="color:#c5a059">${bookingId}</code></p>
          <hr style="border-color:rgba(255,255,255,0.1);margin:20px 0"/>
          <p style="color:#475569;font-size:12px;text-align:center">مكة المكرمة | ceo@tharanufa.sa | +966 53 255 0332</p>
        </div>`,
    });
  } catch (err) {
    console.error('[Email] Failed to send status update:', err);
  }
}
