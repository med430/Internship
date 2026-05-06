import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProfileFormValues } from "../lib/profile-schema";

interface ProfileCompletionStepFieldsProps {
  currentStep: number;
  form: UseFormReturn<ProfileFormValues>;
}

function BasicInfoFields({ form }: { form: UseFormReturn<ProfileFormValues> }) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name *</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormDescription>
              This is how you&apos;ll be identified on the platform
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="Tunis, Tunisia" {...field} />
            </FormControl>
            <FormDescription>Where are you based?</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="birthday"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Birthday</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormDescription>
              Optional: Helps us personalize your experience
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function ProfessionalFields({
  form,
}: {
  form: UseFormReturn<ProfileFormValues>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="targeted_role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Role</FormLabel>
            <FormControl>
              <Input placeholder="Senior Software Engineer" {...field} />
            </FormControl>
            <FormDescription>What position are you aiming for?</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="organization"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Organization</FormLabel>
            <FormControl>
              <Input placeholder="Talentya" {...field} />
            </FormControl>
            <FormDescription>Where do you currently work?</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function SkillsExperienceFields({
  form,
}: {
  form: UseFormReturn<ProfileFormValues>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="skills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Skills</FormLabel>
            <FormControl>
              <Textarea
                placeholder="React, TypeScript, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>Separate skills with commas</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="experiences"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience Highlights</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Won a hackathon, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>Key experiences (comma-separated)</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="education"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Education</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Eng. Degree - INSAT, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Your educational background (comma-separated)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="achievements"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Achievements</FormLabel>
            <FormControl>
              <Textarea
                placeholder="AWS Certified, etc..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Notable achievements (comma-separated)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function SocialLinksFields({
  form,
}: {
  form: UseFormReturn<ProfileFormValues>;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="linkedin_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>LinkedIn URL</FormLabel>
            <FormControl>
              <Input
                placeholder="https://linkedin.com/in/yourprofile"
                {...field}
              />
            </FormControl>
            <FormDescription>Your LinkedIn profile</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="github_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GitHub URL</FormLabel>
            <FormControl>
              <Input placeholder="https://github.com/yourusername" {...field} />
            </FormControl>
            <FormDescription>Your GitHub profile</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="twitter_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Twitter/X URL</FormLabel>
            <FormControl>
              <Input
                placeholder="https://twitter.com/yourusername"
                {...field}
              />
            </FormControl>
            <FormDescription>Your Twitter/X profile</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function ProfileCompletionStepFields({
  currentStep,
  form,
}: ProfileCompletionStepFieldsProps) {
  if (currentStep === 1) {
    return <BasicInfoFields form={form} />;
  }

  if (currentStep === 2) {
    return <ProfessionalFields form={form} />;
  }

  if (currentStep === 3) {
    return <SkillsExperienceFields form={form} />;
  }

  return <SocialLinksFields form={form} />;
}
