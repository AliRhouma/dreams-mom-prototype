import { cn } from "@/lib/utils"
import { formatDT } from "@/lib/format"

/**
 * A price in DT (design system: Prices). Jost, tabular figures, the unit a step
 * smaller and muted. With `original` higher than `value` it renders a sale:
 * the new price in danger, the old one struck through beside it.
 */
export function Price({
  value,
  original,
  size = "md",
  className,
}: {
  value: number
  original?: number
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const onSale = original != null && original > value
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-ui tabular-nums lining-nums whitespace-nowrap",
        size === "sm" && "text-sm font-medium",
        size === "md" && "text-[1.0625rem] font-medium tracking-[0.01em]",
        size === "lg" && "text-[2rem] leading-none font-normal tracking-[-0.01em]",
        onSale ? "text-danger" : "text-ink",
        className,
      )}
    >
      <span>
        {formatDT(value)}
        <span className="ml-1 text-[0.75em] font-normal text-ink-muted">DT</span>
      </span>
      {onSale ? (
        <s className="text-[0.8125rem] font-normal text-ink-disabled">{formatDT(original)} DT</s>
      ) : null}
    </span>
  )
}
