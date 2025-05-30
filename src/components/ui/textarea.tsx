import * as React from "react";

import { cn } from "@/libraries/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "base__input__style flex min-h-[60px] w-full rounded-[8px] border border-border bg-transparent px-3 py-2 text-sm shadow-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
