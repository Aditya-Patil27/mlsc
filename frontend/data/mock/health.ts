import { HealthCredential, LeaveRequest, AIRiskAssessment } from "@/types";

// Mock health credentials
export const mockHealthCredentials: HealthCredential[] = [
  {
    id: "HC001",
    studentId: "STU001",
    issuer: {
      id: "HOSP001",
      name: "City General Hospital",
      address: "123 Health Street, Pune",
      isAuthorized: true,
    },
    issuedDate: new Date("2026-02-08"),
    validFrom: new Date("2026-02-08"),
    validTo: new Date("2026-02-10"),
    credentialType: "medical-leave",
    privateData: {
      diagnosis: "Viral fever with mild symptoms",
      doctorName: "Dr. Patel",
      prescriptions: ["Paracetamol 500mg", "Rest for 3 days"],
    },
    commitments: {
      dateRangeHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
      issuerHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
      credentialTypeHash: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    },
    txHash: "ALGO_HEALTH_001_7XNLQ3KCQHVMF2TML4HKPX5Y6Z7A8B9C0D",
    status: "valid",
  },
  {
    id: "HC002",
    studentId: "STU001",
    issuer: {
      id: "HOSP002",
      name: "VIT Medical Center",
      address: "VIT Pune Campus",
      isAuthorized: true,
    },
    issuedDate: new Date("2025-12-15"),
    validFrom: new Date("2025-12-15"),
    validTo: new Date("2025-12-16"),
    credentialType: "vaccination",
    privateData: {
      diagnosis: "COVID-19 Booster Dose",
      doctorName: "Dr. Sharma",
    },
    commitments: {
      dateRangeHash: "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
      issuerHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
      credentialTypeHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    },
    txHash: "ALGO_HEALTH_002_8YNMQ4LDRIS2NG3UNK5JPLY6Z8A9B0C1D",
    status: "valid",
  },
];

// Mock leave requests
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "LR001",
    studentId: "STU002",
    studentName: "Rahul Sharma",
    credentialId: "HC003",
    requestedDates: [new Date("2026-02-08"), new Date("2026-02-10")],
    reason: "Medical leave as per hospital credential",
    zkProof: {
      id: "ZKP001",
      credentialId: "HC003",
      proof: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
      claims: {
        hasValidCredential: true,
        fromAuthorizedIssuer: true,
        coversDateRange: true,
        isFirstTimeUse: true,
      },
      generatedAt: new Date("2026-02-09T10:30:00"),
      expiresAt: new Date("2026-02-09T22:30:00"),
    },
    submittedAt: new Date("2026-02-09T10:32:00"),
    status: "pending",
  },
];

// Mock AI risk assessment
export const mockRiskAssessment: AIRiskAssessment = {
  score: 87,
  level: "high",
  patterns: [
    {
      type: "exam-correlation",
      description: "Leave request coincides with mid-semester exam (Feb 9)",
      severity: "high",
      evidence: [
        "4th time leave coincides with exam",
        "Mid-semester exam: Feb 9",
        "Probability of coincidence: 2.3%",
      ],
      probability: 97.7,
    },
    {
      type: "frequency-anomaly",
      description: "Medical leaves this semester: 5 (class average: 0.8)",
      severity: "medium",
      evidence: [
        "6x higher than peers",
        "All from different hospitals",
      ],
      probability: 85,
    },
  ],
  recommendation: "manual-review",
  explanation: "While the credential is technically valid, the pattern suggests possible strategic use. Recommend faculty interview.",
};
