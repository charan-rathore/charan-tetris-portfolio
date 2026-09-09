import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const pixel = localFont({
  src: "./fonts/press-start-2p-latin.woff2",
  variable: "--font-pixel",
  weight: "400",
  display: "swap",
});

const siteUrl = "https://charan-tetris-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  title: "Charan Rathore · Systris",
  description:
    "Systris: tetris with systems. Analyst at MiQ across MENA markets. A playable Tetris portfolio · IntelliRAG, memoRABLE, ThermoSense, and more.",
  openGraph: {
    title: "Charan Rathore · Systris",
    description: "I am the MCP between Charan and the world",
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Charan Rathore · Systris",
    description: "Systris: tetris with systems. Built with Next.js + Three.js.",
    creator: "@huesofbanter",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pixel.variable} h-full antialiased`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
