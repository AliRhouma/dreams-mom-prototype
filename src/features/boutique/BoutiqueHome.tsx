import { useMemo } from "react"

import { useData } from "@/data/useData"
import { Hero } from "@/features/boutique/shopco/Hero"
import { ProductListSec } from "@/features/boutique/shopco/ProductListSec"
import { CategoryShowcase } from "@/features/boutique/shopco/CategoryShowcase"
import { toProductCardVM } from "@/features/boutique/shopco/adapters"

/**
 * Boutique home (Shopco re-skin). Fetches from the store exactly as before,
 * maps through the adapter into Shopco view-models, and renders the ported
 * Hero + product sections + category showcase. "Nouveautés" / "Meilleures
 * ventes" are simple slices — my data has no curated-collection field.
 */
export function BoutiqueHome() {
  const { produits, categories } = useData()

  const enVitrine = useMemo(
    () => produits.filter((p) => p.actif && p.afficherSurSite && p.prix > 0),
    [produits],
  )

  const nouveautes = enVitrine.slice(0, 8).map((p) => toProductCardVM(p, categories))
  const meilleures = enVitrine.filter((p) => p.remise > 0).slice(0, 8).map((p) => toProductCardVM(p, categories))
  const fallbackVentes = enVitrine.slice(8, 16).map((p) => toProductCardVM(p, categories))

  // Featured image for the hero = first in-stock product with a photo.
  const featuredImage = enVitrine.find((p) => p.images[0])?.images[0] ?? ""

  const stats = [
    { value: `${enVitrine.length}+`, label: "Articles en ligne" },
    { value: `${categories.length}`, label: "Catégories" },
    { value: "24/24", label: "Gouvernorats livrés" },
  ]

  // Category tiles: each category that has in-vitrine products + a sample image.
  const tiles = categories
    .map((c) => {
      const sample = enVitrine.find((p) => p.categorieId === c.id && p.images[0])
      return sample ? { id: c.id, nom: c.nom, image: sample.images[0] } : null
    })
    .filter((t): t is { id: string; nom: string; image: string } => t !== null)
    .slice(0, 4)

  return (
    <div className="flex flex-col">
      <Hero featuredImage={featuredImage} stats={stats} />

      <div className="mx-auto w-full px-0 py-12 md:py-16">
        <ProductListSec title="Nouveautés" data={nouveautes} viewAllLink="/client/shop" />
      </div>

      <div className="mx-auto w-full border-t border-black/10 px-0 py-12 md:py-16">
        <ProductListSec
          title="Meilleures offres"
          data={meilleures.length >= 4 ? meilleures : fallbackVentes}
          viewAllLink="/client/shop"
        />
      </div>

      <div className="py-4 md:py-8">
        <CategoryShowcase title="Parcourir par catégorie" tiles={tiles} />
      </div>
    </div>
  )
}
