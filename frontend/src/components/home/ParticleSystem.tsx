import { useMemo, type CSSProperties } from 'react';

type ParticleStyle = CSSProperties & { '--duration': string; '--drift': string };

export const ParticleSystem = () => {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i, left: `${(i * 5.5) % 100}%`,
    duration: `${15 + (i * 1.3) % 12}s`, drift: `${((i % 5) - 2) * 80}px`,
    w: `${2 + (i % 3)}px`,
  })), []);
  return (
    <div className="particles-shimmer">
      {particles.map(p => (
        <div key={p.id} className="particle"
          style={{ left: p.left, '--duration': p.duration, '--drift': p.drift, width: p.w, height: p.w } as ParticleStyle} />
      ))}
    </div>
  );
};

