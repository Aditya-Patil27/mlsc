"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePeraWallet } from "@/lib/contexts/pera-wallet-context";
import { Button } from "@/components/ui";
import { Wallet, LogOut, Loader2, CheckCircle2, Copy } from "lucide-react";

function truncateAddress(address: string): string {
    return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
    const {
        walletAddress,
        isConnected,
        isConnecting,
        connectWallet,
        disconnectWallet,
    } = usePeraWallet();

    const [copied, setCopied] = React.useState(false);

    const handleCopyAddress = async () => {
        if (!walletAddress) return;
        await navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isConnected && walletAddress) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
            >
                {/* Address chip */}
                <button
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-electric-cyan/10 border border-electric-cyan/30
                     text-electric-cyan text-sm font-mono
                     hover:bg-electric-cyan/20 hover:border-electric-cyan/50
                     transition-all cursor-pointer"
                    title="Click to copy full address"
                >
                    <CheckCircle2 className="w-4 h-4 text-verified flex-shrink-0" />
                    <span>{truncateAddress(walletAddress)}</span>
                    <AnimatePresence mode="wait">
                        {copied ? (
                            <motion.span
                                key="copied"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-xs text-verified"
                            >
                                Copied!
                            </motion.span>
                        ) : (
                            <motion.span key="copy-icon">
                                <Copy className="w-3.5 h-3.5 opacity-50" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>

                {/* Disconnect */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnectWallet}
                    className="text-parchment/60 hover:text-crimson hover:bg-crimson/10"
                    title="Disconnect wallet"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <Button
                variant="blockchain"
                size="sm"
                onClick={connectWallet}
                disabled={isConnecting}
                id="connect-pera-wallet-btn"
            >
                {isConnecting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting…
                    </>
                ) : (
                    <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Pera Wallet
                    </>
                )}
            </Button>
        </motion.div>
    );
}
