import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const shinyButtonVariants = cva(
  "shiny-cta focus:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        default: "py-3 px-6 text-base",
        sm: "py-2 px-4 text-sm",
        lg: "py-4 px-8 text-lg",
        icon: "p-3",
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
