'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useReciterStore } from '@/stores/reciter-store';
import { AVAILABLE_RECITERS, getReciterById, type Reciter } from '@/lib/quran/types';
import { GlassCard } from '@/components/ui/GlassCard';

interface ReciterSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export function ReciterSelector({ className = '', showLabel = true }: ReciterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { selectedReciterId, setReciter } = useReciterStore();

  const reciters: Reciter[] = AVAILABLE_RECITERS;
  const currentReciter = getReciterById(selectedReciterId) || reciters[0];

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
          closeDropdown();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeDropdown]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDropdown]);

  const handleSelectReciter = (reciter: Reciter) => {
    setReciter(reciter.id);
    closeDropdown();
  };

  const displayName = currentReciter.style
    ? `${currentReciter.nameArabic} (${currentReciter.style})`
    : currentReciter.nameArabic;

  // Check if mobile for bottom sheet behavior
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-xs text-quran-ivory-muted mb-1.5" htmlFor="reciter-select">
          🎙 القارئ
        </label>
      )}
      <button
        ref={buttonRef}
        id="reciter-select"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="اختيار القارئ"
        className="w-full min-h-[44px] glass rounded-xl px-4 py-2.5 text-sm text-quran-ivory text-right flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-quran-gold/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-quran-gold">🎙</span>
          <span className="font-medium truncate">{displayName}</span>
        </div>
        <span className="text-quran-gold flex-shrink-0 ml-2" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={closeDropdown}
              aria-hidden="true"
            />
          )}
          <div
            ref={dropdownRef}
            role="listbox"
            aria-label="قائمة القراء"
            className={`
              ${isMobile 
                ? 'fixed bottom-0 left-0 right-0 z-50 glass-strong rounded-t-2xl shadow-xl animate-slide-up max-h-[70vh]'
                : 'absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden shadow-lg animate-fade-in z-50'
              }
            `}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-quran-gold">اختر القارئ</h3>
            </div>
            
            <div className="max-h-60 overflow-y-auto" role="listbox">
              {reciters.map((reciter) => {
                const isSelected = reciter.id === selectedReciterId;
                const label = reciter.style
                  ? `${reciter.nameArabic} (${reciter.style})`
                  : reciter.nameArabic;
                return (
                  <button
                    key={reciter.id}
                    onClick={() => handleSelectReciter(reciter)}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={label}
                    className={`w-full min-h-[44px] px-4 py-3 text-sm text-right transition-colors flex items-center gap-3 ${
                      isSelected
                        ? 'bg-quran-gold/15 text-quran-gold'
                        : 'text-quran-ivory hover:bg-white/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-quran-emerald/50 flex items-center justify-center text-xs flex-shrink-0">
                      {isSelected ? '✓' : '🎙'}
                    </div>
                    <div className="flex-1 text-right">
                      <div className="font-medium">{reciter.nameArabic}</div>
                      {reciter.style && (
                        <div className="text-[10px] text-quran-ivory-muted">{reciter.style}</div>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-quran-gold text-xs">محدد</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
