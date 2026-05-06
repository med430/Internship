"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateEmail, updatePassword } from "@/lib/profile/actions";
import {
  emailSchema,
  EmailFormValues,
  passwordSchema,
  PasswordFormValues,
} from "../lib/security-schemas";

export function useSecurityTabController() {
  const router = useRouter();
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsUpdatingEmail(true);

    try {
      const result = await updateEmail(data.newEmail, data.password);

      if (result.success) {
        toast.success(result.message || "Email update initiated", {
          description: "Redirecting to login...",
        });
        router.push("/login");
        return;
      }

      toast.error(result.error || "Failed to update email");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsUpdatingPassword(true);

    try {
      const result = await updatePassword(
        data.currentPassword,
        data.newPassword,
      );

      if (result.success) {
        toast.success(result.message || "Password updated successfully", {
          description: "You've been signed out for security",
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
        return;
      }

      toast.error(result.error || "Failed to update password");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return {
    emailForm,
    passwordForm,
    isUpdatingEmail,
    isUpdatingPassword,
    onEmailSubmit,
    onPasswordSubmit,
  };
}
