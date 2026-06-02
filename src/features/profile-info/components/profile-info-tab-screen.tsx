"use client";

import { Loader2, FileText, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfileInfoController } from "../hooks/use-profile-info-controller";
import { ProfileCompletionCard } from "./profile-completion-card";
import { ProfileInfoForm } from "./profile-info-form";

export function ProfileInfoTabScreen() {
  const {
    completion,
    form,
    isSubmitting,
    isUploadingCv,
    loading,
    cvAnalysis,
    cvInputRef,
    onSubmit,
    onUploadCv,
  } =
    useProfileInfoController();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileCompletionCard completion={completion} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Upload CV
          </CardTitle>
          <CardDescription>
            Upload a PDF or image. The profile, skills, education, experience and preferences will be refreshed automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={cvInputRef}
            type="file"
            accept="application/pdf,image/*,.pdf,.png,.jpg,.jpeg,.webp,.bmp"
            className="hidden"
            onChange={(event) => {
              void onUploadCv(event.target.files?.[0] ?? null);
            }}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={isUploadingCv}
              onClick={() => cvInputRef.current?.click()}
            >
              {isUploadingCv ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploadingCv ? "Extracting CV..." : "Upload CV"}
            </Button>
            <p className="text-sm text-muted-foreground">
              PDF, PNG, JPG or WebP. Missing data stays empty; nothing is invented.
            </p>
          </div>

          {cvAnalysis ? (
            <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Detected name</div>
                <div className="font-medium text-foreground">{cvAnalysis.fullName || "Unknown"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Email</div>
                <div className="font-medium text-foreground">{cvAnalysis.email || "Unknown"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Phone</div>
                <div className="font-medium text-foreground">{cvAnalysis.phone || "Unknown"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Main domain</div>
                <div className="font-medium text-foreground">{cvAnalysis.mainDomain || "Unknown"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Experience level</div>
                <div className="font-medium text-foreground">{cvAnalysis.experienceLevel || "Unknown"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Location</div>
                <div className="font-medium text-foreground">{cvAnalysis.location || "Unknown"}</div>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(cvAnalysis.skills || []).slice(0, 10).map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {(cvAnalysis.skills || []).length === 0 ? (
                    <span className="text-muted-foreground">No skills extracted</span>
                  ) : null}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Languages</div>
                <div className="font-medium text-foreground">{(cvAnalysis.languages || []).join(', ') || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Certifications</div>
                <div className="font-medium text-foreground">{(cvAnalysis.certifications || []).join(', ') || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Preferred role</div>
                <div className="font-medium text-foreground">{cvAnalysis.targetRole || 'Unknown'}</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileInfoForm
            form={form}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
