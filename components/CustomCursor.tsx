
import React, { useEffect, useRef } from 'react';

/**
 * CustomCursor — single gradient glow that follows mouse directly (no lerp = no lag).
 * Tiny dot for precision + large soft radial glow for atmosphere.
 * Uses rAF + direct DOM mutation for 60fps with zero React re-renders.
 */
export const CustomCursor: React.FC = () => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef  = useRef({ x: -300, y: -300 });
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    // Direct follow — no lerp = no lag perception
    const animate = () => {
      const { x, y } = posRef.current;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
      }
      if (glowRef.current) {
        // offsetWidth tracks CSS transitions (glow expands on hover)
        const half = glowRef.current.offsetWidth / 2;
        glowRef.current.style.transform = `translate(${x - half}px, ${y - half}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const isBtn   = !!(t.closest('button') || t.closest('a') || t.tagName === 'BUTTON');
      const isInput = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT';

      if (!glowRef.current) return;
      glowRef.current.classList.remove('is-hover', 'is-text', 'is-click');

      if (isBtn)        glowRef.current.classList.add('is-hover');
      else if (isInput) glowRef.current.classList.add('is-text');
    };

    const onDown = () => {
      glowRef.current?.classList.remove('is-hover');
      glowRef.current?.classList.add('is-click');
    };

    const onUp = (e: MouseEvent) => {
      glowRef.current?.classList.remove('is-click');
      const t = e.target as HTMLElement;
      if (t.closest('button') || t.closest('a')) {
        glowRef.current?.classList.add('is-hover');
      }
    };

    const onLeave = () => {
      if (dotRef.current)  dotRef.current.style.opacity  = '0';
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };

    const onEnter = () => {
      if (dotRef.current)  dotRef.current.style.opacity  = '1';
      if (glowRef.current) glowRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove',    onMove,  { passive: true });
    window.addEventListener('mouseover',    onOver);
    window.addEventListener('mousedown',    onDown);
    window.addEventListener('mouseup',      onUp);
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="rx-cursor-dot"  aria-hidden="true" />
      <div ref={glowRef} className="rx-cursor-glow" aria-hidden="true" />
    </>
  );
};
