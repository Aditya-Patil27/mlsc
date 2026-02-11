"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { mockActiveSession, mockSessions } from "@/data/mock/attendance";
import {
  PlayCircle,
  Clock,
  Users,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function LecturesPage() {
  const upcomingLectures = [
    {
      id: "LEC001",
      courseCode: "CS301",
      courseName: "Data Structures & Algorithms",
      room: "Room 301",
      time: "10:00 AM - 11:00 AM",
      students: 60,
    },
    {
      id: "LEC002",
      courseCode: "CS302",
      courseName: "Operating Systems",
      room: "Room 204",
      time: "11:00 AM - 12:00 PM",
      students: 55,
    },
    {
      id: "LEC003",
      courseCode: "CS303",
      courseName: "Database Management",
      room: "Room 105",
      time: "2:00 PM - 3:00 PM",
      students: 58,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-3xl text-walnut mb-2">Start a Lecture</h1>
        <p className="text-walnut/60">
          Select a lecture to begin attendance tracking
        </p>
      </motion.div>

      {/* Active Session Alert */}
      {mockActiveSession.status === "active" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card variant="certificate" className="border-verified/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-verified/20 flex items-center justify-center animate-pulse">
                  <PlayCircle className="w-6 h-6 text-verified" />
                </div>
                <div className="flex-1">
                  <Badge variant="verified" className="mb-1">Active Session</Badge>
                  <h3 className="font-heading text-lg text-walnut">
                    {mockActiveSession.courseName}
                  </h3>
                  <p className="text-sm text-walnut/60">
                    {mockActiveSession.room} • Started at {new Date(mockActiveSession.startTime).toLocaleTimeString()}
                  </p>
                </div>
                <Link href={`/faculty/lectures/${mockActiveSession.id}/live`}>
                  <Button variant="ceremonial">
                    View Live Dashboard
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Lectures */}
      <div>
        <h2 className="font-heading text-xl text-walnut mb-4">Today's Schedule</h2>
        <div className="space-y-4">
          {upcomingLectures.map((lecture, index) => (
            <motion.div
              key={lecture.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="elevated"
                className="hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center">
                      <span className="font-heading text-lg text-gold">
                        {lecture.courseCode.slice(-2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-lg text-walnut mb-1">
                        {lecture.courseName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-walnut/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {lecture.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {lecture.room}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {lecture.students} students
                        </span>
                      </div>
                    </div>
                    <Link href={`/faculty/lectures/${lecture.id}/live`}>
                      <Button variant="outline">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start Session
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <Card variant="blockchain">
        <CardContent className="p-6 text-center">
          <h3 className="font-heading text-lg text-parchment mb-2">
            One-Click Attendance
          </h3>
          <p className="text-parchment/60 text-sm mb-4">
            Start a session and students can mark attendance with multi-factor verification
          </p>
          <div className="flex justify-center gap-4 text-xs text-electric-cyan/70">
            <span>GPS ✓</span>
            <span>WiFi ✓</span>
            <span>Device ✓</span>
            <span>Time ✓</span>
            <span>AI ✓</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
