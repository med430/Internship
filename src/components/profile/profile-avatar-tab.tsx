"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  avatar_url?: string | null;
};

interface ProfileAvatarTabProps {
  profile: Profile;
}

async function syncPublicProfileAvatar(avatarUrl: string) {
  try {
    await fetchWithAuth(`${getClientApiBaseUrl()}/onboard/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar_url: avatarUrl }),
    });
  } catch {
    // The canonical avatar is already saved by /me/avatar; this only keeps legacy profile consumers in sync.
  }
}

export function ProfileAvatarTab({ profile }: ProfileAvatarTabProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.avatar_url || null,
  );
  const [, startTransition] = useTransition();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    void handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetchWithAuth(`${getClientApiBaseUrl()}/me/avatar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Upload failed");
      }

      const { avatarUrl } = (await res.json()) as { avatarUrl: string };
      await syncPublicProfileAvatar(avatarUrl);
      setPreviewUrl(avatarUrl);
      toast.success("Avatar uploaded successfully!");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
      setPreviewUrl(profile.avatar_url || null);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    if (!profile.name) return "U";
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a profile picture (max 5MB, JPEG/PNG/WebP/GIF) — stored on Cloudinary
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-32 h-32 border-4 border-primary/20">
            <AvatarImage
              src={previewUrl || undefined}
              alt={profile.name || "User"}
            />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <p className="text-sm text-muted-foreground">
              A profile picture helps personalize your account and makes it
              easier for others to recognize you.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Avatar
                  </>
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
