import type { Metadata } from "next";
import "./globals.css";
import "./parchment-lock.css";
import { Nav } from "@/components/Nav";
import { Flash } from "@/components/Flash";
import { Providers } from "@/components/Providers";

/**
 * Fonts load via CSS @import in globals (non-blocking). Avoid next/font/google
 * so production builds do not fail when Google Fonts is unreachable.
 */
export const metadata: Metadata = {
  title: "CleanDeed · title insurance for earning seats",
  description:
    "Provably clean title when an earning membership changes hands. Seat NFTs earn ticket cuts on NEAR — Diligence, Transfer Lab, mid-payout rebound.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className="font-manrope font-plex">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div className="shell x-ads-shell">
            <Nav />
            {children}
          </div>
          <Flash />
        </Providers>
      </body>
    </html>
  );
}
