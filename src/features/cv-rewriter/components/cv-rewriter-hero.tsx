import { FileText, Sparkles } from "lucide-react";

export function CVRewriterHero() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 opacity-60" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative px-4 py-6 md:px-8 md:py-8">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-medium text-primary">
                AI-Powered Enhancement
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Your CV,
              <span className="inline-block w-3" />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
              AI analyzes job descriptions, asks the right questions, and
              transforms your CV into a compelling narrative that stands out.
            </p>

            <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs text-foreground/80">
                  Context-aware rewriting
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-xs text-foreground/80">
                  ATS-optimized
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs text-foreground/80">
                  Multi-job targeting
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative h-32">
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-2xl" />

              <div className="absolute top-2 right-4 p-2.5 rounded-lg bg-card/80 backdrop-blur-xl border border-border shadow-lg shadow-primary/5 rotate-6 hover:rotate-3 transition-transform">
                <FileText className="h-5 w-5 text-primary mb-1" />
                <div className="text-[10px] text-muted-foreground">
                  Original CV
                </div>
              </div>
              <div className="absolute bottom-2 left-4 p-2.5 rounded-lg bg-card/80 backdrop-blur-xl border border-primary/40 shadow-lg shadow-primary/10 -rotate-6 hover:-rotate-3 transition-transform">
                <Sparkles className="h-5 w-5 text-accent mb-1" />
                <div className="text-[10px] font-medium text-foreground">
                  Enhanced CV
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
