import { STATUS_COLORS, STATUS_LABELS } from './adminTypes';

export function StatusPill({ status }: { status: string }) {
  const c = (status in STATUS_COLORS)
    ? STATUS_COLORS[status as keyof typeof STATUS_COLORS]
    : STATUS_COLORS.PENDING_REVIEW;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {(status in STATUS_LABELS) ? STATUS_LABELS[status as keyof typeof STATUS_LABELS] : status}
    </span>
  );
}
