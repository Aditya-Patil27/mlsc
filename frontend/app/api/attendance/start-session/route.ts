import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { requireAuth } from "@/lib/services/auth";
import {
  createAttendanceSession,
  getActiveSessionsByFaculty,
} from "@/lib/services/database";

// POST: Faculty starts a new attendance session
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["faculty", "admin"]);

    const body = await request.json();
    const {
      courseCode,
      courseName,
      room,
      durationMinutes = 60,
      geofenceLat,
      geofenceLng,
      geofenceRadius = 100,
      allowedBSSIDs = [],
      bluetoothBeacon,
    } = body;

    if (!courseCode || !courseName || !room || !geofenceLat || !geofenceLng) {
      return NextResponse.json(
        {
          error:
            "courseCode, courseName, room, geofenceLat, and geofenceLng are required",
        },
        { status: 400 }
      );
    }

    // Check if faculty already has an active session
    const activeSessions = await getActiveSessionsByFaculty(user.sub);
    if (activeSessions.length > 0) {
      return NextResponse.json(
        { error: "You already have an active session. End it first." },
        { status: 409 }
      );
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const qrNonce = crypto.randomBytes(16).toString("hex");

    const session = await createAttendanceSession({
      id: uuidv4(),
      course_code: courseCode,
      course_name: courseName,
      faculty_id: user.sub,
      room,
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      qr_nonce: qrNonce,
      geofence_lat: geofenceLat,
      geofence_lng: geofenceLng,
      geofence_radius: geofenceRadius,
      allowed_bssids: allowedBSSIDs,
      bluetooth_beacon: bluetoothBeacon,
      status: "active",
    });

    return NextResponse.json(
      {
        session: {
          id: session.id,
          courseCode: session.course_code,
          courseName: session.course_name,
          room: session.room,
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
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Start session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
