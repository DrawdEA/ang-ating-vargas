import type { Metadata, Viewport } from "next";
import { Caveat, Hanken_Grotesk, IBM_Plex_Mono, Young_Serif } from "next/font/google";
import "./globals.css";

const display = Young_Serif({ weight: "400", subsets: ["latin"], variable: "--f-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--f-body" });
const hand = Caveat({ weight: "500", subsets: ["latin"], variable: "--f-hand" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--f-mono" });

export const metadata: Metadata = {
  title: "Ang Ating Vargas",
  description: "Collect your own Vargas at the UP Vargas Museum: photograph what each prompt asks for and see your page on the wall.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#15130F" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${hand.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
