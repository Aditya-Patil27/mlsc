"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { mockCredentials } from "@/data/mock/credentials";
import { BlockchainHashInline } from "@/components/shared/blockchain-badge";
import {
  Wallet,
  Award,
  Share2,
  ExternalLink,
  Calendar,
  Building2,
  Eye,
  TrendingUp,
} from "lucide-react";

export default function PassportPage() {
  const totalCredentials = mockCredentials.length;
  const totalVerifications = mockCredentials.reduce((sum, c) => sum + c.verifications, 0);
  const totalShares = mockCredentials.reduce((sum, c) => sum + c.shares, 0);

  return (
    <div className="space-y-8">
      {/* Passport Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card variant="certificate" className="overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-oxford via-gold to-oxford" />
          <CardContent className="relative pt-0 pb-8">
            <div className="flex items-end gap-6 -mt-12">
              <div className="bg-parchment p-2 rounded-xl shadow-lg">
                <WaxSeal size="lg" variant="shield" text="VIT" />
              </div>
              <div className="flex-1 pt-12">
                <h1 className="font-heading text-3xl text-walnut">
                  Academic Passport
                </h1>
                <p className="text-walnut/60">
                  Your verified credentials portfolio
                </p>
              </div>
              <Button variant="ceremonial">
                <Share2 className="w-4 h-4 mr-2" />
                Share Portfolio
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-walnut/10">
              {[
                { icon: Award, label: "Credentials", value: totalCredentials },
                { icon: Eye, label: "Verifications", value: totalVerifications },
                { icon: Share2, label: "Shares", value: totalShares },
                { icon: TrendingUp, label: "Trust Score", value: "98%" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-gold" />
                  <p className="font-heading text-2xl text-walnut">{stat.value}</p>
                  <p className="text-sm text-walnut/60">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Credentials Timeline */}
      <div>
        <h2 className="font-heading text-xl text-walnut mb-4">Credential Timeline</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold via-gold/50 to-transparent" />

          <div className="space-y-6">
            {mockCredentials.map((credential, index) => (
              <motion.div
                key={credential.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-6 top-4 w-5 h-5 rounded-full bg-gold border-4 border-parchment shadow" />

                <Card variant="elevated" className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <WaxSeal size="sm" variant="award" animated={false} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading text-lg text-walnut">
                            {credential.title}
                          </h3>
                          {credential.soulbound && (
                            <Badge variant="gold" className="text-[10px]">SOULBOUND</Badge>
                          )}
                        </div>
                        <p className="text-sm text-walnut/60 mb-2">
                          {credential.achievement}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-walnut/50">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {credential.issuer}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(credential.issuedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="blockchain">NFT {credential.nftId}</Badge>
                        <BlockchainHashInline txHash={credential.txHash} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
