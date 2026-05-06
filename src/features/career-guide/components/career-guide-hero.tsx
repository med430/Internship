export function CareerGuideHero() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-primary/5 to-accent/8 opacity-70" />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "100px 100px",
        }}
      />

      <div className="relative px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
              <svg
                className="h-3 w-3 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-[11px] font-medium text-accent">
                Job Market Intelligence
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Navigate Your{" "}
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                Career Journey
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Get a personalized roadmap built from your CV and enriched with
              real job market data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-0.5">
                Career Readiness
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Quantified assessment for target roles
              </p>
            </div>

            <div className="p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <svg
                  className="h-4 w-4 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-0.5">
                Skills Gap Analysis
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Identify needed skills and projects
              </p>
            </div>

            <div className="p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-0.5">
                Personalized Roadmap
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Step-by-step career progression plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
