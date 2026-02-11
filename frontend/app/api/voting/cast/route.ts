import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { requireAuth } from "@/lib/services/auth";
import {
  getElectionById,
  hasUserVoted,
  recordVote,
  incrementCandidateVotes,
} from "@/lib/services/database";
import { recordVoteOnChain } from "@/lib/services/algorand";

// POST: Cast a vote
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["student"]);

    const body = await request.json();
    const { electionId, candidateId } = body;

    if (!electionId || !candidateId) {
      return NextResponse.json(
        { error: "electionId and candidateId are required" },
        { status: 400 }
      );
    }

    // 1. Check election exists and is active
    const election = await getElectionById(electionId);
    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }
    if (election.status !== "active") {
      return NextResponse.json(
        { error: "Election is not active" },
        { status: 400 }
      );
    }

    // Check time window
    const now = new Date();
    if (now < new Date(election.start_date) || now > new Date(election.end_date)) {
      return NextResponse.json(
        { error: "Voting is outside the allowed time window" },
        { status: 400 }
      );
    }

    // 2. Create voter hash (anonymous but unique)
    const voterHash = crypto
      .createHash("sha256")
      .update(`${user.sub}:${electionId}`)
      .digest("hex");

    // 3. Check if already voted
    const alreadyVoted = await hasUserVoted(electionId, voterHash);
    if (alreadyVoted) {
      return NextResponse.json(
        { error: "You have already voted in this election" },
        { status: 409 }
      );
    }

    // 4. Record vote on blockchain (token burn)
    let txHash = "";
    try {
      const txResult = await recordVoteOnChain({
        electionId,
        candidateId,
        voterHash,
      });
      txHash = txResult.txId;
    } catch (err) {
      console.error("Blockchain vote recording failed:", err);
      txHash = `pending-${uuidv4()}`;
    }

    // 5. Record in database
    const voteId = uuidv4();
    await recordVote({
      id: voteId,
      election_id: electionId,
      voter_hash: voterHash,
      candidate_id: candidateId,
      tx_hash: txHash,
      voted_at: now.toISOString(),
    });

    // 6. Increment candidate vote count
    await incrementCandidateVotes(candidateId);

    return NextResponse.json({
      success: true,
      vote: {
        id: voteId,
        txHash,
        votedAt: now.toISOString(),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Cast vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
