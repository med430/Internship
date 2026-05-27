import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "./provider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const neueMontreal = localFont({
  src: [
    {
      path: "../public/fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "Stagio - AI-Powered Career Platform | Land Your Dream Job 10x Faster",
  description:
    "Transform your job search with Stagio's AI-powered CV optimization, intelligent job matching, personalized career guidance, virtual interviews, and portfolio builder. Start free today.",
  keywords: [
    "job search",
    "CV optimization",
    "resume builder",
    "career guidance",
    "job matching",
    "AI career platform",
    "interview preparation",
    "portfolio builder",
  ],
  authors: [{ name: "Stagio" }],
  openGraph: {
    title: "Stagio - AI-Powered Career Platform",
    description:
      "Land your dream job 10x faster with AI-powered CV optimization, intelligent job matching, and personalized career guidance.",
    type: "website",
    locale: "en_US",
    siteName: "Stagio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stagio - AI-Powered Career Platform",
    description:
      "Land your dream job 10x faster with AI-powered CV optimization and intelligent job matching.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${neueMontreal.variable} ${montserrat.variable} font-body antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
