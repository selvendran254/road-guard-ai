import { api } from './api';

let tracking = false;

export async function ensureTripTracking() {
  if (tracking) return;
  const { trip } = await api.getActiveTrip() as { trip: { id: string; distanceKm: number } | null };
  if (!trip) {
    await api.startTrip();
  }
  tracking = true;
}

export async function updateTripFromLocation(_lat: number, _lng: number, speed?: number) {
  try {
    const { trip } = await api.getActiveTrip() as { trip: { distanceKm: number } | null };
    if (!trip) return;
    const speedKmh = speed ? speed * 3.6 : 30;
    await api.updateTrip({
      distanceKm: trip.distanceKm + 0.05,
      avgSpeed: Math.round(speedKmh),
      harshBraking: speedKmh > 80 ? 1 : 0,
    });
  } catch {
    /* trip may not be active */
  }
}
