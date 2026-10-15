import type { Produit } from "@/data/seed/produits"
import { Price } from "@/components/kit/Price"
import { prixFinal } from "@/features/produits/produit"

/** A product's price in lists — sale-aware, or "Prix à définir" when not priced yet (0). */
export function PrixProduit({ produit, size = "sm" }: { produit: Pick<Produit, "prix" | "remise" | "remiseType">; size?: "sm" | "md" }) {
  if (produit.prix <= 0) return <span className="font-body text-xs whitespace-nowrap text-ink-disabled">Prix à définir</span>
  return <Price size={size} value={prixFinal(produit)} original={produit.prix} />
}
