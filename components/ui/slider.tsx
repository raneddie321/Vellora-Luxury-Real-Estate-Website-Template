"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const count = Array.isArray(props.value ?? props.defaultValue)
    ? (props.value ?? props.defaultValue ?? []).length
    : 1;
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-40",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-px w-full grow bg-hairline-strong">
        <SliderPrimitive.Range className="absolute h-px bg-content" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            "block size-3.5 rounded-full border border-content bg-surface transition-[transform,box-shadow] duration-200",
            "hover:scale-125 focus-visible:scale-125 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
            "cursor-grab active:cursor-grabbing",
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = "Slider";
