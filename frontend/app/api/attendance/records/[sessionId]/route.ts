import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import {
  getAttendanceBySession,
  getSessionById,
  getUserById,
} from "@/lib/services/database";

// GET: Get attendance records for a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const { sessionId } = params;

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Only the session owner or admin can view records
    if (session.faculty_id !== user.sub && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const records = await getAttendanceBySession(sessionId);

    // Enrich with student names
    const enrichedRecords = await Promise.all(
      records.map(async (r) => {
        const student = await getUserById(r.student_id);
        return {
          id: r.id,
          studentId: r.student_id,
          studentName: student?.name || "Unknown",
          timestamp: r.timestamp,
          status: r.status,
          txHash: r.tx_hash,
          verification: {
            gps: {
              withinGeofence: r.within_geofence,
              accuracy: r.gps_accuracy,
            },
            wifi: { isVerified: r.wifi_verified },
            device: {
              isEmulator: r.device_is_emulator,
            },
            time: { withinWindow: r.time_within_window },
          },
          aiVerification: {
            status: r.ai_status,
            score: r.ai_score,
            reason: r.ai_reason,
          },
        };
      })
    );

    // Stats
    const present = records.filter((r) => r.status === "present").length;
    const late = records.filter((r) => r.status === "late").length;
    const flagged = records.filter((r) => r.status === "flagged").length;
    const total = records.length;

    return NextResponse.json({
      session: {
        id: session.id,
        courseCode: session.course_code,
        courseName: session.course_name,
        room: session.room,
        startTime: session.start_time,
        endTime: session.end_time,
        status: session.status,
      },
      records: enrichedRecords,
      stats: {
        present,
        late,
        flagged,
        absent: 0, // Would need enrolled student count
        total,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get records error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
