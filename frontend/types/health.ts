// Health credential types
export type CredentialType = "medical-leave" | "vaccination" | "fitness" | "disability";

// Hospital/Healthcare provider
export interface HealthProvider {
  id: string;
  name: string;
  address: string;
  isAuthorized: boolean;
  verificationKey?: string;
}

// Health credential (issued by hospital)
export interface HealthCredential {
  id: string;
  studentId: string;
  issuer: HealthProvider;
  issuedDate: Date;
  validFrom: Date;
  validTo: Date;
  credentialType: CredentialType;
  // Private data (only student sees)
  privateData: {
    diagnosis?: string;
    doctorName?: string;
    prescriptions?: string[];
    notes?: string;
  };
  // Public commitments (hashed for ZK proofs)
  commitments: {
    dateRangeHash: string;
    issuerHash: string;
    credentialTypeHash: string;
  };
  txHash: string;           // On-chain credential
  status: "valid" | "expired" | "revoked";
}

// ZK Proof claims
export interface ZKProofClaims {
  hasValidCredential: boolean;
  fromAuthorizedIssuer: boolean;
  coversDateRange: boolean;
  isFirstTimeUse: boolean;
}

// Generated ZK Proof
export interface ZKProof {
  id: string;
  credentialId: string;
  proof: string;            // The actual proof data
  claims: ZKProofClaims;
  generatedAt: Date;
  expiresAt: Date;
}

// Usage record for duplicate prevention
export interface CredentialUsage {
  id: string;
  credentialId: string;
  usedAt: Date;
  purpose: string;
  verifier: string;
  txHash: string;
}

// Leave request (submitted by student)
export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  credentialId: string;
  requestedDates: [Date, Date];
  reason: string;
  zkProof: ZKProof;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected" | "needs-review";
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

// AI Risk assessment for health claims
export interface AIRiskAssessment {
  score: number;            // 0-100 (higher = more suspicious)
  level: "low" | "medium" | "high";
  patterns: AIRiskPattern[];
  recommendation: "auto-approve" | "manual-review" | "reject";
  explanation: string;
}

// Individual risk pattern
export interface AIRiskPattern {
  type: "exam-correlation" | "frequency-anomaly" | "timing-pattern" | "duplicate-attempt";
  description: string;
  severity: "low" | "medium" | "high";
  evidence: string[];
  probability: number;      // 0-100
}
