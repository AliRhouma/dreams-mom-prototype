import type { BadgeVariant } from "@/components/kit/Badge"
import type {
  Commande,
  LigneCommande,
  SourceCommande,
  StatutCommande,
} from "@/data/seed/commandes"
import { SOURCES_COMMANDE, STATUTS_COMMANDE } from "@/data/seed/commandes"

/** Display values derived from a commande — computed in render, never stored. */

/** Libellé du statut ("Confirmées", "En attente"…). */
export function labelStatut(statut: StatutCommande): string {
  return STATUTS_COMMANDE.find((s) => s.value === statut)?.label ?? statut
}

/** Libellé de la source ("Site V2", "Facebook"…). */
export function labelSource(source: SourceCommande): string {
  return SOURCES_COMMANDE.find((s) => s.value === source)?.label ?? source
}

/** Couleur de badge par statut (vrai statut, jamais décoratif). */
export const STATUT_BADGE: Record<StatutCommande, BadgeVariant> = {
  "panier-abandonne": "default",
  "en-attente": "warning",
  confirmee: "info",
  "pret-a-expedier": "warning",
  expediee: "info",
  livree: "success",
  "retour-non-recue": "danger",
  annulee: "danger",
  "retour-recue": "danger",
}

/** Les lignes d'une commande. */
export function lignesDe(
  commandeId: string,
  lignes: LigneCommande[],
): LigneCommande[] {
  return lignes.filter((l) => l.commandeId === commandeId)
}

/** Sous-total = Σ (prix unitaire × quantité). */
export function sousTotal(lignes: Pick<LigneCommande, "prixUnitaire" | "quantite">[]): number {
  return lignes.reduce((n, l) => n + l.prixUnitaire * l.quantite, 0)
}

/** Montant de la remise appliquée au total. */
export function montantRemise(
  c: Pick<Commande, "remise" | "remiseType">,
  base: number,
): number {
  if (!c.remise) return 0
  return c.remiseType === "pourcentage" ? (base * c.remise) / 100 : c.remise
}

/** Total = sous-total + frais de livraison − remise (jamais < 0). */
export function totalCommande(
  c: Pick<Commande, "fraisLivraison" | "remise" | "remiseType" | "livraisonGratuite">,
  lignes: Pick<LigneCommande, "prixUnitaire" | "quantite">[],
): number {
  const st = sousTotal(lignes)
  const frais = c.livraisonGratuite ? 0 : c.fraisLivraison
  return Math.max(0, st + frais - montantRemise(c, st))
}

/** Nombre total d'articles (somme des quantités). */
export function nbArticles(lignes: Pick<LigneCommande, "quantite">[]): number {
  return lignes.reduce((n, l) => n + l.quantite, 0)
}

/** Une commande vide — brouillon de départ de la page de création. */
export function commandeVide(): Omit<Commande, "id"> {
  return {
    numero: Math.floor(42400 + Math.random() * 600),
    client: "",
    telephone: "",
    telephoneSecondaire: "",
    gouvernorat: "",
    ville: "",
    adresse: "",
    codePostal: "",
    source: "site-v2",
    statut: "en-attente",
    canalContact: "whatsapp",
    transporteur: "",
    livraisonGratuite: false,
    echange: false,
    fraisLivraison: 8,
    remise: 0,
    remiseType: "montant",
    typePaiement: "espece",
    email: "",
    messenger: "",
    dateLivraison: "",
    commentaire: "",
    date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
  }
}

/** Les champs modifiables d'une commande (tout sauf l'id). */
export function sansId(c: Commande): Omit<Commande, "id"> {
  const copie: Partial<Commande> = { ...c }
  delete copie.id
  return copie as Omit<Commande, "id">
}

/** Ligne du brouillon d'édition : comme LigneCommande sans commandeId, avec un drapeau "nouvelle". */
export type LigneDraft = {
  id: string
  produitId: string
  nom: string
  prixUnitaire: number
  quantite: number
  /** true tant que la ligne n'existe pas encore dans le store. */
  nouvelle?: boolean
}
