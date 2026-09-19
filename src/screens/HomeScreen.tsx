import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NextPrayerHero } from '../components/NextPrayerHero';
import { PrayerRow } from '../components/PrayerRow';
import { formatHijriDate } from '../services/prayerTimes';
import { colors, radius, spacing } from '../theme';
import type { AppSettings, NotifiablePrayer, PrayerEntry } from '../types';

type Props = {
  settings: AppSettings;
  prayers: PrayerEntry[];
  nextPrayer: PrayerEntry | null;
  now: Date;
  scheduledCount: number;
  onOpenSettings: () => void;
  onChange: (next: AppSettings) => Promise<void>;
};

export function HomeScreen({
  settings,
  prayers,
  nextPrayer,
  now,
  scheduledCount,
  onOpenSettings,
  onChange,
}: Props) {
  const togglePrayer = (name: NotifiablePrayer) => {
    void onChange({
      ...settings,
      enabledPrayers: {
        ...settings.enabledPrayers,
        [name]: !settings.enabledPrayers[name],
      },
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>Azan Notify</Text>
          <Text style={styles.location}>{settings.locationLabel}</Text>
        </View>
        <Pressable style={styles.settingsBtn} onPress={onOpenSettings}>
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      </View>

      <Text style={styles.hijri}>{formatHijriDate(now)}</Text>
      <NextPrayerHero nextPrayer={nextPrayer} now={now} />

      <Text style={styles.section}>Today's prayers</Text>
      {prayers.map((prayer) => (
        <PrayerRow
          key={prayer.name}
          prayer={prayer}
          isNext={nextPrayer?.name === prayer.name && nextPrayer.time.getTime() === prayer.time.getTime()}
          notificationsOn={
            prayer.name !== 'sunrise' &&
            settings.notificationsEnabled &&
            settings.enabledPrayers[prayer.name]
          }
          onToggle={
            prayer.name === 'sunrise'
              ? undefined
              : () => togglePrayer(prayer.name as NotifiablePrayer)
          }
        />
      ))}

      <Text style={styles.footer}>
        {settings.notificationsEnabled
          ? `${scheduledCount} Azan alerts are scheduled for the next 7 days.`
          : 'Notifications are off. Turn them on in Settings.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  brand: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: '700',
  },
  location: {
    color: colors.muted,
    marginTop: 4,
  },
  settingsBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  settingsText: {
    color: colors.goldSoft,
    fontWeight: '600',
  },
  hijri: {
    color: colors.cream,
    marginBottom: spacing.md,
  },
  section: {
    color: colors.muted,
    marginBottom: spacing.sm,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  footer: {
    color: colors.muted,
    marginTop: spacing.md,
    lineHeight: 20,
  },
});
