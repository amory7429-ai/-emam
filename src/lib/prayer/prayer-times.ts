// Prayer time calculation using AlAdhan API
// Supports: Egyptian General Authority of Survey, auto-location, manual selection
// Caches per day+location, refreshes on date/location change

export interface PrayerTime {
  name: string;
  nameArabic: string;
  time: Date;
  rakahs: number;
}

export interface PrayerTimesResult {
  times: PrayerTime[];
  nextPrayer: PrayerTime;
  currentPrayer: PrayerTime | null;
  nextPrayerName: string;
  timeToNext: string;
  hijriDate: string;
  gregorianDate: string;
  location: { lat: number; lng: number; city: string };
  method: string;
  cached: boolean;
}

export interface LocationData {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

// ─── EGYPTIAN CITIES ─────────────────────────────────────
export const EGYPTIAN_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'الإسكندرية', lat: 31.2001, lng: 29.9187 },
  { name: 'الجيزة', lat: 30.0131, lng: 31.2089 },
  { name: 'المنصورة', lat: 31.0409, lng: 31.3785 },
  { name: 'طنطا', lat: 30.7865, lng: 31.0004 },
  { name: 'الإسماعيلية', lat: 30.5965, lng: 32.2715 },
  { name: 'الفيوم', lat: 29.3100, lng: 30.8418 },
  { name: 'الزقازيق', lat: 30.5877, lng: 31.5020 },
  { name: 'أسيوط', lat: 27.1809, lng: 31.1837 },
  { name: 'سوهاج', lat: 26.5560, lng: 31.6948 },
  { name: 'قليوب', lat: 30.4268, lng: 31.1956 },
  { name: 'كفر الشيخ', lat: 31.1107, lng: 30.9388 },
  { name: 'دمياط', lat: 31.4175, lng: 31.8144 },
  { name: 'بني سويف', lat: 29.0729, lng: 31.0982 },
  { name: 'مطروح', lat: 31.3543, lng: 27.2453 },
  { name: 'الأقصر', lat: 25.6872, lng: 32.6396 },
  { name: 'أسوان', lat: 24.0889, lng: 32.8998 },
  { name: 'الغردقة', lat: 27.2579, lng: 33.8116 },
  { name: 'شرم الشيخ', lat: 27.9158, lng: 34.3300 },
  { name: 'العاشر من رمضان', lat: 30.3085, lng: 31.7430 },
  { name: 'بورسعيد', lat: 31.2653, lng: 32.3019 },
  { name: 'السويس', lat: 29.9668, lng: 32.5498 },
];

// ─── PRAYER CONSTANTS ────────────────────────────────────
const PRAYER_RAKAHS: Record<string, number> = {
  Fajr: 2, Sunrise: 0, Dhuhr: 4, Asr: 4, Maghrib: 3, Isha: 4,
};

const PRAYER_NAMES_AR: Record<string, string> = {
  Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
  Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};

// AlAdhan method 5 = Egyptian General Authority of Survey
const ALADHAN_METHOD = 5;
const ALADHAN_SCHOOL = 0; // 0 = Shafi, 1 = Hanafi

// ─── CACHE ───────────────────────────────────────────────
const CACHE_KEY_PREFIX = 'emam-prayer-';
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

function getCacheKey(lat: number, lng: number, dateStr: string): string {
  return `${CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lng.toFixed(2)}_${dateStr}`;
}

function getCachedResult(key: string): PrayerTimesResult | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > CACHE_DURATION_MS) return null;
    // Rehydrate dates
    data.result.times = data.result.times.map((t: any) => ({ ...t, time: new Date(t.time) }));
    data.result.nextPrayer.time = new Date(data.result.nextPrayer.time);
    if (data.result.currentPrayer) data.result.currentPrayer.time = new Date(data.result.currentPrayer.time);
    return data.result;
  } catch {
    return null;
  }
}

function setCachedResult(key: string, result: PrayerTimesResult): void {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), result }));
  } catch { /* storage full */ }
}

