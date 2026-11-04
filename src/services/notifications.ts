import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import {
  AZAN_CHANNEL_ID,
  AZAN_SOUND_ANDROID,
  AZAN_SOUND_IOS,
  PRAYER_META,
  SCHEDULE_DAYS,
  STALE_CHANNEL_IDS,
} from '../constants';
import type { AppSettings, NotifiablePrayer } from '../types';
import { getPrayerTimesForDate } from './prayerTimes';
import { playTakbir } from './takbirSound';
import type { PrayerTimes } from 'adhan';

const AZAN_SOUND = Platform.OS === 'android' ? AZAN_SOUND_ANDROID : AZAN_SOUND_IOS;

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

function prayerDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function azanIdentifier(prayer: NotifiablePrayer, date: Date): string {
  return `azan-${prayer}-${prayerDayKey(date)}`;
}

let scheduleQueue: Promise<unknown> = Promise.resolve();

function enqueueSchedule<T>(work: () => Promise<T>): Promise<T> {
  const run = scheduleQueue.then(work, work);
  scheduleQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function recreateAzanChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  for (const channelId of [...STALE_CHANNEL_IDS, AZAN_CHANNEL_ID]) {
    try {
      await Notifications.deleteNotificationChannelAsync(channelId);
    } catch {
      // Channel may not exist yet.
    }
  }

  await Notifications.setNotificationChannelAsync(AZAN_CHANNEL_ID, {
    name: 'Azan alarm',
    description: 'Prayer-time Azan with sound',
    importance: Notifications.AndroidImportance.MAX,
    bypassDnd: true,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D4AF37',
    sound: AZAN_SOUND,
    enableVibrate: true,
    enableLights: true,
    showBadge: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: {
        enforceAudibility: true,
        requestHardwareAudioVideoSynchronization: false,
      },
    },
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  await recreateAzanChannel();

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

export async function restoreAzanSound(): Promise<string> {
  const allowed = await ensureNotificationPermissions();
  if (!allowed) {
    throw new Error('Notification permission was not granted.');
  }

  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.REQUEST_SCHEDULE_EXACT_ALARM');
    } catch {
      await Linking.openSettings();
    }
  }

  await playTakbir();
  return 'Azan sound restored. Turn on Alarms & reminders, set this category to Sound, and raise alarm volume.';
}

export async function cancelAzanNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAzanNotifications(settings: AppSettings): Promise<number> {
  return enqueueSchedule(async () => {
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
          identifier: azanIdentifier(prayer, prayerTime),
          content: {
            title: `${meta.label} Azan`,
            body: `It is time for ${meta.label} (${meta.arabic}).`,
            sound: AZAN_SOUND,
            priority: Notifications.AndroidNotificationPriority.MAX,
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
  });
}

export async function sendTestNotification(): Promise<void> {
  const allowed = await ensureNotificationPermissions();
  if (!allowed) {
    throw new Error('Notification permission was not granted.');
  }

  await playTakbir();

  await Notifications.scheduleNotificationAsync({
    identifier: 'azan-test',
    content: {
      title: 'Azan test',
      body: 'الله أكبر',
      sound: AZAN_SOUND,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: AZAN_CHANNEL_ID,
    },
  });
}
