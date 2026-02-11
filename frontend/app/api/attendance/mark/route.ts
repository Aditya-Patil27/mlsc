import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "@/lib/services/auth";
import {
  getSessionById,
  checkDuplicateAttendance,
  createAttendanceRecord,
  getStudentAttendance,
  getUserById,
} from "@/lib/services/database";
import {
  verifyLocation,
  computeVerificationHash,
} from "@/lib/services/location";
import { analyzeAttendance } from "@/lib/services/ai";
import { recordAttendanceOnChain } from "@/lib/services/algorand";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ["student"]);

    const body = await request.json();
    const {
      sessionId,
      qrNonce,
      location,
      wifi,
      device,
      clientTime,
      bluetoothDetected = false,
    } = body;

    if (!sessionId || !location || !device) {
      return NextResponse.json(
        { error: "sessionId, location, and device are required" },
        { status: 400 }
      );
    }

    // 1. Get session
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    if (session.status !== "active") {
      return NextResponse.json(
        { error: "Session is no longer active" },
        { status: 400 }
      );
    }

    // 2. Verify QR nonce (prevents screenshot sharing)
    if (qrNonce && qrNonce !== session.qr_nonce) {
      return NextResponse.json(
        { error: "Invalid or expired QR code" },
        { status: 400 }
      );
    }

    // 3. Check duplicate
    const alreadyMarked = await checkDuplicateAttendance(sessionId, user.sub);
    if (alreadyMarked) {
      return NextResponse.json(
        { error: "Attendance already marked for this session" },
        { status: 409 }
      );
    }

    // 4. Get registered device fingerprint
    const dbUser = await getUserById(user.sub);

    // 5. Multi-factor location verification
    const verificationResult = verifyLocation({
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
      },
      wifi: wifi || null,
      device: {
        fingerprint: device.fingerprint,
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
      registeredFingerprint: dbUser?.device_fingerprint || undefined,
      graceMinutes: 5,
    });

    // 6. AI analysis
    const recentRecords = await getStudentAttendance(user.sub, 30);
    const aiResult = analyzeAttendance({
      studentId: user.sub,
      studentName: dbUser?.name || "Unknown",
      sessionId,
      gpsWithinGeofence: verificationResult.gps.withinGeofence,
      wifiVerified: verificationResult.wifi.isVerified,
      deviceRegistered: verificationResult.device.isRegistered,
      timeWithinWindow: verificationResult.time.withinWindow,
      locationScore: verificationResult.overall.score,
      recentAttendance: {
        totalSessions: recentRecords.length,
        attendedSessions: recentRecords.filter(
          (r) => r.status === "present" || r.status === "late"
        ).length,
        flaggedCount: recentRecords.filter((r) => r.status === "flagged")
          .length,
        averageCheckInDelay: 0,
        wifiDisconnectAfterCheckin: recentRecords.filter(
          (r) => !r.wifi_verified
        ).length,
        boundaryCheckIns: 0,
      },
    });

    // 7. Determine status
    let status: "present" | "late" | "flagged";
    const now = new Date();
    const sessionStart = new Date(session.start_time);
    const graceEnd = new Date(sessionStart.getTime() + 5 * 60 * 1000);

    if (!verificationResult.overall.passed || aiResult.status === "flagged") {
      status = "flagged";
    } else if (now > graceEnd) {
      status = "late";
    } else {
      status = "present";
    }

    // 8. Record on blockchain
    const verificationHash = computeVerificationHash(verificationResult);
    let txHash = "";
    try {
      const txResult = await recordAttendanceOnChain({
        sessionId,
        studentId: user.sub,
        timestamp: Date.now(),
        verificationHash,
      });
      txHash = txResult.txId;
    } catch (err) {
      console.error("Blockchain recording failed, continuing:", err);
      txHash = `pending-${uuidv4()}`;
    }

    // 9. Save to database
    const record = await createAttendanceRecord({
      id: uuidv4(),
      session_id: sessionId,
      student_id: user.sub,
      timestamp: now.toISOString(),
      gps_lat: location.lat,
      gps_lng: location.lng,
      gps_accuracy: location.accuracy,
      within_geofence: verificationResult.gps.withinGeofence,
      wifi_bssid: wifi?.bssid || null,
      wifi_verified: verificationResult.wifi.isVerified,
      device_fingerprint: device.fingerprint,
      device_is_emulator: verificationResult.device.isEmulator,
      time_within_window: verificationResult.time.withinWindow,
      bluetooth_detected: bluetoothDetected,
      ai_status: aiResult.status,
      ai_score: aiResult.score,
      ai_reason: aiResult.reason || undefined,
      tx_hash: txHash,
      status,
    });

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        sessionId: record.session_id,
        timestamp: record.timestamp,
        status: record.status,
        txHash: record.tx_hash,
        verification: {
          gps: verificationResult.gps,
          wifi: verificationResult.wifi,
          device: {
            isRegistered: verificationResult.device.isRegistered,
            isEmulator: verificationResult.device.isEmulator,
          },
          time: verificationResult.time,
          overall: verificationResult.overall,
        },
        aiVerification: aiResult,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("Mark attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
