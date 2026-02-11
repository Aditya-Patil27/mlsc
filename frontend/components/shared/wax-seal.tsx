"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Award, Shield, Star } from "lucide-react";

interface WaxSealProps {
  size?: "sm" | "md" | "lg";
  variant?: "verified" | "award" | "shield" | "star";
  animated?: boolean;
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-28 h-28",
};

const iconSizes = {
  sm: 16,
  md: 28,
  lg: 40,
};

const iconComponents = {
  verified: Check,
  award: Award,
  shield: Shield,
  star: Star,
};

export function WaxSeal({
  size = "md",
  variant = "verified",
  animated = true,
  className,
  text,
}: WaxSealProps) {
  const Icon = iconComponents[variant];

  const sealContent = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-gold-light via-gold to-gold-dark",
        "shadow-lg",
        sizeClasses[size],
        className
      )}
    >
      {/* Highlight effect */}
      <div className="absolute top-[10%] left-[15%] w-[35%] h-[25%] bg-white/20 rounded-full blur-[2px]" />

      {/* Embossed ring */}
      <div
        className={cn(
          "absolute inset-2 rounded-full border-2 border-white/10",
          "flex items-center justify-center"
        )}
      >
        {/* Inner content */}
        <div className="flex flex-col items-center justify-center text-white">
          <Icon size={iconSizes[size]} strokeWidth={2.5} />
          {text && size !== "sm" && (
            <span className="text-[8px] uppercase tracking-wider mt-0.5 font-heading">
              {text}
            </span>
          )}
        </div>
      </div>

      {/* Decorative dots around the edge */}
      {size !== "sm" && (
        <>
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/30 rounded-full" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/30 rounded-full" />
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-white/30 rounded-full" />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-white/30 rounded-full" />
        </>
      )}
    </div>
  );

  if (!animated) {
    return sealContent;
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 1.2,
      }}
    >
      {sealContent}
    </motion.div>
  );
}

// Animated wax seal with press effect
export function WaxSealPress({
  size = "lg",
  variant = "verified",
  className,
  onComplete,
}: WaxSealProps & { onComplete?: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{
        scale: [0, 1.2, 1],
        rotate: [-180, 0, 0],
      }}
      transition={{
        duration: 1.2,
        times: [0, 0.6, 1],
        ease: [0.34, 1.56, 0.64, 1],
      }}
      onAnimationComplete={onComplete}
    >
      <WaxSeal size={size} variant={variant} animated={false} className={className} />
    </motion.div>
  );
}
