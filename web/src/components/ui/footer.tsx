import * as React from "react";

import { cn } from "@/lib/utils";

function Footer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer"
      className={cn(
        "mx-auto mb-8 w-full max-w-7xl rounded-2xl  p-6 shadow-xl backdrop-blur-md border border-foreground/20 dark:border-border/50",
        className,
      )}
      {...props}
    />
  );
}

function FooterContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-content"
      className={cn(
        "grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 pb-2",
        className,
      )}
      {...props}
    />
  );
}

function FooterColumn({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-column"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function FooterBottom({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-bottom"
      className={cn(
        "mt-8 flex flex-col items-center justify-between gap-4 border-t border-sidebar-border pt-4 pb-2 text-xs text-muted-foreground sm:flex-row",
        className,
      )}
      {...props}
    />
  );
}

export { Footer, FooterBottom, FooterColumn, FooterContent };
