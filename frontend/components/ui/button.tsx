import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-parchment transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-white hover:bg-gold-light shadow-md hover:shadow-lg active:scale-[0.98]",
        destructive:
          "bg-crimson text-white hover:bg-crimson-light shadow-md",
        outline:
          "border-2 border-gold text-gold bg-transparent hover:bg-gold/10",
        secondary:
          "bg-oxford text-parchment hover:bg-oxford-light shadow-md",
        ghost:
          "hover:bg-walnut/10 text-walnut",
        link:
          "text-gold underline-offset-4 hover:underline",
        ceremonial:
          "bg-gradient-to-r from-gold via-gold-light to-gold text-white font-heading font-semibold tracking-wider uppercase shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
        blockchain:
          "bg-oxford text-electric-cyan border border-electric-cyan/50 hover:border-electric-cyan hover:shadow-glow-cyan font-mono",
        waxSeal:
          "bg-gradient-to-br from-gold-light via-gold to-gold-dark text-white rounded-full shadow-lg hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        seal: "h-16 w-16",
        sealLg: "h-24 w-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
