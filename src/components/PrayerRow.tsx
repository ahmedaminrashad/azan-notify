import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { PrayerEntry } from '../types';
import { formatPrayerTime } from '../services/prayerTimes';

type Props = {
  prayer: PrayerEntry;
  isNext: boolean;
  notificationsOn: boolean;
  onToggle?: () => void;
};

export function PrayerRow({ prayer, isNext, notificationsOn, onToggle }: Props) {
  const isSunrise = prayer.name === 'sunrise';

  return (
    <View style={[styles.row, isNext && styles.nextRow]}>
      <View style={styles.names}>
        <Text style={styles.arabic}>{prayer.arabic}</Text>
        <Text style={styles.label}>{prayer.label}</Text>
      </View>
      <Text style={styles.time}>{formatPrayerTime(prayer.time)}</Text>
      {!isSunrise && (
        <Pressable
          onPress={onToggle}
          style={[styles.bell, notificationsOn ? styles.bellOn : styles.bellOff]}
          accessibilityRole="button"
          accessibilityLabel={`${prayer.label} notification ${notificationsOn ? 'on' : 'off'}`}
        >
          <Text style={styles.bellText}>{notificationsOn ? '🔔' : '🔕'}</Text>
        </Pressable>
      )}
      {isSunrise && <View style={styles.bellSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.08)',
  },
  nextRow: {
    borderColor: colors.gold,
    backgroundColor: colors.surfaceAlt,
  },
  names: {
    flex: 1,
  },
  arabic: {
    color: colors.goldSoft,
    fontSize: 18,
    textAlign: 'left',
  },
  label: {
    color: colors.cream,
    fontSize: 15,
    marginTop: 2,
  },
  time: {
    color: colors.cream,
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    marginRight: spacing.sm,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellOn: {
    backgroundColor: 'rgba(42, 157, 111, 0.2)',
  },
  bellOff: {
    backgroundColor: 'rgba(139, 168, 156, 0.12)',
  },
  bellText: {
    fontSize: 16,
  },
  bellSpacer: {
    width: 40,
  },
});
