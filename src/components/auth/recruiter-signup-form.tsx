"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { signUpRecruiter } from "@/lib/auth/recruiter-actions";

export function RecruiterSignupForm({ className, ...props }: React.ComponentProps<"div">) {
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
      // @ts-ignore
      const result = await signUpRecruiter(formData);
      if (!result || !result.success) {
        setToast({ message: result?.error || "Signup failed", type: "error" });
      }
      // on success server action will redirect
    } catch (err: any) {
      setToast({ message: err?.message || "Signup failed", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-lg mx-auto", className)} {...props}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>Full name</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <Input id="name" name="name" placeholder="First" required />
                <Input id="lastname" name="lastname" placeholder="Last" />
              </div>
            </Field>

            <Field>
              <FieldLabel>Account</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <Input id="email" name="email" type="email" placeholder="you@company.com" required />
                <Input id="username" name="username" placeholder="username" required />
              </div>
            </Field>

            <Field>
              <FieldLabel>Company</FieldLabel>
              <Input id="company" name="company" placeholder="Company name" />
            </Field>

            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input id="password" name="password" type="password" placeholder="••••••" required />
            </Field>

            <div className="flex items-center justify-between">
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create account'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
