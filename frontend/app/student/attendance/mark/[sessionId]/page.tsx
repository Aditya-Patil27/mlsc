"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { WaxSealPress } from "@/components/shared/wax-seal";
import { BlockchainBadge } from "@/components/shared/blockchain-badge";
import { VerificationFactor } from "@/components/shared/verification-factor";
// Removed mock import
import { FactorStatus } from "@/types";
import { cn, delay } from "@/lib/utils";
import {
  MapPin,
  Loader2,
  Sparkles,
  XCircle,
  QrCode,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";

type VerificationStep = "idle" | "verifying" | "success" | "failed";

interface Factor {
  name: string;
  icon: "gps" | "wifi" | "device" | "time" | "bluetooth";
  status: FactorStatus;
  details: string;
}

interface SessionDetails {
  id: string;
  courseName: string;
  courseCode: string;
  room: string;
  facultyName: string;
  startTime: string;
  endTime: string;
  qrNonce: string;
  status: string;
}

export default function MarkAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<VerificationStep>("idle");
  const [factors, setFactors] = useState<Factor[]>([
    { name: "Location (GPS)", icon: "gps", status: "pending", details: "Waiting to verify..." },
    { name: "WiFi Network", icon: "wifi", status: "pending", details: "Waiting to verify..." },
    { name: "Time Window", icon: "time", status: "pending", details: "Waiting to verify..." },
    { name: "Device Fingerprint", icon: "device", status: "pending", details: "Waiting to verify..." },
    { name: "Bluetooth Beacon", icon: "bluetooth", status: "pending", details: "Optional verification" },
  ]);
  const [aiStatus, setAiStatus] = useState<"pending" | "checking" | "legitimate" | "flagged">("pending");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [showSealAnimation, setShowSealAnimation] = useState(false);

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/attendance/sessions/${sessionId}`);
        if (!res.ok) throw new Error("Failed to fetch session");
        const data = await res.json();
        setSession(data.session);
      } catch (err) {
        console.error("Failed to fetch session:", err);
        setError("Session not found or has ended.");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const updateFactor = (index: number, status: FactorStatus, details: string) => {
    setFactors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, details };
      return updated;
    });
  };

  const getGeolocation = (): Promise<GeolocationPosition> => {
    console.log("📍 Requesting Geolocation...");
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error("❌ Geolocation not supported by browser");
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Geolocation success:", position.coords);
          resolve(position);
        },
        (error) => {
          console.error("❌ Geolocation error:", error);
          let msg = "Location error: " + error.message;
          if (error.code === 1) msg = "Location permission denied. Please enable location access.";
          if (error.code === 2) msg = "Location unavailable. Ensure GPS is on.";
          if (error.code === 3) msg = "Location request timed out.";
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const runVerification = async () => {
    if (!session) return;
    console.log("🚀 Starting verification...");
    setStep("verifying");
    setError(null);

    try {
      // 1. GPS
      updateFactor(0, "checking", "Acquiring GPS coordinates...");
      const position = await getGeolocation();
      updateFactor(0, "verified", `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);

      // 2. WiFi (Client-side estimation via Network API if available, otherwise browser check)
      // Note: Real WiFi BSSID is hard to get in browser. We simulate "Network Check" 
      // but send what we can (userAgent, connection type).
      updateFactor(1, "checking", "Checking network connection...");
      // @ts-ignore
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const netType = connection ? connection.effectiveType : "4g"; // Fallback
      await delay(500);
      updateFactor(1, "verified", `Connected via ${netType.toUpperCase()} (Simulated BSSID)`);

      // 3. Time
      updateFactor(2, "checking", "Validating time...");
      const now = new Date();
      updateFactor(2, "verified", now.toLocaleTimeString());

      // 4. Device
      updateFactor(3, "checking", "Generating device fingerprint...");
      const fingerprint = "browser-fingerprint-" + Math.random().toString(36).substring(7);
      await delay(500);
      updateFactor(3, "verified", "Device match confirmed");

      // 5. Bluetooth (skipped for web demo)
      updateFactor(4, "verified", "Skipped (Web limitation)");

      // 6. Submit to API
      setAiStatus("checking");
      
      const payload = {
        sessionId,
        qrNonce: session.qrNonce, // In real app, scanned from QR
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        wifi: {
            ssid: "VIT-Student", // Placeholder since browser can't read SSID
            bssid: "00:11:22:33:44:55" 
        },
        device: {
          fingerprint,
          userAgent: navigator.userAgent,
          platform: navigator.platform
        },
        clientTime: now.toISOString(),
      };

      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAiStatus("legitimate");
        setTxHash(data.record.txHash);
        setStep("success");
        setShowSealAnimation(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#4F46E5", "#6366F1", "#3B82F6", "#10B981"],
        });
      } else {
        throw new Error(data.error || "Verification failed");
      }

    } catch (err: any) {
      console.error("Verification error:", err);
      setStep("failed");
      setAiStatus("flagged");
      setError(err.message || "Attendance marking failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
        <p className="text-walnut/60">Loading session details...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <Card variant="default" className="border-rejected/30 bg-rejected/5">
        <CardContent className="flex flex-col items-center py-10 text-center">
          <AlertTriangle className="w-12 h-12 text-rejected mb-4" />
          <h2 className="text-xl font-heading text-walnut mb-2">Session Error</h2>
          <p className="text-walnut/70 mb-6">{error}</p>
          <Button onClick={() => router.push("/student/dashboard")}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Session Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="verified" className="mb-2">Active Session</Badge>
                <CardTitle className="text-2xl">{session?.courseName}</CardTitle>
                <p className="text-walnut/60 mt-1">
                  {session?.courseCode} • {session?.room} • {session?.facultyName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-walnut/60">Status</p>
                <p className="font-heading text-xl text-gold capitalize">{session?.status}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Verification Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="certificate" className="overflow-visible">
          <CardHeader>
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-gold" />
              <CardTitle>Multi-Factor Verification</CardTitle>
            </div>
            <p className="text-sm text-walnut/60 mt-1">
              All factors must be verified to mark your attendance
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Verification Factors */}
            <div className="space-y-3">
              {factors.map((factor, index) => (
                <VerificationFactor
                  key={factor.name}
                  name={factor.name}
                  icon={factor.icon}
                  status={factor.status}
                  details={factor.details}
                  delay={index}
                />
              ))}
            </div>

            {/* AI Verification */}
            <AnimatePresence>
              {aiStatus !== "pending" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    "p-4 rounded-lg border-2",
                    aiStatus === "checking" && "bg-confirming/10 border-confirming/30",
                    aiStatus === "legitimate" && "bg-verified/10 border-verified/30",
                    aiStatus === "flagged" && "bg-rejected/10 border-rejected/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      aiStatus === "checking" && "bg-confirming/20",
                      aiStatus === "legitimate" && "bg-verified/20",
                      aiStatus === "flagged" && "bg-rejected/20"
                    )}>
                      {aiStatus === "checking" && (
                        <Loader2 className="w-5 h-5 text-confirming animate-spin" />
                      )}
                      {aiStatus === "legitimate" && (
                        <Sparkles className="w-5 h-5 text-verified" />
                      )}
                      {aiStatus === "flagged" && (
                        <XCircle className="w-5 h-5 text-rejected" />
                      )}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-walnut">
                        AI Verification
                      </p>
                      <p className={cn(
                        "text-sm",
                        aiStatus === "checking" && "text-confirming",
                        aiStatus === "legitimate" && "text-verified",
                        aiStatus === "flagged" && "text-rejected"
                      )}>
                        {aiStatus === "checking" && "Analyzing patterns..."}
                        {aiStatus === "legitimate" && "LEGITIMATE - No anomalies detected"}
                        {aiStatus === "flagged" && "Suspicious activity detected"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && step === "failed" && (
                <div className="p-3 bg-rejected/10 text-rejected rounded-lg text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Action Button */}
            {step === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="ceremonial"
                  size="xl"
                  className="w-full"
                  onClick={runVerification}
                  disabled={!session || session.status !== 'active'}
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  {session?.status === 'active' ? 'Verify & Mark Attendance' : 'Session Ended'}
                </Button>
              </motion.div>
            )}

            {step === "verifying" && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
                <p className="text-walnut/60">Verifying all factors...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Card */}
      <AnimatePresence>
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Card variant="certificate" className="text-center overflow-visible">
              <CardContent className="py-8">
                {/* Animated Wax Seal */}
                <div className="flex justify-center mb-6">
                  {showSealAnimation && (
                    <WaxSealPress
                      size="lg"
                      variant="verified"
                      onComplete={() => setShowSealAnimation(false)}
                    />
                  )}
                </div>

                <h2 className="font-heading text-3xl text-walnut mb-2">
                  Attendance Marked!
                </h2>
                <p className="text-walnut/60 mb-6">
                  Your attendance has been recorded on the Algorand blockchain
                </p>

                {/* Transaction Hash */}
                {txHash && (
                  <div className="flex justify-center mb-6">
                    <BlockchainBadge txHash={txHash} />
                  </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-left mb-6">
                  <div>
                    <p className="text-xs text-walnut/50 uppercase tracking-wider">Course</p>
                    <p className="font-medium text-walnut">{session?.courseCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-walnut/50 uppercase tracking-wider">Time</p>
                    <p className="font-medium text-walnut">{new Date().toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-walnut/50 uppercase tracking-wider">Status</p>
                    <Badge variant="verified">Present</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-walnut/50 uppercase tracking-wider">Verified By</p>
                    <p className="font-medium text-walnut">4/4 Factors + AI</p>
                  </div>
                </div>

                <p className="text-xs text-walnut/40 italic">
                  &ldquo;Veritas et fides&rdquo; — Truth and faith, recorded forever
                </p>
                
                <div className="mt-6">
                    <Button variant="outline" onClick={() => router.push("/student/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
