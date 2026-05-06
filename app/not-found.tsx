"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-background overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-accent/8 to-primary/10 animate-landing-gradient" />
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
        }}
      />

      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-blue-500/10 blur-3xl animate-drift-slow" />
      <div className="absolute bottom-20 right-10 w-52 h-52 rounded-full bg-gradient-to-br from-emerald-500/15 via-cyan-400/10 blur-2xl animate-float-slow" />

      <div className="container mx-auto max-w-7xl px-6 pt-28 md:pt-36 pb-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 text-center">
          <div className="relative">
            <h1 className="text-[10rem] md:text-[14rem] font-heading font-extrabold leading-none tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent select-none">
              404
            </h1>
          </div>

          <div className="flex flex-col items-center gap-3 max-w-lg">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Page Not Found
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Button
              asChild
              size="lg"
              className="shadow-lg shadow-primary/25 gap-2"
            >
              <Link href="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 cursor-pointer"
              type="button"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
