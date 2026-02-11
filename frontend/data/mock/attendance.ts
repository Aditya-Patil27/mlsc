import { AttendanceSession, AttendanceRecord, AttendanceAnomaly } from "@/types";

// Helper to generate a date relative to now
const relativeDate = (hoursFromNow: number): Date => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date;
};

// Current active session
export const mockActiveSession: AttendanceSession = {
  id: "SESSION001",
  courseCode: "CS301",
  courseName: "Data Structures & Algorithms",
  facultyId: "FAC001",
  facultyName: "Prof. Sharma",
  room: "Room 301",
  startTime: relativeDate(-0.5), // Started 30 mins ago
  endTime: relativeDate(0.5),    // Ends in 30 mins
  qrCode: "data:image/png;base64,QR_CODE_PLACEHOLDER",
  qrNonce: "nonce_" + Date.now(),
  qrExpiresAt: relativeDate(0.01), // 30 seconds
  geofence: {
    lat: 18.4574,
    lng: 73.8508,
    radius: 100,
  },
  allowedBSSIDs: [
    "AA:BB:CC:DD:EE:F1",
    "AA:BB:CC:DD:EE:F2",
    "AA:BB:CC:DD:EE:F3",
  ],
  bluetoothBeacon: "BEACON-ROOM-301",
  status: "active",
};

// Mock sessions for history
export const mockSessions: AttendanceSession[] = [
  mockActiveSession,
  {
    id: "SESSION002",
    courseCode: "CS302",
    courseName: "Operating Systems",
    facultyId: "FAC002",
    facultyName: "Prof. Deshmukh",
    room: "Room 204",
    startTime: relativeDate(-26),
    endTime: relativeDate(-25),
    qrCode: "",
    qrNonce: "",
    qrExpiresAt: relativeDate(-25),
    geofence: { lat: 18.4574, lng: 73.8508, radius: 100 },
    allowedBSSIDs: [],
    status: "ended",
  },
  {
    id: "SESSION003",
    courseCode: "CS303",
    courseName: "Database Management",
    facultyId: "FAC003",
    facultyName: "Prof. Joshi",
    room: "Room 105",
    startTime: relativeDate(-50),
    endTime: relativeDate(-49),
    qrCode: "",
    qrNonce: "",
    qrExpiresAt: relativeDate(-49),
    geofence: { lat: 18.4574, lng: 73.8508, radius: 100 },
    allowedBSSIDs: [],
    status: "ended",
  },
];

