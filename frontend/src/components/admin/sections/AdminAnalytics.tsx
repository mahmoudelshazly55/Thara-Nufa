import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Activity, BarChart3 } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { type Booking, arabicService, STATUS_LABELS } from '../shared/adminTypes';

interface Props {
  bookings: Booking[];
}

export function AdminAnalytics({ bookings }: Props) {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [analyticsDate,   setAnalyticsDate]   = useState(() => new Date().toISOString().split('T')[0]);
  const [analyticsMonth,  setAnalyticsMonth]  = useState(() => new Date().getMonth());
  const [analyticsYear,   setAnalyticsYear]   = useState(() => new Date().getFullYear());

  const MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  const getFiltered = () => bookings.filter(b => {
    const d = new Date(b.createdAt);
    if (analyticsPeriod === 'day')   return d.toDateString() === new Date(analyticsDate).toDateString();
    if (analyticsPeriod === 'month') return d.getMonth() === analyticsMonth && d.getFullYear() === analyticsYear;
    return d.getFullYear() === analyticsYear;
  });

  const periodLabel = analyticsPeriod === 'day'
    ? analyticsDate
    : analyticsPeriod === 'month'
    ? `${MONTH_NAMES.at(analyticsMonth) ?? ''} ${analyticsYear}`
    : String(analyticsYear);

  const filtered = getFiltered();

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2024, i).toLocaleDateString('ar-SA', { month: 'short' }),
    count: bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getMonth() === i && d.getFullYear() === new Date().getFullYear();
    }).length,
  }));

  const pieData = [
    { name: 'مكتملة', value: bookings.filter(b => b.status === 'COMPLETED').length,    color: '#10b981' },
    { name: 'جارية',  value: bookings.filter(b => b.status === 'IN_PROGRESS').length,  color: '#8b5cf6' },
    { name: 'مؤكدة',  value: bookings.filter(b => b.status === 'CONFIRMED').length,    color: '#c5a059' },
    { name: 'انتظار', value: bookings.filter(b => b.status === 'PENDING_REVIEW').length, color: '#f59e0b' },
    { name: 'ملغاة',  value: bookings.filter(b => b.status === 'CANCELLED').length,    color: '#ef4444' },
  ].filter(d => d.value > 0);

  const exportReport = () => {
    const src = analyticsPeriod === 'day'
      ? bookings.filter(b => new Date(b.createdAt).toDateString() === new Date(analyticsDate).toDateString())
      : analyticsPeriod === 'month'
      ? bookings.filter(b => { const d = new Date(b.createdAt); return d.getMonth() === analyticsMonth && d.getFullYear() === analyticsYear; })
      : bookings.filter(b => new Date(b.createdAt).getFullYear() === analyticsYear);

    const rows = src.map(b => ({
      'رقم الطلب':  b.id.slice(0, 8).toUpperCase(),
      'الاسم':      b.name,
      'البريد':     b.email,
      'الهاتف':     b.phone,
      'الخدمة':     arabicService(b.serviceType),
      'تاريخ الخدمة': b.date,
      'الحالة':     STATUS_LABELS[b.status] ?? b.status,
      'تاريخ الطلب': new Date(b.createdAt).toLocaleDateString('ar-SA'),
    }));

    const fallback = { 'ملاحظة': 'لا توجد بيانات في هذه الفترة' };
    const dataRows = rows.length ? rows : [fallback];
    const headers = Object.keys(dataRows[0]);
    const csvRows = [
      headers.join(','),
      ...dataRows.map((r: Record<string, unknown>) =>
        Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير_ثرا_${periodLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div key="an" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
      {/* Period selector */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          {([{ v: 'day' as const, l: 'يوم محدد' }, { v: 'month' as const, l: 'شهر محدد' }, { v: 'year' as const, l: 'سنة محددة' }]).map(opt => (
            <button key={opt.v} onClick={() => { setAnalyticsPeriod(opt.v); }}
              className="px-3 py-2 rounded-xl text-xs font-black transition-all"
              style={{ background: analyticsPeriod === opt.v ? '#c5a059' : 'rgba(255,255,255,0.05)', color: analyticsPeriod === opt.v ? '#042f2e' : 'rgba(255,255,255,0.5)' }}>
              {opt.l}
            </button>
          ))}
          <div className="flex gap-2 mr-auto">
            <button onClick={exportReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95"
              style={{ background: 'rgba(197,160,89,0.12)', border: '1px solid rgba(197,160,89,0.3)', color: '#c5a059' }}>
              <Download size={11} /> تصدير CSV
            </button>
          </div>
        </div>

        {analyticsPeriod === 'day' && (
          <div className="flex items-center gap-3">
            <label className="text-white/40 text-xs font-bold shrink-0">اختر اليوم:</label>
            <input type="date" value={analyticsDate} onChange={e => { setAnalyticsDate(e.target.value); }}
              className="rounded-xl px-3 py-2 text-xs font-bold outline-none text-white [color-scheme:dark]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.3)' }} />
          </div>
        )}

        {analyticsPeriod === 'month' && (
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-white/40 text-xs font-bold shrink-0">اختر الشهر:</label>
            <select value={analyticsMonth} onChange={e => { setAnalyticsMonth(Number(e.target.value)); }}
              className="rounded-xl px-3 py-2 text-xs font-bold outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.3)' }}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i} style={{ background: '#042f2e' }}>{m}</option>)}
            </select>
            <select value={analyticsYear} onChange={e => { setAnalyticsYear(Number(e.target.value)); }}
              className="rounded-xl px-3 py-2 text-xs font-bold outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.3)' }}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y} style={{ background: '#042f2e' }}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {analyticsPeriod === 'year' && (
          <div className="flex items-center gap-3">
            <label className="text-white/40 text-xs font-bold shrink-0">اختر السنة:</label>
            <select value={analyticsYear} onChange={e => { setAnalyticsYear(Number(e.target.value)); }}
              className="rounded-xl px-3 py-2 text-xs font-bold outline-none text-white"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.3)' }}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y} style={{ background: '#042f2e' }}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Period KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: `طلبات ${periodLabel}`, value: filtered.length,                                color: '#c5a059' },
          { label: 'مكتملة',               value: filtered.filter(b => b.status === 'COMPLETED').length,   color: '#10b981' },
          { label: 'قيد التنفيذ',           value: filtered.filter(b => b.status === 'IN_PROGRESS').length, color: '#8b5cf6' },
          { label: 'ملغاة',                 value: filtered.filter(b => b.status === 'CANCELLED').length,   color: '#ef4444' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/40 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly trend */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.1)' }}>
        <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
          <Activity size={14} className="text-brand-gold-500" />
          الطلبات الشهرية ({new Date().getFullYear()})
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#c5a059" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#0a1f1e', border: '1px solid rgba(197,160,89,0.3)', borderRadius: 12, fontSize: 12, color: '#fff' }} />
            <Area type="monotone" dataKey="count" stroke="#c5a059" strokeWidth={2} fill="url(#ag)" name="طلب" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Status pie */}
      {pieData.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.1)' }}>
          <h3 className="text-white font-black text-sm mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-brand-gold-500" />
            توزيع الحالات (إجمالي)
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-white/60 text-xs flex-1">{d.name}</span>
                  <span className="text-white font-black text-xs">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
