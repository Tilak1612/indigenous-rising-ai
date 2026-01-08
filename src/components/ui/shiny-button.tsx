import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const shinyButtonVariants = cva(
  "shiny-cta focus:outline-none disabled:pointer-events-none disabled:opacity-50 inline-flex items-center justify-center",
  {
    variants: {
      size: {
        default: "h-10 px-6 text-sm font-medium",
        sm: "h-9 px-4 text-sm font-medium",
        lg: "h-11 px-8 text-sm font-medium",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof shinyButtonVariants> {
  asChild?: boolean;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ className, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(shinyButtonVariants({ size, className }))}
        ref={ref}
        {...props}
      >
        <span>{children}</span>
      </Comp>
    );
  }
);

ShinyButton.displayName = "ShinyButton";

export { ShinyButton, shinyButtonVariants };
