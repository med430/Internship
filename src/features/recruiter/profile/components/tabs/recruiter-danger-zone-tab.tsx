"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteMyAccount } from "@/lib/api/recruiter-profile-api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const deleteSchema = z.object({
  confirmText: z.string().refine((val) => val === "DELETE MY ACCOUNT", {
    message: "Please type 'DELETE MY ACCOUNT' exactly to confirm",
  }),
});

type DeleteFormInput = z.input<typeof deleteSchema>;

export function RecruiterDangerZoneTab() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const form = useForm<DeleteFormInput>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { confirmText: "" },
  });

  const onSubmit = async () => {
    setIsDeleting(true);
    try {
      await deleteMyAccount();
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.warning("Account deactivated", {
        description: "Your account has been deactivated.",
      });
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate account");
      setIsDeleting(false);
      setShowDialog(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </div>
        <CardDescription>Irreversible actions that affect your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 rounded-lg border-2 border-destructive/50 bg-destructive/5 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Deactivate Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your account will be deactivated. All your offers and applications data will be soft-deleted.
              Contact support if you need to recover your account.
            </p>
          </div>

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="lg">Deactivate Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>This action will deactivate your recruiter account and all associated offers.</p>
                  <p className="font-semibold text-destructive">
                    This action cannot be easily undone. Contact support to recover your account.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="confirmText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type &quot;DELETE MY ACCOUNT&quot; to confirm</FormLabel>
                        <FormControl>
                          <Input placeholder="DELETE MY ACCOUNT" {...field} className="font-mono" />
                        </FormControl>
                        <FormDescription>This confirmation is required to proceed</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button type="submit" variant="destructive" disabled={isDeleting}>
                      {isDeleting ? "Deactivating..." : "Deactivate Account"}
                    </Button>
                  </AlertDialogFooter>
                </form>
              </Form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}