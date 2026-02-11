import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import {
  getActiveElections,
  getCandidatesByElection,
  createElection,
} from "@/lib/services/database";
import { createVoteTokens } from "@/lib/services/algorand";

// GET: Get active elections with candidates
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const elections = await getActiveElections();

    const enriched = await Promise.all(
      elections.map(async (e) => {
        const candidates = await getCandidatesByElection(e.id);
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          startDate: e.start_date,
          endDate: e.end_date,
          eligibleVoterCount: e.eligible_voter_count,
          voteTokenAsaId: e.vote_token_asa_id,
          status: e.status,
          candidates: candidates.map((c) => ({
            id: c.id,
            name: c.name,
            manifesto: c.manifesto,
            imageUrl: c.image_url,
            position: c.position,
            voteCount: c.vote_count,
          })),
        };
      })
    );

    return NextResponse.json({ elections: enriched });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get elections error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new election (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["admin"]);

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      eligibleVoterCount,
      candidates,
    } = body;

    if (!title || !description || !startDate || !endDate || !eligibleVoterCount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const electionId = uuidv4();

    // Create vote tokens on blockchain
    let voteTokenAsaId = "";
    try {
      const result = await createVoteTokens({
        electionId,
        totalVoters: eligibleVoterCount,
      });
      voteTokenAsaId = String(result.assetId);
    } catch (err) {
      console.error("Vote token creation failed:", err);
      voteTokenAsaId = `pending-${electionId}`;
    }

    const election = await createElection({
      id: electionId,
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      eligible_voter_count: eligibleVoterCount,
      vote_token_asa_id: voteTokenAsaId,
      status: "active",
      created_by: user.sub,
    });

    return NextResponse.json({ election }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Create election error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
