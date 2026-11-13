import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Flash } from "@/components/Flash";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ClearTitle — Sell the seat. Keep nothing.",
  description:
    "Title insurance for ticket-earning membership NFTs on NEAR. Ticket money follows clear title.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
