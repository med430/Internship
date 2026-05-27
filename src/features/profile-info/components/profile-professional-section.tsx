"use client";

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

interface ProfileContactSectionProps {
  form: UseFormReturn<ProfileInfoFormValues>;
}

export function ProfileProfessionalSection({ form }: ProfileContactSectionProps) {
  return (
    <div className="space-y-6 pb-6">
      <h3 className="text-xl font-semibold">Contact & Account</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Username</FormLabel>
              <FormControl>
                <Input placeholder="john_doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Phone</FormLabel>
              <FormControl>
                <Input placeholder="+216 XX XXX XXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
