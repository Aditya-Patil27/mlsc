// NFT Credential (Certificate)
export interface NFTCredential {
  id: string;
  nftId: string;            // On-chain NFT ID
  recipientId: string;
  recipientName: string;
  title: string;
  achievement: string;
  issuer: string;
  issuerLogo?: string;
  issuedDate: Date;
  metadata: {
    eventName?: string;
    position?: string;      // 1st place, 2nd place, etc.
    category?: string;
    track?: string;
    imageUrl?: string;
    pdfUrl?: string;
    additionalInfo?: Record<string, string>;
  };
  soulbound: boolean;       // Non-transferable
  txHash: string;
  verificationUrl: string;  // Public verification link
  shares: number;           // Number of times shared
  verifications: number;    // Number of times verified
}

// Credential category
export type CredentialCategory =
  | "academic"
  | "hackathon"
  | "workshop"
  | "internship"
  | "sports"
  | "cultural"
  | "leadership"
  | "volunteer"
  | "certification"
  | "other";

// Share configuration
export interface ShareConfig {
  credentialId: string;
  expiresAt?: Date;
  maxViews?: number;
  visibleFields: string[];  // Which fields to show
  requiresAuth: boolean;
}

// Share record
export interface ShareRecord {
  id: string;
  credentialId: string;
  shareUrl: string;
  qrCode: string;
  config: ShareConfig;
  createdAt: Date;
  viewCount: number;
}

// External verification result
export interface VerificationResult {
  isValid: boolean;
  credential: NFTCredential | null;
  verifiedAt: Date;
  blockchain: {
    network: string;
    txHash: string;
    blockNumber: number;
    confirmedAt: Date;
  };
  issuer: {
    name: string;
    verified: boolean;
    logo?: string;
  };
}
