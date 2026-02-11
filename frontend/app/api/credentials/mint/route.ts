import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import {
  createCredentialNFT,
  getUserById,
} from "@/lib/services/database";
import { mintCredentialNFT as mintNFTOnChain } from "@/lib/services/algorand";

// POST: Mint a new credential NFT (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["admin"]);

    const body = await request.json();
    const {
      recipientId,
      title,
      achievement,
      issuer,
      issuerLogo,
      category = "academic",
      eventName,
      position,
      soulbound = true,
    } = body;

    if (!recipientId || !title || !achievement || !issuer) {
      return NextResponse.json(
        { error: "recipientId, title, achievement, and issuer are required" },
        { status: 400 }
      );
    }

    const recipient = await getUserById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const nftId = uuidv4();
    const credId = uuidv4();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/api/credentials/verify/${nftId}`;

    // Mint on blockchain
    let txHash = "";
    let assetId: number | undefined;
    try {
      const metadataUrl = `${appUrl}/api/credentials/verify/${nftId}`;
      const result = await mintNFTOnChain({
        recipientAddress: recipient.wallet_address,
        metadataUrl,
        name: title,
      });
      txHash = result.txId;
      assetId = result.assetId;
    } catch (err) {
      console.error("Blockchain NFT minting failed:", err);
      txHash = `pending-${credId}`;
    }

    const credential = await createCredentialNFT({
      id: credId,
      nft_id: nftId,
      asset_id: assetId,
      recipient_id: recipientId,
      title,
      achievement,
      issuer,
      issuer_logo: issuerLogo,
      issued_date: new Date().toISOString(),
      category,
      event_name: eventName,
      position,
      soulbound,
      tx_hash: txHash,
      verification_url: verificationUrl,
      shares: 0,
      verifications: 0,
    });

    return NextResponse.json(
      {
        credential: {
          id: credential.id,
          nftId: credential.nft_id,
          assetId: credential.asset_id,
          title: credential.title,
          achievement: credential.achievement,
          txHash: credential.tx_hash,
          verificationUrl: credential.verification_url,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Mint credential error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
