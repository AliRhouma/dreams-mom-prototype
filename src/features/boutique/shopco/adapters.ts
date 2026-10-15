/**
 * The ONE adapter layer between Dreams Mom domain types and the Shopco
 * view-models. Pure functions only. All price maths reuse existing helpers
 * (prixFinal, formatDT); currency is DT (never "$"); routes use my slug scheme.
 * Nothing here mutates or reshapes the data layer.
 */
import type { Categorie } from "@/data/seed/categories"
import type { Declinaison } from "@/data/seed/declinaisons"
import type { Produit } from "@/data/seed/produits"
import type { ArticlePanier } from "@/data/DataProvider"
import { formatDT } from "@/lib/format"
import { prixFinal } from "@/features/produits/produit"
import type { CartLineVM, ProductCardVM, ProductPageVM } from "./vm"

/** "59 DT" — currency formatting for the storefront (reuses formatDT). */
export function formatPrixDT(value: number): string {
  return `${formatDT(value)} DT`
}

/** Product detail route (my routing/slug scheme — unchanged). */
export function produitHref(id: string): string {
  return `/client/produit/${id}`
}

/** "-20%" / "-10 DT" for the discount pill, or null when not discounted. */
function discountLabel(p: Pick<Produit, "remise" | "remiseType">): string | null {
  if (!p.remise) return null
  return p.remiseType === "pourcentage" ? `-${p.remise}%` : `-${formatDT(p.remise)} DT`
}

function nomCategorie(categorieId: string, categories: Categorie[]): string | null {
  return categories.find((c) => c.id === categorieId)?.nom ?? null
}

export function toProductCardVM(produit: Produit, categories: Categorie[]): ProductCardVM {
  const cat = nomCategorie(produit.categorieId, categories)
  const final = prixFinal(produit)
  const onSale = produit.remise > 0
  return {
    id: produit.id,
    title: produit.nom,
    href: produitHref(produit.id),
    image: produit.images[0] ?? "",
    priceFinal: final,
    priceOriginal: onSale ? produit.prix : null,
    discountLabel: discountLabel(produit),
    badge: onSale ? "solde" : cat === "LIMITED SELECTION" ? "edition" : null,
  }
}

export function toProductPageVM(
  produit: Produit,
  categories: Categorie[],
  declinaisons: Declinaison[],
): ProductPageVM {
  const mesDecls = declinaisons.filter((d) => d.produitId === produit.id)
  // Options that have at least one value — keeping their original index so each
  // variant's values can be re-aligned with the options actually shown.
  const gardees = produit.options
    .map((nom, i) => ({
      nom,
      i,
      valeurs: [...new Set(mesDecls.map((d) => d.valeurs[i]).filter((v) => v && v.trim()))],
    }))
    .filter((o) => o.valeurs.length > 0)
  const final = prixFinal(produit)
  return {
    id: produit.id,
    title: produit.nom,
    category: nomCategorie(produit.categorieId, categories),
    categoryId: produit.categorieId,
    images: produit.images,
    priceFinal: final,
    priceOriginal: produit.remise > 0 ? produit.prix : null,
    discountLabel: discountLabel(produit),
    descriptionHtml: produit.description,
    options: gardees.map(({ nom, valeurs }) => ({ nom, valeurs })),
    variantes: mesDecls.map((d) => ({ valeurs: gardees.map((o) => d.valeurs[o.i] ?? ""), image: d.image })),
  }
}

export function toCartLineVM(article: ArticlePanier): CartLineVM {
  return {
    id: article.id,
    title: article.nom,
    image: article.image,
    couleur: article.couleur,
    taille: article.taille,
    prixUnitaire: article.prixUnitaire,
    quantite: article.quantite,
    lineTotal: article.prixUnitaire * article.quantite,
  }
}
