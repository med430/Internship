"use client";

import { useState } from "react";
import { Database, Upload } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/cv-rewriter/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoverLetterDatabaseModal } from "./cover-letter-database-modal";
import { SelectedDatabaseCoverLetter } from "./selected-database-cover-letter";
import type { CoverLetter } from "@/lib/api/cover-letters";

export type CoverLetterSource =
  | { type: "file"; file: File }
  | { type: "database"; letter: CoverLetter };

interface CoverLetterSelectorProps {
  onSelect: (source: CoverLetterSource | null) => void;
  label?: string;
  description?: string;
}

export function CoverLetterSelector({
  onSelect,
  label = "Cover Letter",
  description = "Upload your cover letter or select from database",
}: CoverLetterSelectorProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "database">("upload");
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "upload" | "database");
    setSelectedLetter(null);
    onSelect(null);
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      onSelect({ type: "file", file });
      return;
    }
    onSelect(null);
  };

  const handleDatabaseSelect = (letter: CoverLetter) => {
    setSelectedLetter(letter);
    onSelect({ type: "database", letter });
    toast.success("Cover letter selected from database");
  };

  const handleRemove = () => {
    setSelectedLetter(null);
    onSelect(null);
  };

  return (
    <div className="w-full">
      <label className="text-base font-semibold text-foreground block mb-4">{label}</label>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 backdrop-blur">
          <TabsTrigger
            value="upload"
            className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 rounded-md"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload File
          </TabsTrigger>
          <TabsTrigger
            value="database"
            className="text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 rounded-md"
          >
            <Database className="mr-1.5 h-3.5 w-3.5" />
            From Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <FileUpload onFileSelect={handleFileSelect} label="" description={description} />
        </TabsContent>

        <TabsContent value="database" className="mt-3">
          {!selectedLetter ? (
            <div className="w-full">
              <div
                className="relative rounded-xl border-2 border-dashed border-border bg-card/60 hover:border-primary/50 hover:bg-card/80 backdrop-blur-md transition-all duration-200 cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className="mb-3 rounded-full bg-primary/10 p-3">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-foreground">
                    <span className="text-primary">Click to select</span> from your saved cover letters
                  </p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            </div>
          ) : (
            <SelectedDatabaseCoverLetter letter={selectedLetter} onRemove={handleRemove} />
          )}
        </TabsContent>
      </Tabs>

      <CoverLetterDatabaseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleDatabaseSelect}
      />
    </div>
  );
}
