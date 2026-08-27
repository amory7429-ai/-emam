'use client';

import { useCallback } from 'react';
import { useAdhkarCounter } from '@/stores/adhkar-counter-store';

interface DhikrCounterProps {
  dhikrId: string;
  target: number;
  label?: string;
}

export function DhikrCounter({ dhikrId, target, label }: DhikrCounterProps) {
  const { increment, reset, getCount } = useAdhkarCounter();
  const current = getCount(dhikrId);
  const isComplete = current.count >= target;
  const progress = target > 0 ? Math.min((current.count / target) * 100, 100) : 0;

  const handleTap = useCallback(() => {
    if (!isComplete) {
      increment(dhikrId, target);
    }
  }, [dhikrId, target, isComplete, increment]);

  const handleReset = useCallback(() => {
    reset(dhikrId);
  }, [dhikrId, reset]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTap();
    }
  }, [handleTap]);

  return (
    <div className="mt-3">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-[11px] mb-1.5">
        <span className="text-quran-ivory-muted">
          {label || 'التقدم'}
        </span>
        <span className={`font-bold ${isComplete ? 'text-quran-emerald-light' : 'text-quran-gold'}`}>
          {current.count} / {target}
        </span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete ? 'bg-quran-emerald-light' : 'bg-quran-gold/60'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {isComplete ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-quran-emerald-light text-sm font-bold">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            تم ✓
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-quran-ivory-muted hover:text-quran-ivory transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            إعادة العد
          </button>
        </div>
      ) : (
        <button
          onClick={handleTap}
          onKeyDown={handleKeyDown}
          role="button"
          aria-label={`عد ${target - current.count} مرات متبقية`}
          className="w-full min-h-[52px] bg-quran-emerald hover:bg-quran-emerald-light text-quran-gold font-bold rounded-xl py-3 text-lg transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-quran-gold select-none"
        >
          +1
        </button>
      )}
    </div>
  );
}
