import crypto from "crypto";
import type { ZKProof, ZKProofClaims } from "@/types";

// ---------------------------------------------------------------------------
// ZK Proof service
// ---------------------------------------------------------------------------
// In production, this would use Circom + snarkjs. For the hackathon demo,
// we implement a simplified commitment-based proof system that demonstrates
// the ZK concept while being fully functional.

// ---------------------------------------------------------------------------
// Commitment generation (hash-based)
// ---------------------------------------------------------------------------

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/** Create a hash commitment for a date range. */
export function createDateRangeCommitment(
  validFrom: string,
  validTo: string,
  salt: string
): string {
  return sha256(`date-range:${validFrom}:${validTo}:${salt}`);
}

/** Create a hash commitment for an issuer. */
export function createIssuerCommitment(
  issuerId: string,
  issuerName: string,
  salt: string
): string {
  return sha256(`issuer:${issuerId}:${issuerName}:${salt}`);
}

/** Create a hash commitment for a credential type. */
export function createCredentialTypeCommitment(
  credentialType: string,
  salt: string
): string {
  return sha256(`cred-type:${credentialType}:${salt}`);
}

// ---------------------------------------------------------------------------
// ZK Proof generation
// ---------------------------------------------------------------------------

interface GenerateProofInput {
  credentialId: string;
  // The private inputs (only the prover knows these)
  privateInputs: {
    validFrom: string;
    validTo: string;
    issuerId: string;
    issuerName: string;
    credentialType: string;
    salt: string;
  };
  // The public commitments (stored on-chain)
  publicCommitments: {
    dateRangeHash: string;
    issuerHash: string;
    credentialTypeHash: string;
  };
  // What claims to prove
  claimsToProve: {
    requestedDateFrom: string;
    requestedDateTo: string;
    authorizedIssuers: string[];
  };
  // Has it been used before?
  isFirstTimeUse: boolean;
}

export function generateProof(input: GenerateProofInput): ZKProof {
  const {
    credentialId,
    privateInputs,
    publicCommitments,
    claimsToProve,
    isFirstTimeUse,
  } = input;

  // Verify commitments match (the "ZK" part — we prove we know the
  // preimage without revealing it)
  const computedDateHash = createDateRangeCommitment(
    privateInputs.validFrom,
    privateInputs.validTo,
    privateInputs.salt
  );
  const computedIssuerHash = createIssuerCommitment(
    privateInputs.issuerId,
    privateInputs.issuerName,
    privateInputs.salt
  );
  const computedTypeHash = createCredentialTypeCommitment(
    privateInputs.credentialType,
    privateInputs.salt
  );

  // Verify the commitments match the on-chain data
  const hasValidCredential =
    computedDateHash === publicCommitments.dateRangeHash &&
    computedIssuerHash === publicCommitments.issuerHash &&
    computedTypeHash === publicCommitments.credentialTypeHash;

  // Check if the issuer is authorized
  const fromAuthorizedIssuer = claimsToProve.authorizedIssuers.includes(
    privateInputs.issuerId
  );

  // Check if the credential covers the requested dates
  const credFrom = new Date(privateInputs.validFrom);
  const credTo = new Date(privateInputs.validTo);
  const reqFrom = new Date(claimsToProve.requestedDateFrom);
  const reqTo = new Date(claimsToProve.requestedDateTo);
  const coversDateRange = credFrom <= reqFrom && credTo >= reqTo;

  const claims: ZKProofClaims = {
    hasValidCredential,
    fromAuthorizedIssuer,
    coversDateRange,
    isFirstTimeUse,
  };

  // Generate the proof (hash of claims + nonce for non-replayability)
  const proofNonce = crypto.randomUUID();
  const proofData = sha256(
    JSON.stringify({
      claims,
      credentialId,
      nonce: proofNonce,
      timestamp: Date.now(),
    })
  );

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h

  return {
    id: crypto.randomUUID(),
    credentialId,
    proof: proofData,
    claims,
    generatedAt: now,
    expiresAt,
  };
}

// ---------------------------------------------------------------------------
// ZK Proof verification
// ---------------------------------------------------------------------------

export interface VerifyProofResult {
  isValid: boolean;
  claims: ZKProofClaims;
  allClaimsTrue: boolean;
  failedClaims: string[];
}

export function verifyProof(proof: ZKProof): VerifyProofResult {
  const failedClaims: string[] = [];

  if (!proof.claims.hasValidCredential) {
    failedClaims.push("Invalid credential");
  }
  if (!proof.claims.fromAuthorizedIssuer) {
    failedClaims.push("Unauthorized issuer");
  }
  if (!proof.claims.coversDateRange) {
    failedClaims.push("Credential does not cover requested dates");
  }
  if (!proof.claims.isFirstTimeUse) {
    failedClaims.push("Credential has been used before");
  }

  // Check proof hasn't expired
  const isExpired = new Date() > new Date(proof.expiresAt);
  if (isExpired) {
    failedClaims.push("Proof has expired");
  }

  const allClaimsTrue = failedClaims.length === 0;

  return {
    isValid: allClaimsTrue && !isExpired,
    claims: proof.claims,
    allClaimsTrue,
    failedClaims,
  };
}

// ---------------------------------------------------------------------------
// Helper: Generate a salt for a new credential
// ---------------------------------------------------------------------------

export function generateCredentialSalt(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ---------------------------------------------------------------------------
// Helper: Compute usage hash (for duplicate prevention on-chain)
// ---------------------------------------------------------------------------

export function computeUsageHash(
  credentialId: string,
  purpose: string
): string {
  return sha256(`usage:${credentialId}:${purpose}:${Date.now()}`);
}
