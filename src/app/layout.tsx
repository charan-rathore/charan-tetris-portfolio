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
  title: "Charan Rathore · Product Analyst & AI Systems Builder",
  description:
    "A playable Tetris portfolio. BITS Pilani '26, ex-Flipkart, building AI infrastructure. IntelliRAG, memoRABLE, ThermoSense, and more.",
  openGraph: {
    title: "Charan Rathore · Product Analyst & AI Systems Builder",
    description:
      "A playable Tetris portfolio. Guideline mechanics, hand-tuned juice, real production systems.",
    type: "website",
    url: "https://charan-tetris-portfolio.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Charan Rathore · Product Analyst & AI Systems Builder",
    description: "A playable Tetris portfolio built with Next.js + Three.js.",
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
