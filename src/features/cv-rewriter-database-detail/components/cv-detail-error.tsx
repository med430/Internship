import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CvDetailErrorProps {
  error: string;
  onBack: () => void;
}

export function CvDetailError({ error, onBack }: CvDetailErrorProps) {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to history
        </Button>
      </div>
    </div>
  );
}
