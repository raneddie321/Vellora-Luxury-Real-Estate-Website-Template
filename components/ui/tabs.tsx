"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "no-scrollbar flex gap-8 overflow-x-auto border-b border-hairline",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative -mb-px shrink-0 border-b border-transparent pb-4 text-[11px] font-medium tracking-[0.18em] whitespace-nowrap text-content-faint uppercase transition-colors duration-300",
      "hover:text-content focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
      "data-[state=active]:border-content data-[state=active]:text-content",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "pt-10 focus-visible:outline-none data-[state=active]:animate-[var(--animate-rise)]",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
