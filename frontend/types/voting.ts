// Election
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  candidates: Candidate[];
  eligibleVoterCount: number;
  voteTokenAsaId: string;   // Algorand ASA ID for vote tokens
  status: "upcoming" | "active" | "ended";
  createdBy: string;
}

// Candidate in an election
export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  manifesto: string;
  imageUrl?: string;
  position: string;         // Position they're running for
  voteCount: number;        // Public, verifiable on-chain
}

// Vote record
export interface Vote {
  id: string;
  electionId: string;
  voterId: string;          // Student ID (hashed for privacy)
  candidateId: string;
  voteToken: string;        // ASA token ID (burned on vote)
  timestamp: Date;
  txHash: string;           // Token burn transaction
}

// Voter eligibility
export interface VoterEligibility {
  studentId: string;
  electionId: string;
  isEligible: boolean;
  hasVoted: boolean;
  voteToken?: string;
  reason?: string;          // If not eligible, why
}

// Election results
export interface ElectionResults {
  electionId: string;
  title: string;
  totalVotes: number;
  turnout: number;          // percentage
  candidates: CandidateResult[];
  winner?: CandidateResult;
  finalizedAt?: Date;
}

// Individual candidate result
export interface CandidateResult {
  candidateId: string;
  name: string;
  voteCount: number;
  percentage: number;
  rank: number;
}
