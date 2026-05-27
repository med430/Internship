"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { signInRecruiter } from "@/lib/auth/recruiter-actions";

export function RecruiterLoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    const formData = new FormData(e.currentTarget);

    try {
      // call server action
      // @ts-ignore - server action invocation
      const result = await signInRecruiter(formData);
      if (!result || !result.success) {
        setToast({ message: result?.error || "Login failed", type: "error" });
      }
      // on success signInRecruiter redirects server-side
    } catch (err: any) {
      setToast({ message: err?.message || "Login failed", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8", className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="you@company.com" required />
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </Field>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</Button>
              <Link href="/recruiter/signup" className="text-sm text-muted-foreground">Create account</Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="hidden md:block relative rounded overflow-hidden">
        <Image src="/images/recruiter-cover.jpg" alt="Recruiter login" fill priority sizes="50vw" className="absolute inset-0 object-cover" />
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
