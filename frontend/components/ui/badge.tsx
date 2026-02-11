import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gold/10 text-gold border border-gold/30",
        secondary:
          "bg-oxford/10 text-oxford border border-oxford/30",
        destructive:
          "bg-crimson/10 text-crimson border border-crimson/30",
        outline:
          "text-walnut border border-walnut/30",
        verified:
          "bg-verified/10 text-verified border border-verified/30",
        pending:
          "bg-pending/10 text-pending border border-pending/30",
        rejected:
          "bg-rejected/10 text-rejected border border-rejected/30",
        confirming:
          "bg-confirming/10 text-confirming border border-confirming/30 animate-pulse",
        blockchain:
          "bg-oxford text-electric-cyan border border-electric-cyan/50 font-mono text-[10px]",
        gold:
          "bg-gradient-to-r from-gold to-gold-light text-white border-0 shadow-sm",
        waxSeal:
          "bg-gradient-to-br from-gold to-gold-dark text-white rounded-full px-3 py-1 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
