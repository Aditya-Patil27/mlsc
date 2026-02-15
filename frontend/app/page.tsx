"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { ConnectWalletButton } from "@/components/shared/connect-wallet-button";
import {
  Shield,
  Award,
  Vote,
  Clock,
  ChevronRight,
  Fingerprint,
  Link as LinkIcon,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen parchment-bg-dark relative overflow-hidden">
      {/* Background blockchain grid */}
      <div className="absolute inset-0 blockchain-grid opacity-30" />

      {/* Radial gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-cyan/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between px-8 py-6"
        >
          <div className="flex items-center gap-3">
            <WaxSeal size="sm" variant="shield" animated={false} />
            <span className="font-heading text-2xl text-parchment font-semibold tracking-wide">
              CampusChain
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-parchment/70 hover:text-parchment transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-parchment/70 hover:text-parchment transition-colors">
              How It Works
            </Link>
            <Link href="/login" className="text-parchment/70 hover:text-parchment transition-colors">
              Login
            </Link>
            <ConnectWalletButton />
            <Button variant="ceremonial" size="sm" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </nav>
        </motion.header>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="max-w-5xl mx-auto text-center">
            {/* Gate opening animation */}
            <AnimatePresence>
              {isLoaded && (
                <motion.div
                  initial={{ clipPath: "inset(50% 0% 50% 0%)", opacity: 0 }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  {/* Wax Seal */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                    className="flex justify-center mb-8"
                  >
                    <WaxSeal size="lg" variant="shield" text="VERITAS" />
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="font-heading text-5xl md:text-7xl text-parchment mb-6 leading-tight"
                  >
                    Your Academic Legacy,{" "}
                    <span className="metallic-gold-animated">Immortalized</span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="text-xl md:text-2xl text-parchment/70 mb-8 max-w-3xl mx-auto"
                  >
                    Trust Automated. Fraud Eliminated. Campus Revolutionized.
                    <br />
                    <span className="text-electric-cyan">Powered by Algorand Blockchain</span>
                  </motion.p>

                  {/* Hackathon Badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.4 }}
                    className="flex flex-wrap gap-3 justify-center mb-6"
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm font-medium">
                      🏆 Built for Hackspiration&apos;26
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric-cyan/20 border border-electric-cyan/30 text-electric-cyan text-sm font-medium">
                      ⛓️ Powered by Algorand
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-sm font-medium">
                      🤖 AI on Blockchain Track
                    </span>
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                  >
                    <Button variant="ceremonial" size="xl" asChild>
                      <Link href="/login">
                        Enter Campus Portal
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
                    <Button variant="blockchain" size="xl" asChild>
                      <Link href="#features">
                        <LinkIcon className="mr-2 w-5 h-5" />
                        Verify a Credential
                      </Link>
                    </Button>
                  </motion.div>

                  {/* Stats */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
                  >
                    {[
                      { value: "4.5s", label: "Block Finality" },
                      { value: "$0.001", label: "Per Transaction" },
                      { value: "100%", label: "Tamper Proof" },
                      { value: "∞", label: "Permanent Record" },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 + index * 0.1 }}
                        className="text-center"
                      >
                        <div className="text-3xl md:text-4xl font-heading text-electric-cyan mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm text-parchment/60 uppercase tracking-wider">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Features Section */}
        <section id="features" className="px-8 py-20 bg-oxford/50">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl text-parchment text-center mb-16"
            >
              Three Pillars of Campus Trust
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Fingerprint,
                  title: "Bulletproof Attendance",
                  description: "Multi-factor verification: GPS + WiFi + Device + Time + Bluetooth. You actually have to BE IN CLASS.",
                  color: "text-verified",
                  bgColor: "bg-verified/10",
                },
                {
                  icon: Shield,
                  title: "Privacy-First Health Verification",
                  description: "Zero-Knowledge proofs verify medical leave without revealing your diagnosis. Your health, your privacy.",
                  color: "text-electric-cyan",
                  bgColor: "bg-electric-cyan/10",
                },
                {
                  icon: Award,
                  title: "NFT Credentials",
                  description: "Soulbound certificates on blockchain. Unfakeable. Instantly verifiable. Forever yours.",
                  color: "text-gold",
                  bgColor: "bg-gold/10",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="p-8 rounded-xl bg-oxford-light/50 border border-parchment/10 hover:border-parchment/20 transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="font-heading text-xl text-parchment mb-3">{feature.title}</h3>
                  <p className="text-parchment/60">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading text-4xl text-parchment mb-16"
            >
              How It Works
            </motion.h2>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Verify", desc: "Multi-factor check confirms your presence" },
                { step: "2", title: "Record", desc: "Data is cryptographically signed" },
                { step: "3", title: "Store", desc: "Recorded on Algorand blockchain" },
                { step: "4", title: "Trust", desc: "Anyone can verify, forever" },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-white font-heading text-xl">
                    {item.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gold/50 to-gold/20" />
                  )}
                  <h4 className="font-heading text-lg text-parchment mb-2">{item.title}</h4>
                  <p className="text-sm text-parchment/60">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-8 py-8 border-t border-parchment/10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <WaxSeal size="sm" variant="shield" animated={false} />
              <span className="font-heading text-parchment/70">
                CampusChain &copy; 2026
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-parchment/50">
              <span className="flex items-center gap-1.5">
                🏆 Hackspiration&apos;26
              </span>
              <span className="text-parchment/30">•</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-electric-cyan" />
                Powered by Algorand
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
