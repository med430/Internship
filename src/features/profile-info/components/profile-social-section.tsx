import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProfileInfoFormValues } from "../lib/profile-info-schema";

interface ProfileSocialSectionProps {
  form: UseFormReturn<ProfileInfoFormValues>;
}

export function ProfileSocialSection({ form }: ProfileSocialSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Social Links</h3>
      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="linkedin_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                LinkedIn URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="github_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                GitHub URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/yourusername"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="twitter_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Twitter/X URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://twitter.com/yourusername"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
