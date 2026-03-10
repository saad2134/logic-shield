import { cva, VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "@/lib/utils";

const glowVariants = cva("absolute w-full", {
  variants: {
    variant: {
      top: "top-0",
      above: "-top-[128px]",
      bottom: "bottom-0",
      below: "-bottom-[128px]",
      center: "top-[50%]",
    },
  },
  defaultVariants: {
    variant: "top",
  },
});

function Glow({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof glowVariants>) {
  return (
    <div
      data-slot="glow"
      className={cn(glowVariants({ variant }), className)}
      {...props}
    >
      {/* <div
        className={cn(
          "from-brand-foreground/50 to-brand-foreground/0 absolute left-1/2 h-[320px] sm:h-[640px] w-[80%] -translate-x-1/2 scale-[3.5] rounded-[50%] bg-radial from-10% to-70% opacity-25 dark:opacity-100",
          variant === "center" && "-translate-y-1/2",
        )}
      /> */}
      <div
        className={cn(
          "from-brand/25 to-brand-foreground/0 absolute left-1/2 h-[180px] sm:h-[360px] w-[55%] -translate-x-1/2 scale-[2.8] rounded-[50%] bg-radial from-10% to-65% opacity-60 dark:opacity-100",
          variant === "center" && "-translate-y-1/2",
        )}
      />
    </div>
  );
}

export default Glow;
