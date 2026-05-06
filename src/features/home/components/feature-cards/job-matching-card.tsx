import { Target } from "lucide-react";

export function JobMatchingCard() {
  return (
    <div className="group relative p-6 rounded-3xl bg-gradient-to-br from-accent/15 to-accent/8 border-2 border-accent/20 hover:border-accent transition-all duration-700 hover:shadow-[0_0_40px_-12px] hover:shadow-accent cursor-pointer overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <Target className="h-14 w-14 text-accent mb-4 group-hover:scale-110 group-hover:rotate-[360deg] transition-all duration-700" />
      <h3 className="text-2xl font-bold mb-3 font-heading group-hover:text-accent transition-colors">
        Intelligent Job Matching
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Stop scrolling through irrelevant listings. Our semantic AI surfaces the
        best opportunities.
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#14A800">
            <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.387 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
          </svg>
          <span className="text-accent text-xl font-bold">+</span>
        </div>
        <span className="text-xs font-semibold text-accent">Multi-source</span>
      </div>
    </div>
  );
}
