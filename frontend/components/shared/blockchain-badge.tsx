"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn, formatTxHash, copyToClipboard } from "@/lib/utils";
import { Copy, ExternalLink, Check } from "lucide-react";

interface BlockchainBadgeProps {
  txHash: string;
  network?: string;
  showFull?: boolean;
  className?: string;
}

export function BlockchainBadge({
  txHash,
  network = "Algorand",
  showFull = false,
  className,
}: BlockchainBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [showFullHash, setShowFullHash] = useState(showFull);

  const handleCopy = async () => {
    const success = await copyToClipboard(txHash);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayHash = showFullHash ? txHash : formatTxHash(txHash, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-oxford border border-electric-cyan/30",
        "text-electric-cyan font-mono text-xs",
        "hover:border-electric-cyan/60 hover:shadow-glow-cyan",
        "transition-all duration-300",
        className
      )}
    >
      {/* Network indicator */}
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-electric-cyan animate-pulse" />
        <span className="text-parchment/60 text-[10px] uppercase tracking-wider">
          {network}
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-electric-cyan/30" />

      {/* Hash display */}
      <button
        onClick={() => setShowFullHash(!showFullHash)}
        className="hover:text-electric-cyan/80 transition-colors cursor-pointer"
        title={showFullHash ? "Show less" : "Show full hash"}
      >
        {displayHash}
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={handleCopy}
          className={cn(
            "p-1 rounded hover:bg-electric-cyan/10 transition-colors",
            copied && "text-verified"
          )}
          title="Copy hash"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <a
          href={`https://testnet.algoexplorer.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-electric-cyan/10 transition-colors"
          title="View on AlgoExplorer"
        >
          <ExternalLink size={12} />
        </a>
      </div>
    </motion.div>
  );
}

// Compact version for inline use
export function BlockchainHashInline({
  txHash,
  className,
}: {
  txHash: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(txHash);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded",
        "bg-oxford/80 text-electric-cyan/80 font-mono text-[10px]",
        "hover:text-electric-cyan hover:bg-oxford transition-colors",
        className
      )}
      title={copied ? "Copied!" : "Click to copy"}
    >
      <span>{formatTxHash(txHash, 4)}</span>
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}
