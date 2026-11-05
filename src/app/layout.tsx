import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const rotis = localFont({
  src: [
    { path: "./fonts/rotis-sans-55.ttf", weight: "400", style: "normal" },
    { path: "./fonts/rotis-sans-65.ttf", weight: "700", style: "normal" },
  ],
  variable: "--f-rotis",
});

export const metadata: Metadata = {
  title: "Ang Ating Vargas",
  description: "Photograph four prompts at the UP Vargas Museum and see your page on the wall.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#1D3DB4" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={rotis.variable}>
      <body>{children}</body>
    </html>
  );
}
