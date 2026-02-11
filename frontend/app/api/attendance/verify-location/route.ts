import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/services/auth";
import { verifyLocation } from "@/lib/services/location";
import { getSessionById } from "@/lib/services/database";

// POST: Verify a student's location against a session geofence
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request, ["student"]);

    const body = await request.json();
    const { sessionId, location, wifi, device, clientTime } = body;

    if (!sessionId || !location || !device) {
      return NextResponse.json(
        { error: "sessionId, location, and device are required" },
        { status: 400 }
      );
    }

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const result = verifyLocation({
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy || 10,
      },
      wifi: wifi || null,
      device: {
        fingerprint: device.fingerprint || "",
        userAgent: device.userAgent || "",
        platform: device.platform || "",
      },
      clientTime: new Date(clientTime || Date.now()),
      geofence: {
        lat: session.geofence_lat,
        lng: session.geofence_lng,
        radius: session.geofence_radius,
      },
      allowedBSSIDs: session.allowed_bssids || [],
      sessionStart: new Date(session.start_time),
      sessionEnd: new Date(session.end_time),
    });

    return NextResponse.json({ verification: result });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Verify location error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
