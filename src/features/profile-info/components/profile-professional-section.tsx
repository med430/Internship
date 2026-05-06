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

interface ProfileProfessionalSectionProps {
  form: UseFormReturn<ProfileInfoFormValues>;
}

export function ProfileProfessionalSection({
  form,
}: ProfileProfessionalSectionProps) {
  return (
    <div className="space-y-6 pb-20">
      <h3 className="text-xl font-semibold">Professional Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="targeted_role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Target Role
              </FormLabel>
              <FormControl>
                <Input placeholder="Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Current Organization
              </FormLabel>
              <FormControl>
                <Input placeholder="Talentya" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
