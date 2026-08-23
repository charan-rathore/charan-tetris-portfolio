import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixel = Press_Start_2P({
  variable: "--font-pixel",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://charan-tetris-portfolio.vercel.app"),
  title: "Charan Rathore · Systris",
  description:
    "Systris: tetris with systems. A playable Tetris portfolio · IntelliRAG, memoRABLE, ThermoSense, and more.",
  openGraph: {
    title: "Charan Rathore · Systris",
    description: "I am the MCP between Charan and the world",
    type: "website",
    url: "https://charan-tetris-portfolio.vercel.app",
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
        <Analytics />
      </body>
    </html>
  );
}
