/**
 * CampusChain — Demo Seed Data
 *
 * Realistic data for hackathon demo. This module exports demo constants
 * that can be used by the application when real Supabase data isn't available.
 *
 * Usage: import { DEMO_USERS, DEMO_SESSIONS, ... } from '@/data/seed-demo'
 */

// ============================================================================
// DEMO USERS
// ============================================================================

export const DEMO_USERS = {
  student: {
    id: "stu-001-aditya",
    name: "Aditya Patil",
    email: "aditya.patil@vit.edu",
    role: "student" as const,
    prn: "22CS1045",
    department: "Computer Science",
    year: 3,
    wallet_address: "DEMO_STUDENT_WALLET_ADDR_ALGORAND_TESTNET",
    device_fingerprint: "fp_iphone14pro_aditya_001",
  },
  faculty: {
    id: "fac-001-sharma",
    name: "Prof. Sharma",
    email: "sharma@vit.edu",
    role: "faculty" as const,
    employee_id: "FAC-CS-042",
    department: "Computer Science",
    wallet_address: "DEMO_FACULTY_WALLET_ADDR_ALGORAND_TESTNET",
  },
  admin: {
    id: "adm-001-dean",
    name: "Dr. Kulkarni",
    email: "kulkarni@vit.edu",
    role: "admin" as const,
    employee_id: "ADM-001",
    department: "Administration",
    wallet_address: "DEMO_ADMIN_WALLET_ADDR_ALGORAND_TESTNET",
  },
} as const;

// ============================================================================
// DEMO ATTENDANCE SESSIONS
// ============================================================================

export const DEMO_SESSIONS = [
  {
    id: "sess-ds-042",
    course_code: "CS301",
    course_name: "Data Structures",
    faculty_id: DEMO_USERS.faculty.id,
    room: "301",
    start_time: "2026-02-15T10:00:00+05:30",
    end_time: "2026-02-15T11:00:00+05:30",
    qr_nonce: "qr_nonce_ds042_live",
    geofence_lat: 18.4574,
    geofence_lng: 73.8508,
    geofence_radius: 100,
    allowed_bssids: ["AA:BB:CC:DD:EE:01", "AA:BB:CC:DD:EE:02"],
    bluetooth_beacon: "beacon-room-301",
    status: "active" as const,
  },
  {
    id: "sess-algo-018",
    course_code: "CS405",
    course_name: "Design & Analysis of Algorithms",
    faculty_id: DEMO_USERS.faculty.id,
    room: "205",
    start_time: "2026-02-15T11:30:00+05:30",
    end_time: "2026-02-15T12:30:00+05:30",
    qr_nonce: "qr_nonce_algo018_live",
    geofence_lat: 18.4572,
    geofence_lng: 73.8511,
    geofence_radius: 100,
    allowed_bssids: ["AA:BB:CC:DD:EE:03"],
    status: "active" as const,
  },
];

// ============================================================================
// DEMO ATTENDANCE RECORDS
// ============================================================================

export const DEMO_ATTENDANCE_RECORDS = [
  {
    id: "att-001",
    session_id: DEMO_SESSIONS[0].id,
    student_id: DEMO_USERS.student.id,
    timestamp: "2026-02-15T10:03:22+05:30",
    gps_lat: 18.4573,
    gps_lng: 73.8509,
    gps_accuracy: 5.2,
    within_geofence: true,
    wifi_bssid: "AA:BB:CC:DD:EE:01",
    wifi_verified: true,
    device_fingerprint: DEMO_USERS.student.device_fingerprint,
    device_is_emulator: false,
    time_within_window: true,
    bluetooth_detected: true,
    ai_status: "legitimate" as const,
    ai_score: 0,
    ai_reason: "All factors verified. No anomalies detected.",
    tx_hash: "DEMO_TX_ATTENDANCE_001_ALGORAND",
    status: "present" as const,
  },
  // Flagged student example
  {
    id: "att-002-flagged",
    session_id: DEMO_SESSIONS[0].id,
    student_id: "stu-002-amit",
    timestamp: "2026-02-15T10:01:45+05:30",
    gps_lat: 18.4590,
    gps_lng: 73.8490,
    gps_accuracy: 45.0,
    within_geofence: true,
    wifi_bssid: null,
    wifi_verified: false,
    device_fingerprint: "fp_android_amit_002",
    device_is_emulator: false,
    time_within_window: true,
    bluetooth_detected: false,
    ai_status: "flagged" as const,
    ai_score: 50,
    ai_reason:
      "GPS says campus but WiFi not connected. Possible GPS spoofing.",
    tx_hash: "DEMO_TX_ATTENDANCE_002_FLAGGED",
    status: "flagged" as const,
  },
];

