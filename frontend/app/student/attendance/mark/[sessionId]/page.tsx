"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui";
import { WaxSeal, WaxSealPress } from "@/components/shared/wax-seal";
import { BlockchainBadge } from "@/components/shared/blockchain-badge";
import { VerificationFactor, MultiFactorDisplay } from "@/components/shared/verification-factor";
import { mockActiveSession } from "@/data/mock/attendance";
import { FactorStatus } from "@/types";
import { cn, delay } from "@/lib/utils";
import {
  MapPin,
  Wifi,
  Smartphone,
  Timer,
  Bluetooth,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  QrCode,
} from "lucide-react";
import confetti from "canvas-confetti";

type VerificationStep = "idle" | "verifying" | "success" | "failed";

interface Factor {
  name: string;
  icon: "gps" | "wifi" | "device" | "time" | "bluetooth";
  status: FactorStatus;
  details: string;
}

export default function MarkAttendancePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

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

  const session = mockActiveSession;

  const updateFactor = (index: number, status: FactorStatus, details: string) => {
    setFactors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, details };
      return updated;
    });
  };

  const runVerification = async () => {
    setStep("verifying");

    // Factor 1: GPS
    updateFactor(0, "checking", "Acquiring GPS coordinates...");
    await delay(800);
    updateFactor(0, "verified", "18.4574° N, 73.8508° E (VIT Pune Campus)");

    // Factor 2: WiFi
    updateFactor(1, "checking", "Checking WiFi network...");
    await delay(600);
    updateFactor(1, "verified", "Connected to VIT-STUDENT-5G (BSSID verified)");

    // Factor 3: Time Window
    updateFactor(2, "checking", "Validating time window...");
    await delay(400);
    const now = new Date();
    updateFactor(2, "verified", `${now.toLocaleTimeString()} (Within grace period)`);

    // Factor 4: Device
    updateFactor(3, "checking", "Verifying device fingerprint...");
    await delay(700);
    updateFactor(3, "verified", "Registered device confirmed (No emulator detected)");

    // Factor 5: Bluetooth (optional)
    updateFactor(4, "checking", "Scanning for beacon...");
    await delay(500);
    updateFactor(4, "verified", "BEACON-ROOM-301 detected");

    // AI Verification
    setAiStatus("checking");
    await delay(1000);
    setAiStatus("legitimate");

    // Generate transaction
    await delay(500);
    const mockTxHash = "ALGO" + Math.random().toString(36).substr(2, 50).toUpperCase();
    setTxHash(mockTxHash);

    setStep("success");
    setShowSealAnimation(true);

    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4F46E5", "#6366F1", "#3B82F6", "#10B981"],
    });
  };

  const allVerified = factors.every((f) => f.status === "verified");

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
                <CardTitle className="text-2xl">{session.courseName}</CardTitle>
                <p className="text-walnut/60 mt-1">
                  {session.courseCode} • {session.room} • {session.facultyName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-walnut/60">Time Remaining</p>
                <p className="font-heading text-2xl text-gold">28:45</p>
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
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Verify & Mark Attendance
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
                    <p className="font-medium text-walnut">{session.courseCode}</p>
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
                    <p className="font-medium text-walnut">5/5 Factors</p>
                  </div>
                </div>

                <p className="text-xs text-walnut/40 italic">
                  &ldquo;Veritas et fides&rdquo; — Truth and faith, recorded forever
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
