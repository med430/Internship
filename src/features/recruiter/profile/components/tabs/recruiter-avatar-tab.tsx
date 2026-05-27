"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { uploadRecruiterAvatar } from "@/lib/api/recruiter-profile-server-actions";
import type { RecruiterProfileData } from "@/lib/api/recruiter-profile-api";

interface Props {
  profile: RecruiterProfileData;
}

export function RecruiterAvatarTab({ profile }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.user.avatarUrl ?? null);
  const [, startTransition] = useTransition();

  const initials = [profile.user.name, profile.user.lastname]
    .filter(Boolean)
    .map(s => s![0])
    .join("")
    .toUpperCase() || "R";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);

    void handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadRecruiterAvatar(formData);

      if (result.success) {
        setPreviewUrl(result.url);
        toast.success("Avatar uploaded successfully!");
        startTransition(() => router.refresh());
      } else {
        toast.error(result.error || "Failed to upload avatar");
        setPreviewUrl(profile.user.avatarUrl ?? null);
      }
    } catch {
      toast.error("An unexpected error occurred");
      setPreviewUrl(profile.user.avatarUrl ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture (max 5MB, JPEG/PNG/WebP/GIF)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary/20">
            <AvatarImage src={previewUrl ?? undefined} alt={profile.user.name || "Recruiter"} />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <p className="text-sm text-muted-foreground">
              A profile picture helps personalize your account and builds trust with students.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Upload Avatar</>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