// ─── ALADHAN API ─────────────────────────────────────────
async function fetchFromAlAdhan(lat: number, lng: number, date: Date): Promise<PrayerTime[]> {
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${ALADHAN_METHOD}&shafp=${ALADHAN_SCHOOL}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`AlAdhan API error: ${res.status}`);

  const data = await res.json();
  if (data.code !== 200) throw new Error('AlAdhan API returned error');

  const timings = data.data.timings;
  const tz = data.data.meta.timezone;

  const parseTime = (timeStr: string): Date => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(date);
    // Handle day wraparound (e.g., Isha at 00:30)
    if (h >= 0 && h < 6 && date.getHours() > 12) {
      d.setDate(d.getDate() + 1);
    }
    d.setHours(h, m, 0, 0);
    return d;
  };

  return [
    { name: 'Fajr', nameArabic: PRAYER_NAMES_AR.Fajr, time: parseTime(timings.Fajr), rakahs: PRAYER_RAKAHS.Fajr },
    { name: 'Sunrise', nameArabic: PRAYER_NAMES_AR.Sunrise, time: parseTime(timings.Sunrise), rakahs: PRAYER_RAKAHS.Sunrise },
    { name: 'Dhuhr', nameArabic: PRAYER_NAMES_AR.Dhuhr, time: parseTime(timings.Dhuhr), rakahs: PRAYER_RAKAHS.Dhuhr },
    { name: 'Asr', nameArabic: PRAYER_NAMES_AR.Asr, time: parseTime(timings.Asr), rakahs: PRAYER_RAKAHS.Asr },
    { name: 'Maghrib', nameArabic: PRAYER_NAMES_AR.Maghrib, time: parseTime(timings.Maghrib), rakahs: PRAYER_RAKAHS.Maghrib },
    { name: 'Isha', nameArabic: PRAYER_NAMES_AR.Isha, time: parseTime(timings.Isha), rakahs: PRAYER_RAKAHS.Isha },
  ];
}

// ─── LOCATION ────────────────────────────────────────────
function getSavedLocation(): LocationData | null {
  try {
    const raw = localStorage.getItem('emam-location');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLocation(loc: LocationData): void {
  try { localStorage.setItem('emam-location', JSON.stringify(loc)); } catch {}
}

async function resolveLocation(): Promise<LocationData> {
  // 1. Try saved location first
  const saved = getSavedLocation();
  if (saved) return saved;

  // 2. Try geolocation
  if ('geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          maximumAge: 60 * 60 * 1000,
        });
      });
      // Reverse geocode to get city name
      const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        city: city || 'موقعك الحالي',
        country: 'EG',
      };
    } catch { /* fall through */ }
  }

  // 3. Default to Cairo
  return { lat: 30.0444, lng: 31.2357, city: 'القاهرة', country: 'EG' };
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
  } catch { return ''; }
}

// ─── LOGIC ───────────────────────────────────────────────
function getNextPrayer(times: PrayerTime[]): PrayerTime {
  const now = new Date();
  for (const prayer of times) {
    if (prayer.time > now && prayer.rakahs > 0) return prayer;
  }
  return times[0]; // Tomorrow's Fajr
}

function getCurrentPrayer(times: PrayerTime[]): PrayerTime | null {
  const now = new Date();
  const prayersWithRakah = times.filter(p => p.rakahs > 0);
  for (let i = prayersWithRakah.length - 1; i >= 0; i--) {
    if (prayersWithRakah[i].time <= now) return prayersWithRakah[i];
  }
  return null;
}

function formatTimeToNext(nextPrayerTime: Date): string {
  const now = new Date();
  const diff = nextPrayerTime.getTime() - now.getTime();
  if (diff <= 0) return 'الآن';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours} ساعة ${minutes > 0 ? `و ${minutes} دقيقة` : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} دقيقة ${seconds > 30 ? 'و نصف' : ''}`;
  }
  return `${seconds} ثانية`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getHijriDate(): string {
  try {
    return new Date().toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
}

function getGregorianDate(): string {
  try {
    return new Date().toLocaleDateString('ar', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return ''; }
}

// ─── PUBLIC API ──────────────────────────────────────────
export async function getPrayerTimes(forceRefresh = false): Promise<PrayerTimesResult | null> {
  try {
    const location = await resolveLocation();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const cacheKey = getCacheKey(location.lat, location.lng, dateStr);

    // Check cache first
    if (!forceRefresh) {
      const cached = getCachedResult(cacheKey);
      if (cached) {
        // Update countdown (don't cache countdown)
        cached.timeToNext = formatTimeToNext(cached.nextPrayer.time);
        return cached;
      }
    }

    // Fetch from API
    const times = await fetchFromAlAdhan(location.lat, location.lng, now);
    const nextPrayer = getNextPrayer(times);
    const currentPrayer = getCurrentPrayer(times);

    const result: PrayerTimesResult = {
      times,
      nextPrayer,
      currentPrayer,
      nextPrayerName: PRAYER_NAMES_AR[nextPrayer.name] || nextPrayer.nameArabic,
      timeToNext: formatTimeToNext(nextPrayer.time),
      hijriDate: getHijriDate(),
      gregorianDate: getGregorianDate(),
      location,
      method: 'الهيئة المصرية العامة للمساحة',
      cached: false,
    };

    setCachedResult(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

export { formatTime, PRAYER_NAMES_AR, PRAYER_RAKAHS };
