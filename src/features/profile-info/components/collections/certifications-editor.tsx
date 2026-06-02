"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/shared/date-picker-field";
import type { MyProfileCertification } from "@/lib/api/me-profile-client";
import { createCertification, updateCertification, removeCertification } from "@/lib/api/me-collections-client";
import {
  certificationSchema,
  type CertificationFormValues,
  emptyCertification,
  certificationFromItem,
  certificationToPayload,
} from "../../lib/collections-schema";
import { SectionCard, ItemRow, Field, useCrudList, formatDate } from "./crud-shell";

export function CertificationsEditor({ initial }: { initial: MyProfileCertification[] }) {
  const { items, add, update, remove } = useCrudList<MyProfileCertification>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MyProfileCertification | null>(null);
  const form = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: emptyCertification,
  });

  function openAdd() {
    setEditing(null);
    form.reset(emptyCertification);
    setOpen(true);
  }
  function openEdit(c: MyProfileCertification) {
    setEditing(c);
    form.reset(certificationFromItem(c));
    setOpen(true);
  }

  async function onSubmit(v: CertificationFormValues) {
    const payload = certificationToPayload(v);
    const ok = editing
      ? await update(editing.id, () => updateCertification(editing.id, payload))
      : await add(() => createCertification(payload));
    if (ok) setOpen(false);
  }

  return (
    <SectionCard
      icon={Award}
      title="Certifications"
      description="Credentials and courses you've completed."
      addLabel="Add certification"
      empty="No certifications yet."
      onAdd={openAdd}
      hasItems={items.length > 0}
    >
      {items.map((c) => (
        <ItemRow
          key={c.id}
          title={c.name}
          subtitle={c.organization}
          meta={formatDate(c.issueDate)}
          deleteName="certification"
          onEdit={() => openEdit(c)}
          onDelete={() => remove(c.id, () => removeCertification(c.id))}
        />
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit certification" : "Add certification"}</DialogTitle>
            <DialogDescription className="sr-only">
              Add the certification details, issue date, and optional credential information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Name" required error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="AWS Certified Cloud Practitioner" />
            </Field>
            <Field label="Issuing organization" required error={form.formState.errors.organization?.message}>
              <Input {...form.register("organization")} placeholder="Amazon Web Services" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Issue date" required error={form.formState.errors.issueDate?.message}>
                <DatePickerField
                  value={form.watch("issueDate") || null}
                  onChange={(iso) => form.setValue("issueDate", iso ?? "", { shouldValidate: true })}
                />
              </Field>
              <Field label="Expiration date" error={form.formState.errors.expirationDate?.message}>
                <DatePickerField
                  value={form.watch("expirationDate") || null}
                  onChange={(iso) => form.setValue("expirationDate", iso ?? "")}
                  placeholder="No expiry"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Credential ID" error={form.formState.errors.credentialId?.message}>
                <Input {...form.register("credentialId")} placeholder="ABC-123" />
              </Field>
              <Field label="Credential URL" error={form.formState.errors.credentialUrl?.message}>
                <Input {...form.register("credentialUrl")} placeholder="https://…" />
              </Field>
            </div>
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
