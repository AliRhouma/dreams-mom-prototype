import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Shopco quantity stepper — a soft grey rounded pill. Controlled: the parent
 * owns the value (so cart totals stay driven by the store, never recomputed
 * inside this widget).
 */
export function CartCounter({
  value,
  onChange,
  min = 1,
  className,
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-w-[110px] max-w-[110px] items-center justify-between rounded-full bg-[#F0F0F0] px-4 py-3 sm:max-w-[170px] sm:px-5 md:py-3.5",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Diminuer la quantité"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex size-5 items-center justify-center text-black transition-opacity hover:opacity-60 disabled:opacity-30 sm:size-6"
      >
        <Minus className="size-4" />
      </button>
      <span className="font-medium text-sm tabular-nums sm:text-base">{value}</span>
      <button
        type="button"
        aria-label="Augmenter la quantité"
        onClick={() => onChange(value + 1)}
        className="flex size-5 items-center justify-center text-black transition-opacity hover:opacity-60 sm:size-6"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
