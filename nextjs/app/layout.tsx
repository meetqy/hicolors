import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { ApolloWrapper } from "@/components/apollo-wrapper";
import { Footer } from "@/components/footer";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Discover Anime Color Palettes & Create Your Own - HiColors",
  description: "Extract the iconic colors from your favorite anime and game scenes. Upload any image to instantly generate a beautiful, shareable color palette with HiColors.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://hicolors.org"),
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <NextTopLoader color="#000" />
        <ApolloWrapper>
          <Header />
          {children}
          <Footer />
          <Toaster richColors />
        </ApolloWrapper>
      </body>
      <GoogleAnalytics gaId="G-CZV2BT21C2" />
    </html>
  );
}
