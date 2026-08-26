// Audio cache manager for offline playback
// Downloads and caches audio blobs in IndexedDB for offline use

import { dbPut, dbGet, dbDelete, dbCount } from './indexed-db';
import { AVAILABLE_RECITERS } from '@/lib/quran/types';
import { SURAH_META } from '@/lib/data/surahs';

export interface AudioDownloadRecord {
  verseKey: string;
  reciterId: number;
  url: string;
  blob?: Blob;
  downloaded: boolean;
  size?: number;
  downloadedAt?: number;
}

// Get a cached audio blob
export async function getCachedAudio(verseKey: string, reciterId: number): Promise<string | null> {
  try {
    const record = await dbGet<AudioDownloadRecord>('audioFiles', [verseKey, reciterId]);
    if (record?.downloaded && record.blob) {
      return URL.createObjectURL(record.blob);
    }
    return null;
  } catch {
    return null;
  }
}

// Check if a verse is downloaded
export async function isAudioDownloaded(verseKey: string, reciterId: number): Promise<boolean> {
  try {
    const record = await dbGet<AudioDownloadRecord>('audioFiles', [verseKey, reciterId]);
    return record?.downloaded === true;
  } catch {
    return false;
  }
}

// Check if an entire surah is downloaded for a reciter
export async function isSurahDownloaded(surahNumber: number, reciterId: number): Promise<boolean> {
  const surah = SURAH_META.find(s => s.id === surahNumber);
  if (!surah) return false;

  try {
    for (let ayah = 1; ayah <= surah.ayahs; ayah++) {
      const key = `${surahNumber}:${ayah}`;
      const downloaded = await isAudioDownloaded(key, reciterId);
      if (!downloaded) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Get download status for a surah
export async function getSurahDownloadStatus(surahNumber: number, reciterId: number) {
  const surah = SURAH_META.find(s => s.id === surahNumber);
  if (!surah) return { total: 0, downloaded: 0, complete: false };

  let downloaded = 0;
  for (let ayah = 1; ayah <= surah.ayahs; ayah++) {
    const key = `${surahNumber}:${ayah}`;
    if (await isAudioDownloaded(key, reciterId)) downloaded++;
  }
  return { total: surah.ayahs, downloaded, complete: downloaded === surah.ayahs };
}

// Download a single audio file
async function downloadSingleAudio(
  verseKey: string,
  reciterId: number,
  url: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;

    const contentLength = res.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength) : 0;

    if (total > 0 && res.body) {
      // Stream download with progress
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        onProgress?.(loaded, total);
      }

      const blob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
      await dbPut('audioFiles', {
        verseKey,
        reciterId,
        url,
        blob,
        downloaded: true,
        size: blob.size,
        downloadedAt: Date.now(),
      });
      return true;
    } else {
      // Simple download without progress
      const blob = await res.blob();
      await dbPut('audioFiles', {
        verseKey,
        reciterId,
        url,
        blob,
        downloaded: true,
        size: blob.size,
        downloadedAt: Date.now(),
      });
      onProgress?.(1, 1);
      return true;
    }
  } catch {
    return false;
  }
}

