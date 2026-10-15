import { useState } from "react"
import { ShoppingBag } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Storefront image with a graceful fallback (Shopco uses a soft grey box).
 * Replaces Shopco's next/image — plain <img> with lazy-loading + onError tile.
 */
export function ShopImage({
  src,
  alt,
  className,
  imgClassName,
  fit = "cover",
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  fit?: "cover" | "contain"
}) {
  const [broken, setBroken] = useState(false)
  return (
    <div className={cn("flex items-center justify-center overflow-hidden bg-[#F0EEED]", className)}>
      {src && !broken ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className={cn(
            "h-full w-full transition-transform duration-500 hover:scale-110",
            fit === "cover" ? "object-cover" : "object-contain",
            imgClassName,
          )}
        />
      ) : (
        <span className="flex items-center justify-center text-black/20">
          <ShoppingBag className="size-1/4 min-h-10 min-w-10" strokeWidth={1.25} />
        </span>
      )}
    </div>
  )
}
