import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { JobSearchFilters } from "@/types/job-matcher";
import type { ActiveFilterTag } from "../types";

interface ActiveFilterTagsProps {
  tags: ActiveFilterTag[];
  onReset: () => void;
  onRemove: (type: keyof JobSearchFilters, value: string) => void;
}

export function ActiveFilterTags({
  tags,
  onReset,
  onRemove,
}: ActiveFilterTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-md p-4">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-sm font-medium text-foreground">Active Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          Reset to Defaults
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={`${tag.type}-${tag.value}`}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80 pr-1 gap-1 whitespace-normal break-words shrink max-w-full"
          >
            <span className="break-words whitespace-normal max-w-[12rem] truncate">
              {tag.label}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive/20 rounded-full"
              onClick={() => onRemove(tag.type, tag.value)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
