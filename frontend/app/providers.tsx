"use client";

import React from "react";
import { AuthProvider } from "@/lib/contexts/auth-context";
import { PeraWalletProvider } from "@/lib/contexts/pera-wallet-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PeraWalletProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PeraWalletProvider>
  );
}
