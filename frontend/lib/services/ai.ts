import crypto from "crypto";
import type {
  AIVerification,
  AttendanceAnomaly,
  AIRiskAssessment,
  AIRiskPattern,
} from "@/types";

// ---------------------------------------------------------------------------
// Attendance AI analysis
// ---------------------------------------------------------------------------

interface AttendanceContext {
  studentId: string;
  studentName: string;
  sessionId: string;
  gpsWithinGeofence: boolean;
  wifiVerified: boolean;
  deviceRegistered: boolean;
  timeWithinWindow: boolean;
  locationScore: number;
  // Historical data
  recentAttendance?: {
    totalSessions: number;
    attendedSessions: number;
    flaggedCount: number;
    averageCheckInDelay: number; // seconds
    wifiDisconnectAfterCheckin: number;
    boundaryCheckIns: number;
  };
}

export function analyzeAttendance(ctx: AttendanceContext): AIVerification {
  const patterns: string[] = [];
  let score = 0;

  // Factor scores
  if (!ctx.gpsWithinGeofence) {
    score += 30;
    patterns.push("GPS location outside campus geofence");
  }
  if (!ctx.wifiVerified) {
    score += 20;
    patterns.push("Not connected to campus WiFi network");
  }
  if (!ctx.deviceRegistered) {
    score += 15;
    patterns.push("Unregistered device used for check-in");
  }
  if (!ctx.timeWithinWindow) {
    score += 10;
    patterns.push("Check-in outside lecture time window");
  }

  // Historical pattern analysis
  if (ctx.recentAttendance) {
    const hist = ctx.recentAttendance;

    if (hist.flaggedCount > 3) {
      score += 15;
      patterns.push(
        `Previously flagged ${hist.flaggedCount} times this month`
      );
    }
    if (hist.wifiDisconnectAfterCheckin > 5) {
      score += 20;
      patterns.push(
        `WiFi disconnected shortly after check-in ${hist.wifiDisconnectAfterCheckin} times`
      );
    }
    if (hist.boundaryCheckIns > 3) {
      score += 15;
      patterns.push(
        `Checked in from campus boundary ${hist.boundaryCheckIns} times`
      );
    }
    if (hist.averageCheckInDelay < 1) {
      score += 10;
      patterns.push(
        "Suspiciously fast check-in timing (possible automation)"
      );
    }
  }

  score = Math.min(100, score);

  let status: AIVerification["status"];
  let reason: string;

  if (score <= 20) {
    status = "legitimate";
    reason = "All factors verified. No anomalies detected.";
  } else if (score <= 50) {
    status = "suspicious";
    reason = `Minor anomalies detected (score: ${score}/100). Monitoring.`;
  } else {
    status = "flagged";
    reason = `Multiple verification failures detected (score: ${score}/100). Manual review recommended.`;
  }

  return { status, score, reason, patterns };
}

// ---------------------------------------------------------------------------
// Anomaly detection
// ---------------------------------------------------------------------------

interface AttendanceRecordForAnalysis {
  studentId: string;
  studentName: string;
  sessionId: string;
  timestamp: string;
  wifiVerified: boolean;
  gpsDistance: number;
  aiScore: number;
}

export function detectAnomalies(
  records: AttendanceRecordForAnalysis[]
): AttendanceAnomaly[] {
  const anomalies: AttendanceAnomaly[] = [];
  const byStudent: Record<string, AttendanceRecordForAnalysis[]> = {};

  for (const r of records) {
    if (!byStudent[r.studentId]) byStudent[r.studentId] = [];
    byStudent[r.studentId].push(r);
  }

  for (const studentId of Object.keys(byStudent)) {
    const studentRecords = byStudent[studentId];
    const name = studentRecords[0].studentName;

    // Pattern: GPS verified but WiFi not connected frequently
    const noWifiCount = studentRecords.filter((r: AttendanceRecordForAnalysis) => !r.wifiVerified).length;
    if (noWifiCount >= 3) {
      anomalies.push({
        id: crypto.randomUUID(),
        studentId,
        studentName: name,
        type: "location-spoof",
        severity: noWifiCount >= 5 ? "high" : "medium",
        description: `GPS verified but WiFi not connected in ${noWifiCount} sessions. Possible GPS spoofing.`,
        detectedAt: new Date(),
        sessionId: studentRecords[studentRecords.length - 1].sessionId,
      });
    }

    // Pattern: Always checking in at boundary distance
    const boundaryCheckins = studentRecords.filter(
      (r: AttendanceRecordForAnalysis) => r.gpsDistance > 80 && r.gpsDistance < 120
    );
    if (boundaryCheckins.length >= 3) {
      anomalies.push({
        id: crypto.randomUUID(),
        studentId,
        studentName: name,
        type: "location-spoof",
        severity: "medium",
        description: `Consistently checking in from campus boundary (${boundaryCheckins.length} times).`,
        detectedAt: new Date(),
      });
    }

    // Pattern: Timing anomaly — always exactly on time
    const timestamps = studentRecords.map((r: AttendanceRecordForAnalysis) => new Date(r.timestamp));
    const seconds = timestamps.map((t: Date) => t.getSeconds());
    const allSameSecond = seconds.every((s: number) => s === seconds[0]);
    if (allSameSecond && studentRecords.length >= 5) {
      anomalies.push({
        id: crypto.randomUUID(),
        studentId,
        studentName: name,
        type: "timing-anomaly",
        severity: "high",
        description: `Always checks in at exactly the same second. Possible automated attendance.`,
        detectedAt: new Date(),
      });
    }

    // Pattern: High AI score average
    const avgScore =
      studentRecords.reduce((sum: number, r: AttendanceRecordForAnalysis) => sum + r.aiScore, 0) /
      studentRecords.length;
    if (avgScore > 40) {
      anomalies.push({
        id: crypto.randomUUID(),
        studentId,
        studentName: name,
        type: "pattern-abuse",
        severity: avgScore > 60 ? "high" : "medium",
        description: `Average suspicion score of ${Math.round(avgScore)}/100 across ${studentRecords.length} sessions.`,
        detectedAt: new Date(),
      });
    }
  }

  return anomalies;
}

