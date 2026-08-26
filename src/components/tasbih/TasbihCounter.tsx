'use client';

import { useState, useCallback } from 'react';

interface TasbihCounterProps {
  initialCount?: number;
  label?: string;
  onCountChange?: (count: number) => void;
}

export default function TasbihCounter({ initialCount = 0, label = 'تسبيح', onCountChange }: TasbihCounterProps) {
  const [count, setCount] = useState(initialCount);

  const increment = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange?.(newCount);
  }, [count, onCountChange]);

  const reset = useCallback(() => {
    setCount(0);
    onCountChange?.(0);
  }, [onCountChange]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-ivory/70 text-sm font-medium tracking-wider uppercase">{label}</p>

      <button
        onClick={increment}
        className="w-44 h-44 rounded-full border-4 border-gold/40 bg-emerald-dark/40 
          flex items-center justify-center cursor-pointer select-none
          active:scale-95 transition-transform duration-150
          shadow-[0_0_40px_rgba(198,161,91,0.25)] hover:shadow-[0_0_50px_rgba(198,161,91,0.4)]
          focus:outline-none focus:ring-4 focus:ring-gold/50"
        aria-label={`${label} - اضغط للتسبيح`}
      >
        <span className="text-7xl font-bold text-gold font-amiri select-none pointer-events-none">
          {count}
        </span>
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl border border-ivory/20 bg-emerald-dark/30 
            text-ivory/80 text-sm font-medium
            hover:bg-emerald-dark/50 hover:border-ivory/30 transition-colors"
        >
          إعادة
        </button>
      </div>
    </div>
  );
}
