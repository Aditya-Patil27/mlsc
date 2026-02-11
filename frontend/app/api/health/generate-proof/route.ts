import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import {
  getHealthCredentialById,
  checkProofUsed,
} from "@/lib/services/database";
import {
  generateProof,
  generateCredentialSalt,
  createDateRangeCommitment,
  createIssuerCommitment,
  createCredentialTypeCommitment,
} from "@/lib/services/zk-proof";

// POST: Generate a ZK proof for a health credential
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["student"]);

    const body = await request.json();
    const {
      credentialId,
      requestedDateFrom,
      requestedDateTo,
      purpose = "medical-leave",
    } = body;

    if (!credentialId || !requestedDateFrom || !requestedDateTo) {
      return NextResponse.json(
        {
          error:
            "credentialId, requestedDateFrom, and requestedDateTo are required",
        },
        { status: 400 }
      );
    }

    // Get the credential
    const credential = await getHealthCredentialById(credentialId);
    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (credential.student_id !== user.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if already used
    const alreadyUsed = await checkProofUsed(credentialId);

    // Authorized issuers list (in production, from database)
    const authorizedIssuers = [
      credential.issuer_id, // The actual issuer
      "hospital-001",
      "hospital-002",
      "hospital-003",
    ];

    // Generate ZK proof
    const salt = generateCredentialSalt();
    const proof = generateProof({
      credentialId,
      privateInputs: {
        validFrom: credential.valid_from,
        validTo: credential.valid_to,
        issuerId: credential.issuer_id,
        issuerName: credential.issuer_name,
        credentialType: credential.credential_type,
        salt,
      },
      publicCommitments: {
        dateRangeHash: credential.date_range_hash,
        issuerHash: credential.issuer_hash,
        credentialTypeHash: credential.credential_type_hash,
      },
      claimsToProve: {
        requestedDateFrom,
        requestedDateTo,
        authorizedIssuers,
      },
      isFirstTimeUse: !alreadyUsed,
    });

    return NextResponse.json({
      proof: {
        id: proof.id,
        credentialId: proof.credentialId,
        proof: proof.proof,
        claims: proof.claims,
        generatedAt: proof.generatedAt,
        expiresAt: proof.expiresAt,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Generate proof error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
