import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import {
  createCredentialNFT,
  getCredentialsByRecipient,
  getUserById,
} from "@/lib/services/database";
import { mintCredentialNFT } from "@/lib/services/algorand";

// GET: Get credentials for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const credentials = await getCredentialsByRecipient(user.sub);

    return NextResponse.json({
      credentials: credentials.map((c) => ({
        id: c.id,
        nftId: c.nft_id,
        title: c.title,
        achievement: c.achievement,
        issuer: c.issuer,
        issuerLogo: c.issuer_logo,
        issuedDate: c.issued_date,
        category: c.category,
        eventName: c.event_name,
        position: c.position,
        soulbound: c.soulbound,
        txHash: c.tx_hash,
        verificationUrl: c.verification_url,
        shares: c.shares,
        verifications: c.verifications,
      })),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get credentials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
