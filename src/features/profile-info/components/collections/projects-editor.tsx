"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderGit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChipInput } from "@/components/shared/chip-input";
import type { MyProfileProject } from "@/lib/api/me-profile-client";
import { createProject, updateProject, removeProject } from "@/lib/api/me-collections-client";
import {
  projectSchema,
  type ProjectFormValues,
  emptyProject,
  projectFromItem,
  projectToPayload,
} from "../../lib/collections-schema";
import { SectionCard, ItemRow, Field, useCrudList } from "./crud-shell";

export function ProjectsEditor({ initial }: { initial: MyProfileProject[] }) {
  const { items, add, update, remove } = useCrudList<MyProfileProject>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MyProfileProject | null>(null);
  const form = useForm<ProjectFormValues>({ resolver: zodResolver(projectSchema), defaultValues: emptyProject });

  function openAdd() {
    setEditing(null);
    form.reset(emptyProject);
    setOpen(true);
  }
  function openEdit(p: MyProfileProject) {
    setEditing(p);
    form.reset(projectFromItem(p));
    setOpen(true);
  }

  async function onSubmit(v: ProjectFormValues) {
    const payload = projectToPayload(v);
    const ok = editing
      ? await update(editing.id, () => updateProject(editing.id, payload))
      : await add(() => createProject(payload));
    if (ok) setOpen(false);
  }

  return (
    <SectionCard
      icon={FolderGit2}
      title="Projects"
      description="Personal or academic projects worth showing recruiters."
      addLabel="Add project"
      empty="No projects yet — add a few so the recommender knows what you build."
      onAdd={openAdd}
      hasItems={items.length > 0}
    >
      {items.map((p) => (
        <ItemRow
          key={p.id}
          title={p.title}
          subtitle={p.technologies?.join(", ")}
          deleteName="project"
          onEdit={() => openEdit(p)}
          onDelete={() => remove(p.id, () => removeProject(p.id))}
        />
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "Add project"}</DialogTitle>
            <DialogDescription className="sr-only">
              Add the project details, technologies, and optional links.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Title" required error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} placeholder="EduMatch platform" />
            </Field>
            <Field label="Description" required error={form.formState.errors.description?.message}>
              <Textarea rows={3} {...form.register("description")} placeholder="What it does, your role, the stack…" />
            </Field>
            <Field label="Technologies" required error={form.formState.errors.technologies?.message}>
              <ChipInput
                value={form.watch("technologies")}
                onChange={(next) => form.setValue("technologies", next, { shouldValidate: true })}
                placeholder="React, Node.js… (Enter to add)"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GitHub URL" error={form.formState.errors.githubUrl?.message}>
                <Input {...form.register("githubUrl")} placeholder="https://github.com/…" />
              </Field>
              <Field label="Demo URL" error={form.formState.errors.demoUrl?.message}>
                <Input {...form.register("demoUrl")} placeholder="https://…" />
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
