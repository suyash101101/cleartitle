import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Syne } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Flash } from "@/components/Flash";
import { Providers } from "@/components/Providers";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const brand = Syne({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClearTitle | Sell the seat. Keep nothing.",
  description:
    "Title insurance for ticket-earning seat NFTs on NEAR. Pending cuts follow the buyer. Live testnet proofs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${brand.variable} ${mono.variable}`}>
      <body>
        <Providers>
          <div className="shell">
            <Nav />
            {children}
          </div>
          <Flash />
        </Providers>
      </body>
    </html>
  );
}
