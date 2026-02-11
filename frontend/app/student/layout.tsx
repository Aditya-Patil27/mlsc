"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/contexts/auth-context";
import { cn } from "@/lib/utils";
import { WaxSeal } from "@/components/shared/wax-seal";
import { Button, Avatar, AvatarFallback, Badge } from "@/components/ui";
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  Heart,
  Vote,
  LogOut,
  ChevronRight,
  Wallet,
} from "lucide-react";

const studentNavItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/attendance/mark", label: "Attendance", icon: CalendarCheck },
  { href: "/student/credentials", label: "Credentials", icon: Award },
  { href: "/student/passport", label: "Passport", icon: Wallet },
  { href: "/student/health", label: "Health", icon: Heart },
  { href: "/student/vote", label: "Vote", icon: Vote },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen parchment-bg flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed left-0 top-0 bottom-0 w-64 bg-oxford border-r border-parchment/10 flex flex-col z-40"
      >
        {/* Logo */}
        <div className="p-6 border-b border-parchment/10">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <WaxSeal size="sm" variant="shield" animated={false} />
            <span className="font-heading text-xl text-parchment font-semibold">
              CampusChain
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-parchment/10">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-oxford-light/50">
            <Avatar>
              <AvatarFallback>{user?.name ? getInitials(user.name) : "ST"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-parchment truncate">
                {user?.name || "Student"}
              </p>
              <p className="text-xs text-parchment/50 truncate">
                {user?.metadata?.prn && `PRN: ${user.metadata.prn}`}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {studentNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "text-parchment/60 hover:bg-parchment/5 hover:text-parchment"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Blockchain Status */}
        <div className="p-4 border-t border-parchment/10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-oxford-light/50">
            <div className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
            <span className="text-xs text-electric-cyan font-mono">Algorand Connected</span>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-parchment/10">
          <Button
            variant="ghost"
            className="w-full justify-start text-parchment/60 hover:text-parchment"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-parchment/80 backdrop-blur-sm border-b border-walnut/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl text-walnut">
                {studentNavItems.find((item) => pathname?.startsWith(item.href))?.label || "Dashboard"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="verified">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-verified" />
                  Verified Student
                </span>
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
