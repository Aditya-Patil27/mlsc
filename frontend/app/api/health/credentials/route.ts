import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { requireAuth } from "@/lib/services/auth";
import {
  createHealthCredential,
  getHealthCredentialsByStudent,
} from "@/lib/services/database";
import { storeHealthCredentialOnChain } from "@/lib/services/algorand";
import {
  createDateRangeCommitment,
  createIssuerCommitment,
  createCredentialTypeCommitment,
  generateCredentialSalt,
} from "@/lib/services/zk-proof";

// GET: Get health credentials for the authenticated student
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["student"]);

    const credentials = await getHealthCredentialsByStudent(user.sub);

    return NextResponse.json({
      credentials: credentials.map((c) => ({
        id: c.id,
        issuerName: c.issuer_name,
        issuedDate: c.issued_date,
        validFrom: c.valid_from,
        validTo: c.valid_to,
        credentialType: c.credential_type,
        txHash: c.tx_hash,
        status: c.status,
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

// POST: Issue a new health credential (admin/hospital)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["admin"]);

    const body = await request.json();
    const {
      studentId,
      issuerId,
      issuerName,
      validFrom,
      validTo,
      credentialType,
    } = body;

    if (
      !studentId ||
      !issuerId ||
      !issuerName ||
      !validFrom ||
      !validTo ||
      !credentialType
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const credId = uuidv4();
    const salt = generateCredentialSalt();

    // Create commitments
    const dateRangeHash = createDateRangeCommitment(validFrom, validTo, salt);
    const issuerHash = createIssuerCommitment(issuerId, issuerName, salt);
    const credentialTypeHash = createCredentialTypeCommitment(
      credentialType,
      salt
    );

    // Store on blockchain
    let txHash = "";
    try {
      const txResult = await storeHealthCredentialOnChain({
        credentialId: credId,
        commitmentHash: dateRangeHash,
        issuerHash,
      });
      txHash = txResult.txId;
    } catch (err) {
      console.error("Blockchain credential storage failed:", err);
      txHash = `pending-${credId}`;
    }

    const credential = await createHealthCredential({
      id: credId,
      student_id: studentId,
      issuer_id: issuerId,
      issuer_name: issuerName,
      issued_date: new Date().toISOString(),
      valid_from: validFrom,
      valid_to: validTo,
      credential_type: credentialType,
      date_range_hash: dateRangeHash,
      issuer_hash: issuerHash,
      credential_type_hash: credentialTypeHash,
      tx_hash: txHash,
      status: "valid",
    });

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Create credential error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
