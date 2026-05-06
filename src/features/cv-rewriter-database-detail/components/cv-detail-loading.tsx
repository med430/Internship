import { Loader2 } from "lucide-react";

export function CvDetailLoading() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-neutral-400" />
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
            Loading CV...
          </p>
        </div>
      </div>
    </div>
  );
}
