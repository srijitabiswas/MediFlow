// ─── Haversine distance between two lat/lng points, in km ───────────────────
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Format a distance in km for display ─────────────────────────────────────
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Given a center point (the patient's real device location) and a fixed
 * distance + bearing "seed" stored on each doctor/clinic, compute a real
 * lat/lng for that clinic that sits exactly `km` away from the patient.
 *
 * NOTE: this is a deliberate simulation for the prototype — we don't have
 * real geocoded hospital addresses, so instead of hardcoding coordinates
 * that would only make sense in one specific city, every clinic is placed
 * at a realistic short distance from WHEREVER the patient actually is.
 * This keeps "nearby doctors" demoable from any location, while the
 * distance numbers shown to the user are still real, consistent math
 * (destination-point formula), not random per render.
 */
export function getClinicCoordinates(userLat, userLng, km, bearingDeg) {
  const R = 6371;
  const brng = (bearingDeg * Math.PI) / 180;
  const lat1 = (userLat * Math.PI) / 180;
  const lng1 = (userLng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(km / R) + Math.cos(lat1) * Math.sin(km / R) * Math.cos(brng)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(km / R) * Math.cos(lat1),
      Math.cos(km / R) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (((lng2 * 180) / Math.PI + 540) % 360) - 180,
  };
}

// ─── Wrap the browser geolocation API in a promise ───────────────────────────
export function requestBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
