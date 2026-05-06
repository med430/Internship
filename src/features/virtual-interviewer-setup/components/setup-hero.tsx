import { Brain, Target, Trophy, Users } from "lucide-react";

export function SetupHero() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-blue-500/10 to-cyan-500/8 opacity-60" />
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="relative px-4 py-6 md:px-8 md:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Brain className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                AI-Powered Practice
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Master Your{" "}
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Interview Skills
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Practice with AI interviewer personas and get comprehensive
              feedback reports automatically saved to your profile.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-0.5">
                Dynamic Personas
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                5 unique interviewer personalities
              </p>
            </div>

            <div className="p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-0.5">
                Realistic Experience
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Adaptive real interview scenarios
              </p>
            </div>

            <div className="p-3 rounded-lg bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-2">
                <Trophy className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-0.5">
                Instant Feedback
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Detailed performance analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
