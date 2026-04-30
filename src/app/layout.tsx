import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Studio",
  description: "Voice interview practice with recruiter modes and scoring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
