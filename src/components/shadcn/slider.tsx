"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * Slider — alinhado com tokens v3.
 *
 * Specs:
 *   - Track: h:8px (h-2), bg-emphasis (light, gray[100]) / bg-accent (dark, alpha 16%), radius-full
 *   - Range: bg-brand (filled portion)
 *   - Thumb: 24x16 (oval), white com shadow-sh-md
 *     - hover/focus: shadow-sh-ring (brand glow)
 */
const THUMB_CLASS = cn(
  "block h-4 w-6 shrink-0 rounded-radius-full bg-white",
  "shadow-sh-md",
  "transition-[box-shadow] select-none outline-none",
  "hover:shadow-sh-ring",
  "focus-visible:shadow-sh-ring",
  "disabled:pointer-events-none disabled:opacity-50"
);

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, defaultValue, value, ...props }, ref) => {
  const thumbCount = (value ?? defaultValue ?? [0]).length;

  return (
    <SliderPrimitive.Root
      ref={ref}
      defaultValue={defaultValue}
      value={value}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-radius-full bg-bg-emphasis dark:bg-bg-accent">
        <SliderPrimitive.Range className="absolute h-full bg-bg-brand" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <SliderPrimitive.Thumb key={i} className={THUMB_CLASS} />
      ))}
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
