"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChipInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

// Free-text chip input. Enter or comma to add, click x to remove. Optional suggestions render as clickable chips below.
export function ChipInput({
  value,
  onChange,
  suggestions = [],
  placeholder,
  className,
}: ChipInputProps) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const clean = raw.trim();
    if (!clean) return;
    if (value.some((v) => v.toLowerCase() === clean.toLowerCase())) return;
    onChange([...value, clean]);
    setDraft("");
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  const remainingSuggestions = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
        {value.map((chip, i) => (
          <Badge key={`${chip}-${i}`} variant="secondary" className="gap-1 pr-1">
            {chip}
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5"
              aria-label={`Remove ${chip}`}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => draft && commit(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[120px] h-7 px-1"
        />
      </div>
      {remainingSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remainingSuggestions.slice(0, 12).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="text-xs px-2.5 py-1 rounded-full border border-dashed border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
