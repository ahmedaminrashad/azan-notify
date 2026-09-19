import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { usePrayerApp } from './src/hooks/usePrayerApp';
import { colors } from './src/theme';

export default function App() {
  const { settings, updateSettings, prayers, nextPrayer, now, loading, error, scheduledCount } =
    usePrayerApp();
  const [showSettings, setShowSettings] = useState(false);

  if (loading || !settings) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.center}>
          <StatusBar style="light" />
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loading}>Preparing prayer times…</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.center}>
          <StatusBar style="light" />
          <Text style={styles.error}>{error}</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {showSettings ? (
        <SettingsScreen
          settings={settings}
          onChange={updateSettings}
          scheduledCount={scheduledCount}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <HomeScreen
          settings={settings}
          prayers={prayers}
          nextPrayer={nextPrayer}
          now={now}
          scheduledCount={scheduledCount}
          onOpenSettings={() => setShowSettings(true)}
          onChange={updateSettings}
        />
      )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loading: {
    color: colors.cream,
    marginTop: 12,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
});
