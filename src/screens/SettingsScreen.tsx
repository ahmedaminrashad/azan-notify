import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useState } from 'react';
import { CALCULATION_METHODS, CITY_PRESETS, NOTIFIABLE_PRAYERS, PRAYER_META } from '../constants';
import { requestAndReadGps } from '../services/location';
import { sendTestNotification } from '../services/notifications';
import { colors, radius, spacing } from '../theme';
import type { AppSettings, CalculationMethodKey, MadhabKey, NotifiablePrayer } from '../types';

type Props = {
  settings: AppSettings;
  onChange: (next: AppSettings) => Promise<void>;
  scheduledCount: number;
  onClose: () => void;
};

export function SettingsScreen({ settings, onChange, scheduledCount, onClose }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const patch = (partial: Partial<AppSettings>) => onChange({ ...settings, ...partial });

  const useGps = async () => {
    const gps = await requestAndReadGps();
    if (!gps) {
      setMessage('Location permission is needed to use GPS. You can pick a city instead.');
      return;
    }
    setMessage(null);
    await onChange({
      ...settings,
      locationMode: 'gps',
      latitude: gps.latitude,
      longitude: gps.longitude,
      locationLabel: gps.locationLabel,
    });
  };

  const chooseCity = (cityId: string) => {
    const city = CITY_PRESETS.find((item) => item.id === cityId);
    if (!city) {
      return;
    }
    void patch({
      locationMode: 'city',
      cityId: city.id,
      latitude: city.latitude,
      longitude: city.longitude,
      locationLabel: `${city.name}, ${city.country}`,
    });
  };

  const togglePrayer = (prayer: NotifiablePrayer) => {
    void patch({
      enabledPrayers: {
        ...settings.enabledPrayers,
        [prayer]: !settings.enabledPrayers[prayer],
      },
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Pressable onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Location</Text>
      <Text style={styles.hint}>{settings.locationLabel}</Text>
      {message ? <Text style={styles.warning}>{message}</Text> : null}
      <Pressable style={styles.button} onPress={useGps}>
        <Text style={styles.buttonText}>Use my GPS location</Text>
      </Pressable>
      <View style={styles.chipWrap}>
        {CITY_PRESETS.map((city) => {
          const active = settings.locationMode === 'city' && settings.cityId === city.id;
          return (
            <Pressable
              key={city.id}
              onPress={() => chooseCity(city.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{city.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>Calculation method</Text>
      {CALCULATION_METHODS.map((method) => {
        const active = settings.calculationMethod === method.key;
        return (
          <Pressable
            key={method.key}
            onPress={() => patch({ calculationMethod: method.key as CalculationMethodKey })}
            style={[styles.option, active && styles.optionActive]}
          >
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{method.label}</Text>
          </Pressable>
        );
      })}

      <Text style={styles.section}>Asr madhab</Text>
      {(['Shafi', 'Hanafi'] as MadhabKey[]).map((madhab) => {
        const active = settings.madhab === madhab;
        return (
          <Pressable
            key={madhab}
            onPress={() => patch({ madhab })}
            style={[styles.option, active && styles.optionActive]}
          >
            <Text style={[styles.optionText, active && styles.optionTextActive]}>
              {madhab === 'Shafi' ? 'Shafi / Maliki / Hanbali' : 'Hanafi'}
            </Text>
          </Pressable>
        );
      })}

      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleTitle}>Azan notifications</Text>
          <Text style={styles.hint}>{scheduledCount} prayer alerts scheduled</Text>
        </View>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={(notificationsEnabled) => void patch({ notificationsEnabled })}
          trackColor={{ false: '#244038', true: colors.accent }}
          thumbColor={settings.notificationsEnabled ? colors.gold : colors.muted}
        />
      </View>

      {NOTIFIABLE_PRAYERS.map((prayer) => (
        <View key={prayer} style={styles.toggleRow}>
          <Text style={styles.toggleTitle}>{PRAYER_META[prayer].label}</Text>
          <Switch
            value={settings.enabledPrayers[prayer]}
            onValueChange={() => togglePrayer(prayer)}
            trackColor={{ false: '#244038', true: colors.accent }}
            thumbColor={settings.enabledPrayers[prayer] ? colors.gold : colors.muted}
          />
        </View>
      ))}

      <Pressable
        style={styles.button}
        onPress={() => {
          void sendTestNotification().catch((err) => {
            setMessage(err instanceof Error ? err.message : 'Could not send a test notification.');
          });
        }}
      >
        <Text style={styles.buttonText}>Play test: الله أكبر</Text>
      </Pressable>
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
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.cream,
    fontSize: 28,
    fontWeight: '700',
  },
  close: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  closeText: {
    color: colors.gold,
    fontWeight: '600',
  },
  section: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  warning: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.24)',
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.goldSoft,
    fontWeight: '600',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.surfaceAlt,
  },
  chipText: {
    color: colors.cream,
  },
  chipTextActive: {
    color: colors.gold,
  },
  option: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  optionActive: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  optionText: {
    color: colors.cream,
  },
  optionTextActive: {
    color: colors.gold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 8,
    gap: spacing.md,
  },
  toggleTitle: {
    color: colors.cream,
    fontSize: 16,
  },
});
