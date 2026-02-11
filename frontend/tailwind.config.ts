import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Headings - Traditional serif
        heading: ["var(--font-cormorant)", "serif"],
        "heading-alt": ["var(--font-spectral)", "serif"],

        // Body - Readable serif
        body: ["var(--font-source-serif)", "serif"],

        // Technical - Monospace for blockchain hashes
        mono: ["var(--font-jetbrains)", "monospace"],

        // Accents - Modern sans
        accent: ["var(--font-syne)", "sans-serif"],
      },

      colors: {
        // Primary — dark sidebar / navigation
        oxford: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          dark: "#020617",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        // Danger / alerts
        crimson: {
          DEFAULT: "#DC2626",
          light: "#EF4444",
          dark: "#B91C1C",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        // Surface / backgrounds
        parchment: {
          DEFAULT: "#F8FAFC",
          light: "#FFFFFF",
          dark: "#F1F5F9",
          50: "#FFFFFF",
          100: "#F8FAFC",
          200: "#F1F5F9",
          300: "#E2E8F0",
          400: "#CBD5E1",
          500: "#94A3B8",
          600: "#64748B",
          700: "#475569",
          800: "#334155",
          900: "#1E293B",
        },
        // Text / foreground
        walnut: {
          DEFAULT: "#1E293B",
          light: "#334155",
          dark: "#0F172A",
        },
        // Accent — buttons, links, highlights
        gold: {
          DEFAULT: "#4F46E5",
          light: "#6366F1",
          dark: "#4338CA",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },

        // Info / tech accent
        "electric-cyan": {
          DEFAULT: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        // Success accent
        "neon-lime": {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },

        // Status colors
        verified: "#10B981",
        pending: "#F59E0B",
        rejected: "#EF4444",
        confirming: "#06B6D4",
      },

      backgroundImage: {
        "holographic": "linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)",
        "holographic-bright": "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #3B82F6 100%)",
        "parchment-gradient": "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
        "wax-seal": "radial-gradient(circle, #DC2626 0%, #B91C1C 100%)",
        "oxford-gradient": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        "gold-shimmer": "linear-gradient(90deg, #4F46E5 0%, #6366F1 50%, #4F46E5 100%)",
      },

      animation: {
        // Ceremonial animations
        "seal-press": "sealPress 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "certificate-materialize": "materialize 1.5s ease-out forwards",
        "wax-stamp": "waxStamp 0.8s ease-in-out",
        "qr-scan": "qrScan 2s linear infinite",
        "pulse-verification": "pulseVerify 2s ease-in-out infinite",
        "stagger-reveal": "staggerReveal 0.6s ease-out forwards",
        "holographic-shimmer": "shimmer 3s linear infinite",
        "confetti-fall": "confetti 3s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "gate-open": "gateOpen 1.5s ease-out forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "blockchain-connect": "blockchainConnect 0.8s ease-out forwards",
        "checkmark-draw": "checkmarkDraw 0.5s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
      },

      keyframes: {
        sealPress: {
          "0%": {
            transform: "scale(0) rotate(-180deg)",
            opacity: "0"
          },
          "60%": {
            transform: "scale(1.2) rotate(0deg)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1"
          },
        },
        materialize: {
          "0%": {
            opacity: "0",
            transform: "translateY(40px) scale(0.9) rotateX(15deg)",
            filter: "blur(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1) rotateX(0deg)",
            filter: "blur(0)"
          },
        },
        waxStamp: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.9)" },
        },
        qrScan: {
          "0%": { top: "0%" },
          "50%": { top: "100%" },
          "100%": { top: "0%" },
        },
        pulseVerify: {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
            boxShadow: "0 0 10px rgba(59,130,246,0.2)"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.02)",
            boxShadow: "0 0 20px rgba(59,130,246,0.4)"
          },
        },
        staggerReveal: {
          "0%": {
            opacity: "0",
            transform: "translateX(-20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)"
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        confetti: {
          "0%": {
            transform: "translateY(0) rotate(0deg)",
            opacity: "1"
          },
          "100%": {
            transform: "translateY(100vh) rotate(360deg)",
            opacity: "0"
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          },
        },
        slideInRight: {
          "0%": {
            opacity: "0",
            transform: "translateX(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)"
          },
        },
        gateOpen: {
          "0%": {
            clipPath: "inset(50% 0% 50% 0%)",
            opacity: "0"
          },
          "100%": {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: "1"
          },
        },
        glowPulse: {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(79, 70, 229, 0.15)"
          },
          "50%": {
            boxShadow: "0 0 20px rgba(79, 70, 229, 0.3)"
          },
        },
        blockchainConnect: {
          "0%": {
            strokeDasharray: "0 100",
            opacity: "0"
          },
          "100%": {
            strokeDasharray: "100 0",
            opacity: "1"
          },
        },
        checkmarkDraw: {
          "0%": {
            strokeDashoffset: "50"
          },
          "100%": {
            strokeDashoffset: "0"
          },
        },
      },

      boxShadow: {
        "embossed": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "embossed-dark": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
        "wax-seal": "0 4px 8px rgba(220, 38, 38, 0.25), 0 2px 4px rgba(0,0,0,0.1)",
        "certificate": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "certificate-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
        "glow-cyan": "0 0 15px rgba(59, 130, 246, 0.25)",
        "glow-gold": "0 0 15px rgba(79, 70, 229, 0.25)",
        "glow-verified": "0 0 15px rgba(16, 185, 129, 0.25)",
        "inner-glow": "inset 0 0 15px rgba(59, 130, 246, 0.08)",
      },

      borderRadius: {
        "certificate": "0.5rem",
        "seal": "50%",
      },

      transitionTimingFunction: {
        "ceremonial": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "seal": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
