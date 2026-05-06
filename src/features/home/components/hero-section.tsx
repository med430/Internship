import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-[120px] animate-floatY" />
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-accent/30 rounded-full blur-[120px] animate-[floatY_8s_ease-in-out_infinite]"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-[floatY_10s_ease-in-out_infinite]"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-8 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 backdrop-blur-sm animate-pulse">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-label">
              AI-Powered Career Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-8xl font-extrabold font-heading leading-tight tracking-tight">
            <span className="inline-block animate-[floatY_3s_ease-in-out_infinite]">
              Land
            </span>{" "}
            <span
              className="inline-block animate-[floatY_3s_ease-in-out_infinite]"
              style={{ animationDelay: "0.1s" }}
            >
              your
            </span>{" "}
            <span
              className="inline-block animate-[floatY_3s_ease-in-out_infinite]"
              style={{ animationDelay: "0.2s" }}
            >
              dream
            </span>{" "}
            <span
              className="inline-block animate-[floatY_3s_ease-in-out_infinite]"
              style={{ animationDelay: "0.3s" }}
            >
              job
            </span>{" "}
            <br />
            <span
              className="relative inline-block animate-[floatY_3s_ease-in-out_infinite]"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent animate-landingGradient bg-[length:200%_auto]">
                10x faster
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-purple-500/20 blur-2xl -z-10" />
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            OnBoard combines AI-powered CV optimization, intelligent job
            matching, personalized career guidance, and interview preparation
            into one seamless platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden group shadow-2xl shadow-primary/30 font-cta"
            >
              <Link href="/signup">
                <span className="relative z-10">Get Started Free</span>
                <ArrowRight className="ml-2 h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-landingGradient bg-[length:200%_auto]" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="backdrop-blur-sm border-2 font-cta hover:scale-105 transition-transform"
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                No credit card required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                14-day free trial
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
