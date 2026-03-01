
import React, { useMemo } from 'react';

interface Particle {
  id: number;
  x: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  type: 'dot' | 'cross' | 'ring' | 'leaf';
  hue: string;
}

/**
 * ParticleBackground — immersive health-themed ambient layer.
 * Renders morphing orbs + floating geometric particles via pure CSS.
 * Zero JS animation loops — GPU-accelerated CSS only.
 */
export const ParticleBackground: React.FC = () => {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 5 + (i / 18) * 90 + (Math.sin(i * 2.3) * 4),
      size: 5 + (i % 5) * 3,
      delay: (i * 1.3) % 14,
      duration: 18 + (i % 7) * 4,
      opacity: 0.08 + (i % 4) * 0.06,
      type: (['dot','cross','ring','leaf'] as const)[i % 4],
      hue: i % 3 === 0 ? '#38F9D7' : i % 3 === 1 ? '#66D9C4' : '#A78BFA',
    }))
  , []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
      role="presentation"
    >
      {/* ── Ambient morphing orbs ─────────────────────────────── */}
      <div
        className="animate-morph"
        style={{
          position: 'absolute',
          width: 700, height: 700,
          top: '-18%', left: '-12%',
          background: 'radial-gradient(circle at 40% 40%, rgba(56,249,215,1) 0%, transparent 65%)',
          opacity: 'var(--orb-opacity)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="animate-morph animate-float-slow"
        style={{
          position: 'absolute',
          width: 550, height: 550,
          bottom: '-14%', right: '-8%',
          background: 'radial-gradient(circle at 60% 60%, rgba(167,139,250,1) 0%, transparent 65%)',
          opacity: 'var(--orb-opacity)',
          filter: 'blur(65px)',
          animationDelay: '5s, 3s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 420, height: 420,
          top: '35%', left: '45%',
          background: 'radial-gradient(circle at 50% 50%, rgba(96,165,250,1) 0%, transparent 65%)',
          opacity: 'var(--orb-opacity)',
          filter: 'blur(55px)',
          animation: 'morph-blob 22s ease-in-out 8s infinite',
        }}
      />

      {/* ── Floating particles ───────────────────────────────── */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            bottom: -30,
            width:  p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `particle-rise ${p.duration}s ${p.delay}s linear infinite`,
          }}
        >
          {p.type === 'dot' && (
            <div
              style={{
                width: '100%', height: '100%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${p.hue}, transparent)`,
              }}
            />
          )}
          {p.type === 'cross' && (
            <svg viewBox="0 0 10 10" fill={p.hue}>
              <rect x="4" y="0" width="2" height="10" rx="1" />
              <rect x="0" y="4" width="10" height="2" rx="1" />
            </svg>
          )}
          {p.type === 'ring' && (
            <svg viewBox="0 0 10 10" fill="none" stroke={p.hue} strokeWidth="1.5">
              <circle cx="5" cy="5" r="4" />
            </svg>
          )}
          {p.type === 'leaf' && (
            <svg viewBox="0 0 10 10" fill={p.hue}>
              <path d="M5 1 C8 1 9 4 9 5 C9 8 6 9 5 9 C4 9 1 8 1 5 C1 4 2 1 5 1Z" />
            </svg>
          )}
        </div>
      ))}

      {/* ── Subtle grid overlay ───────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(56,249,215,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,249,215,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};
