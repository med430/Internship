import { Briefcase } from "lucide-react";

export function PortfolioGeneratorCard() {
  return (
    <div className="group relative p-6 rounded-3xl bg-gradient-to-br from-blue-500/15 to-blue-500/8 border-2 border-blue-500/20 hover:border-blue-500 transition-all duration-700 hover:shadow-[0_0_40px_-12px] hover:shadow-blue-500 cursor-pointer overflow-hidden">
      <Briefcase className="h-14 w-14 text-blue-500 mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700" />
      <h3 className="text-2xl font-bold mb-3 font-heading group-hover:text-blue-500 transition-colors">
        Portfolio Generator
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Auto-generate stunning, responsive portfolio sites from your CV in
        seconds.
      </p>
      <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-500">
        One-Click Deploy
      </div>
    </div>
  );
}
