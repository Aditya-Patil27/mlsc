import crypto from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface Geofence {
  lat: number;
  lng: number;
  radius: number; // meters
}

export interface WiFiData {
  bssid: string;
  ssid: string;
  signalStrength?: number;
}

export interface DeviceData {
  fingerprint: string;
  userAgent: string;
  platform: string;
  screenResolution?: string;
  timezone?: string;
}

export interface LocationVerificationResult {
  gps: {
    withinGeofence: boolean;
    distance: number; // meters from center
    accuracy: number;
    isMockLocation: boolean;
  };
  wifi: {
    isVerified: boolean;
    bssidMatch: boolean;
    ssidMatch: boolean;
  };
  device: {
    isRegistered: boolean;
    isEmulator: boolean;
    isRooted: boolean;
    fingerprintMatch: boolean;
  };
  time: {
    withinWindow: boolean;
    serverTime: Date;
    clientTimeDrift: number; // ms
  };
  overall: {
    score: number; // 0-100
    passed: boolean;
    failedFactors: string[];
  };
}

// ---------------------------------------------------------------------------
// Geofence verification
// ---------------------------------------------------------------------------

/** Calculate distance between two GPS coordinates (Haversine formula). */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function verifyGeofence(
  location: LocationData,
  geofence: Geofence
): { withinGeofence: boolean; distance: number } {
  const distance = haversineDistance(
    location.lat,
    location.lng,
    geofence.lat,
    geofence.lng
  );
  return {
    withinGeofence: distance <= geofence.radius,
    distance: Math.round(distance),
  };
}

// ---------------------------------------------------------------------------
// Mock location detection
// ---------------------------------------------------------------------------

const MOCK_LOCATION_INDICATORS = [
  // Perfect round coordinates are suspicious
  (lat: number, lng: number) =>
    lat === Math.round(lat) && lng === Math.round(lng),
  // Accuracy too perfect (< 1m on mobile is suspicious)
  (_lat: number, _lng: number, accuracy: number) => accuracy < 1,
  // Accuracy too low (> 500m means likely spoofed)
  (_lat: number, _lng: number, accuracy: number) => accuracy > 500,
];

export function detectMockLocation(location: LocationData): boolean {
  return MOCK_LOCATION_INDICATORS.some((check) =>
    check(location.lat, location.lng, location.accuracy)
  );
}

// ---------------------------------------------------------------------------
// WiFi verification
// ---------------------------------------------------------------------------

export function verifyWiFi(
  wifi: WiFiData,
  allowedBSSIDs: string[]
): { isVerified: boolean; bssidMatch: boolean } {
  const normalizedBSSID = wifi.bssid.toLowerCase().trim();
  const bssidMatch = allowedBSSIDs.some(
    (allowed) => allowed.toLowerCase().trim() === normalizedBSSID
  );
  return { isVerified: bssidMatch, bssidMatch };
}

// ---------------------------------------------------------------------------
// Device verification
// ---------------------------------------------------------------------------

const EMULATOR_SIGNATURES = [
  "generic",
  "emulator",
  "sdk_gphone",
  "android sdk",
  "goldfish",
  "ranchu",
  "vbox",
  "genymotion",
  "bluestacks",
  "nox",
  "memu",
];

const ROOT_INDICATORS = [
  "supersu",
  "magisk",
  "kingroot",
  "cydia",
  "substrate",
];

export function verifyDevice(
  device: DeviceData,
  registeredFingerprint?: string
): {
  isEmulator: boolean;
  isRooted: boolean;
  fingerprintMatch: boolean;
} {
  const ua = device.userAgent.toLowerCase();
  const platform = device.platform.toLowerCase();

  const isEmulator =
    EMULATOR_SIGNATURES.some((sig) => ua.includes(sig) || platform.includes(sig));

  const isRooted = ROOT_INDICATORS.some(
    (sig) => ua.includes(sig) || platform.includes(sig)
  );

  const fingerprintMatch = registeredFingerprint
    ? device.fingerprint === registeredFingerprint
    : true;

  return { isEmulator, isRooted, fingerprintMatch };
}

// ---------------------------------------------------------------------------
// Time window verification
// ---------------------------------------------------------------------------

