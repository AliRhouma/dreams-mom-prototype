import type { Commande } from "@/data/seed/commandes"
import type { PalierQuantite, Produit } from "@/data/seed/produits"
import { prixFinal } from "@/features/produits/produit"
import { commandeVide } from "@/features/commandes/commande"

/** Champs du formulaire « Commander » côté boutique. */
export type FormulaireClient = {
  nom: string
  telephone: string
  gouvernorat: string
  adresse: string
}

export const formulaireVide: FormulaireClient = { nom: "", telephone: "", gouvernorat: "", adresse: "" }

/** Erreurs du formulaire client (vide = valide). */
export function validerFormulaire(f: FormulaireClient): Partial<Record<keyof FormulaireClient, string>> {
  const e: Partial<Record<keyof FormulaireClient, string>> = {}
  if (!f.nom.trim()) e.nom = "Nom et prénom obligatoires."
  if (f.telephone.trim().length < 8) e.telephone = "Numéro de téléphone invalide."
  if (!f.gouvernorat.trim()) e.gouvernorat = "Choisissez un gouvernorat."
  if (!f.adresse.trim()) e.adresse = "Adresse obligatoire."
  return e
}

/** Libellé de variante lisible, ex. « — Gris / S » (vide si pas d'options). */
export function suffixeVariante(valeurs: string[]): string {
  const propres = valeurs.filter((v) => v.trim())
  return propres.length ? ` — ${propres.join(" / ")}` : ""
}

/** Le meilleur palier applicable pour une quantité (le plus élevé atteint), ou null. */
export function palierApplicable(produit: Pick<Produit, "paliers">, quantite: number): PalierQuantite | null {
  const eligibles = produit.paliers.filter((p) => quantite >= p.quantite).sort((a, b) => b.quantite - a.quantite)
  return eligibles[0] ?? null
}

/** Montant de remise d'un palier sur un sous-total. */
export function remisePalier(palier: PalierQuantite, sousTotal: number): number {
  return palier.remiseType === "pourcentage" ? (sousTotal * palier.remise) / 100 : palier.remise
}

/** Une commande « en attente » depuis la boutique (source Site V2, contact Dispo). */
export function commandeBoutique(
  f: FormulaireClient,
  extra: Pick<Commande, "remise" | "remiseType">,
): Omit<Commande, "id"> {
  return {
    ...commandeVide(),
    client: f.nom.trim(),
    telephone: f.telephone.trim(),
    gouvernorat: f.gouvernorat.trim(),
    adresse: f.adresse.trim(),
    source: "site-v2",
    statut: "en-attente",
    canalContact: "dispo",
    fraisLivraison: 8,
    remise: extra.remise,
    remiseType: extra.remiseType,
  }
}

/** Prix unitaire TTC figé d'un produit (prix soldé). */
export function prixUnitaire(produit: Pick<Produit, "prix" | "remise" | "remiseType">): number {
  return prixFinal(produit)
}
