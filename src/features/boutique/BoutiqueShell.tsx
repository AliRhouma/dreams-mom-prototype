import { Outlet } from "react-router-dom"

import { useData } from "@/data/useData"
import { TopBanner } from "@/features/boutique/shopco/TopBanner"
import { Navbar } from "@/features/boutique/shopco/Navbar"
import { Footer } from "@/features/boutique/shopco/Footer"

/**
 * Storefront frame — Shopco re-skin (client side only). Sets the Satoshi body
 * face via `font-body-shopco` on the root; the admin is untouched. Composes the
 * ported TopBanner + Navbar + Footer around the routed pages.
 */
export function BoutiqueShell() {
  const { panier } = useData()
  const { categories } = useData()
  const nbPanier = panier.reduce((n, a) => n + a.quantite, 0)

  return (
    <div className="storefront-root font-body-shopco flex min-h-svh flex-col bg-white text-black">
      <TopBanner />
      <Navbar cartCount={nbPanier} categories={categories} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
