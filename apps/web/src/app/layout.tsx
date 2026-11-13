import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Flash } from "@/components/Flash";
import { Providers } from "@/components/Providers";

/** X Ads–adjacent geometric sans (Chirp-like weight + tracking). */
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-code",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuietTitle · Nearnight seat NFTs",
  description:
    "Quiet title = undisputed ownership of every future cut. Five NEP-171 seat NFTs earn on Nearnight. Live testnet proofs on NEAR.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
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
