import { Sparkles } from "lucide-react";

export function PortfolioBuilderHero() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-pink-500/6 to-blue-500/8 opacity-60" />
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="relative px-4 py-6 md:px-8 md:py-8">
        <div className="grid md:grid-cols-5 gap-6 items-center">
          <div className="md:col-span-3 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                AI-Generated Design
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Build Your{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Digital Presence
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xl">
              Transform your profile into a stunning portfolio website. Choose
              from multiple layouts and themes.
            </p>
          </div>

          <div className="md:col-span-2 relative hidden md:block">
            <div className="relative h-32">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/15 to-purple-500/15 rounded-full blur-2xl" />

              <div className="absolute top-2 right-2 w-32 h-20 rounded-md bg-card/90 backdrop-blur-xl border border-border shadow-lg rotate-6 hover:rotate-3 transition-transform overflow-hidden">
                <div className="p-2 bg-gradient-to-br from-purple-500/10 to-transparent h-full">
                  <div className="space-y-1">
                    <div className="h-1.5 w-12 bg-foreground/20 rounded" />
                    <div className="h-1 w-16 bg-foreground/10 rounded" />
                    <div className="h-1 w-14 bg-foreground/10 rounded" />
                  </div>
                </div>
              </div>

              <div className="absolute top-6 left-2 w-32 h-20 rounded-md bg-card/90 backdrop-blur-xl border border-primary/40 shadow-lg shadow-primary/10 -rotate-6 hover:-rotate-3 transition-transform overflow-hidden">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-transparent h-full">
                  <div className="space-y-1">
                    <div className="w-5 h-5 rounded-full bg-primary/20" />
                    <div className="h-1.5 w-14 bg-foreground/20 rounded" />
                    <div className="h-1 w-full bg-foreground/10 rounded" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-2 right-6 w-32 h-20 rounded-md bg-card/90 backdrop-blur-xl border border-border shadow-lg rotate-3 hover:rotate-0 transition-transform overflow-hidden">
                <div className="p-2 bg-gradient-to-br from-pink-500/10 to-transparent h-full">
                  <div className="grid grid-cols-3 gap-0.5">
                    <div className="aspect-square bg-foreground/10 rounded-sm" />
                    <div className="aspect-square bg-foreground/10 rounded-sm" />
                    <div className="aspect-square bg-foreground/10 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
