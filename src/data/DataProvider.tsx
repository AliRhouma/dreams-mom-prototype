import { createContext, useMemo, useState, type ReactNode } from "react"

import { categoriesSeed, type Categorie } from "@/data/seed/categories"
import { produitsSeed, type Produit } from "@/data/seed/produits"
import { declinaisonsSeed, type Declinaison } from "@/data/seed/declinaisons"
import {
  commandesSeed,
  lignesCommandeSeed,
  type Commande,
  type LigneCommande,
} from "@/data/seed/commandes"

/**
 * The app-root in-memory store (CLAUDE.md → Data layer).
 *
 * - Seeded once from `src/data/seed/*` — screens never import the seed directly.
 * - Every entity exposes the same trio: add<Entity> / update<Entity> / remove<Entity>.
 * - New rows get `crypto.randomUUID()`; seed rows keep their slug ids.
 * - Derived values (counts, "X/Y", rates) are computed in render, never stored.
 * - In memory only: a refresh resets everything.
 *
 * To add an entity: (1) add its shape to docs/data-plan.md, (2) create
 * `seed/<entity>.ts` with its type + seed, (3) add a useState slice and the
 * add/update/remove trio below, (4) expose them on DataContextValue.
 *
 * Perf note: any setState here re-renders every useData() consumer. Never write
 * to the store on every frame of a drag/scroll — keep that in local state and
 * commit once when the gesture ends.
 */

type Patch<T> = Partial<Omit<T, "id">>

export type DataContextValue = {
  // ── Catégories (seed-only for now — no category screen yet) ──
  categories: Categorie[]

  // ── Produits ──
  produits: Produit[]
  addProduit: (produit: Omit<Produit, "id">) => string
  updateProduit: (id: string, patch: Patch<Produit>) => void
  /** Cascade: removing a produit also removes its déclinaisons. */
  removeProduit: (id: string) => void

  // ── Déclinaisons (child of Produit) ──
  declinaisons: Declinaison[]
  addDeclinaison: (declinaison: Omit<Declinaison, "id">) => string
  updateDeclinaison: (id: string, patch: Patch<Declinaison>) => void
  removeDeclinaison: (id: string) => void

  // ── Commandes ──
  commandes: Commande[]
  addCommande: (commande: Omit<Commande, "id">) => string
  updateCommande: (id: string, patch: Patch<Commande>) => void
  /** Cascade: removing a commande also removes its lignes. */
  removeCommande: (id: string) => void

  // ── Lignes de commande (child of Commande) ──
  lignesCommande: LigneCommande[]
  addLigneCommande: (ligne: Omit<LigneCommande, "id">) => string
  updateLigneCommande: (id: string, patch: Patch<LigneCommande>) => void
  removeLigneCommande: (id: string) => void

  // ── Panier (client-side cart — session state, not persisted) ──
  panier: ArticlePanier[]
  addAuPanier: (article: Omit<ArticlePanier, "id">) => string
  updateArticlePanier: (id: string, patch: Patch<ArticlePanier>) => void
  removeArticlePanier: (id: string) => void
  viderPanier: () => void
}

/** Un article du panier côté boutique (produit + variante choisie + quantité). */
export type ArticlePanier = {
  id: string
  produitId: string
  /** Nom affiché (peut inclure la variante, ex. « Capuche alloucha — Gris / S »). */
  nom: string
  /** Prix unitaire TTC figé (prix soldé du produit). */
  prixUnitaire: number
  quantite: number
  /** Valeur de la 1re option (couleur), si le produit en a. */
  couleur: string
  /** Valeur de la 2e option (taille), si le produit en a. */
  taille: string
  /** Première image du produit, pour la vignette du panier. */
  image: string
}

export const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [categories] = useState<Categorie[]>(categoriesSeed)
  const [produits, setProduits] = useState<Produit[]>(produitsSeed)
  const [declinaisons, setDeclinaisons] = useState<Declinaison[]>(declinaisonsSeed)
  const [commandes, setCommandes] = useState<Commande[]>(commandesSeed)
  const [lignesCommande, setLignesCommande] = useState<LigneCommande[]>(lignesCommandeSeed)
  const [panier, setPanier] = useState<ArticlePanier[]>([])

  const value = useMemo<DataContextValue>(
    () => ({
      categories,

      produits,
      addProduit: (produit) => {
        const id = crypto.randomUUID()
        setProduits((list) => [{ id, ...produit }, ...list])
        return id
      },
      updateProduit: (id, patch) =>
        setProduits((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      removeProduit: (id) => {
        setProduits((list) => list.filter((p) => p.id !== id))
        setDeclinaisons((list) => list.filter((d) => d.produitId !== id))
      },

      declinaisons,
      addDeclinaison: (declinaison) => {
        const id = crypto.randomUUID()
        setDeclinaisons((list) => [...list, { id, ...declinaison }])
        return id
      },
      updateDeclinaison: (id, patch) =>
        setDeclinaisons((list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d))),
      removeDeclinaison: (id) => setDeclinaisons((list) => list.filter((d) => d.id !== id)),

      commandes,
      addCommande: (commande) => {
        const id = crypto.randomUUID()
        setCommandes((list) => [{ id, ...commande }, ...list])
        return id
      },
      updateCommande: (id, patch) =>
        setCommandes((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      removeCommande: (id) => {
        setCommandes((list) => list.filter((c) => c.id !== id))
        setLignesCommande((list) => list.filter((l) => l.commandeId !== id))
      },

      lignesCommande,
      addLigneCommande: (ligne) => {
        const id = crypto.randomUUID()
        setLignesCommande((list) => [...list, { id, ...ligne }])
        return id
      },
      updateLigneCommande: (id, patch) =>
        setLignesCommande((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l))),
      removeLigneCommande: (id) =>
        setLignesCommande((list) => list.filter((l) => l.id !== id)),

      panier,
      addAuPanier: (article) => {
        const id = crypto.randomUUID()
        setPanier((list) => {
          // Same product + same variant → bump the quantity instead of a dupe row.
          const existant = list.find(
            (a) => a.produitId === article.produitId && a.couleur === article.couleur && a.taille === article.taille,
          )
          if (existant) {
            return list.map((a) =>
              a.id === existant.id ? { ...a, quantite: a.quantite + article.quantite } : a,
            )
          }
          return [...list, { id, ...article }]
        })
        return id
      },
      updateArticlePanier: (id, patch) =>
        setPanier((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a))),
      removeArticlePanier: (id) => setPanier((list) => list.filter((a) => a.id !== id)),
      viderPanier: () => setPanier([]),
    }),
    [categories, produits, declinaisons, commandes, lignesCommande, panier],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
