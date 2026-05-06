import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
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

      <div className="container mx-auto max-w-7xl px-6 pt-28 md:pt-36 pb-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">

          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/10" />
            </div>
          </div>


          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-heading font-semibold text-foreground">
              Loading
            </h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare your content
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-4 mt-8">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-4 justify-center mt-6">
              <Skeleton className="h-10 w-28 rounded-md" />
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
