"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[80] bg-ink/70 backdrop-blur-[3px]",
      "data-[state=open]:animate-[fade-in_320ms_var(--ease-soft)] data-[state=closed]:animate-[fade-out_200ms_var(--ease-soft)]",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** `panel` is the standard centred sheet; `full` fills the viewport (gallery). */
    layout?: "panel" | "full";
    hideClose?: boolean;
  }
>(({ className, children, layout = "panel", hideClose, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[90] focus:outline-none",
        "data-[state=open]:animate-[var(--animate-rise)]",
        layout === "panel"
          ? "top-1/2 left-1/2 max-h-[90dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-hairline bg-surface p-6 shadow-[var(--shadow-panel)] sm:p-10"
          : "inset-0 bg-ink",
        className,
      )}
      {...props}
    >
      {children}
      {hideClose ? null : (
        <DialogPrimitive.Close
          className={cn(
            "absolute z-20 inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
            layout === "panel"
              ? "top-5 right-5 size-9 text-content-faint hover:text-content"
              : "top-5 right-5 size-11 text-paper/70 hover:text-paper sm:top-8 sm:right-8",
          )}
        >
          <X className="size-5" aria-hidden />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

export function DialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mb-7 space-y-2.5 pr-10", className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-serif text-3xl leading-[1.05] tracking-[-0.03em] text-content", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-relaxed text-content-muted", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";
