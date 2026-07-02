import { motion } from "motion/react";

function Pulse({ className }: { className: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={`rounded-xl ${className}`}
      style={{ background: "rgba(255,255,255,0.06)" }}
    />
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 p-4 space-y-3" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center gap-3">
        <Pulse className="w-10 h-10 shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-3/4" />
          <Pulse className="h-3 w-1/2" />
        </div>
        <Pulse className="h-6 w-20 shrink-0" />
      </div>
      <Pulse className="h-3 w-1/3" />
      <div className="pt-3 border-t border-white/8">
        <div className="flex items-center gap-2 justify-between">
          {[1,2,3,4,5].map(i => <Pulse key={i} className="w-8 h-8 rounded-full" />)}
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="p-4 rounded-2xl border border-white/8 flex gap-3 items-start" style={{ background: "rgba(255,255,255,0.03)" }}>
      <Pulse className="w-9 h-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3.5 w-2/3" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-2.5 w-1/4" />
      </div>
    </div>
  );
}

export function AdminBookingRowSkeleton() {
  return (
    <div className="rounded-2xl border border-white/8 p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.03)" }}>
      <Pulse className="h-3 w-20 shrink-0" />
      <Pulse className="h-4 flex-1" />
      <Pulse className="h-6 w-16 shrink-0" />
      <Pulse className="h-3 w-24 shrink-0" />
    </div>
  );
}
