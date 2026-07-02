import { motion } from 'motion/react';
import { Search, Eye, Trash2, MessageCircle } from 'lucide-react';
import { type Booking, arabicService, STATUS_COLORS } from '../shared/adminTypes';
import { StatusChanger } from '../shared/StatusChanger';

interface Props {
  bookings: Booking[];
  search: string;
  statusFilter: string;
  token: string;
  onSearchChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onViewDetail: (b: Booking) => void;
  onDelete: (id: string) => void;
  onUpdated: (b: Booking) => void;
}

export function AdminBookings({ bookings, search, statusFilter, token, onSearchChange, onStatusFilterChange, onViewDetail, onDelete, onUpdated }: Props) {
  return (
    <motion.div key="bk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {/* Status Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
        {[
          { v: '',               l: 'الكل',      count: bookings.length },
          { v: 'PENDING_REVIEW', l: '⏳ انتظار', count: bookings.filter(b => b.status === 'PENDING_REVIEW').length },
          { v: 'UNDER_REVIEW',   l: '🔍 تواصل',  count: bookings.filter(b => b.status === 'UNDER_REVIEW').length },
          { v: 'CONFIRMED',      l: '✅ مؤكد',   count: bookings.filter(b => b.status === 'CONFIRMED').length },
          { v: 'IN_PROGRESS',    l: '⚙️ تنفيذ',  count: bookings.filter(b => b.status === 'IN_PROGRESS').length },
          { v: 'COMPLETED',      l: '🎉 مكتمل',  count: bookings.filter(b => b.status === 'COMPLETED').length },
          { v: 'CANCELLED',      l: '❌ ملغي',   count: bookings.filter(b => b.status === 'CANCELLED').length },
        ].map(tab => (
          <button key={tab.v} onClick={() => { onStatusFilterChange(tab.v); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0"
            style={{
              background: statusFilter === tab.v ? '#c5a059' : 'rgba(255,255,255,0.05)',
              color: statusFilter === tab.v ? '#042f2e' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${statusFilter === tab.v ? '#c5a059' : 'rgba(255,255,255,0.08)'}`,
            }}>
            {tab.l}
            {tab.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: statusFilter === tab.v ? 'rgba(4,47,46,0.3)' : 'rgba(197,160,89,0.2)', color: statusFilter === tab.v ? '#042f2e' : '#c5a059' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => { onSearchChange(e.target.value); }}
            placeholder="بحث برقم الطلب أو الاسم أو الخدمة..."
            className="w-full rounded-2xl pr-9 pl-4 py-2.5 text-sm outline-none text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(197,160,89,0.15)' }} />
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">لا توجد طلبات</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b, idx) => {
            const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.PENDING_REVIEW;
            return (
              <motion.div key={b.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                className={`rounded-2xl border p-4 ${sc.bg} ${sc.border}`}>
                {/* Row 1: ID + name + actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-brand-gold-500/60 text-[10px] font-black font-mono shrink-0">#{b.id.slice(0,8).toUpperCase()}</span>
                    <div className="min-w-0">
                      <p className="text-white font-black text-sm">{b.name}</p>
                      <p className="text-white/35 text-xs truncate">{b.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={`https://wa.me/${b.phone.replace(/[^0-9]/g,'').replace(/^0/,'966')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-xl transition-colors hover:bg-white/5"
                      style={{ color: '#25d366' }} title="واتساب">
                      <MessageCircle size={15} />
                    </a>
                    <button onClick={() => { onViewDetail(b); }} className="p-2 text-white/30 hover:text-brand-gold-500 transition-colors rounded-xl hover:bg-white/5"><Eye size={15} /></button>
                    <button onClick={() => { onDelete(b.id); }} className="p-2 text-white/30 hover:text-red-400 transition-colors rounded-xl hover:bg-white/5"><Trash2 size={15} /></button>
                  </div>
                </div>
                {/* Row 2: service + date + phone */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-white/50">
                  <span className="font-bold text-white/70">{arabicService(b.serviceType)}</span>
                  <span>{b.date}</span>
                  <span>{b.phone}</span>
                </div>
                {/* Row 3: Status changer */}
                <div className="flex items-center gap-3">
                  <span className="text-white/40 text-xs font-bold shrink-0">تغيير الحالة:</span>
                  <StatusChanger booking={b} token={token} onUpdated={onUpdated} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
