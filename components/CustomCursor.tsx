
import React, { useEffect, useRef } from 'react';

/**
 * CustomCursor — context-aware morphing cursor.
 * Uses rAF + direct DOM mutation (no React re-renders) for 60fps performance.
 */
export const CustomCursor: React.FC = () => {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef  = useRef({ x: -200, y: -200 });
  const trailRef = useRef({ x: -200, y: -200 });
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    // RAF animation loop — lerp the ring toward the dot
    const animate = () => {
      trailRef.current.x += (posRef.current.x - trailRef.current.x) * 0.11;
      trailRef.current.y += (posRef.current.y - trailRef.current.y) * 0.11;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(${posRef.current.x - 3}px, ${posRef.current.y - 3}px)`;
      }

      if (ringRef.current) {
        const halfW = ringRef.current.offsetWidth  / 2;
        const halfH = ringRef.current.offsetHeight / 2;
        ringRef.current.style.transform =
          `translate(${trailRef.current.x - halfW}px, ${trailRef.current.y - halfH}px)`;
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

      if (!ringRef.current) return;
      ringRef.current.classList.remove('is-hover', 'is-text', 'is-click');

      if (isBtn)        ringRef.current.classList.add('is-hover');
      else if (isInput) ringRef.current.classList.add('is-text');
    };

    const onDown = () => {
      ringRef.current?.classList.remove('is-hover');
      ringRef.current?.classList.add('is-click');
    };

    const onUp = (e: MouseEvent) => {
      ringRef.current?.classList.remove('is-click');
      const t = e.target as HTMLElement;
      if (t.closest('button') || t.closest('a')) {
        ringRef.current?.classList.add('is-hover');
      }
    };

    const onLeave = () => {
      if (dotRef.current)  dotRef.current.style.opacity  = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const onEnter = () => {
      if (dotRef.current)  dotRef.current.style.opacity  = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
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
      <div ref={ringRef} className="rx-cursor-ring" aria-hidden="true" />
    </>
  );
};
