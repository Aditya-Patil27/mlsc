"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui";
import { BlockchainBadge, BlockchainHashInline } from "@/components/shared/blockchain-badge";
import { WaxSeal } from "@/components/shared/wax-seal";
import {
  mockActiveSession,
  mockAttendanceRecords,
  mockSessionStats,
  mockAnomalies,
} from "@/data/mock/attendance";
import { cn } from "@/lib/utils";
import {
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  QrCode,
  RefreshCw,
  Download,
  ExternalLink,
  Wifi,
  MapPin,
  Smartphone,
  Bell,
  StopCircle,
} from "lucide-react";

export default function LiveLecturePage() {
  const params = useParams();
  const [session] = useState(mockActiveSession);
  const [records, setRecords] = useState(mockAttendanceRecords);
  const [stats, setStats] = useState(mockSessionStats);
  const [timeRemaining, setTimeRemaining] = useState("28:45");
  const [qrRefreshCount, setQrRefreshCount] = useState(0);

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update QR refresh count (every 30s)
      setQrRefreshCount((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Time countdown simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simple countdown simulation
      setTimeRemaining((prev) => {
        const [mins, secs] = prev.split(":").map(Number);
        if (secs > 0) return `${mins}:${(secs - 1).toString().padStart(2, "0")}`;
        if (mins > 0) return `${mins - 1}:59`;
        return "0:00";
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="verified" className="animate-pulse">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-verified animate-ping" />
                LIVE
              </span>
            </Badge>
            <h1 className="font-heading text-3xl text-walnut">{session.courseName}</h1>
          </div>
          <p className="text-walnut/60">
            {session.courseCode} • {session.room} • Started at{" "}
            {new Date(session.startTime).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-walnut/60">Time Remaining</p>
            <p className="font-heading text-2xl text-gold">{timeRemaining}</p>
          </div>
          <Button variant="destructive" size="lg">
            <StopCircle className="w-5 h-5 mr-2" />
            End Session
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Present",
            value: stats.present,
            icon: CheckCircle2,
            color: "text-verified",
            bgColor: "bg-verified/10",
          },
          {
            label: "Late",
            value: stats.late,
            icon: Clock,
            color: "text-pending",
            bgColor: "bg-pending/10",
          },
          {
            label: "Flagged",
            value: stats.flagged,
            icon: AlertTriangle,
            color: "text-crimson",
            bgColor: "bg-crimson/10",
          },
          {
            label: "Absent",
            value: stats.absent,
            icon: XCircle,
            color: "text-walnut/50",
            bgColor: "bg-walnut/5",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className={cn("flex items-center gap-3", stat.color)}>
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-3xl font-heading">{stat.value}</p>
                    <p className="text-sm text-walnut/60">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-walnut/60">Attendance Progress</span>
            <span className="font-heading text-lg text-walnut">
              {stats.percentage}% ({stats.present + stats.late}/{stats.total})
            </span>
          </div>
          <Progress value={stats.percentage} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Student List */}
        <div className="col-span-2 space-y-4">
          <Card variant="elevated">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Live Attendance</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-walnut/10">
                {records.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-parchment-dark/30 transition-colors",
                      record.status === "flagged" && "bg-rejected/5"
                    )}
                  >
                    {/* Status indicator */}
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        record.status === "present" && "bg-verified",
                        record.status === "late" && "bg-pending",
                        record.status === "flagged" && "bg-rejected animate-pulse"
                      )}
                    />

                    {/* Student info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-walnut truncate">{record.studentName}</p>
                      <p className="text-xs text-walnut/50">
                        ID: {record.studentId}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="text-sm text-walnut/60">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </div>

                    {/* Verification badges */}
                    <div className="flex items-center gap-1">
                      <div
                        className={cn(
                          "p-1 rounded",
                          record.verification.gps.status === "verified"
                            ? "bg-verified/20 text-verified"
                            : "bg-rejected/20 text-rejected"
                        )}
                        title="GPS"
                      >
                        <MapPin className="w-3 h-3" />
                      </div>
                      <div
                        className={cn(
                          "p-1 rounded",
                          record.verification.wifi.status === "verified"
                            ? "bg-verified/20 text-verified"
                            : "bg-rejected/20 text-rejected"
                        )}
                        title="WiFi"
                      >
                        <Wifi className="w-3 h-3" />
                      </div>
                      <div
                        className={cn(
                          "p-1 rounded",
                          record.verification.device.status === "verified"
                            ? "bg-verified/20 text-verified"
                            : "bg-rejected/20 text-rejected"
                        )}
                        title="Device"
                      >
                        <Smartphone className="w-3 h-3" />
                      </div>
                    </div>

                    {/* AI Status */}
                    <Badge
                      variant={
                        record.aiVerification.status === "legitimate"
                          ? "verified"
                          : record.aiVerification.status === "flagged"
                          ? "destructive"
                          : "pending"
                      }
                    >
                      {record.aiVerification.status}
                    </Badge>

                    {/* Blockchain link */}
                    <BlockchainHashInline txHash={record.txHash} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* QR Code */}
          <Card variant="certificate">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Session QR</CardTitle>
                <Badge variant="confirming" className="text-xs">
                  Refreshes in 30s
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-white p-4 rounded-lg mb-4">
                {/* Placeholder QR */}
                <div className="w-full aspect-square bg-walnut/5 rounded flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-walnut/30" />
                </div>
                {/* Holographic scan line */}
                <div className="absolute inset-4 overflow-hidden rounded">
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-electric-cyan to-transparent"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
              <p className="text-xs text-center text-walnut/50">
                Scan to mark attendance • Nonce: {qrRefreshCount}
              </p>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card variant="elevated">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-crimson" />
                <CardTitle className="text-lg">Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockAnomalies.slice(0, 2).map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="p-3 rounded-lg bg-rejected/5 border border-rejected/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-walnut text-sm">{anomaly.studentName}</p>
                    <Badge variant="destructive" className="text-[10px]">
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-walnut/60">{anomaly.description}</p>
                </div>
              ))}
              {mockAnomalies.length === 0 && (
                <p className="text-sm text-walnut/50 text-center py-4">
                  No anomalies detected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Status */}
          <Card variant="blockchain">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-electric-cyan animate-pulse" />
                <span className="text-sm text-parchment">Algorand TestNet</span>
              </div>
              <div className="space-y-2 text-xs font-mono text-electric-cyan/70">
                <div className="flex justify-between">
                  <span>Records synced:</span>
                  <span className="text-electric-cyan">{records.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Block height:</span>
                  <span className="text-electric-cyan">42,567,891</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas used:</span>
                  <span className="text-electric-cyan">0.003 ALGO</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
