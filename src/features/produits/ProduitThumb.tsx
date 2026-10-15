import { useState } from "react"
import { Shirt } from "lucide-react"

import { cn } from "@/lib/utils"

/** Product photo, or a neutral garment tile when there is none yet. */
export function ProduitThumb({
  image,
  nom,
  size = "md",
  className,
}: {
  image: string
  nom: string
  size?: "md" | "lg" | "xl"
  className?: string
}) {
  const box = {
    md: "size-11 rounded-md",
    lg: "size-14 rounded-md",
    xl: "aspect-[4/3] w-full rounded-lg",
  }[size]
  // Imported photos live on the shop's CDN: lazy-load them, and fall back to
  // the garment tile if one can't be reached.
  const [casse, setCasse] = useState<string | null>(null)
  return image && casse !== image ? (
    <img
      src={image}
      alt={nom}
      loading="lazy"
      decoding="async"
      onError={() => setCasse(image)}
      className={cn(box, "shrink-0 border border-border bg-surface-nested object-cover", className)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(box, "flex shrink-0 items-center justify-center bg-surface-nested text-ink-disabled", className)}
    >
      <Shirt className={size === "xl" ? "size-10" : "size-5"} strokeWidth={1.5} />
    </span>
  )
}
