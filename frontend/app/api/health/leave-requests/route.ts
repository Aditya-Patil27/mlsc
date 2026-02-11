import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import {
  createLeaveRequest,
  getPendingLeaveRequests,
  getStudentLeaveRequests,
  updateLeaveRequestStatus,
  getHealthCredentialById,
} from "@/lib/services/database";
import { assessHealthClaimRisk } from "@/lib/services/ai";

// GET: Get leave requests (student sees own, admin sees all pending)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    let requests;
    if (user.role === "student") {
      requests = await getStudentLeaveRequests(user.sub);
    } else {
      requests = await getPendingLeaveRequests();
    }

    return NextResponse.json({
      leaveRequests: requests.map((r) => ({
        id: r.id,
        studentId: r.student_id,
        credentialId: r.credential_id,
        dateFrom: r.date_from,
        dateTo: r.date_to,
        reason: r.reason,
        aiRiskScore: r.ai_risk_score,
        aiRiskLevel: r.ai_risk_level,
        aiRecommendation: r.ai_recommendation,
        status: r.status,
        adminNotes: r.admin_notes,
        submittedAt: r.submitted_at,
      })),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get leave requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Submit a new leave request with ZK proof
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["student"]);

    const body = await request.json();
    const { credentialId, dateFrom, dateTo, reason, zkProof } = body;

    if (!credentialId || !dateFrom || !dateTo || !reason || !zkProof) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // AI risk assessment
    const previousRequests = await getStudentLeaveRequests(user.sub);
    const riskAssessment = assessHealthClaimRisk({
      studentId: user.sub,
      requestedDates: [dateFrom, dateTo],
      credentialType: "medical-leave",
      totalLeaveRequests: previousRequests.length,
      classAverageLeaves: 0.8,
      examDates: [], // Would come from academic calendar
      previousLeaveCorrelations: 0,
    });

    const autoStatus =
      riskAssessment.recommendation === "auto-approve"
        ? "approved"
        : riskAssessment.recommendation === "reject"
        ? "needs-review"
        : "pending";

    const leaveRequest = await createLeaveRequest({
      id: uuidv4(),
      student_id: user.sub,
      credential_id: credentialId,
      date_from: dateFrom,
      date_to: dateTo,
      reason,
      zk_proof: JSON.stringify(zkProof),
      ai_risk_score: riskAssessment.score,
      ai_risk_level: riskAssessment.level,
      ai_recommendation: riskAssessment.recommendation,
      status: autoStatus,
    });

    return NextResponse.json(
      {
        leaveRequest: {
          id: leaveRequest.id,
          status: leaveRequest.status,
          aiAssessment: riskAssessment,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Submit leave request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Admin reviews a leave request
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const body = await request.json();
    const { requestId, status, adminNotes } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "requestId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["approved", "rejected", "needs-review"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await updateLeaveRequestStatus(requestId, {
      status,
      admin_notes: adminNotes,
      reviewed_by: user.sub,
      reviewed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Review leave request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