// ============================================================================
// DEMO HEALTH CREDENTIALS & LEAVE REQUESTS
// ============================================================================

export const DEMO_HEALTH_CREDENTIAL = {
  id: "hc-001",
  student_id: DEMO_USERS.student.id,
  issuer_id: "hospital-city-general",
  issuer_name: "City General Hospital, Pune",
  issued_date: "2026-02-08T09:00:00+05:30",
  valid_from: "2026-02-08T00:00:00+05:30",
  valid_to: "2026-02-10T23:59:59+05:30",
  credential_type: "medical_leave",
  date_range_hash: "0x7a6b...demo_hash_dates",
  issuer_hash: "0x3c4d...demo_hash_issuer",
  credential_type_hash: "0x9e0f...demo_hash_type",
  tx_hash: "DEMO_TX_HEALTH_CRED_001",
  status: "valid" as const,
};

export const DEMO_LEAVE_REQUEST = {
  id: "lr-001",
  student_id: DEMO_USERS.student.id,
  credential_id: DEMO_HEALTH_CREDENTIAL.id,
  date_from: "2026-02-08",
  date_to: "2026-02-10",
  reason: "Medical leave — verified via ZK proof",
  zk_proof: {
    proof: { pi_a: ["demo_a"], pi_b: [["demo_b"]], pi_c: ["demo_c"] },
    publicSignals: ["1", "1", "1", "1"], // all TRUE
  },
  ai_risk_score: 15,
  ai_risk_level: "low" as const,
  ai_recommendation: "auto-approve" as const,
  status: "approved" as const,
};

// Suspicious student for demo
export const DEMO_SUSPICIOUS_LEAVE = {
  id: "lr-002-suspicious",
  student_id: "stu-003-rahul",
  credential_id: "hc-002-suspicious",
  date_from: "2026-02-09",
  date_to: "2026-02-11",
  reason: "Medical leave",
  zk_proof: {
    proof: { pi_a: ["demo_a2"], pi_b: [["demo_b2"]], pi_c: ["demo_c2"] },
    publicSignals: ["1", "1", "1", "1"],
  },
  ai_risk_score: 87,
  ai_risk_level: "high" as const,
  ai_recommendation: "reject" as const,
  ai_explanation:
    'Leave dates overlap with mid-semester exam. 4 out of 5 past leaves coincided with exams (80% correlation). Medical leaves this semester: 5 vs class average: 0.8 (6x higher).',
  status: "needs-review" as const,
};

// ============================================================================
// DEMO CREDENTIAL NFTS
// ============================================================================

export const DEMO_CREDENTIAL_NFT = {
  id: "cred-nft-001",
  nft_id: "CAMPUS-CERT-0001",
  asset_id: 123456789,
  recipient_id: DEMO_USERS.student.id,
  title: "Hackspiration'26 — Winner 🥇",
  achievement: "Won First Place in Hackspiration'26, Track: AI on Blockchain",
  issuer: "Vishwakarma Institute of Technology",
  issuer_logo: "/vit-logo.png",
  issued_date: "2026-02-15T17:00:00+05:30",
  category: "hackathon",
  event_name: "Hackspiration'26",
  position: "1st Place",
  metadata_url: "ipfs://QmDemo.../metadata.json",
  soulbound: true,
  tx_hash: "DEMO_TX_NFT_MINT_001",
  verification_url: "https://campuschain.vercel.app/verify/CAMPUS-CERT-0001",
  shares: 12,
  verifications: 47,
};

// ============================================================================
// DEMO ELECTION
// ============================================================================

export const DEMO_ELECTION = {
  id: "election-council-2026",
  title: "Student Council Election 2026",
  description:
    "Annual student council election. Vote for your preferred candidate. One vote per student, anonymous, immutable, verifiable on Algorand.",
  start_date: "2026-02-15T09:00:00+05:30",
  end_date: "2026-02-15T18:00:00+05:30",
  eligible_voter_count: 1200,
  vote_token_asa_id: "DEMO_ASA_VOTE_TOKEN_ID",
  status: "active" as const,
  candidates: [
    {
      id: "cand-001",
      name: "Rahul Sharma",
      manifesto:
        "Better hostel facilities, 24/7 library access, more sports events",
      position: "President",
      vote_count: 342,
    },
    {
      id: "cand-002",
      name: "Priya Patel",
      manifesto:
        "More hackathons, industry connections, improved cafeteria menu",
      position: "President",
      vote_count: 298,
    },
    {
      id: "cand-003",
      name: "Vikram Desai",
      manifesto:
        "Green campus initiative, mental health support, transparent budgets",
      position: "President",
      vote_count: 187,
    },
  ],
};
