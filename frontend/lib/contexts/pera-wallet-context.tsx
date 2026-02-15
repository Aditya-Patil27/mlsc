"use client";

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { PeraWalletConnect } from "@perawallet/connect";

interface PeraWalletContextType {
    walletAddress: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

const PeraWalletContext = createContext<PeraWalletContextType | undefined>(
    undefined
);

export function PeraWalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const peraWalletRef = useRef<PeraWalletConnect | null>(null);

    // Initialize the Pera Wallet SDK and attempt session reconnect
    useEffect(() => {
        const peraWallet = new PeraWalletConnect();
        peraWalletRef.current = peraWallet;

        // Try to reconnect an existing session
        peraWallet
            .reconnectSession()
            .then((accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    peraWallet.connector?.on("disconnect", handleDisconnect);
                }
            })
            .catch(() => {
                // No previous session — that's fine
            });

        return () => {
            peraWallet.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDisconnect = useCallback(() => {
        setWalletAddress(null);
    }, []);

    const connectWallet = useCallback(async () => {
        const peraWallet = peraWalletRef.current;
        if (!peraWallet) return;

        setIsConnecting(true);
        try {
            const accounts = await peraWallet.connect();
            setWalletAddress(accounts[0]);

            // Listen for disconnects from the wallet side
            peraWallet.connector?.on("disconnect", handleDisconnect);
        } catch (error) {
            // User rejected or connection failed
            if ((error as Error)?.message?.includes("CONNECT_MODAL_CLOSED")) {
                // User simply closed the modal — not a real error
            } else {
                console.error("Pera Wallet connection error:", error);
            }
        } finally {
            setIsConnecting(false);
        }
    }, [handleDisconnect]);

    const disconnectWallet = useCallback(() => {
        const peraWallet = peraWalletRef.current;
        if (peraWallet) {
            peraWallet.disconnect();
        }
        setWalletAddress(null);
    }, []);

    return (
        <PeraWalletContext.Provider
            value={{
                walletAddress,
                isConnected: !!walletAddress,
                isConnecting,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </PeraWalletContext.Provider>
    );
}

export function usePeraWallet() {
    const context = useContext(PeraWalletContext);
    if (context === undefined) {
        throw new Error("usePeraWallet must be used within a PeraWalletProvider");
    }
    return context;
}
