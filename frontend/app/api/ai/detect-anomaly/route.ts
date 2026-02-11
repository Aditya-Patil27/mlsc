import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import {
  getAttendanceBySession,
  getStudentAttendance,
  getUserById,
} from "@/lib/services/database";
import { detectAnomalies } from "@/lib/services/ai";

// POST: Run anomaly detection on attendance records
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const body = await request.json();
    const { sessionId, studentId } = body;

    let records;
    if (sessionId) {
      records = await getAttendanceBySession(sessionId);
    } else if (studentId) {
      records = await getStudentAttendance(studentId, 50);
    } else {
      return NextResponse.json(
        { error: "sessionId or studentId is required" },
        { status: 400 }
      );
    }

    // Enrich with student names
    const enrichedRecords = await Promise.all(
      records.map(async (r) => {
        const student = await getUserById(r.student_id);
        return {
          studentId: r.student_id,
          studentName: student?.name || "Unknown",
          sessionId: r.session_id,
          timestamp: r.timestamp,
          wifiVerified: r.wifi_verified,
          gpsDistance: 0, // Would need to recalculate from session geofence
          aiScore: r.ai_score,
        };
      })
    );

    const anomalies = detectAnomalies(enrichedRecords);

    return NextResponse.json({
      anomalies: anomalies.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        studentName: a.studentName,
        type: a.type,
        severity: a.severity,
        description: a.description,
        detectedAt: a.detectedAt,
        sessionId: a.sessionId,
      })),
      totalRecordsAnalyzed: records.length,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Detect anomaly error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
