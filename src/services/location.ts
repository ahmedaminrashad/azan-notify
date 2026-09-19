import * as Location from 'expo-location';
import type { AppSettings } from '../types';

export async function requestAndReadGps(): Promise<{
  latitude: number;
  longitude: number;
  locationLabel: string;
} | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const { latitude, longitude } = position.coords;
  let locationLabel = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = places[0];
    if (place) {
      const city = place.city || place.subregion || place.district;
      const country = place.country;
      locationLabel = [city, country].filter(Boolean).join(', ') || locationLabel;
    }
  } catch {
    // Keep coordinate label if reverse geocoding is unavailable.
  }

  return { latitude, longitude, locationLabel };
}

export function coordinatesFromSettings(settings: AppSettings) {
  return {
    latitude: settings.latitude,
    longitude: settings.longitude,
    label: settings.locationLabel,
  };
}
