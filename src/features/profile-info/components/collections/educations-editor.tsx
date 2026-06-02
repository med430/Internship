"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { MyProfileEducation } from "@/lib/api/me-profile-client";
import { createEducation, updateEducation, removeEducation } from "@/lib/api/me-collections-client";
import {
  educationSchema,
  type EducationFormValues,
  emptyEducation,
  educationFromItem,
  educationToPayload,
} from "../../lib/collections-schema";
import { SectionCard, ItemRow, Field, useCrudList, formatRange } from "./crud-shell";

export function EducationsEditor({ initial }: { initial: MyProfileEducation[] }) {
  const { items, add, update, remove } = useCrudList<MyProfileEducation>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MyProfileEducation | null>(null);
  const form = useForm<EducationFormValues>({ resolver: zodResolver(educationSchema), defaultValues: emptyEducation });

  function openAdd() {
    setEditing(null);
    form.reset(emptyEducation);
    setOpen(true);
  }
  function openEdit(e: MyProfileEducation) {
    setEditing(e);
    form.reset(educationFromItem(e));
    setOpen(true);
  }

  async function onSubmit(v: EducationFormValues) {
    const payload = educationToPayload(v);
    const ok = editing
      ? await update(editing.id, () => updateEducation(editing.id, payload))
      : await add(() => createEducation(payload));
    if (ok) setOpen(false);
  }

  return (
    <SectionCard
      icon={GraduationCap}
      title="Education"
      description="Degrees and programs — past and current."
      addLabel="Add education"
      empty="No education entries yet."
      onAdd={openAdd}
      hasItems={items.length > 0}
    >
      {items.map((e) => (
        <ItemRow
          key={e.id}
          title={`${e.degree}, ${e.field}`}
          subtitle={e.school}
          meta={formatRange(e.startDate, e.endDate)}
          deleteName="education entry"
          onEdit={() => openEdit(e)}
          onDelete={() => remove(e.id, () => removeEducation(e.id))}
        />
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit education" : "Add education"}</DialogTitle>
            <DialogDescription className="sr-only">
              Add the school, degree, field of study, dates, and optional description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field label="School" required error={form.formState.errors.school?.message}>
              <Input {...form.register("school")} placeholder="INSAT" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Degree" required error={form.formState.errors.degree?.message}>
                <Input {...form.register("degree")} placeholder="Engineering Diploma" />
              </Field>
              <Field label="Field of study" required error={form.formState.errors.field?.message}>
                <Input {...form.register("field")} placeholder="Software Engineering" />
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
              <Textarea rows={3} {...form.register("description")} placeholder="Focus areas, achievements, GPA…" />
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
