
import React, { useRef, ReactNode, CSSProperties } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: number;
  shine?: boolean;
  onClick?: () => void;
}

/**
 * TiltCard — enhanced 3D perspective tilt with tilt-responsive floating shadow.
 * Shadow offsets opposite to tilt direction, simulating a real overhead light source.
 * Uses direct style mutation on rAF for smooth 60fps performance.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  style,
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

      // Shadow shifts opposite to tilt — simulates overhead directional light
      const shadowX =  rotY * 2.5;
      const shadowY = -rotX * 2.5;

      cardRef.current.style.transform =
        `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04) translateZ(12px)`;

      cardRef.current.style.boxShadow =
        `${shadowX}px ${shadowY + 35}px 90px -20px rgba(0,0,0,0.4),
         0 0 60px rgba(56,249,215,0.18),
         0 0 0 1px rgba(56,249,215,0.25),
         inset 0 1px 0 rgba(255,255,255,0.12)`;

      if (shine && shineRef.current) {
        shineRef.current.style.background =
          `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.28) 0%, rgba(56,249,215,0.06) 40%, transparent 70%)`;
        shineRef.current.style.opacity = '1';
      }
    });
  };

  const handleMouseLeave = () => {
    cancelAnimationFrame(rafRef.current);
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)';
      cardRef.current.style.boxShadow = '';
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
      style={{
        transition: 'transform 0.2s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease',
        ...style,
      }}
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