// ---------------------------------------------------------------------------
// Health claim AI risk assessment
// ---------------------------------------------------------------------------

interface HealthClaimContext {
  studentId: string;
  requestedDates: [string, string];
  credentialType: string;
  // Historical
  totalLeaveRequests: number;
  classAverageLeaves: number;
  examDates: string[];
  previousLeaveCorrelations: number; // how many past leaves coincided with exams
}

export function assessHealthClaimRisk(
  ctx: HealthClaimContext
): AIRiskAssessment {
  const patterns: AIRiskPattern[] = [];
  let totalScore = 0;

  // Pattern 1: Exam correlation
  const requestStart = new Date(ctx.requestedDates[0]);
  const requestEnd = new Date(ctx.requestedDates[1]);
  const examCorrelation = ctx.examDates.some((examDate) => {
    const exam = new Date(examDate);
    return exam >= requestStart && exam <= requestEnd;
  });

  if (examCorrelation) {
    const correlationRate =
      ctx.previousLeaveCorrelations / Math.max(ctx.totalLeaveRequests, 1);

    const severity =
      correlationRate > 0.7
        ? "high"
        : correlationRate > 0.4
        ? "medium"
        : "low";
    const probability = Math.round(correlationRate * 100);

    patterns.push({
      type: "exam-correlation",
      description: `Leave dates overlap with an exam. ${ctx.previousLeaveCorrelations} out of ${ctx.totalLeaveRequests} past leaves coincided with exams.`,
      severity,
      evidence: [
        `Leave: ${ctx.requestedDates[0]} to ${ctx.requestedDates[1]}`,
        `Exam found within leave period`,
        `Historical correlation: ${probability}%`,
      ],
      probability,
    });

    totalScore += probability > 70 ? 35 : probability > 40 ? 20 : 10;
  }

  // Pattern 2: Frequency anomaly
  if (ctx.totalLeaveRequests > ctx.classAverageLeaves * 2) {
    const ratio = ctx.totalLeaveRequests / Math.max(ctx.classAverageLeaves, 1);
    const severity = ratio > 5 ? "high" : ratio > 3 ? "medium" : "low";

    patterns.push({
      type: "frequency-anomaly",
      description: `${ctx.totalLeaveRequests} medical leaves this semester vs class average of ${ctx.classAverageLeaves}.`,
      severity,
      evidence: [
        `Student leaves: ${ctx.totalLeaveRequests}`,
        `Class average: ${ctx.classAverageLeaves}`,
        `${Math.round(ratio)}x higher than peers`,
      ],
      probability: Math.min(95, Math.round(ratio * 20)),
    });

    totalScore += ratio > 5 ? 30 : ratio > 3 ? 20 : 10;
  }

  // Pattern 3: Timing pattern (e.g., always Monday/Friday leaves)
  const dayOfWeek = requestStart.getDay();
  if (dayOfWeek === 1 || dayOfWeek === 5) {
    patterns.push({
      type: "timing-pattern",
      description: `Leave starts on a ${dayOfWeek === 1 ? "Monday" : "Friday"}, commonly associated with extended weekends.`,
      severity: "low",
      evidence: [`Leave start day: ${dayOfWeek === 1 ? "Monday" : "Friday"}`],
      probability: 30,
    });
    totalScore += 10;
  }

  totalScore = Math.min(100, totalScore);

  let level: AIRiskAssessment["level"];
  let recommendation: AIRiskAssessment["recommendation"];
  let explanation: string;

  if (totalScore <= 25) {
    level = "low";
    recommendation = "auto-approve";
    explanation =
      "Low risk. No significant suspicious patterns detected. Safe to auto-approve.";
  } else if (totalScore <= 60) {
    level = "medium";
    recommendation = "manual-review";
    explanation = `Moderate risk (score: ${totalScore}/100). Some patterns warrant review before approval.`;
  } else {
    level = "high";
    recommendation = "reject";
    explanation = `High risk (score: ${totalScore}/100). Multiple suspicious patterns detected. Recommend faculty interview before approval.`;
  }

  return { score: totalScore, level, patterns, recommendation, explanation };
}
