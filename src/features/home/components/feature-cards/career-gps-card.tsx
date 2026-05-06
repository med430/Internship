import { Brain } from "lucide-react";

const ITEMS = ["Skill Gap Analysis", "Network Building", "Interview Prep"];

export function CareerGpsCard() {
  return (
    <div className="group relative p-6 rounded-3xl bg-gradient-to-br from-purple-500/15 to-purple-500/8 border-2 border-purple-500/20 hover:border-purple-500 transition-all duration-700 hover:shadow-[0_0_40px_-12px] hover:shadow-purple-500 cursor-pointer overflow-hidden">
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
      <Brain className="h-14 w-14 text-purple-500 mb-4 group-hover:scale-110 transition-transform duration-700" />
      <h3 className="text-2xl font-bold mb-3 font-heading group-hover:text-purple-500 transition-colors">
        Career GPS
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Not just advice-a complete roadmap. From where you are to where you want
        to be, step by step.
      </p>
      <div className="space-y-2">
        {ITEMS.map((item, i) => (
          <div
            key={item}
            className="flex items-center gap-3 p-2 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-xs font-bold text-purple-500">
              {i + 1}
            </div>
            <span className="text-xs font-medium">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
