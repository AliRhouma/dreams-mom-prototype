import { useMemo } from "react"

import { useData } from "@/data/useData"
import { Hero } from "@/features/boutique/shopco/Hero"
import { ProductListSec } from "@/features/boutique/shopco/ProductListSec"
import { CategoryShowcase } from "@/features/boutique/shopco/CategoryShowcase"
import { CtaBand, TrustBar, Testimonials, ValueProps } from "@/features/boutique/shopco/LandingSections"
import { toProductCardVM } from "@/features/boutique/shopco/adapters"

/**
 * Boutique home (Shopco re-skin) — composed as a conversion funnel in French:
 * hero → réassurance → nouveautés → bandeau promo → offres → catégories →
 * arguments de valeur → avis clients → appel final. Every section steers the
 * client toward the shop / checkout. Data comes from the store via the adapter;
 * "Nouveautés" / "Offres" are simple slices (no curated-collection field).
 */
export function BoutiqueHome() {
  const { produits, categories } = useData()

  const enVitrine = useMemo(
    () => produits.filter((p) => p.actif && p.afficherSurSite && p.prix > 0),
    [produits],
  )

  const nouveautes = enVitrine.slice(0, 8).map((p) => toProductCardVM(p, categories))
  const soldes = enVitrine.filter((p) => p.remise > 0)
  const meilleures = soldes.slice(0, 8).map((p) => toProductCardVM(p, categories))
  const fallbackVentes = enVitrine.slice(8, 16).map((p) => toProductCardVM(p, categories))

  // Meilleure réduction en % — argument d'urgence du bandeau promo.
  const maxRemisePct = Math.max(
    0,
    ...soldes.map((p) => (p.remiseType === "pourcentage" ? p.remise : Math.round((p.remise / p.prix) * 100))),
  )

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

      {/* Réassurance — lève les freins à l'achat juste après le hero */}
      <TrustBar />

      {/* Nouveautés */}
      <div className="mx-auto w-full px-0 py-12 md:py-16">
        <ProductListSec title="Nouveautés" data={nouveautes} viewAllLink="/client/shop" />
      </div>

      {/* Bandeau promo — urgence, redirige vers la boutique */}
      <div className="pb-12 md:pb-16">
        <CtaBand
          surtitre={maxRemisePct > 0 ? `Jusqu’à −${maxRemisePct}%` : "Offres du moment"}
          titre="Les offres ne durent qu’un instant"
          texte="Profitez des meilleurs prix sur une sélection de pièces. Paiement à la livraison, partout en Tunisie."
          cta="Voir les offres"
          to="/client/shop"
        />
      </div>

      {/* Offres du moment (produits soldés) */}
      <div className="mx-auto w-full px-0 pb-12 md:pb-16">
        <ProductListSec
          title="Offres du moment"
          data={meilleures.length >= 4 ? meilleures : fallbackVentes}
          viewAllLink="/client/shop"
        />
      </div>

      {/* Parcourir par catégorie */}
      <div className="pb-14 md:pb-20">
        <CategoryShowcase title="Parcourir par catégorie" tiles={tiles} />
      </div>

      {/* Arguments de valeur */}
      <div className="pb-14 md:pb-20">
        <ValueProps />
      </div>

      {/* Preuve sociale */}
      <Testimonials />

      {/* Appel à l'action final */}
      <div className="py-14 md:py-20">
        <CtaBand
          titre="Prêt à renouveler votre vestiaire ?"
          texte="Découvrez toute la collection et commandez en quelques clics — livraison rapide, paiement à la réception."
          cta="Découvrir la collection"
          to="/client/shop"
        />
      </div>
    </div>
  )
}
