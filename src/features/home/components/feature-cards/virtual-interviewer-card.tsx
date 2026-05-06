import { Video } from "lucide-react";

export function VirtualInterviewerCard() {
  return (
    <div className="group relative p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/8 border-2 border-emerald-500/20 hover:border-emerald-500 transition-all duration-700 hover:shadow-[0_0_40px_-12px] hover:shadow-emerald-500 cursor-pointer overflow-hidden">
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <Video className="h-14 w-14 text-emerald-500 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700" />
      <h3 className="text-2xl font-bold mb-3 font-heading group-hover:text-emerald-500 transition-colors">
        Virtual Interviewer
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Practice makes perfect. AI-powered interviews that adapt to your answers
        and help you improve.
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="font-bold text-center text-emerald-500">Voice AI</div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="font-bold text-center text-emerald-500">Feedback</div>
        </div>
      </div>
    </div>
  );
}
