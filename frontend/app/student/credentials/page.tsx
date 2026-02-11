"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { WaxSeal } from "@/components/shared/wax-seal";
import { BlockchainBadge, BlockchainHashInline } from "@/components/shared/blockchain-badge";
import { mockCredentials } from "@/data/mock/credentials";
import { cn } from "@/lib/utils";
import {
  Award,
  Share2,
  Download,
  ExternalLink,
  Eye,
  Calendar,
  Building2,
  Grid,
  List,
  Search,
  Filter,
} from "lucide-react";

type ViewMode = "grid" | "list";

export default function CredentialsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCredential, setSelectedCredential] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCredentials = mockCredentials.filter(
    (cred) =>
      cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-walnut">Your Credentials</h1>
          <p className="text-walnut/60">
            {mockCredentials.length} NFT certificates on the blockchain
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-walnut/40" />
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-walnut/20 bg-parchment-light text-walnut placeholder:text-walnut/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-walnut/20 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded",
                viewMode === "grid" ? "bg-gold/20 text-gold" : "text-walnut/50"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded",
                viewMode === "list" ? "bg-gold/20 text-gold" : "text-walnut/50"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Credentials Grid/List */}
      <motion.div
        layout
        className={cn(
          viewMode === "grid" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          viewMode === "list" && "space-y-4"
        )}
      >
        <AnimatePresence mode="popLayout">
          {filteredCredentials.map((credential, index) => (
            <motion.div
              key={credential.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              {viewMode === "grid" ? (
                <CredentialCard credential={credential} />
              ) : (
                <CredentialListItem credential={credential} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredCredentials.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-walnut/20 mx-auto mb-4" />
          <p className="text-walnut/60">No credentials found</p>
        </div>
      )}
    </div>
  );
}

// Grid Card Component
function CredentialCard({ credential }: { credential: typeof mockCredentials[0] }) {
  return (
    <Card
      variant="certificate"
      className="group cursor-pointer hover:-translate-y-2 hover:shadow-certificate-hover transition-all duration-500"
    >
      {/* Corner ornaments */}
      <div className="corner-ornament" />

      <CardHeader className="pb-3 relative">
        {/* Soulbound badge */}
        {credential.soulbound && (
          <Badge variant="gold" className="absolute top-4 right-4 text-[10px]">
            SOULBOUND
          </Badge>
        )}

        <div className="flex items-start gap-4">
          <WaxSeal size="md" variant="award" animated={false} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-walnut/50 uppercase tracking-wider mb-1 small-caps">
              NFT {credential.nftId}
            </p>
            <CardTitle className="text-xl leading-tight line-clamp-2">
              {credential.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Achievement */}
        <p className="text-sm text-walnut/70 line-clamp-2">{credential.achievement}</p>

        {/* Issuer */}
        <div className="flex items-center gap-2 text-sm text-walnut/60">
          <Building2 className="w-4 h-4" />
          <span className="truncate">{credential.issuer}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-walnut/60">
          <Calendar className="w-4 h-4" />
          <span>{new Date(credential.issuedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-walnut/50">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {credential.verifications} verifications
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="w-3 h-3" /> {credential.shares} shares
          </span>
        </div>

        {/* Blockchain hash */}
        <div className="pt-2 border-t border-walnut/10">
          <BlockchainHashInline txHash={credential.txHash} />
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-1" /> Share
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-1" /> Verify
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// List Item Component
function CredentialListItem({ credential }: { credential: typeof mockCredentials[0] }) {
  return (
    <Card variant="elevated" className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <WaxSeal size="sm" variant="award" animated={false} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg text-walnut truncate">
                {credential.title}
              </h3>
              {credential.soulbound && (
                <Badge variant="gold" className="text-[10px]">SOULBOUND</Badge>
              )}
            </div>
            <p className="text-sm text-walnut/60 truncate">
              {credential.issuer} • {new Date(credential.issuedDate).toLocaleDateString()}
            </p>
          </div>

          <Badge variant="blockchain">NFT {credential.nftId}</Badge>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
