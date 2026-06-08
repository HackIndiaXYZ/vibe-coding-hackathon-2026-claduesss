import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://smilechain.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SmileChain — Where Your Smile is the Currency",
    template: "%s · SmileChain",
  },
  description:
    "A social platform powered by genuine smiles. Post a photo, earn Smile Points based on your smile intensity, and gift positivity to others.",
  keywords: [
    "SmileChain", "smile", "social media", "smile points", "face detection",
    "positivity", "hackathon", "HackIndia", "AI", "face-api",
  ],
  authors: [{ name: "Team Claduesss" }],
  creator: "Team Claduesss",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    title: "SmileChain — Where Your Smile is the Currency",
    description:
      "Post a photo, let AI detect your smile intensity, earn Smile Points, and gift positivity to others.",
    siteName: "SmileChain",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "SmileChain logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmileChain — Where Your Smile is the Currency",
    description:
      "A social platform where your genuine smile earns points. Powered by face-api.js + Supabase.",
    images: ["/logo.png"],
    creator: "@smilechain",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
