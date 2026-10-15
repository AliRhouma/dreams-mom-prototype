import { cn } from "@/lib/utils"
import { formatPrixDT } from "./adapters"

/**
 * Shopco price row — final price, struck original, and a red discount pill.
 * Currency is DT (via formatPrixDT), never "$". `size` scales for card vs page.
 */
export function PriceRow({
  priceFinal,
  priceOriginal,
  discountLabel,
  size = "card",
  className,
}: {
  priceFinal: number
  priceOriginal: number | null
  discountLabel: string | null
  size?: "card" | "page"
  className?: string
}) {
  const big = size === "page"
  return (
    <div className={cn("flex items-center", big ? "space-x-2.5 sm:space-x-3" : "space-x-[5px] xl:space-x-2.5", className)}>
      <span className={cn("font-bold text-black", big ? "text-2xl sm:text-[32px]" : "text-xl xl:text-2xl")}>
        {formatPrixDT(priceFinal)}
      </span>
      {priceOriginal != null ? (
        <span className={cn("font-bold text-black/40 line-through", big ? "text-2xl sm:text-[32px]" : "text-xl xl:text-2xl")}>
          {formatPrixDT(priceOriginal)}
        </span>
      ) : null}
      {discountLabel ? (
        <span
          className={cn(
            "rounded-full bg-[#FF3333]/10 font-medium text-[#FF3333]",
            big ? "px-3.5 py-1.5 text-[10px] sm:text-xs" : "px-3.5 py-1.5 text-[10px] xl:text-xs",
          )}
        >
          {discountLabel}
        </span>
      ) : null}
    </div>
  )
}
