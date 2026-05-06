import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordFormValues } from "../lib/security-schemas";

interface PasswordSecurityCardProps {
  isOAuthUser: boolean;
  isUpdatingPassword: boolean;
  passwordForm: UseFormReturn<PasswordFormValues>;
  onPasswordSubmit: (data: PasswordFormValues) => Promise<void>;
}

export function PasswordSecurityCard({
  isOAuthUser,
  isUpdatingPassword,
  passwordForm,
  onPasswordSubmit,
}: PasswordSecurityCardProps) {
  return (
    <Card className={isOAuthUser ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          {isOAuthUser
            ? "Password is managed by your OAuth provider (Google, LinkedIn, etc.)"
            : "Update your password. You'll be signed out from all devices for security."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isOAuthUser ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Your account uses OAuth authentication. Password management is
              handled by your provider.
            </p>
          </div>
        ) : (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters with letters and numbers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
