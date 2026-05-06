import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewNav } from "@/components/virtual-interviewer/interview-nav";

interface InterviewDetailErrorProps {
  error: string;
  onBack: () => void;
}

export function InterviewDetailError({
  error,
  onBack,
}: InterviewDetailErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-5xl">
        <InterviewNav />
        <div className="rounded-lg border border-red-200/40 bg-red-50/50 backdrop-blur p-8 text-center dark:border-red-800/40 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to history
          </Button>
        </div>
      </div>
    </div>
  );
}
