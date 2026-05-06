import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="group relative rounded-3xl p-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-purple-500 group-hover:animate-pulse" />

          <div className="relative rounded-[1.4rem] bg-background p-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-purple-500/20 animate-gradient-xy" />

            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "140px 140px",
              }}
            />

            <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000 delay-200" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-[2] transition-transform duration-1000 delay-100" />

            {Array.from({ length: 12 }, (_, i) => {
              const top = (i * 19) % 100;
              const left = (i * 31) % 100;
              const animationDelay = `${((i % 5) * 0.4).toFixed(1)}s`;
              const animationDuration = `${(2 + (i % 4) * 0.5).toFixed(1)}s`;

              return (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/40 rounded-full group-hover:animate-ping"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    animationDelay,
                    animationDuration,
                  }}
                />
              );
            })}

            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-black font-heading leading-tight">
                <span className="block bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500 inline-block">
                  Stop Scrolling.
                </span>
                <br />
                <span className="block bg-gradient-to-r from-purple-500 via-accent to-primary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500 delay-100 inline-block">
                  Start Landing.
                </span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Transform your job search with AI-powered tools designed to get
                you hired faster.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  asChild
                  size="lg"
                  className="font-cta shadow-2xl hover:shadow-primary/50 transition-all duration-500 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Get Started Free
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="font-cta border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-500"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
