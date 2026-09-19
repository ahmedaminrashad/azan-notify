import type {
  AppSettings,
  CalculationMethodKey,
  CityPreset,
  NotifiablePrayer,
  PrayerName,
} from './types';

export const PRAYER_META: Record<
  PrayerName,
  { label: string; arabic: string; notifiable: boolean }
> = {
  fajr: { label: 'Fajr', arabic: 'الفجر', notifiable: true },
  sunrise: { label: 'Sunrise', arabic: 'الشروق', notifiable: false },
  dhuhr: { label: 'Dhuhr', arabic: 'الظهر', notifiable: true },
  asr: { label: 'Asr', arabic: 'العصر', notifiable: true },
  maghrib: { label: 'Maghrib', arabic: 'المغرب', notifiable: true },
  isha: { label: 'Isha', arabic: 'العشاء', notifiable: true },
};

export const NOTIFIABLE_PRAYERS: NotifiablePrayer[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const CALCULATION_METHODS: { key: CalculationMethodKey; label: string }[] = [
  { key: 'MuslimWorldLeague', label: 'Muslim World League' },
  { key: 'Egyptian', label: 'Egyptian' },
  { key: 'Karachi', label: 'Karachi' },
  { key: 'UmmAlQura', label: 'Umm al-Qura' },
  { key: 'Dubai', label: 'Dubai' },
  { key: 'Qatar', label: 'Qatar' },
  { key: 'Kuwait', label: 'Kuwait' },
  { key: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
  { key: 'Singapore', label: 'Singapore' },
  { key: 'Turkey', label: 'Turkey' },
  { key: 'Tehran', label: 'Tehran' },
  { key: 'NorthAmerica', label: 'North America (ISNA)' },
];

export const CITY_PRESETS: CityPreset[] = [
  { id: 'makkah', name: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
  { id: 'madinah', name: 'Madinah', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6117 },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  { id: 'dubai', name: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708 },
  { id: 'karachi', name: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011 },
  { id: 'jakarta', name: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { id: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869 },
  { id: 'london', name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { id: 'new-york', name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { id: 'casablanca', name: 'Casablanca', country: 'Morocco', latitude: 33.5731, longitude: -7.5898 },
];

export const DEFAULT_CITY = CITY_PRESETS[0];

export const DEFAULT_SETTINGS: AppSettings = {
  locationMode: 'city',
  cityId: DEFAULT_CITY.id,
  latitude: DEFAULT_CITY.latitude,
  longitude: DEFAULT_CITY.longitude,
  locationLabel: `${DEFAULT_CITY.name}, ${DEFAULT_CITY.country}`,
  calculationMethod: 'MuslimWorldLeague',
  madhab: 'Shafi',
  notificationsEnabled: true,
  enabledPrayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
};

export const SETTINGS_KEY = 'azan-notify-settings-v1';
export const AZAN_CHANNEL_ID = 'azan-user-sound-channel';
export const AZAN_SOUND = 'azansound.wav';
export const SCHEDULE_DAYS = 7;
