import { useState } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';
import { type SiteUser } from '../shared/adminTypes';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// ─── InlineBroadcast (embedded form, no modal) ────────────────────────────────
function InlineBroadcast({ token, users }: { token: string; users: SiteUser[] }) {
  const [targetMode, setTargetMode] = useState<'all' | 'multi' | 'one'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const toggleId = (id: string) => { setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); };

  const send = async () => {
    if (!title.trim() || !message.trim()) return;
    setLoading(true); setResult(null);
    try {
      const targets = targetMode === 'all' ? [{}] : selectedIds.map(uid => ({ userId: uid }));
      let total = 0;
      for (const extra of targets) {
        const r = await fetch(`${API_URL}/notifications/broadcast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title, message, ...extra }),
        });
        const d = await r.json();
        if (d.success) total += d.count || 1;
      }
      setResult({ ok: true, msg: `تم الإرسال بنجاح إلى ${total} مستخدم` });
      setTitle(''); setMessage(''); setSelectedIds([]);
    } catch {
      setResult({ ok: false, msg: 'حدث خطأ أثناء الإرسال' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <p className="text-white/50 text-xs font-bold mb-2">المستلمون</p>
        <div className="flex gap-2">
          {[{ v: 'all' as const, l: 'الجميع' }, { v: 'multi' as const, l: 'عدة مستخدمين' }, { v: 'one' as const, l: 'مستخدم واحد' }].map(opt => (
            <button key={opt.v} onClick={() => { setTargetMode(opt.v); setSelectedIds([]); }}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: targetMode === opt.v ? '#c5a059' : 'rgba(255,255,255,0.05)', color: targetMode === opt.v ? '#042f2e' : 'rgba(255,255,255,0.5)' }}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {(targetMode === 'one' || targetMode === 'multi') && (
        <div className="max-h-44 overflow-y-auto rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,160,89,0.15)' }}>
          {users.map(u => (
            <label key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0">
              <input type={targetMode === 'multi' ? 'checkbox' : 'radio'} name="bc-user"
                checked={selectedIds.includes(u.id)}
                onChange={() => { if (targetMode === 'multi') { toggleId(u.id); } else { setSelectedIds([u.id]); } }}
                className="accent-brand-gold-500" />
              <div className="min-w-0">
                <p className="text-white font-bold text-sm">{u.name}</p>
                <p className="text-white/35 text-xs truncate">{u.email}</p>
              </div>
            </label>
          ))}
          {users.length === 0 && <p className="text-center text-white/30 text-sm py-4">لا يوجد مستخدمون</p>}
        </div>
      )}

      <div>
        <p className="text-white/50 text-xs font-bold mb-1.5">عنوان الإشعار</p>
        <input value={title} onChange={(e) => { setTitle(e.target.value); }} placeholder="اكتب العنوان هنا..."
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)' }} />
      </div>

      <div>
        <p className="text-white/50 text-xs font-bold mb-1.5">نص الإشعار</p>
        <textarea rows={3} value={message} onChange={(e) => { setMessage(e.target.value); }} placeholder="اكتب نص الإشعار هنا..."
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none resize-none text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(197,160,89,0.2)' }} />
      </div>

      {result && (
        <div className={`px-4 py-3 rounded-2xl text-sm font-bold text-center ${result.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/10 text-red-400 border border-red-500/25'}`}>
          {result.msg}
        </div>
      )}

      <button onClick={() => { void send(); }}
        disabled={loading || !title.trim() || !message.trim() || (targetMode !== 'all' && selectedIds.length === 0)}
        className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition-all"
        style={{ background: '#c5a059', color: '#042f2e' }}>
        {loading
          ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-brand-green-900/30 border-t-brand-green-900 rounded-full" />
          : <><Send size={15} /><span>إرسال الإشعار</span></>}
      </button>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
interface Props {
  token: string;
  users: SiteUser[];
}

export function AdminNotifications({ token, users }: Props) {
  return (
    <motion.div key="nt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.15)' }}>
        <InlineBroadcast token={token} users={users} />
      </div>
    </motion.div>
  );
}
