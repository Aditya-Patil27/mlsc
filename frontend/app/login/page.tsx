"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth-context";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { UserRole } from "@/types";
import { GraduationCap, BookOpen, Settings, ChevronRight, Loader2 } from "lucide-react";

const roles: { role: UserRole; title: string; description: string; icon: React.ElementType }[] = [
  {
    role: "student",
    title: "Student",
    description: "Mark attendance, view credentials, vote in elections",
    icon: GraduationCap,
  },
  {
    role: "faculty",
    title: "Faculty",
    description: "Start lectures, track attendance, review reports",
    icon: BookOpen,
  },
  {
    role: "admin",
    title: "Administrator",
    description: "Verify claims, issue credentials, manage system",
    icon: Settings,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);

    // Simulate login delay for ceremonial effect
    await new Promise((resolve) => setTimeout(resolve, 1500));

    switchRole(role);

    // Redirect based on role
    const redirectPaths: Record<UserRole, string> = {
      student: "/student/dashboard",
      faculty: "/faculty/dashboard",
      admin: "/admin/dashboard",
    };

    router.push(redirectPaths[role]);
  };

  return (
    <div className="min-h-screen parchment-bg flex items-center justify-center p-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-crimson/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-block mb-4"
          >
            <WaxSeal size="lg" variant="shield" text="FIDES" />
          </motion.div>
          <h1 className="font-heading text-4xl text-walnut mb-2">
            Welcome to CampusChain
          </h1>
          <p className="text-walnut/60">
            Select your role to enter the portal
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid gap-4">
          {roles.map((roleOption, index) => (
            <motion.div
              key={roleOption.role}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card
                variant="elevated"
                className={`cursor-pointer transition-all duration-300 ${
                  selectedRole === roleOption.role
                    ? "ring-2 ring-gold shadow-lg"
                    : "hover:shadow-md hover:-translate-y-0.5"
                }`}
                onClick={() => !isSubmitting && handleLogin(roleOption.role)}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center">
                    <roleOption.icon className="w-7 h-7 text-gold" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="font-heading text-xl text-walnut mb-1">
                      {roleOption.title}
                    </h3>
                    <p className="text-sm text-walnut/60">
                      {roleOption.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {isSubmitting && selectedRole === roleOption.role ? (
                      <Loader2 className="w-6 h-6 text-gold animate-spin" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-walnut/30" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Demo Notice */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-walnut/50 mt-8"
        >
          Demo Mode: Click any role to enter with pre-filled credentials
        </motion.p>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-4"
        >
          <Link
            href="/"
            className="text-sm text-gold hover:text-gold-light transition-colors"
          >
            &larr; Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
