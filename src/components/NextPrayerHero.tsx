import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { PrayerEntry } from '../types';
import { formatCountdown, formatPrayerTime } from '../services/prayerTimes';

type Props = {
  nextPrayer: PrayerEntry | null;
  now: Date;
};

export function NextPrayerHero({ nextPrayer, now }: Props) {
  if (!nextPrayer) {
    return null;
  }

  const remaining = nextPrayer.time.getTime() - now.getTime();

  return (
    <View style={styles.hero}>
      <Text style={styles.kicker}>Next prayer</Text>
      <Text style={styles.arabic}>{nextPrayer.arabic}</Text>
      <Text style={styles.name}>{nextPrayer.label}</Text>
      <Text style={styles.time}>{formatPrayerTime(nextPrayer.time)}</Text>
      <Text style={styles.countdown}>{formatCountdown(remaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.28)',
    marginBottom: spacing.lg,
  },
  kicker: {
    color: colors.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  arabic: {
    color: colors.gold,
    fontSize: 40,
    marginTop: spacing.sm,
  },
  name: {
    color: colors.cream,
    fontSize: 22,
    marginTop: 4,
  },
  time: {
    color: colors.goldSoft,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  countdown: {
    color: colors.cream,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
    marginTop: spacing.md,
    letterSpacing: 2,
  },
});
