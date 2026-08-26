// Lightweight IndexedDB wrapper for Offline-First PWA
// No external dependencies - pure browser API

const DB_NAME = 'rafiq-imam-db';
const DB_VERSION = 1;

export interface DBSchema {
  quranVerses: { verseKey: string; surahNumber: number; verseNumber: number; textUthmani: string; juz: number; hizb: number; page: number; ruku: number; manzil: number; sajdahNumber: number | null };
  quranMeta: { id: string; value: any };
  audioFiles: { verseKey: string; reciterId: number; url: string; blob?: Blob; downloaded: boolean; size?: number; downloadedAt?: number };
  hifzProgress: { passageId: string; date: string; status: 'memorized' | 'review'; surahNumber: number; startAyah: number; endAyah: number };
  offlineSettings: { key: string; value: any };
}

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Quran verses store
      if (!db.objectStoreNames.contains('quranVerses')) {
        const verseStore = db.createObjectStore('quranVerses', { keyPath: 'verseKey' });
        verseStore.createIndex('bySurah', 'surahNumber');
        verseStore.createIndex('byJuz', 'juz');
      }

      // Quran metadata store (bootstrap status, etc.)
      if (!db.objectStoreNames.contains('quranMeta')) {
        db.createObjectStore('quranMeta', { keyPath: 'id' });
      }

      // Audio files store
      if (!db.objectStoreNames.contains('audioFiles')) {
        const audioStore = db.createObjectStore('audioFiles', { keyPath: ['verseKey', 'reciterId'] });
        audioStore.createIndex('byReciter', 'reciterId');
        audioStore.createIndex('bySurah', 'verseKey');
        audioStore.createIndex('byDownloaded', 'downloaded');
      }

      // Hifz progress store
      if (!db.objectStoreNames.contains('hifzProgress')) {
        const hifzStore = db.createObjectStore('hifzProgress', { keyPath: 'passageId' });
        hifzStore.createIndex('bySurah', 'surahNumber');
        hifzStore.createIndex('byStatus', 'status');
      }

      // Offline settings store
      if (!db.objectStoreNames.contains('offlineSettings')) {
        db.createObjectStore('offlineSettings', { keyPath: 'key' });
      }
    };
  });
}

// Generic CRUD operations
export async function dbGet<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbGetByIndex<T>(storeName: string, indexName: string, key: IDBValidKey): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const req = index.getAll(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbPutMany<T>(storeName: string, values: T[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    values.forEach((value) => {
      store.put(value);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    if (values.length === 0) resolve();
  });
}

export async function dbDelete(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbClear(storeName: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function dbCount(storeName: string): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Estimate storage usage
export async function getStorageEstimate(): Promise<{ used: number; quota: number } | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return { used: estimate.usage || 0, quota: estimate.quota || 0 };
  }
  return null;
}

// Request persistent storage
export async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    try {
      // Check if already persistent
      if (await navigator.storage.persisted()) return true;
      // Request persistence — user may see a permission dialog
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}

// Check if persistent storage is already granted
export async function isPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persisted' in navigator.storage) {
    try {
      return await navigator.storage.persisted();
    } catch {
      return false;
    }
  }
  return false;
}

// Close DB connection on page unload (cleanup)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
    }
  });
}