// Mock attendance records for the active session
export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "ATT001",
    sessionId: "SESSION001",
    studentId: "STU001",
    studentName: "Aditya Prashant Patil",
    timestamp: relativeDate(-0.45),
    verification: {
      gps: {
        lat: 18.4574,
        lng: 73.8508,
        accuracy: 5,
        withinGeofence: true,
        campusName: "VIT Pune Campus",
        status: "verified",
      },
      wifi: {
        bssid: "AA:BB:CC:DD:EE:F1",
        ssid: "VIT-STUDENT-5G",
        signalStrength: -45,
        isVerified: true,
        status: "verified",
      },
      time: {
        serverTime: relativeDate(-0.45),
        clientTime: relativeDate(-0.45),
        withinWindow: true,
        graceMinutes: 5,
        status: "verified",
      },
      device: {
        fingerprint: "fp_abc123def456",
        deviceName: "Aditya's iPhone 14",
        isRegistered: true,
        isEmulator: false,
        isRooted: false,
        status: "verified",
      },
      bluetooth: {
        beaconId: "BEACON-ROOM-301",
        roomName: "Room 301",
        isDetected: true,
        status: "verified",
      },
    },
    aiVerification: {
      status: "legitimate",
      score: 95,
      reason: "All factors verified. No anomalies detected.",
    },
    txHash: "ALGO7XNLQ3KCQHVMF2TML4HKPX5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N",
    status: "present",
  },
  {
    id: "ATT002",
    sessionId: "SESSION001",
    studentId: "STU002",
    studentName: "Rahul Sharma",
    timestamp: relativeDate(-0.43),
    verification: {
      gps: {
        lat: 18.4574,
        lng: 73.8508,
        accuracy: 8,
        withinGeofence: true,
        campusName: "VIT Pune Campus",
        status: "verified",
      },
      wifi: {
        bssid: "AA:BB:CC:DD:EE:F2",
        ssid: "VIT-STUDENT-5G",
        signalStrength: -52,
        isVerified: true,
        status: "verified",
      },
      time: {
        serverTime: relativeDate(-0.43),
        clientTime: relativeDate(-0.43),
        withinWindow: true,
        graceMinutes: 5,
        status: "verified",
      },
      device: {
        fingerprint: "fp_xyz789abc012",
        deviceName: "Rahul's Samsung S23",
        isRegistered: true,
        isEmulator: false,
        isRooted: false,
        status: "verified",
      },
    },
    aiVerification: {
      status: "legitimate",
      score: 92,
      reason: "All factors verified. No anomalies detected.",
    },
    txHash: "ALGO8YNMQ4LDRIS2NG3UNK5JPLY6Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O",
    status: "present",
  },
  {
    id: "ATT003",
    sessionId: "SESSION001",
    studentId: "STU004",
    studentName: "Amit Kumar",
    timestamp: relativeDate(-0.40),
    verification: {
      gps: {
        lat: 18.4590,
        lng: 73.8520,
        accuracy: 15,
        withinGeofence: true,
        campusName: "VIT Pune Campus",
        status: "verified",
      },
      wifi: {
        bssid: "XX:YY:ZZ:AA:BB:CC",
        ssid: "Unknown Network",
        signalStrength: -70,
        isVerified: false,
        status: "failed",
      },
      time: {
        serverTime: relativeDate(-0.40),
        clientTime: relativeDate(-0.40),
        withinWindow: true,
        graceMinutes: 5,
        status: "verified",
      },
      device: {
        fingerprint: "fp_mno345pqr678",
        deviceName: "Amit's OnePlus",
        isRegistered: true,
        isEmulator: false,
        isRooted: false,
        status: "verified",
      },
    },
    aiVerification: {
      status: "flagged",
      score: 45,
      reason: "GPS shows campus, but WiFi not connected to campus network. Possible location spoofing.",
      patterns: ["WiFi mismatch detected"],
    },
    txHash: "ALGO0APQR6NFTLU4PI5WPM7LNRA8B1C2D3E4F5G6H7I8J9K0L1M2N3O4P",
    status: "flagged",
  },
];

// Mock anomalies
export const mockAnomalies: AttendanceAnomaly[] = [
  {
    id: "ANOM001",
    studentId: "STU004",
    studentName: "Amit Kumar",
    type: "location-spoof",
    severity: "high",
    description: "GPS says campus, but WiFi not connected to campus network",
    detectedAt: relativeDate(-0.40),
    sessionId: "SESSION001",
  },
  {
    id: "ANOM002",
    studentId: "STU006",
    studentName: "Vikram Singh",
    type: "pattern-abuse",
    severity: "medium",
    description: "Marked attendance, left after 5 mins (WiFi disconnected). 12 times this month.",
    detectedAt: relativeDate(-24),
    sessionId: "SESSION002",
  },
  {
    id: "ANOM003",
    studentId: "STU007",
    studentName: "Neha Reddy",
    type: "timing-anomaly",
    severity: "low",
    description: "Always marks at exactly 10:00:00 AM. Possible automated/scripted attendance.",
    detectedAt: relativeDate(-48),
  },
];

// Statistics for the active session
export const mockSessionStats = {
  present: 42,
  late: 3,
  flagged: 2,
  absent: 13,
  total: 60,
  percentage: 75,
};
