import { cn } from "@/lib/utils";
import { toolbarDivider } from "../table-toolbar.styles";

export type ToolbarDividerProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Divisor vertical 1px × 24px usado entre grupos da toolbar.
 */
export function ToolbarDivider({ className, ...props }: ToolbarDividerProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(toolbarDivider(), className)}
      {...props}
    />
  );
}
