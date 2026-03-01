
import React, { useRef, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  shine?: boolean;
  onClick?: () => void;
}

/**
 * TiltCard — 3D perspective tilt effect with a dynamic specular shine.
 * Uses direct style mutation on mousemove for smooth 60fps performance.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  intensity = 12,
  shine = true,
  onClick,
}) => {
  const cardRef  = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;   // 0–1
      const y = (e.clientY - rect.top)  / rect.height;  // 0–1

      const rotX = (y - 0.5) * -intensity;
      const rotY = (x - 0.5) *  intensity;

      cardRef.current.style.transform =
        `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;

      if (shine && shineRef.current) {
        shineRef.current.style.background =
          `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.22) 0%, transparent 65%)`;
        shineRef.current.style.opacity = '1';
      }
    });
  };

  const handleMouseLeave = () => {
    cancelAnimationFrame(rafRef.current);
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
    if (shineRef.current) {
      shineRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`tilt-card ${className}`}
      style={{ transition: 'transform 0.18s ease, box-shadow 0.3s ease' }}
    >
      {shine && (
        <div
          ref={shineRef}
          className="card-shine"
          style={{ opacity: 0, transition: 'opacity 0.35s ease' }}
        />
      )}
      {children}
    </div>
  );
};
