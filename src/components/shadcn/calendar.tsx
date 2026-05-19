import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-transparent p-0 [--cell-size:2.5rem]",
        className
      )}
      captionLayout={captionLayout}
      classNames={{
        root: cn("w-full", defaultClassNames.root),
        months: cn("relative flex flex-col gap-gp-2xl sm:flex-row sm:gap-gp-4xl", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-gp-2xl", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "inline-flex items-center justify-center size-[--cell-size] rounded-full text-fg-muted hover:bg-bg-muted transition-colors select-none aria-disabled:opacity-30",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "inline-flex items-center justify-center size-[--cell-size] rounded-full text-fg-muted hover:bg-bg-muted transition-colors select-none aria-disabled:opacity-30",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "text-body-md font-medium font-semibold select-none",
          captionLayout === "dropdown" ? "hidden" : "",
          defaultClassNames.caption_label
        ),
        dropdowns: cn(
          "flex items-center gap-gp-md",
          defaultClassNames.dropdowns
        ),
        dropdown: cn(
          "cursor-pointer appearance-none bg-transparent text-body-md font-medium font-semibold text-fg-default outline-none",
          defaultClassNames.dropdown
        ),
        months_dropdown: cn("", defaultClassNames.months_dropdown),
        years_dropdown: cn("", defaultClassNames.years_dropdown),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 min-w-8 max-w-12 text-body-sm font-normal text-fg-muted select-none text-center",
          defaultClassNames.weekday
        ),
        week: cn("mt-gp-md flex w-full", defaultClassNames.week),
        day: cn(
          "group/day relative aspect-square min-w-8 max-w-12 p-0 text-center select-none",
          defaultClassNames.day
        ),
        range_start: cn("rounded-l-full", defaultClassNames.range_start),
        range_end: cn("rounded-r-full", defaultClassNames.range_end),
        range_middle: cn("", defaultClassNames.range_middle),
        today: cn("", defaultClassNames.today),
        outside: cn(
          "text-fg-subtle opacity-40",
          defaultClassNames.outside
        ),
        disabled: cn("text-fg-disabled opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootCn, rootRef, ...rootProps }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(rootCn)} {...rootProps} />
        ),
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <ChevronLeftIcon className="size-4" />
          return <ChevronRightIcon className="size-4" />
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const isRangeStart = modifiers.range_start;
  const isRangeEnd = modifiers.range_end;
  const isRangeMiddle = modifiers.range_middle;
  const isSingleSelected =
    modifiers.selected && !isRangeStart && !isRangeEnd && !isRangeMiddle;

  return (
    <button
      ref={ref}
      type="button"
      data-selected-single={isSingleSelected}
      data-range-start={isRangeStart || undefined}
      data-range-end={isRangeEnd || undefined}
      data-range-middle={isRangeMiddle || undefined}
      className={cn(
        "relative flex aspect-square w-full items-center justify-center text-body-md font-normal leading-none outline-none transition-colors",

        // Default shape
        "rounded-full",

        // Hover
        "hover:bg-bg-muted",

        // Single selected
        "data-[selected-single=true]:bg-bg-brand data-[selected-single=true]:text-fg-on-brand data-[selected-single=true]:hover:bg-bg-brand",

        // Range start
        "data-[range-start]:bg-bg-brand data-[range-start]:text-fg-on-brand data-[range-start]:rounded-full data-[range-start]:hover:bg-bg-brand",

        // Range end
        "data-[range-end]:bg-bg-brand data-[range-end]:text-fg-on-brand data-[range-end]:rounded-full data-[range-end]:hover:bg-bg-brand",

        // Range middle
        "data-[range-middle]:bg-bg-brand-subtle data-[range-middle]:text-fg-brand data-[range-middle]:rounded-none",

        // Today
        modifiers.today && !isSingleSelected && !isRangeStart && !isRangeEnd && !isRangeMiddle &&
          "bg-bg-brand text-fg-on-brand font-semibold hover:bg-bg-brand",

        // Outside
        modifiers.outside && "text-fg-subtle opacity-40 hover:bg-transparent",

        // Disabled
        modifiers.disabled && "opacity-30 pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
