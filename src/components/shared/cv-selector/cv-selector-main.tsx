"use client";

import { useState } from "react";
import { Database, Upload } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/cv-rewriter/file-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CVDatabaseModal } from "./cv-database-modal";
import { SelectedDatabaseCV } from "./selected-database-cv";
import type { CV } from "@/lib/api/cvs";

export type CVSource =
  | { type: "file"; file: File }
  | { type: "database"; cv: CV };

interface CVSelectorProps {
  onCVSelect: (source: CVSource | null) => void;
  label?: string;
  description?: string;
}

export function CVSelector({
  onCVSelect,
  label = "Your CV",
  description = "Upload your CV or select from database",
}: CVSelectorProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "database">("upload");
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTabChange = (value: string) => {
    const newTab = value as "upload" | "database";
    setActiveTab(newTab);
    setSelectedCV(null);
    onCVSelect(null);
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      onCVSelect({ type: "file", file });
      return;
    }
    onCVSelect(null);
  };

  const handleDatabaseCVSelect = (cv: CV) => {
    setSelectedCV(cv);
    onCVSelect({ type: "database", cv });
    toast.success("CV selected from database");
  };

  const handleRemoveSelectedCV = () => {
    setSelectedCV(null);
    onCVSelect(null);
  };

  return (
    <div className="w-full">
      <label className="text-base font-semibold text-foreground block mb-4">
        {label}
      </label>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
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
          <FileUpload
            onFileSelect={handleFileSelect}
            label=""
            description={description}
          />
        </TabsContent>

        <TabsContent value="database" className="mt-3">
          {!selectedCV ? (
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
                    <span className="text-primary">Click to select</span> from
                    your saved CVs
                  </p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            </div>
          ) : (
            <SelectedDatabaseCV
              cv={selectedCV}
              onRemove={handleRemoveSelectedCV}
            />
          )}
        </TabsContent>
      </Tabs>

      <CVDatabaseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelect={handleDatabaseCVSelect}
      />
    </div>
  );
}
