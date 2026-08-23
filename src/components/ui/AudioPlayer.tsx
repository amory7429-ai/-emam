'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  url: string;
  label?: string;
  className?: string;
}

export function AudioPlayer({ url, label = 'تشغيل', className = '' }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      setIsLoading(false);
    });

    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });

    audio.addEventListener('error', () => {
      setIsPlaying(false);
      setIsLoading(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const stopPrevious = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, []);

  const handlePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    stopPrevious();
    setIsLoading(true);
    audioRef.current.src = url;

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch {
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [url, isPlaying, stopPrevious]);

  const handleReplay = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setProgress(0);
    if (!isPlaying) {
      handlePlay();
    }
  }, [isPlaying, handlePlay]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handlePlay}
        disabled={isLoading}
        className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm font-medium text-quran-gold hover:bg-white/8 active:scale-95 transition-all duration-200 disabled:opacity-50 min-w-[100px] justify-center"
      >
        {isLoading ? (
          <span className="animate-pulse">⏳</span>
        ) : isPlaying ? (
          <>
            <span>⏸</span>
            <span>إيقاف</span>
          </>
        ) : (
          <>
            <span>▶</span>
            <span>{label}</span>
          </>
        )}
      </button>

      {isPlaying && (
        <button
          onClick={handleReplay}
          className="glass rounded-lg px-3 py-2 text-sm text-quran-ivory-muted hover:text-quran-ivory transition-colors"
        >
          ↻ إعادة
        </button>
      )}

      {duration > 0 && (
        <span className="text-xs text-quran-olive tabular-nums">
          {formatTime(duration)}
        </span>
      )}

      {progress > 0 && (
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
          <div
            className="h-full bg-quran-gold/60 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
