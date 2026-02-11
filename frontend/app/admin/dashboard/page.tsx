"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { mockCredentials } from "@/data/mock/credentials";
import { mockSessionStats, mockAnomalies } from "@/data/mock/attendance";
import {
  ClipboardCheck,
  Award,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Shield,
} from "lucide-react";

export default function AdminDashboard() {
  const pendingVerifications = 12;
  const credentialsIssued = 156;
  const activeProviders = 8;
  const anomaliesThisWeek = mockAnomalies.length;

  const stats = [
    {
      label: "Pending Verifications",
      value: pendingVerifications,
      icon: ClipboardCheck,
      color: "text-pending",
      bgColor: "bg-pending/10",
    },
    {
      label: "Credentials Issued",
      value: credentialsIssued,
      icon: Award,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      label: "Active Providers",
      value: activeProviders,
      icon: Users,
      color: "text-verified",
      bgColor: "bg-verified/10",
    },
    {
      label: "Anomalies This Week",
      value: anomaliesThisWeek,
      icon: AlertTriangle,
      color: "text-crimson",
      bgColor: "bg-crimson/10",
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
            Admin Dashboard
          </h1>
          <p className="text-walnut/60">
            Manage verifications, credentials, and system health
          </p>
        </div>
        <WaxSeal size="md" variant="shield" text="ADMIN" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="p-6">
                <div className={`flex items-center gap-4 ${stat.color}`}>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className="w-6 h-6" />
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="certificate">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-pending" />
                  Pending Verifications
                </CardTitle>
                <Badge variant="pending">{pendingVerifications} pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sample pending items */}
              {[
                { name: "Rahul Sharma", type: "Medical Leave", time: "2 hours ago" },
                { name: "Priya Patel", type: "Medical Leave", time: "3 hours ago" },
                { name: "Amit Kumar", type: "Medical Leave", time: "5 hours ago" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-parchment-dark/30"
                >
                  <div>
                    <p className="font-medium text-walnut">{item.name}</p>
                    <p className="text-xs text-walnut/50">{item.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-walnut/50">{item.time}</span>
                    <Badge variant="pending">Review</Badge>
                  </div>
                </div>
              ))}
              <Link href="/admin/verify">
                <Button variant="outline" className="w-full">
                  View All Verifications
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Credentials */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="certificate">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  Recently Issued
                </CardTitle>
                <Badge variant="gold">{credentialsIssued} total</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCredentials.slice(0, 3).map((cred, index) => (
                <div
                  key={cred.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-parchment-dark/30"
                >
                  <WaxSeal size="sm" variant="award" animated={false} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-walnut truncate">{cred.title}</p>
                    <p className="text-xs text-walnut/50 truncate">{cred.recipientName}</p>
                  </div>
                  <Badge variant="blockchain">{cred.nftId}</Badge>
                </div>
              ))}
              <Link href="/admin/credentials">
                <Button variant="outline" className="w-full">
                  Issue New Credential
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="blockchain">
          <CardHeader>
            <CardTitle className="text-parchment flex items-center gap-2">
              <Shield className="w-5 h-5 text-electric-cyan" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: "Blockchain Sync", value: "100%", status: "healthy" },
                { label: "API Response", value: "45ms", status: "healthy" },
                { label: "Active Sessions", value: "234", status: "healthy" },
                { label: "Error Rate", value: "0.01%", status: "healthy" },
              ].map((metric, index) => (
                <div key={metric.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-verified animate-pulse" />
                    <span className="text-xs text-parchment/60 uppercase tracking-wider">
                      {metric.label}
                    </span>
                  </div>
                  <p className="font-heading text-2xl text-electric-cyan">{metric.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
