import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AZAN_CHANNEL_ID, PRAYER_META, SCHEDULE_DAYS } from '../constants';
import type { AppSettings, NotifiablePrayer } from '../types';
import { getPrayerTimesForDate } from './prayerTimes';
import type { PrayerTimes } from 'adhan';

function timeForNotifiablePrayer(times: PrayerTimes, prayer: NotifiablePrayer): Date {
  if (prayer === 'fajr') return times.fajr;
  if (prayer === 'dhuhr') return times.dhuhr;
  if (prayer === 'asr') return times.asr;
  if (prayer === 'maghrib') return times.maghrib;
  return times.isha;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(AZAN_CHANNEL_ID, {
      name: 'Azan',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted' || current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requested.status === 'granted' || requested.granted;
}

export async function cancelAzanNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAzanNotifications(settings: AppSettings): Promise<number> {
  await cancelAzanNotifications();

  if (!settings.notificationsEnabled) {
    return 0;
  }

  const allowed = await ensureNotificationPermissions();
  if (!allowed) {
    return 0;
  }

  const now = Date.now();
  let scheduled = 0;

  for (let dayOffset = 0; dayOffset < SCHEDULE_DAYS; dayOffset += 1) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    const times = getPrayerTimesForDate(date, settings);

    for (const prayer of Object.keys(settings.enabledPrayers) as NotifiablePrayer[]) {
      if (!settings.enabledPrayers[prayer]) {
        continue;
      }

      const prayerTime = timeForNotifiablePrayer(times, prayer);
      if (prayerTime.getTime() <= now + 15_000) {
        continue;
      }

      const meta = PRAYER_META[prayer];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${meta.label} Azan`,
          body: `It is time for ${meta.label} (${meta.arabic}).`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: prayerTime,
          channelId: AZAN_CHANNEL_ID,
        },
      });
      scheduled += 1;
    }
  }

  return scheduled;
}

export async function sendTestNotification(): Promise<void> {
  const allowed = await ensureNotificationPermissions();
  if (!allowed) {
    throw new Error('Notification permission was not granted.');
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Azan test',
      body: 'Notifications are working. You will hear Azan alerts at prayer time.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: AZAN_CHANNEL_ID,
    },
  });
}
