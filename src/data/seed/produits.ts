/**
 * Produits — the real Dreams Mom catalogue, imported read-only from the shop's
 * TikTak back-office into tiktak/produits.json. Field names follow the TikTak
 * product form; see docs/data-plan.md.
 * Seed rows keep slug ids carrying the TikTak id; rows added at runtime get UUIDs.
 */
import tiktakProduits from "@/data/seed/tiktak/produits.json"

export type RemiseType = "montant" | "pourcentage"

export const REMISE_TYPES: { value: RemiseType; label: string }[] = [
  { value: "montant", label: "DT" },
  { value: "pourcentage", label: "%" },
]

/** « Prix par quantité » — one formula: from N pieces, X DT or X % off. Embedded in Produit. */
export type PalierQuantite = {
  id: string
  /** From this many pieces. */
  quantite: number
  remise: number
  /** DT off (what the shop uses) or % off. */
  remiseType: RemiseType
  /** Text shown to the client, e.g. "2 achetés : −10 %". */
  texte: string
  /** Short badge label, may be empty (e.g. "Populaire"). */
  badge: string
  /** The formula pre-selected for the client — at most one. */
  parDefaut: boolean
}

export type Produit = {
  id: string
  /** « Nom du produit * » */
  nom: string
  /** « Référence » — e.g. U917 */
  reference: string
  /** « Description » — HTML from the rich-text editor; may be empty. */
  description: string
  /** « Code-barres »; may be empty. */
  codeBarres: string
  /** « Catégorie * » → Categorie.id; "" = none yet. */
  categorieId: string
  /** « Tags » — secondary Categorie ids (never the main one). */
  categoriesSecondaires: string[]
  /** « Marque »; may be empty. */
  marque: string
  /** « Prix TTC * » in DT; 0 = not priced yet. */
  prix: number
  /** « Remise » — 0 = none. */
  remise: number
  remiseType: RemiseType
  /** « Produit actif » — the Statut toggle of the list. */
  actif: boolean
  /** « Afficher sur le site » */
  afficherSurSite: boolean
  /** « Produit personnalisé » */
  personnalise: boolean
  /** « Images du produit » — first = principale; [] → garment-icon tile. */
  images: string[]
  /** « Activer la gestion de stock » — off: stock isn't tracked. */
  gestionStock: boolean
  /** « Ce produit a des déclinaisons » — stock then comes from the déclinaisons. */
  aDeclinaisons: boolean
  /** Names of the variant options, in column order (« Couleurs », « Taille »…). */
  options: string[]
  /** « Stock disponible » — used when aDeclinaisons is false. */
  stock: number
  /** « Seuil d'alerte » — "Stock faible" at or below this. */
  seuilAlerte: number
  /** « Prix par quantité » */
  paliers: PalierQuantite[]
}

// The real Dreams Mom catalogue (251 products), imported from TikTak.
// Cast: JSON widens `remiseType` to string; the converter only writes "montant" | "pourcentage".
export const produitsSeed: Produit[] = tiktakProduits as Produit[]
