import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import {
  getActiveSessionsByFaculty,
  updateSessionStatus,
  updateSessionQRNonce,
} from "@/lib/services/database";
import crypto from "crypto";

// GET: Get active sessions for the authenticated faculty
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const sessions = await getActiveSessionsByFaculty(user.sub);

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        courseCode: s.course_code,
        courseName: s.course_name,
        room: s.room,
        startTime: s.start_time,
        endTime: s.end_time,
        qrNonce: s.qr_nonce,
        geofence: {
          lat: s.geofence_lat,
          lng: s.geofence_lng,
          radius: s.geofence_radius,
        },
        status: s.status,
      })),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: End or cancel a session / Refresh QR nonce
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId || !action) {
      return NextResponse.json(
        { error: "sessionId and action are required" },
        { status: 400 }
      );
    }

    if (action === "end") {
      await updateSessionStatus(sessionId, "ended");
      return NextResponse.json({ success: true, status: "ended" });
    }

    if (action === "cancel") {
      await updateSessionStatus(sessionId, "cancelled");
      return NextResponse.json({ success: true, status: "cancelled" });
    }

    if (action === "refresh-qr") {
      const newNonce = crypto.randomBytes(16).toString("hex");
      await updateSessionQRNonce(sessionId, newNonce);
      return NextResponse.json({ success: true, qrNonce: newNonce });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
