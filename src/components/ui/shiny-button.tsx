import * as React from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={cn("shiny-cta focus:outline-none", className)}
        ref={ref}
        {...props}
      >
        <span>{children}</span>
      </button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

export { ShinyButton };
