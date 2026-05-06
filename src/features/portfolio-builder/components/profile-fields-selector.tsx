import Link from "next/link";
import { AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ProfileFieldOption } from "../types";

interface ProfileFieldsSelectorProps {
  availableFields: ProfileFieldOption[];
  selectedFields: string[];
  onToggleField: (fieldKey: string) => void;
}

export function ProfileFieldsSelector({
  availableFields,
  selectedFields,
  onToggleField,
}: ProfileFieldsSelectorProps) {
  return (
    <Card className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50 shadow-sm p-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium text-neutral-900 dark:text-neutral-50">
            Profile Information
          </Label>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Select which information to include from your profile
          </p>
        </div>

        {availableFields.length === 0 ? (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Complete your profile for better results
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Add information to your profile so the AI can generate a more
                  personalized and accurate portfolio.
                </p>
                <Link href="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100"
                  >
                    Go to Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Adding more profile information helps the AI generate better
                results
              </p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => onToggleField(field.key)}
                  />
                  <Label
                    htmlFor={field.key}
                    className="text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
