/**
 * Shopco view-models — local presentational shapes the ported Shopco
 * components render. These are NOT the project's domain types; the adapter
 * (adapters.ts) maps Produit / Categorie / ArticlePanier into these.
 */

export type ProductCardVM = {
  id: string
  title: string
  /** In-app route (my routing scheme, not Shopco's). */
  href: string
  image: string
  /** Final price in DT (after remise). */
  priceFinal: number
  /** Crossed-out original price, or null when not discounted. */
  priceOriginal: number | null
  /** e.g. "-20%" or "-10 DT", or null. */
  discountLabel: string | null
  badge: "solde" | "edition" | null
}

export type ProductOptionVM = {
  /** Option name as named in the shop (Couleurs, Taille, Pointure…). */
  nom: string
  valeurs: string[]
}

export type ProductPageVM = {
  id: string
  title: string
  category: string | null
  categoryId: string
  images: string[]
  priceFinal: number
  priceOriginal: number | null
  discountLabel: string | null
  /** Rich HTML from the back-office product description (may be empty). */
  descriptionHtml: string
  options: ProductOptionVM[]
  /** Every variant: one value per entry of `options` (same order) + its photo ("" = none). */
  variantes: { valeurs: string[]; image: string }[]
}

export type CartLineVM = {
  id: string
  title: string
  image: string
  couleur: string
  taille: string
  prixUnitaire: number
  quantite: number
  lineTotal: number
}
