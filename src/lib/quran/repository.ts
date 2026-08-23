// QuranRepository - Abstract data layer
// All Quran data access goes through this interface
// Providers implement this; UI components depend on it

import type {
  Surah,
  Verse,
  Juz,
  Passage,
  AudioSource,
  AudioConfig,
} from "./types";

export interface QuranRepository {
  // Surah metadata
  getAllSurahs(): Promise<Surah[]>;
  getSurah(surahNumber: number): Promise<Surah>;

  // Verse retrieval
  getVersesBySurah(surahNumber: number): Promise<Verse[]>;
  getVersesByJuz(juzNumber: number): Promise<Verse[]>;
  getVerse(verseKey: string): Promise<Verse>;
  getVerseRange(startKey: string, endKey: string): Promise<Verse[]>;

  // Juz
  getAllJuz(): Promise<Juz[]>;
  getJuz(juzNumber: number): Promise<Juz>;

  // Audio
  getAudioUrl(verseKey: string): Promise<AudioSource>;
  getAudioConfig(): AudioConfig;

  // Passage generation helpers
  buildPassage(
    surahNumber: number,
    ayahStart: number,
    ayahEnd: number,
  ): Promise<Passage>;
}

export interface AudioPlayer {
  play(url: string): Promise<void>;
  pause(): void;
  resume(): void;
  replay(): void;
  stop(): void;
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  onEnded(callback: () => void): void;
  onError(callback: (error: Error) => void): void;
}
