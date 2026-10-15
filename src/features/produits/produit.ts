import type { BadgeVariant } from "@/components/kit/Badge"
import { formatDT } from "@/lib/format"
import type { Declinaison } from "@/data/seed/declinaisons"
import type { PalierQuantite, Produit } from "@/data/seed/produits"

/** Display values derived from a produit — computed in render, never stored. */

/** A blank product — the starting draft of the creation page. */
export function produitVide(categorieId: string): Omit<Produit, "id"> {
  return {
    nom: "",
    reference: "",
    description: "",
    codeBarres: "",
    categorieId,
    categoriesSecondaires: [],
    marque: "",
    prix: 0,
    remise: 0,
    remiseType: "montant",
    actif: true,
    afficherSurSite: true,
    personnalise: false,
    images: [],
    gestionStock: true,
    aDeclinaisons: false,
    options: [],
    stock: 0,
    seuilAlerte: 3,
    paliers: [],
  }
}

/** The editable fields of a produit (everything but its id). */
export function sansId(p: Produit): Omit<Produit, "id"> {
  const copie: Partial<Produit> = { ...p }
  delete copie.id
  return copie as Omit<Produit, "id">
}

/** Price after the remise (never below 0). */
export function prixFinal(p: Pick<Produit, "prix" | "remise" | "remiseType">): number {
  if (!p.remise) return p.prix
  const off = p.remiseType === "pourcentage" ? (p.prix * p.remise) / 100 : p.remise
  return Math.max(0, p.prix - off)
}

/** Own stock, or the sum of its déclinaisons when it has some. */
export function stockTotal(
  p: Pick<Produit, "id" | "aDeclinaisons" | "stock">,
  declinaisons: Pick<Declinaison, "produitId" | "stock">[],
): number {
  if (!p.aDeclinaisons) return p.stock
  return declinaisons.filter((d) => d.produitId === p.id).reduce((n, d) => n + d.stock, 0)
}

export type StockStatut = "en-stock" | "faible" | "rupture" | "non-suivi"

export function stockStatut(
  stock: number,
  p: Pick<Produit, "seuilAlerte" | "gestionStock">,
): StockStatut {
  if (!p.gestionStock) return "non-suivi"
  if (stock <= 0) return "rupture"
  if (stock <= p.seuilAlerte) return "faible"
  return "en-stock"
}

export const STOCK_BADGE: Record<StockStatut, { label: string; variant: BadgeVariant }> = {
  "en-stock": { label: "En stock", variant: "success" },
  faible: { label: "Stock faible", variant: "warning" },
  rupture: { label: "Rupture", variant: "danger" },
  "non-suivi": { label: "Non suivi", variant: "default" },
}

/** The text the client sees for a quantity formula that has none of its own. */
export function textePalier(p: Pick<PalierQuantite, "quantite" | "remise" | "remiseType">): string {
  const remise = p.remiseType === "pourcentage" ? `${p.remise} %` : `${formatDT(p.remise)} DT`
  return `Dès ${p.quantite} pièce${p.quantite > 1 ? "s" : ""} : −${remise}`
}

/** A déclinaison being edited; `nouvelle` rows don't exist in the store yet. */
export type LigneDecl = { id: string; valeurs: string[]; stock: number; nouvelle?: boolean }

export function nouvelleLigne(nbOptions: number): LigneDecl {
  return { id: crypto.randomUUID(), valeurs: Array<string>(nbOptions).fill(""), stock: 0, nouvelle: true }
}
