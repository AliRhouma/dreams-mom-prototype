import tiktakCategories from "@/data/seed/tiktak/categories.json"

/**
 * Catégories — the "Catégorie *" select of the product form.
 * The real Dreams Mom categories, imported from the shop's TikTak back-office
 * (see docs/data-plan.md; regenerate tiktak/*.json to refresh).
 */
export type Categorie = {
  id: string
  nom: string
}

export const categoriesSeed: Categorie[] = tiktakCategories
