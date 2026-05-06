import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/cv-rewriter/file-upload";
import {
  JobDescriptionInputs,
  type JobDescriptionInput,
} from "@/components/cv-rewriter/job-description-inputs";

interface CVRewriterUploadStepProps {
  cvFile: File | null;
  isGeneratingQueries: boolean;
  onCVFileChange: (file: File | null) => void;
  onJobDescriptionsChange: (jobs: JobDescriptionInput[]) => void;
  onGenerateQueries: () => Promise<void>;
}

export function CVRewriterUploadStep({
  cvFile,
  isGeneratingQueries,
  onCVFileChange,
  onJobDescriptionsChange,
  onGenerateQueries,
}: CVRewriterUploadStepProps) {
  return (
    <Card className="p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg shadow-primary/5">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1.5 text-foreground">
            Upload Your Documents
          </h2>
          <p className="text-muted-foreground text-sm font-light">
            Upload your current CV and the job descriptions you are targeting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <FileUpload
              onFileSelect={onCVFileChange}
              label="Your CV"
              description="Upload your current CV (PDF, DOCX, TXT, or MD, max 10MB)"
            />
          </div>

          <div>
            <JobDescriptionInputs
              onJobDescriptionsChange={onJobDescriptionsChange}
              maxJobs={5}
            />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={onGenerateQueries}
            disabled={isGeneratingQueries || !cvFile}
            size="lg"
            className="px-6 py-2.5 text-sm font-medium rounded-lg shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingQueries ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Generating Questions...
              </>
            ) : (
              <>Enhance</>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
