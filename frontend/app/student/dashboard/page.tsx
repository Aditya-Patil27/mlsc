"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { BlockchainHashInline } from "@/components/shared/blockchain-badge";
import { mockCredentials } from "@/data/mock/credentials";
import { mockSessionStats, mockSessions } from "@/data/mock/attendance";
import {
  CalendarCheck,
  Award,
  Heart,
  Vote,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "Mark Attendance",
      description: "Data Structures - Room 301",
      href: "/student/attendance/mark/SESSION001",
      icon: CalendarCheck,
      color: "text-verified",
      bgColor: "bg-verified/10",
      badge: "Active Now",
      badgeVariant: "verified" as const,
    },
    {
      title: "Request Medical Leave",
      description: "Generate ZK Proof",
      href: "/student/health",
      icon: Heart,
      color: "text-crimson",
      bgColor: "bg-crimson/10",
    },
    {
      title: "View Credentials",
      description: `${mockCredentials.length} NFT Certificates`,
      href: "/student/credentials",
      icon: Award,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      title: "Cast Your Vote",
      description: "Student Council Election",
      href: "/student/vote",
      icon: Vote,
      color: "text-electric-cyan",
      bgColor: "bg-electric-cyan/10",
      badge: "Ends in 2 days",
      badgeVariant: "pending" as const,
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
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="text-walnut/60">
            Your academic credentials are secure on the blockchain
          </p>
        </div>
        <WaxSeal size="md" variant="award" />
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Attendance Rate",
            value: `${mockSessionStats.percentage}%`,
            icon: TrendingUp,
            color: "text-verified",
          },
          {
            label: "NFT Credentials",
            value: mockCredentials.length.toString(),
            icon: Award,
            color: "text-gold",
          },
          {
            label: "Lectures This Week",
            value: "12",
            icon: Clock,
            color: "text-walnut",
          },
          {
            label: "Verified Claims",
            value: "3",
            icon: CheckCircle2,
            color: "text-electric-cyan",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading text-xl text-walnut mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link href={action.href}>
                <Card
                  variant="elevated"
                  className="hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${action.bgColor} flex items-center justify-center`}>
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading text-lg text-walnut">{action.title}</h3>
                          {action.badge && (
                            <Badge variant={action.badgeVariant}>{action.badge}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-walnut/60">{action.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-walnut/30" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Credentials */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-walnut">Recent Credentials</h2>
          <Link href="/student/credentials">
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockCredentials.slice(0, 3).map((credential, index) => (
            <motion.div
              key={credential.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card variant="certificate" className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{credential.title}</CardTitle>
                      <p className="text-xs text-walnut/60">{credential.issuer}</p>
                    </div>
                    <WaxSeal size="sm" variant="award" animated={false} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-walnut/70 mb-3">{credential.achievement}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="blockchain">NFT {credential.nftId}</Badge>
                    <BlockchainHashInline txHash={credential.txHash} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Attendance Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-walnut">This Week's Attendance</h2>
          <Link href="/student/attendance/mark">
            <Button variant="ghost" size="sm">
              View History <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-walnut/60 mb-1">Overall Attendance</p>
                <p className="font-heading text-2xl text-walnut">
                  {mockSessionStats.present}/{mockSessionStats.total} Classes
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-walnut/60 mb-1">Percentage</p>
                <p className="font-heading text-2xl text-verified">
                  {mockSessionStats.percentage}%
                </p>
              </div>
            </div>
            <Progress value={mockSessionStats.percentage} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-walnut/50">
              <span>Minimum Required: 75%</span>
              <span className={mockSessionStats.percentage >= 75 ? "text-verified" : "text-rejected"}>
                {mockSessionStats.percentage >= 75 ? "On Track" : "Below Minimum"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
