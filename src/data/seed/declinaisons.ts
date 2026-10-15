import tiktakDeclinaisons from "@/data/seed/tiktak/declinaisons.json"

/**
 * Déclinaisons — one combination of option values of a produit (e.g. Gris / S),
 * each with its own stock. Child of Produit (removing a produit removes them).
 * `valeurs` follows the order of the parent's `options` (["Couleurs", "Taille"]).
 * Imported from the shop's TikTak back-office (active variants only).
 */
export type Declinaison = {
  id: string
  /** Parent — every déclinaison belongs to one produit. */
  produitId: string
  /** One value per Produit.options, same order; a value may be empty. */
  valeurs: string[]
  stock: number
  /** The variant's photo (usually one of the product's images), "" = none. The shop shows it when the client picks this variant. */
  image: string
}

export const declinaisonsSeed: Declinaison[] = tiktakDeclinaisons
