"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { mockSessionStats, mockSessions, mockAnomalies, mockAttendanceRecords } from "@/data/mock/attendance";
import { cn } from "@/lib/utils";
import {
  PlayCircle,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function FacultyDashboard() {
  const [activeSession] = useState(mockSessions.find(s => s.status === "active"));

  const stats = [
    {
      label: "Today's Classes",
      value: "4",
      icon: Calendar,
      color: "text-walnut",
    },
    {
      label: "Students Present",
      value: `${mockSessionStats.present}/${mockSessionStats.total}`,
      icon: Users,
      color: "text-verified",
    },
    {
      label: "Average Attendance",
      value: `${mockSessionStats.percentage}%`,
      icon: TrendingUp,
      color: "text-gold",
    },
    {
      label: "Flagged Today",
      value: mockAnomalies.filter(a => a.severity === "high").length.toString(),
      icon: AlertTriangle,
      color: "text-crimson",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-3xl text-walnut mb-2">
            Faculty Dashboard
          </h1>
          <p className="text-walnut/60">
            Manage attendance and monitor student activity
          </p>
        </div>
        <WaxSeal size="md" variant="shield" />
      </motion.div>

      {/* Quick Action - Start Lecture */}
      {activeSession ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="certificate" className="border-verified/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-verified/20 flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-verified" />
                </div>
                <div className="flex-1">
                  <Badge variant="verified" className="mb-2">Session Active</Badge>
                  <h3 className="font-heading text-2xl text-walnut">
                    {activeSession.courseName}
                  </h3>
                  <p className="text-walnut/60">
                    {activeSession.courseCode} • {activeSession.room}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-walnut/60 mb-1">Present</p>
                  <p className="font-heading text-3xl text-verified">
                    {mockSessionStats.present}/{mockSessionStats.total}
                  </p>
                </div>
                <Link href={`/faculty/lectures/${activeSession.id}/live`}>
                  <Button variant="ceremonial" size="lg">
                    <Eye className="w-5 h-5 mr-2" />
                    View Live
                  </Button>
                </Link>
              </div>
              <Progress
                value={mockSessionStats.percentage}
                className="mt-4 h-2"
                indicatorClassName="bg-verified"
              />
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-2xl text-walnut">
                    Start a New Lecture
                  </h3>
                  <p className="text-walnut/60">
                    Begin attendance tracking for your next class
                  </p>
                </div>
                <Link href="/faculty/lectures">
                  <Button variant="ceremonial" size="lg">
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Lecture
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-walnut/60">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className={`font-heading text-3xl ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Anomalies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-walnut">Recent Anomalies</h2>
          <Link href="/faculty/anomalies">
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {mockAnomalies.slice(0, 3).map((anomaly, index) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card variant="elevated">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      anomaly.severity === "high" && "bg-rejected/20",
                      anomaly.severity === "medium" && "bg-pending/20",
                      anomaly.severity === "low" && "bg-walnut/10"
                    )}>
                      <AlertTriangle className={cn(
                        "w-5 h-5",
                        anomaly.severity === "high" && "text-rejected",
                        anomaly.severity === "medium" && "text-pending",
                        anomaly.severity === "low" && "text-walnut/60"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-walnut">{anomaly.studentName}</p>
                        <Badge variant={
                          anomaly.severity === "high" ? "destructive" :
                          anomaly.severity === "medium" ? "pending" : "secondary"
                        }>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-walnut/60">{anomaly.description}</p>
                    </div>
                    <div className="text-right text-sm text-walnut/50">
                      {new Date(anomaly.detectedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Today's Attendance Summary */}
      <div>
        <h2 className="font-heading text-xl text-walnut mb-4">Today's Attendance</h2>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-3xl font-heading text-verified">{mockSessionStats.present}</p>
                <p className="text-sm text-walnut/60">Present</p>
              </div>
              <div>
                <p className="text-3xl font-heading text-pending">{mockSessionStats.late}</p>
                <p className="text-sm text-walnut/60">Late</p>
              </div>
              <div>
                <p className="text-3xl font-heading text-rejected">{mockSessionStats.flagged}</p>
                <p className="text-sm text-walnut/60">Flagged</p>
              </div>
              <div>
                <p className="text-3xl font-heading text-walnut/50">{mockSessionStats.absent}</p>
                <p className="text-sm text-walnut/60">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
