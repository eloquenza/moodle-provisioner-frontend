import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // base visual
        "flex h-9 w-full min-w-0 rounded-md border border-border bg-input-background shadow-inner",
        // text & placeholder
        "text-base md:text-sm text-foreground placeholder:text-muted-foreground",
        // padding & file input
        "px-3 py-1 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // selection
        "selection:bg-primary selection:text-primary-foreground",
        // focus style (ring uses your --ring token)
        "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // disabled + misc
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 transition-[color,box-shadow]",
        // dark fallback: if you prefer slightly darker field in dark mode
        "dark:bg-input",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
