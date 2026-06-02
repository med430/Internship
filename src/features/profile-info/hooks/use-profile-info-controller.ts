"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  getMyProfile,
  patchMyProfile,
  uploadMyProfileCv,
  type CvUploadAnalysis,
  type MyProfile,
} from "@/lib/api/me-profile-client";
import {
  buildDefaultValues,
  mapFormToProfilePayload,
  profileInfoSchema,
  ProfileInfoFormValues,
} from "../lib/profile-info-schema";

export function useProfileInfoController() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState<CvUploadAnalysis | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);
  const [, startTransition] = useTransition();

  const form = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      lastname: "",
      username: "",
      phone: "",
      bio: "",
      birthDate: "",
      gender: "",
      address: "",
      city: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (cancelled || !p) return;
        setProfile(p);
        form.reset(buildDefaultValues(p));
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [form]);

  const completion = profile ? computeCompletion(profile) : 0;

  const onSubmit = async (data: ProfileInfoFormValues) => {
    setIsSubmitting(true);
    try {
      const saved = await patchMyProfile(mapFormToProfilePayload(data));
      setProfile(saved);
      toast.success("Profile updated successfully!");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUploadCv = async (file: File | null) => {
    if (!file) return;

    setIsUploadingCv(true);
    try {
      const result = await uploadMyProfileCv(file);
      setProfile(result.profile);
      setCvAnalysis(result.analysis);
      form.reset(buildDefaultValues(result.profile));
      toast.success("CV uploaded and profile updated.");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setIsUploadingCv(false);
      if (cvInputRef.current) {
        cvInputRef.current.value = "";
      }
    }
  };

  return {
    form,
    onSubmit,
    completion,
    isSubmitting,
    loading,
    isUploadingCv,
    cvAnalysis,
    cvInputRef,
    onUploadCv,
  };
}

function computeCompletion(profile: MyProfile): number {
  const fields: (keyof MyProfile)[] = [
    "name", "lastname", "email", "bio", "birthDate", "gender", "address", "city", "username", "phone",
  ];
  const filled = fields.filter((f) => {
    const v = profile[f];
    return v !== null && v !== undefined && v !== "";
  }).length;
  return Math.round((filled / fields.length) * 100);
}
