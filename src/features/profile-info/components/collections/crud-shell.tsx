"use client";

// Shared scaffolding for the CV collection editors: optimistic list state, a section card,
// a row with edit + delete-confirm, a labeled field, and a date formatter.

import { ReactNode, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Plus, Pencil, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function useCrudList<T extends { id: string }>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial);

  async function add(fn: () => Promise<T>): Promise<boolean> {
    try {
      const saved = await fn();
      setItems((prev) => [...prev, saved]);
      toast.success("Added");
      return true;
    } catch (e) {
      toast.error((e as Error).message || "Failed to add");
      return false;
    }
  }

  async function update(id: string, fn: () => Promise<T>): Promise<boolean> {
    try {
      const saved = await fn();
      setItems((prev) => prev.map((x) => (x.id === id ? saved : x)));
      toast.success("Saved");
      return true;
    } catch (e) {
      toast.error((e as Error).message || "Failed to save");
      return false;
    }
  }

  async function remove(id: string, fn: () => Promise<void>): Promise<void> {
    const before = items;
    setItems((prev) => prev.filter((x) => x.id !== id)); // optimistic
    try {
      await fn();
      toast.success("Removed");
    } catch (e) {
      toast.error((e as Error).message || "Failed to remove");
      setItems(before);
    }
  }

  return { items, add, update, remove };
}

export function SectionCard({
  icon: Icon,
  title,
  description,
  addLabel,
  empty,
  onAdd,
  hasItems,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  addLabel: string;
  empty: string;
  onAdd: () => void;
  hasItems: boolean;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-4 h-4" /> {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd} className="gap-1 shrink-0">
          <Plus className="w-4 h-4" /> {addLabel}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasItems ? children : <p className="text-sm text-muted-foreground italic">{empty}</p>}
      </CardContent>
    </Card>
  );
}

export function ItemRow({
  title,
  subtitle,
  meta,
  deleteName,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  deleteName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5">
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium truncate">{title}</p>
        {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} aria-label="Edit">
          <Pencil className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this {deleteName}?</AlertDialogTitle>
              <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// "Jun 2025 – Aug 2025", or "Jun 2025 – Present" when end is missing.
export function formatRange(start?: string | null, end?: string | null): string {
  if (!start) return "";
  const s = dayjs(start).format("MMM YYYY");
  return `${s} – ${end ? dayjs(end).format("MMM YYYY") : "Present"}`;
}

export function formatDate(iso?: string | null): string {
  return iso ? dayjs(iso).format("MMM YYYY") : "";
}
