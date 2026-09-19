import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
} from 'adhan';
import { PRAYER_META } from '../constants';
import type { AppSettings, PrayerEntry, PrayerName } from '../types';

const METHOD_FACTORIES: Record<AppSettings['calculationMethod'], () => ReturnType<typeof CalculationMethod.MuslimWorldLeague>> = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
  UmmAlQura: CalculationMethod.UmmAlQura,
  Dubai: CalculationMethod.Dubai,
  Qatar: CalculationMethod.Qatar,
  Kuwait: CalculationMethod.Kuwait,
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  Singapore: CalculationMethod.Singapore,
  Turkey: CalculationMethod.Turkey,
  Tehran: CalculationMethod.Tehran,
  NorthAmerica: CalculationMethod.NorthAmerica,
};

export function getPrayerTimesForDate(date: Date, settings: AppSettings): PrayerTimes {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);
  const params = METHOD_FACTORIES[settings.calculationMethod]();
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return new PrayerTimes(coordinates, date, params);
}

export function getPrayerEntries(date: Date, settings: AppSettings): PrayerEntry[] {
  const times = getPrayerTimesForDate(date, settings);
  const names: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const timesByName: Record<PrayerName, Date> = {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
  return names.map((name) => ({
    name,
    label: PRAYER_META[name].label,
    arabic: PRAYER_META[name].arabic,
    time: timesByName[name],
  }));
}

export function getNextPrayer(settings: AppSettings, now = new Date()): PrayerEntry | null {
  const today = getPrayerEntries(now, settings);
  const upcoming = today.find((entry) => entry.name !== 'sunrise' && entry.time.getTime() > now.getTime());
  if (upcoming) {
    return upcoming;
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return getPrayerEntries(tomorrow, settings).find((entry) => entry.name !== 'sunrise') ?? null;
}

export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function formatHijriDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
