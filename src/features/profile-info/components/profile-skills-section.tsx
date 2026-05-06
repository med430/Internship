import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProfileInfoFormValues } from "../lib/profile-info-schema";

interface ProfileSkillsSectionProps {
  form: UseFormReturn<ProfileInfoFormValues>;
}

export function ProfileSkillsSection({ form }: ProfileSkillsSectionProps) {
  return (
    <div className="space-y-6 pb-20">
      <h3 className="text-xl font-semibold">Skills & Experience</h3>
      <FormField
        control={form.control}
        name="skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Skills</FormLabel>
            <FormDescription>Separate skills with commas</FormDescription>
            <FormControl>
              <Textarea
                placeholder="React, TypeScript, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="experiences"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              Experience Highlights
            </FormLabel>
            <FormDescription>Key experiences (comma-separated)</FormDescription>
            <FormControl>
              <Textarea
                placeholder="Won a hackathon, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="education"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Education</FormLabel>
            <FormDescription>
              Educational background (comma-separated)
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="Eng. Degree - INSAT, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="achievements"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">
              Achievements
            </FormLabel>
            <FormDescription>
              Notable achievements (comma-separated)
            </FormDescription>
            <FormControl>
              <Textarea
                placeholder="AWS Certified, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
