import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Eye, Key, Trash2, MessageCircle } from 'lucide-react';
import { type SiteUser, fmtDate } from '../shared/adminTypes';

interface Props {
  users: SiteUser[];
  token: string;
  onViewUser: (u: SiteUser) => void;
  onResetPw: (u: SiteUser) => void;
  onDelete: (id: string) => void;
}

export function AdminUsers({ users, onViewUser, onResetPw, onDelete }: Props) {
  const [userSearch, setUserSearch] = useState('');

  const filtered = users.filter(u =>
    !userSearch ||
    u.name.includes(userSearch) ||
    u.email.includes(userSearch) ||
    (u.phone || '').includes(userSearch)
  );

  return (
    <motion.div key="us" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="relative mb-4">
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          placeholder="بحث بالاسم أو البريد أو الهاتف..."
          onChange={(e) => { setUserSearch(e.target.value); }}
          className="w-full rounded-2xl pr-9 pl-4 py-2.5 text-sm outline-none text-white"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(197,160,89,0.15)' }}
        />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,160,89,0.1)' }}>
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-white font-black text-sm">{filtered.length} مستخدم</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['المستخدم', 'الهاتف', 'الطلبات', 'تاريخ التسجيل', ''].map(h => (
                  <th key={h} className="text-right px-4 py-3 text-xs text-white/30 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-bold text-sm">{u.name}</p>
                    <p className="text-white/30 text-xs">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/45 text-xs">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-gold-500/15 text-brand-gold-500">{u._count.bookings}</span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">{fmtDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {u.phone && (
                        <a href={`https://wa.me/${u.phone.replace(/[^0-9]/g,'').replace(/^0/,'966')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded-xl transition-colors hover:bg-white/5" style={{ color: '#25d366' }} title="واتساب">
                          <MessageCircle size={14} />
                        </a>
                      )}
                      <button onClick={() => { onViewUser(u); }} className="p-1.5 text-white/20 hover:text-brand-gold-500 transition-colors rounded-xl hover:bg-white/5" title="عرض التفاصيل"><Eye size={14} /></button>
                      <button onClick={() => { onResetPw(u); }} className="p-1.5 text-white/20 hover:text-brand-gold-500 transition-colors" title="إعادة تعيين كلمة المرور"><Key size={14} /></button>
                      <button onClick={() => { onDelete(u.id); }} className="p-1.5 text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
