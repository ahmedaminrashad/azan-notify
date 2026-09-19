export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type NotifiablePrayer = Exclude<PrayerName, 'sunrise'>;

export type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran'
  | 'NorthAmerica';

export type MadhabKey = 'Shafi' | 'Hanafi';

export type LocationMode = 'gps' | 'city';

export type CityPreset = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type AppSettings = {
  locationMode: LocationMode;
  cityId: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  calculationMethod: CalculationMethodKey;
  madhab: MadhabKey;
  notificationsEnabled: boolean;
  enabledPrayers: Record<NotifiablePrayer, boolean>;
};

export type PrayerEntry = {
  name: PrayerName;
  label: string;
  arabic: string;
  time: Date;
};
