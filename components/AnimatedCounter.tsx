
import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * AnimatedCounter — smooth ease-out count-up animation.
 * Re-triggers whenever `value` changes.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1600,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [display, setDisplay] = useState(0);
  const startRef  = useRef<number | null>(null);
  const fromRef   = useRef(0);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed  = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromRef.current + (value - fromRef.current) * eased;

      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = display.toFixed(decimals);

  return <>{prefix}{Number(formatted).toLocaleString()}{suffix}</>;
};