// Download all ayahs for a surah
export async function downloadSurahAudio(
  surahNumber: number,
  reciterId: number,
  onProgress?: (ayah: number, total: number, bytesLoaded: number, bytesTotal: number) => void
): Promise<boolean> {
  const surah = SURAH_META.find(s => s.id === surahNumber);
  if (!surah) return false;

  const reciter = AVAILABLE_RECITERS.find(r => r.id === reciterId);
  if (!reciter) return false;

  for (let ayah = 1; ayah <= surah.ayahs; ayah++) {
    const verseKey = `${surahNumber}:${ayah}`;

    // Skip if already downloaded
    if (await isAudioDownloaded(verseKey, reciterId)) {
      onProgress?.(ayah, surah.ayahs, 0, 0);
      continue;
    }

    // Build audio URL
    const surahStr = surahNumber.toString().padStart(3, '0');
    const ayahStr = ayah.toString().padStart(3, '0');

    let audioUrl: string;
    if (reciter.urlPattern === 'quranicaudio-protocol-relative') {
      // For Husary etc - use Quran.com API to get the actual URL
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNumber}?per_page=10000`
        );
        if (res.ok) {
          const data = await res.json();
          const match = data.audio_files.find((a: any) => a.verse_key === verseKey);
          if (match) {
            audioUrl = match.url.startsWith('//') ? `https:${match.url}` : `https://${match.url}`;
          } else {
            continue;
          }
        } else {
          continue;
        }
      } catch {
        continue;
      }
    } else {
      audioUrl = `${reciter.audioBaseUrl}/${reciter.urlPattern === 'quran-foundation' ? 'Alafasy' : reciter.name}/mp3/${surahStr}${ayahStr}.mp3`;
    }

    // For quran-foundation pattern, fetch the URL from API first
    if (reciter.urlPattern === 'quran-foundation') {
      try {
        const res = await fetch(
          `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNumber}?per_page=10000`
        );
        if (res.ok) {
          const data = await res.json();
          const match = data.audio_files.find((a: any) => a.verse_key === verseKey);
          if (match) {
            audioUrl = `${reciter.audioBaseUrl}/${match.url}`;
          }
        }
      } catch {
        // Use constructed URL as fallback
      }
    }

    const success = await downloadSingleAudio(verseKey, reciterId, audioUrl, (loaded, total) => {
      onProgress?.(ayah, surah.ayahs, loaded, total);
    });

    if (!success) {
      // Failed to download — continue with next ayah
    }
  }

  return true;
}

// Download a single ayah audio
export async function downloadAyahAudio(
  verseKey: string,
  reciterId: number,
  onProgress?: (loaded: number, total: number) => void
): Promise<boolean> {
  const reciter = AVAILABLE_RECITERS.find(r => r.id === reciterId);
  if (!reciter) return false;

  // Get URL from API
  const [surahNum] = verseKey.split(':').map(Number);
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/recitations/${reciterId}/by_chapter/${surahNum}?per_page=10000`
    );
    if (!res.ok) return false;
    const data = await res.json();
    const match = data.audio_files.find((a: any) => a.verse_key === verseKey);
    if (!match) return false;

    let audioUrl: string;
    if (reciter.urlPattern === 'quranicaudio-protocol-relative') {
      audioUrl = match.url.startsWith('//') ? `https:${match.url}` : `https://${match.url}`;
    } else {
      audioUrl = `${reciter.audioBaseUrl}/${match.url}`;
    }

    return downloadSingleAudio(verseKey, reciterId, audioUrl, onProgress);
  } catch {
    return false;
  }
}

// Delete all audio for a surah
export async function deleteSurahAudio(surahNumber: number, reciterId: number): Promise<void> {
  const surah = SURAH_META.find(s => s.id === surahNumber);
  if (!surah) return;

  for (let ayah = 1; ayah <= surah.ayahs; ayah++) {
    try {
      await dbDelete('audioFiles', [`${surahNumber}:${ayah}`, reciterId]);
    } catch {
      // continue
    }
  }
}

// Delete all downloaded audio
export async function deleteAllAudio(): Promise<void> {
  const { dbClear } = await import('./indexed-db');
  await dbClear('audioFiles');
}

// Get total downloaded audio count
export async function getDownloadedAudioCount(): Promise<number> {
  try {
    return await dbCount('audioFiles');
  } catch {
    return 0;
  }
}

// Get all downloaded surahs for a reciter
export async function getDownloadedSurahs(reciterId: number): Promise<number[]> {
  const surahs: number[] = [];
  for (const surah of SURAH_META) {
    if (await isSurahDownloaded(surah.id, reciterId)) {
      surahs.push(surah.id);
    }
  }
  return surahs;
}
