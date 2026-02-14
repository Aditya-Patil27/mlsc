import { NextRequest, NextResponse } from "next/server";
import { getSessionById, getUserById } from "@/lib/services/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch faculty name
    const faculty = await getUserById(session.faculty_id);

    return NextResponse.json({
      session: {
        id: session.id,
        courseCode: session.course_code,
        courseName: session.course_name,
        room: session.room,
        facultyName: faculty?.name || "Unknown Faculty",
        startTime: session.start_time,
        endTime: session.end_time,
        qrNonce: session.qr_nonce,
        geofence: {
          lat: session.geofence_lat,
          lng: session.geofence_lng,
          radius: session.geofence_radius,
        },
        status: session.status,
      },
    });
  } catch (error: any) {
    console.error("Get session details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
