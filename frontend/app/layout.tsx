import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Serif_4, JetBrains_Mono, Syne, Spectral } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Headings - Traditional serif with academic gravitas
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const spectral = Spectral({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-spectral",
  display: "swap",
});

// Body - Readable serif for credibility
const sourceSerif = Source_Serif_4({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

// Technical - Monospace for blockchain hashes
const jetbrains = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Accents - Modern sans for labels
const syne = Syne({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusChain | Academic Credentials Verified on Blockchain",
  description: "Trust Automated. Fraud Eliminated. Campus Revolutionized. Secure academic credential verification powered by Algorand blockchain.",
  keywords: ["blockchain", "academic credentials", "verification", "NFT certificates", "attendance", "Algorand"],
  authors: [{ name: "CampusChain Team" }],
  openGraph: {
    title: "CampusChain | Academic Credentials Verified on Blockchain",
    description: "Trust Automated. Fraud Eliminated. Campus Revolutionized.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${cormorant.variable}
          ${spectral.variable}
          ${sourceSerif.variable}
          ${jetbrains.variable}
          ${syne.variable}
          font-body
          antialiased
          parchment-bg
          min-h-screen
        `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
