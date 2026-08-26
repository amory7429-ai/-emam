// Multi-ayah audio engine
// Sequential ayah playback with honest timing
//
// WORD TIMING: The Quran Foundation public API does NOT provide word-level
// timing segments for the Alafasy recitation. We only have:
// - Verse-level audio files (real duration from loaded metadata)
// - Word-level text positions (no timing)
//
// Therefore: We provide VERSE-LEVEL synchronization only.
// We do NOT fake word-level timing.
//
// OPTIMIZATION: Audio durations are measured lazily as verses are played,
// not preloaded upfront. This avoids blocking for 10+ seconds on long surahs.

import type { VerseWithWords } from '../quran/types';

export interface AudioEngineState {
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  currentAyahIndex: number;
  currentTimeMs: number;
  totalDurationMs: number;
  error: string | null;
  /** Indicates whether word-level timing is real (segments) or unavailable */
  hasWordTiming: boolean;
}

type StateListener = (state: AudioEngineState) => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private verses: VerseWithWords[] = [];
  private audioUrls: string[] = [];
  private ayahDurations: Map<number, number> = new Map();
  private cumulativeOffsets: number[] = [];
  private updateTimer: number | null = null;
  private durationMeasureQueue: Set<number> = new Set();
  private measuringDurations = false;
  private audioCache: Map<string, string> = new Map();

  private state: AudioEngineState = {
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    currentAyahIndex: 0,
    currentTimeMs: 0,
    totalDurationMs: 0,
    error: null,
    hasWordTiming: false,
  };

  private listeners: Set<StateListener> = new Set();

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snapshot = { ...this.state };
    this.listeners.forEach(l => l(snapshot));
  }

  private setState(partial: Partial<AudioEngineState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  async load(verses: VerseWithWords[], audioUrls: string[]): Promise<void> {
    this.stop();
    this.verses = verses;
    this.audioUrls = audioUrls;
    this.ayahDurations.clear();
    this.cumulativeOffsets = new Array(audioUrls.length).fill(0);
    this.durationMeasureQueue.clear();

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'none';
      this.audio.addEventListener('ended', this.handleEnded);
      this.audio.addEventListener('error', this.handleError);
    }

    // Estimate total duration based on average verse length (3-5 seconds)
    // This gives a reasonable initial estimate without blocking
    const estimatedDuration = audioUrls.length * 4000;

    this.setState({
      totalDurationMs: estimatedDuration,
      currentAyahIndex: 0,
      currentTimeMs: 0,
      isComplete: false,
      error: null,
      hasWordTiming: false,
    });

    // Start measuring durations in background (non-blocking)
    this.measureDurationsInBackground();
  }

  private async measureDurationsInBackground() {
    if (this.measuringDurations) return;
    this.measuringDurations = true;

    // Measure durations for upcoming verses (next 5)
    const startIdx = Math.max(0, this.state.currentAyahIndex);
    const endIdx = Math.min(this.audioUrls.length, startIdx + 5);

    for (let i = startIdx; i < endIdx; i++) {
      if (!this.ayahDurations.has(i)) {
        const duration = await this.measureSingleDuration(i);
        this.ayahDurations.set(i, duration);
        this.recalculateOffsets();
      }
    }

    this.measuringDurations = false;
  }

  private async measureSingleDuration(index: number): Promise<number> {
    if (index < 0 || index >= this.audioUrls.length) return 4000;

    return new Promise<number>((resolve) => {
      const temp = new Audio();
      temp.preload = 'auto';
      const timeout = setTimeout(() => {
        resolve(4000);
      }, 5000);

      temp.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
        resolve(temp.duration * 1000);
      }, { once: true });

      temp.addEventListener('error', () => {
        clearTimeout(timeout);
        resolve(4000);
      }, { once: true });

      temp.src = this.audioUrls[index];
    });
  }

  private recalculateOffsets() {
    let totalMs = 0;
    for (let i = 0; i < this.audioUrls.length; i++) {
      this.cumulativeOffsets[i] = totalMs;
      totalMs += this.ayahDurations.get(i) || 4000;
    }
    this.setState({ totalDurationMs: totalMs });
  }

  private handleEnded = () => {
    const next = this.state.currentAyahIndex + 1;
    if (next < this.audioUrls.length) {
      this.playAyah(next);
    } else {
      this.setState({ isPlaying: false, isComplete: true });
    }
  };

  private handleError = () => {
    const next = this.state.currentAyahIndex + 1;
    if (next < this.audioUrls.length) {
      this.playAyah(next);
    } else {
      this.setState({ isPlaying: false, error: 'خطأ في تحميل الصوت' });
    }
  };

  async play(): Promise<void> {
    if (this.state.isComplete) {
      this.setState({ isComplete: false, currentAyahIndex: 0, currentTimeMs: 0 });
    }
    await this.playAyah(this.state.currentAyahIndex);
  }

  private async playAyah(index: number): Promise<void> {
    if (!this.audio || index >= this.audioUrls.length) return;

    this.setState({ currentAyahIndex: index });
    this.audio.src = this.audioUrls[index];

    try {
      await this.audio.play();
      this.setState({ isPlaying: true, isPaused: false, error: null });
      this.startUpdateLoop();
      
      // Ensure durations are measured for upcoming verses
      this.measureDurationsInBackground();
    } catch {
      const next = index + 1;
      if (next < this.audioUrls.length) {
        this.playAyah(next);
      } else {
        this.setState({ isPlaying: false, error: 'لا يمكن تشغيل الصوت' });
      }
    }
  }

  private startUpdateLoop() {
    this.stopUpdateLoop();
    this.updateTimer = window.setInterval(() => {
      if (!this.audio || !this.state.isPlaying) return;
      const i = this.state.currentAyahIndex;
      const ayahTime = this.audio.currentTime * 1000;
      this.setState({ currentTimeMs: this.cumulativeOffsets[i] + ayahTime });
    }, 250);
  }

  private stopUpdateLoop() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  pause(): void {
    if (this.audio && this.state.isPlaying) {
      this.audio.pause();
      this.setState({ isPlaying: false, isPaused: true });
      this.stopUpdateLoop();
    }
  }

  resume(): void {
    if (this.audio && this.state.isPaused) {
      this.audio.play().then(() => {
        this.setState({ isPlaying: true, isPaused: false });
        this.startUpdateLoop();
      }).catch(() => {});
    }
  }

  replay(): void {
    this.stopUpdateLoop();
    this.setState({
      currentAyahIndex: 0,
      currentTimeMs: 0,
      isComplete: false,
      isPaused: false,
    });
    this.playAyah(0);
  }

  stop(): void {
    this.stopUpdateLoop();
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.setState({
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      currentAyahIndex: 0,
      currentTimeMs: 0,
      error: null,
    });
  }

  seekToVerse(index: number): void {
    if (index < 0 || index >= this.audioUrls.length) return;
    const wasPlaying = this.state.isPlaying;
    this.stopUpdateLoop();
    if (wasPlaying) {
      this.playAyah(index);
    } else {
      this.setState({ 
        currentAyahIndex: index, 
        currentTimeMs: this.cumulativeOffsets[index] || 0 
      });
    }
  }

  getState(): AudioEngineState {
    return { ...this.state };
  }

  getCachedUrl(verseKey: string): string | undefined {
    return this.audioCache.get(verseKey);
  }

  setCachedUrl(verseKey: string, url: string): void {
    this.audioCache.set(verseKey, url);
  }

  clearCache(): void {
    this.audioCache.clear();
  }

  getAyahDuration(index: number): number {
    return this.ayahDurations.get(index) || 4000;
  }

  getCumulativeOffset(index: number): number {
    return this.cumulativeOffsets[index] || 0;
  }

  destroy(): void {
    this.stop();
    if (this.audio) {
      this.audio.removeEventListener('ended', this.handleEnded);
      this.audio.removeEventListener('error', this.handleError);
    }
    this.listeners.clear();
  }
}

let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine();
  }
  return engineInstance;
}