export function verifyTimeWindow(
  clientTime: Date,
  sessionStart: Date,
  sessionEnd: Date,
  graceMinutes = 5
): {
  withinWindow: boolean;
  serverTime: Date;
  clientTimeDrift: number;
} {
  const serverTime = new Date();
  const clientTimeDrift = Math.abs(serverTime.getTime() - clientTime.getTime());

  const graceMs = graceMinutes * 60 * 1000;
  const windowStart = new Date(sessionStart.getTime() - graceMs);
  const windowEnd = new Date(sessionEnd.getTime() + graceMs);

  const withinWindow =
    serverTime >= windowStart && serverTime <= windowEnd;

  return { withinWindow, serverTime, clientTimeDrift };
}

// ---------------------------------------------------------------------------
// Complete multi-factor verification
// ---------------------------------------------------------------------------

export function verifyLocation(params: {
  location: LocationData;
  wifi: WiFiData | null;
  device: DeviceData;
  clientTime: Date;
  geofence: Geofence;
  allowedBSSIDs: string[];
  sessionStart: Date;
  sessionEnd: Date;
  registeredFingerprint?: string;
  graceMinutes?: number;
}): LocationVerificationResult {
  const {
    location,
    wifi,
    device,
    clientTime,
    geofence,
    allowedBSSIDs,
    sessionStart,
    sessionEnd,
    registeredFingerprint,
    graceMinutes,
  } = params;

  // 1. GPS
  const geoResult = verifyGeofence(location, geofence);
  const isMockLocation = detectMockLocation(location);

  // 2. WiFi
  const wifiResult = wifi
    ? verifyWiFi(wifi, allowedBSSIDs)
    : { isVerified: false, bssidMatch: false };

  // 3. Device
  const deviceResult = verifyDevice(device, registeredFingerprint);

  // 4. Time
  const timeResult = verifyTimeWindow(
    clientTime,
    sessionStart,
    sessionEnd,
    graceMinutes
  );

  // Calculate overall score
  const failedFactors: string[] = [];
  let score = 100;

  if (!geoResult.withinGeofence) {
    score -= 30;
    failedFactors.push("GPS: Outside geofence");
  }
  if (isMockLocation) {
    score -= 25;
    failedFactors.push("GPS: Mock location detected");
  }
  if (!wifiResult.isVerified && wifi) {
    score -= 20;
    failedFactors.push("WiFi: BSSID not matching campus network");
  }
  if (!wifi) {
    score -= 10;
    failedFactors.push("WiFi: Not connected to campus network");
  }
  if (deviceResult.isEmulator) {
    score -= 30;
    failedFactors.push("Device: Emulator detected");
  }
  if (deviceResult.isRooted) {
    score -= 15;
    failedFactors.push("Device: Root/jailbreak detected");
  }
  if (!deviceResult.fingerprintMatch) {
    score -= 15;
    failedFactors.push("Device: Unregistered device");
  }
  if (!timeResult.withinWindow) {
    score -= 20;
    failedFactors.push("Time: Outside lecture window");
  }
  if (timeResult.clientTimeDrift > 60000) {
    score -= 10;
    failedFactors.push("Time: Significant clock drift detected");
  }

  score = Math.max(0, score);

  return {
    gps: {
      withinGeofence: geoResult.withinGeofence,
      distance: geoResult.distance,
      accuracy: location.accuracy,
      isMockLocation,
    },
    wifi: {
      isVerified: wifiResult.isVerified,
      bssidMatch: wifiResult.bssidMatch,
      ssidMatch: wifiResult.isVerified,
    },
    device: {
      isRegistered: deviceResult.fingerprintMatch,
      isEmulator: deviceResult.isEmulator,
      isRooted: deviceResult.isRooted,
      fingerprintMatch: deviceResult.fingerprintMatch,
    },
    time: {
      withinWindow: timeResult.withinWindow,
      serverTime: timeResult.serverTime,
      clientTimeDrift: timeResult.clientTimeDrift,
    },
    overall: {
      score,
      passed: score >= 60,
      failedFactors,
    },
  };
}

// ---------------------------------------------------------------------------
// Verification hash (for on-chain recording)
// ---------------------------------------------------------------------------

export function computeVerificationHash(result: LocationVerificationResult): string {
  const payload = JSON.stringify({
    gps: result.gps.withinGeofence,
    wifi: result.wifi.isVerified,
    device: result.device.fingerprintMatch,
    time: result.time.withinWindow,
    score: result.overall.score,
    timestamp: result.time.serverTime.toISOString(),
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}
