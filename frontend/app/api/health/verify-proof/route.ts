import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import { verifyProof } from "@/lib/services/zk-proof";
import {
  recordProofUsage,
  checkProofUsed,
} from "@/lib/services/database";
import { recordProofUsageOnChain } from "@/lib/services/algorand";
import type { ZKProof } from "@/types";

// POST: Verify a ZK proof (admin/faculty verifying a student's claim)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const body = await request.json();
    const { proof, purpose = "medical-leave-verification" } = body;

    if (!proof) {
      return NextResponse.json(
        { error: "proof is required" },
        { status: 400 }
      );
    }

    const zkProof: ZKProof = {
      ...proof,
      generatedAt: new Date(proof.generatedAt),
      expiresAt: new Date(proof.expiresAt),
    };

    // Verify the proof
    const result = verifyProof(zkProof);

    // If valid, record usage on blockchain and database
    if (result.isValid) {
      const usageId = uuidv4();

      let txHash = "";
      try {
        const txResult = await recordProofUsageOnChain({
          proofId: zkProof.id,
          credentialId: zkProof.credentialId,
          purpose,
          usageHash: `usage-${usageId}`,
        });
        txHash = txResult.txId;
      } catch (err) {
        console.error("Blockchain proof usage recording failed:", err);
        txHash = `pending-${usageId}`;
      }

      await recordProofUsage({
        id: usageId,
        credential_id: zkProof.credentialId,
        purpose,
        verifier: user.sub,
        tx_hash: txHash,
      });
    }

    return NextResponse.json({
      verification: {
        isValid: result.isValid,
        claims: result.claims,
        allClaimsTrue: result.allClaimsTrue,
        failedClaims: result.failedClaims,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Verify proof error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
