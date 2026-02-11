import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import {
  getElectionById,
  getCandidatesByElection,
} from "@/lib/services/database";

// GET: Get election results
export async function GET(
  request: NextRequest,
  { params }: { params: { electionId: string } }
) {
  try {
    await requireAuth(request);

    const { electionId } = params;

    const election = await getElectionById(electionId);
    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    const candidates = await getCandidatesByElection(electionId);
    const totalVotes = candidates.reduce((sum, c) => sum + c.vote_count, 0);

    const rankedCandidates = candidates
      .map((c, index) => ({
        candidateId: c.id,
        name: c.name,
        voteCount: c.vote_count,
        percentage:
          totalVotes > 0 ? Math.round((c.vote_count / totalVotes) * 100) : 0,
        rank: index + 1,
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    // Re-assign ranks after sort
    rankedCandidates.forEach((c, i) => {
      c.rank = i + 1;
    });

    const turnout =
      election.eligible_voter_count > 0
        ? Math.round((totalVotes / election.eligible_voter_count) * 100)
        : 0;

    return NextResponse.json({
      results: {
        electionId: election.id,
        title: election.title,
        totalVotes,
        turnout,
        candidates: rankedCandidates,
        winner:
          election.status === "ended" && rankedCandidates.length > 0
            ? rankedCandidates[0]
            : null,
        status: election.status,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
