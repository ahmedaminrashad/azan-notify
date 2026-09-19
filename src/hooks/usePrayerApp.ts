import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppSettings, PrayerEntry } from '../types';
import { loadSettings, saveSettings } from '../services/settings';
import { getNextPrayer, getPrayerEntries } from '../services/prayerTimes';
import { scheduleAzanNotifications } from '../services/notifications';

export function usePrayerApp() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await loadSettings();
        if (!mounted) {
          return;
        }
        setSettings(loaded);
        const count = await scheduleAzanNotifications(loaded);
        if (mounted) {
          setScheduledCount(count);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Could not load prayer times.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateSettings = useCallback(async (next: AppSettings) => {
    setSettings(next);
    await saveSettings(next);
    const count = await scheduleAzanNotifications(next);
    setScheduledCount(count);
  }, []);

  const prayers = useMemo<PrayerEntry[]>(() => {
    if (!settings) {
      return [];
    }
    return getPrayerEntries(now, settings);
  }, [now, settings]);

  const nextPrayer = useMemo(() => {
    if (!settings) {
      return null;
    }
    return getNextPrayer(settings, now);
  }, [now, settings]);

  return {
    settings,
    updateSettings,
    prayers,
    nextPrayer,
    now,
    loading,
    error,
    scheduledCount,
  };
}
