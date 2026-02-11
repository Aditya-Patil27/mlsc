import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import {
  getStudentAttendance,
  getStudentLeaveRequests,
  getUserById,
} from "@/lib/services/database";

// POST: Get an AI explanation for a student's patterns
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const body = await request.json();
    const { studentId, context } = body;

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const student = await getUserById(studentId);
    const attendanceRecords = await getStudentAttendance(studentId, 30);
    const leaveRequests = await getStudentLeaveRequests(studentId);

    // Build explanation from data
    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (r) => r.status === "present"
    ).length;
    const lateCount = attendanceRecords.filter(
      (r) => r.status === "late"
    ).length;
    const flaggedCount = attendanceRecords.filter(
      (r) => r.status === "flagged"
    ).length;

    const noWifiCount = attendanceRecords.filter(
      (r) => !r.wifi_verified
    ).length;
    const emulatorCount = attendanceRecords.filter(
      (r) => r.device_is_emulator
    ).length;
    const avgAiScore =
      totalSessions > 0
        ? Math.round(
            attendanceRecords.reduce((sum, r) => sum + r.ai_score, 0) /
              totalSessions
          )
        : 0;

    const insights: string[] = [];
    const recommendations: string[] = [];

    // Attendance rate
    const attendanceRate =
      totalSessions > 0
        ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
        : 0;

    if (attendanceRate < 50) {
      insights.push(
        `Attendance rate is critically low at ${attendanceRate}%. Student has been present or late in only ${presentCount + lateCount} out of ${totalSessions} sessions.`
      );
      recommendations.push(
        "Schedule a meeting with the student to discuss attendance."
      );
    } else if (attendanceRate < 75) {
      insights.push(
        `Attendance rate is below acceptable threshold at ${attendanceRate}%.`
      );
      recommendations.push("Send an attendance warning notification.");
    }

    // WiFi discrepancies
    if (noWifiCount > totalSessions * 0.3) {
      insights.push(
        `Student was not connected to campus WiFi in ${noWifiCount} out of ${totalSessions} sessions (${Math.round((noWifiCount / totalSessions) * 100)}%). This is a strong indicator of location spoofing.`
      );
      recommendations.push(
        "Enable mandatory WiFi verification for this student."
      );
    }

    // Flagged records
    if (flaggedCount > 2) {
      insights.push(
        `${flaggedCount} attendance records have been flagged by the AI system. Average suspicion score: ${avgAiScore}/100.`
      );
      recommendations.push(
        "Review flagged records and consider manual verification."
      );
    }

    // Leave patterns
    if (leaveRequests.length > 3) {
      insights.push(
        `Student has submitted ${leaveRequests.length} leave requests this semester, which is above average.`
      );
    }

    // Emulator detection
    if (emulatorCount > 0) {
      insights.push(
        `Emulator/root detected on ${emulatorCount} occasion(s). This may indicate an attempt to spoof device verification.`
      );
      recommendations.push(
        "Flag student for device registration re-verification."
      );
    }

    const summary =
      insights.length > 0
        ? `Analysis for ${student?.name || "Student"}: ${insights.join(" ")}`
        : `No significant anomalies detected for ${student?.name || "Student"}. Attendance rate: ${attendanceRate}%, average AI score: ${avgAiScore}/100.`;

    return NextResponse.json({
      explanation: {
        studentId,
        studentName: student?.name || "Unknown",
        summary,
        insights,
        recommendations,
        metrics: {
          attendanceRate,
          totalSessions,
          presentCount,
          lateCount,
          flaggedCount,
          noWifiCount,
          emulatorCount,
          avgAiScore,
          leaveRequestCount: leaveRequests.length,
        },
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("AI explain error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
