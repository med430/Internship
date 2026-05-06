import { CheckCircle2, FileText } from "lucide-react";

export function CvOptimizerCard() {
  return (
    <div className="group relative p-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/8 to-accent/15 border-2 border-primary/20 hover:border-primary transition-all duration-700 hover:shadow-[0_0_50px_-12px] hover:shadow-primary cursor-pointer overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/10 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative">
        <div className="relative mb-4">
          <FileText className="h-14 w-14 text-primary group-hover:scale-125 group-hover:rotate-6 transition-all duration-700" />
          <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>

        <h3 className="text-2xl font-bold mb-3 font-heading group-hover:text-primary transition-colors">
          Smart CV Optimization
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Transform your resume with AI that understands ATS algorithms and
          recruiter psychology.
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 group/item hover:translate-x-1 transition-transform">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 group-hover/item:scale-110 transition-transform" />
            <span className="text-xs font-medium">Keyword optimization</span>
          </div>
          <div className="flex items-center gap-2 group/item hover:translate-x-1 transition-transform">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 group-hover/item:scale-110 transition-transform" />
            <span className="text-xs font-medium">LaTeX templates</span>
          </div>
          <div className="flex items-center gap-2 group/item hover:translate-x-1 transition-transform">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 group-hover/item:scale-110 transition-transform" />
            <span className="text-xs font-medium">ATS compatible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
