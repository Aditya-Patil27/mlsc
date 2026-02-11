import { NextRequest, NextResponse } from "next/server";
import {
  getCredentialByNFTId,
  incrementCredentialVerifications,
  getUserById,
} from "@/lib/services/database";
import { lookupTransaction } from "@/lib/services/algorand";

// GET: Publicly verify a credential by NFT ID (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const credential = await getCredentialByNFTId(id);
    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    // Increment verification count
    try {
      await incrementCredentialVerifications(credential.id);
    } catch {
      // Non-critical
    }

    // Try to look up blockchain transaction
    let blockchain = null;
    try {
      if (
        credential.tx_hash &&
        !credential.tx_hash.startsWith("pending-")
      ) {
        const tx = await lookupTransaction(credential.tx_hash);
        blockchain = {
          network: "Algorand TestNet",
          txHash: credential.tx_hash,
          blockNumber: tx?.["confirmed-round"] || 0,
          confirmedAt: tx?.["round-time"]
            ? new Date(tx["round-time"] * 1000).toISOString()
            : null,
        };
      }
    } catch {
      blockchain = {
        network: "Algorand TestNet",
        txHash: credential.tx_hash,
        blockNumber: 0,
        confirmedAt: null,
      };
    }

    const recipient = await getUserById(credential.recipient_id);

    return NextResponse.json({
      verification: {
        isValid: true,
        credential: {
          nftId: credential.nft_id,
          title: credential.title,
          achievement: credential.achievement,
          recipientName: recipient?.name || "Unknown",
          issuedDate: credential.issued_date,
          category: credential.category,
          eventName: credential.event_name,
          position: credential.position,
          soulbound: credential.soulbound,
        },
        issuer: {
          name: credential.issuer,
          verified: true,
          logo: credential.issuer_logo,
        },
        blockchain,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Verify credential error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
