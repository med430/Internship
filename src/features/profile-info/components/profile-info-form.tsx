import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProfileInfoFormValues } from "../lib/profile-info-schema";
import { ProfileBasicSection } from "./profile-basic-section";
import { ProfileProfessionalSection } from "./profile-professional-section";
import { ProfileSkillsSection } from "./profile-skills-section";
import { ProfileSocialSection } from "./profile-social-section";

interface ProfileInfoFormProps {
  form: UseFormReturn<ProfileInfoFormValues>;
  isSubmitting: boolean;
  onSubmit: (data: ProfileInfoFormValues) => Promise<void>;
}

export function ProfileInfoForm({
  form,
  isSubmitting,
  onSubmit,
}: ProfileInfoFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ProfileBasicSection form={form} />
        <ProfileProfessionalSection form={form} />
        <ProfileSkillsSection form={form} />
        <ProfileSocialSection form={form} />

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
