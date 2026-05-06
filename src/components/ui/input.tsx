import * as React from "react";

import { cn } from "@/lib/utils";
import { INPUT_MAX_LENGTHS } from "@/lib/constants";

function Input({
  className,
  type,
  maxLength,
  ...props
}: React.ComponentProps<"input">) {
  const defaultMaxLength = React.useMemo(() => {
    if (maxLength !== undefined) return maxLength;
    switch (type) {
      case "email":
        return INPUT_MAX_LENGTHS.EMAIL;
      case "password":
        return INPUT_MAX_LENGTHS.PASSWORD;
      case "url":
        return INPUT_MAX_LENGTHS.URL;
      case "search":
        return INPUT_MAX_LENGTHS.SEARCH;
      default:
        return INPUT_MAX_LENGTHS.DEFAULT;
    }
  }, [type, maxLength]);

  return (
    <input
      type={type}
      maxLength={defaultMaxLength}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-xs placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
