import { useState } from "react"
import { X } from "lucide-react"

/** Shopco promo banner — black bar, dismissible (local state). */
export function TopBanner() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  return (
    <div className="bg-black px-2 py-2 text-center text-white sm:px-4 xl:px-0">
      <div className="relative mx-auto max-w-[1240px]">
        <p className="text-xs sm:text-sm">
          Livraison partout en Tunisie · paiement à la livraison.{" "}
          <span className="font-medium underline">Profitez-en</span>
        </p>
        <button
          type="button"
          aria-label="Fermer la bannière"
          onClick={() => setOpen(false)}
          className="absolute right-0 top-1/2 hidden -translate-y-1/2 p-1 opacity-80 transition-opacity hover:opacity-100 sm:flex"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
