// Verification factor status
export type FactorStatus = "pending" | "checking" | "verified" | "failed";

// Individual verification factor
export interface VerificationFactor {
  id: string;
  name: string;
  status: FactorStatus;
  details: string;
  timestamp?: Date;
}

// GPS verification data
export interface GPSVerification {
  lat: number;
  lng: number;
  accuracy: number;       // meters
  withinGeofence: boolean;
  campusName?: string;
}

// WiFi verification data
export interface WiFiVerification {
  bssid: string;
  ssid: string;
  signalStrength?: number;
  isVerified: boolean;
}

// Device verification data
export interface DeviceVerification {
  fingerprint: string;
  deviceName: string;
  isRegistered: boolean;
  isEmulator: boolean;
  isRooted: boolean;
}

// Time verification data
export interface TimeVerification {
  serverTime: Date;
  clientTime: Date;
  withinWindow: boolean;
  graceMinutes: number;
}

// Bluetooth beacon verification
export interface BluetoothVerification {
  beaconId: string;
  roomName: string;
  isDetected: boolean;
}

// Complete multi-factor verification result
export interface MultiFactorVerification {
  gps: GPSVerification & { status: FactorStatus };
  wifi: WiFiVerification & { status: FactorStatus };
  time: TimeVerification & { status: FactorStatus };
  device: DeviceVerification & { status: FactorStatus };
  bluetooth?: BluetoothVerification & { status: FactorStatus };
}

// AI verification result
export interface AIVerification {
  status: "legitimate" | "flagged" | "suspicious";
  score: number;          // 0-100
  reason?: string;
  patterns?: string[];
}

// Attendance session (created by faculty)
export interface AttendanceSession {
  id: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  room: string;
  startTime: Date;
  endTime: Date;
  qrCode: string;
  qrNonce: string;
  qrExpiresAt: Date;
  geofence: {
    lat: number;
    lng: number;
    radius: number;       // meters
  };
  allowedBSSIDs: string[];
  bluetoothBeacon?: string;
  status: "active" | "ended" | "cancelled";
}

// Individual attendance record
export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  timestamp: Date;
  verification: MultiFactorVerification;
  aiVerification: AIVerification;
  txHash: string;         // Algorand transaction hash
  status: "present" | "late" | "flagged" | "absent";
}

// Anomaly detected by AI
export interface AttendanceAnomaly {
  id: string;
  studentId: string;
  studentName: string;
  type: "location-spoof" | "pattern-abuse" | "device-mismatch" | "timing-anomaly";
  severity: "low" | "medium" | "high";
  description: string;
  detectedAt: Date;
  sessionId?: string;
}

// Attendance statistics
export interface AttendanceStats {
  present: number;
  late: number;
  flagged: number;
  absent: number;
  total: number;
  percentage: number;
}
