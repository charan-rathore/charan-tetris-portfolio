import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const chakra = localFont({
  src: [{ path: "./fonts/chakra-petch-regular.ttf", weight: "400" }, { path: "./fonts/chakra-petch-semibold.ttf", weight: "600" }],
  variable: "--font-geist-sans",
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
  other: { "build-revision": process.env.VERCEL_GIT_COMMIT_SHA || "local" },
  alternates: { canonical: siteUrl },
  title: "Charan Rathore · Systris",
  description:
    "Systris: tetris with systems. Analyst at MiQ across MENA markets. A playable Tetris portfolio · IntelliRAG, memoRABLE, ThermoSense, and more.",
  openGraph: {
    title: "Charan Rathore · Systris",
    description: "I build systems that make the pieces click.",
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
      className={`${chakra.variable} ${geistMono.variable} ${pixel.variable} h-full antialiased`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
