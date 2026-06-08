import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "SmileChain — Where Your Smile is the Currency",
  description:
    "A social platform powered by genuine smiles. Post a photo, earn Smile Points based on your smile intensity, and gift positivity to others.",
  openGraph: {
    title: "SmileChain",
    description: "Where your smile is the currency 😄",
    siteName: "SmileChain",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
