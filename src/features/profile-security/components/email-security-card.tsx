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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EmailFormValues } from "../lib/security-schemas";

interface EmailSecurityCardProps {
  userEmail: string;
  isOAuthUser: boolean;
  isUpdatingEmail: boolean;
  emailForm: UseFormReturn<EmailFormValues>;
  onEmailSubmit: (data: EmailFormValues) => Promise<void>;
}

export function EmailSecurityCard({
  userEmail,
  isOAuthUser,
  isUpdatingEmail,
  emailForm,
  onEmailSubmit,
}: EmailSecurityCardProps) {
  return (
    <Card className={isOAuthUser ? "opacity-60" : ""}>
      <CardHeader>
        <CardTitle>Change Email</CardTitle>
        <CardDescription>
          {isOAuthUser
            ? "Email is managed by your OAuth provider (Google, LinkedIn, etc.)"
            : "Update your email address. You'll be signed out from all devices for security."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isOAuthUser ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">Current Email</p>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
            <p className="text-xs text-muted-foreground mt-2">
              To change your email, please update it in your OAuth
              provider&apos;s settings.
            </p>
          </div>
        ) : (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Current Email</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>

              <FormField
                control={emailForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="new@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You&apos;ll receive a verification email at your new
                      address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={emailForm.control}
                name="password"
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
                    <FormDescription>
                      Confirm your password to continue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isUpdatingEmail}>
                {isUpdatingEmail ? "Updating..." : "Update Email"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
