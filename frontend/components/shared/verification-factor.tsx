"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Loader2, MapPin, Wifi, Smartphone, Timer, Bluetooth } from "lucide-react";
import { FactorStatus } from "@/types";

interface VerificationFactorProps {
  name: string;
  status: FactorStatus;
  details: string;
  icon: "gps" | "wifi" | "device" | "time" | "bluetooth";
  delay?: number;
}

const iconComponents = {
  gps: MapPin,
  wifi: Wifi,
  device: Smartphone,
  time: Timer,
  bluetooth: Bluetooth,
};

const statusConfig = {
  pending: {
    color: "text-walnut/50",
    bgColor: "bg-walnut/5",
    borderColor: "border-walnut/20",
    icon: Clock,
  },
  checking: {
    color: "text-confirming",
    bgColor: "bg-confirming/10",
    borderColor: "border-confirming/30",
    icon: Loader2,
  },
  verified: {
    color: "text-verified",
    bgColor: "bg-verified/10",
    borderColor: "border-verified/30",
    icon: CheckCircle2,
  },
  failed: {
    color: "text-rejected",
    bgColor: "bg-rejected/10",
    borderColor: "border-rejected/30",
    icon: XCircle,
  },
};

export function VerificationFactor({
  name,
  status,
  details,
  icon,
  delay = 0,
}: VerificationFactorProps) {
  const FactorIcon = iconComponents[icon];
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.15, duration: 0.4 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300",
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Factor icon */}
      <div
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full",
          config.bgColor
        )}
      >
        <FactorIcon className={cn("w-6 h-6", config.color)} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-heading font-semibold text-walnut">{name}</span>
          <AnimatePresence mode="wait">
            {status === "checking" && (
              <motion.span
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-confirming"
              >
                Verifying...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <p className="text-sm text-walnut/70 truncate">{details}</p>
      </div>

      {/* Status icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: delay * 0.15 + 0.2 }}
      >
        <StatusIcon
          className={cn(
            "w-6 h-6",
            config.color,
            status === "checking" && "animate-spin"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

// Container for all verification factors
interface MultiFactorDisplayProps {
  factors: VerificationFactorProps[];
  className?: string;
}

export function MultiFactorDisplay({ factors, className }: MultiFactorDisplayProps) {
  const allVerified = factors.every((f) => f.status === "verified");
  const hasFailed = factors.some((f) => f.status === "failed");
  const isChecking = factors.some((f) => f.status === "checking");

  return (
    <div className={cn("space-y-3", className)}>
      {factors.map((factor, index) => (
        <VerificationFactor key={factor.name} {...factor} delay={index} />
      ))}

      {/* Overall status */}
      <AnimatePresence>
        {!isChecking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 p-4 rounded-lg border-2 text-center",
              allVerified && "bg-verified/10 border-verified/30",
              hasFailed && "bg-rejected/10 border-rejected/30"
            )}
          >
            {allVerified && (
              <div className="flex items-center justify-center gap-2 text-verified font-heading font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                All Factors Verified
              </div>
            )}
            {hasFailed && (
              <div className="flex items-center justify-center gap-2 text-rejected font-heading font-semibold">
                <XCircle className="w-5 h-5" />
                Verification Failed
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
