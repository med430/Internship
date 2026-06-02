"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { MyProfileExperience } from "@/lib/api/me-profile-client";
import { createExperience, updateExperience, removeExperience } from "@/lib/api/me-collections-client";
import {
  experienceSchema,
  type ExperienceFormValues,
  emptyExperience,
  experienceFromItem,
  experienceToPayload,
} from "../../lib/collections-schema";
import { SectionCard, ItemRow, Field, useCrudList, formatRange } from "./crud-shell";

export function ExperiencesEditor({ initial }: { initial: MyProfileExperience[] }) {
  const { items, add, update, remove } = useCrudList<MyProfileExperience>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MyProfileExperience | null>(null);
  const form = useForm<ExperienceFormValues>({ resolver: zodResolver(experienceSchema), defaultValues: emptyExperience });

  function openAdd() {
    setEditing(null);
    form.reset(emptyExperience);
    setOpen(true);
  }
  function openEdit(e: MyProfileExperience) {
    setEditing(e);
    form.reset(experienceFromItem(e));
    setOpen(true);
  }

  async function onSubmit(v: ExperienceFormValues) {
    const payload = experienceToPayload(v);
    const ok = editing
      ? await update(editing.id, () => updateExperience(editing.id, payload))
      : await add(() => createExperience(payload));
    if (ok) setOpen(false);
  }

  return (
    <SectionCard
      icon={Briefcase}
      title="Experience"
      description="Internships and jobs — even short ones count."
      addLabel="Add experience"
      empty="No experience yet."
      onAdd={openAdd}
      hasItems={items.length > 0}
    >
      {items.map((e) => (
        <ItemRow
          key={e.id}
          title={`${e.role} @ ${e.company}`}
          subtitle={e.description ?? undefined}
          meta={formatRange(e.startDate, e.endDate)}
          deleteName="experience"
          onEdit={() => openEdit(e)}
          onDelete={() => remove(e.id, () => removeExperience(e.id))}
        />
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit experience" : "Add experience"}</DialogTitle>
            <DialogDescription className="sr-only">
              Add the role, company, dates, and optional experience description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role" required error={form.formState.errors.role?.message}>
                <Input {...form.register("role")} placeholder="Software Engineering Intern" />
              </Field>
              <Field label="Company" required error={form.formState.errors.company?.message}>
                <Input {...form.register("company")} placeholder="Vermeg" />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date" required error={form.formState.errors.startDate?.message}>
                <DatePickerField
                  value={form.watch("startDate") || null}
                  onChange={(iso) => form.setValue("startDate", iso ?? "", { shouldValidate: true })}
                />
              </Field>
              <Field label="End date" error={form.formState.errors.endDate?.message}>
                <DatePickerField
                  value={form.watch("endDate") || null}
                  onChange={(iso) => form.setValue("endDate", iso ?? "")}
                  placeholder="Present"
                />
              </Field>
            </div>
            <Field label="Description" error={form.formState.errors.description?.message}>
              <Textarea rows={3} {...form.register("description")} placeholder="What you worked on, the stack, impact…" />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
