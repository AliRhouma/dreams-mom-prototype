import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Package, ReceiptEuro, Shirt } from "lucide-react"

import { useData } from "@/data/useData"
import { PageHeader } from "@/components/kit/PageHeader"
import { LinkBtn, Panel, Stat } from "@/components/kit/Primitives"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { Price } from "@/components/kit/Price"
import { Button } from "@/components/ui/button"
import { ProduitThumb } from "@/features/produits/ProduitThumb"
import { PrixProduit } from "@/features/produits/PrixProduit"
import { STOCK_BADGE, stockStatut, stockTotal } from "@/features/produits/produit"
import { labelStatut, lignesDe, STATUT_BADGE, totalCommande } from "@/features/commandes/commande"

/** Unit after a number — 0.75em, muted (design system: numbers). */
function Unit({ children }: { children: string }) {
  return <span className="ml-1 text-[0.75em] text-ink-muted">{children}</span>
}

/**
 * Admin dashboard. Products come from the store; sales, orders and clients
 * have no entity yet, so they stay at zero with their empty state.
 */
export function AdminDashboardScreen() {
  const { produits, declinaisons, categories, commandes, lignesCommande } = useData()
  const navigate = useNavigate()

  // Derived in render.
  const lignes = produits.map((p) => {
    const stock = stockTotal(p, declinaisons)
    return { p, stock, etat: stockStatut(stock, p) }
  })
  const alertes = lignes.filter((l) => l.etat === "faible" || l.etat === "rupture").length
  const recents = lignes.slice(0, 5)
  const nomCategorie = (id: string) => categories.find((c) => c.id === id)?.nom ?? "Sans catégorie"

  // Commandes — dérivé du store.
  const aTraiter = commandes.filter((c) => c.statut === "en-attente").length
  const caLivre = commandes
    .filter((c) => c.statut === "livree")
    .reduce((n, c) => n + totalCommande(c, lignesDe(c.id, lignesCommande)), 0)
  const commandesRecentes = commandes.slice(0, 5).map((c) => ({
    c,
    total: totalCommande(c, lignesDe(c.id, lignesCommande)),
  }))

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={
          commandes.length
            ? "Vue d’ensemble de la boutique — commandes à suivre et catalogue."
            : produits.length
              ? "Votre catalogue est en place. Les ventes apparaîtront dès les premières commandes."
              : "Votre boutique est prête. Commencez par ajouter des produits."
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="CA livré" value={<>{caLivre.toLocaleString("fr-FR")}<Unit>DT</Unit></>} />
        <Stat
          label="Commandes"
          value={commandes.length}
          delta={aTraiter ? `${aTraiter} à traiter` : commandes.length ? "Rien en attente" : undefined}
          dtone={aTraiter ? "down" : commandes.length ? "up" : undefined}
        />
        <Stat
          label="Produits"
          value={produits.length}
          delta={alertes ? `${alertes} en stock faible ou rupture` : produits.length ? "Stock en ordre" : undefined}
          dtone={alertes ? "down" : produits.length ? "up" : undefined}
        />
        <Stat label="Catégories" value={categories.length} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Panel
          title="Commandes récentes"
          action={
            commandes.length ? (
              <LinkBtn onClick={() => navigate("/admin/commandes")}>
                Voir tout
                <ArrowRight className="size-3.5" />
              </LinkBtn>
            ) : null
          }
        >
          {commandes.length === 0 ? (
            <EmptyState
              icon={ReceiptEuro}
              title="Aucune commande pour l’instant"
              description="Les commandes passées en boutique et en ligne apparaîtront ici."
              action={<Button onClick={() => navigate("/admin/commandes/nouvelle")}>Nouvelle commande</Button>}
            />
          ) : (
            <ul className="-my-2 flex flex-col">
              {commandesRecentes.map(({ c, total }) => (
                <li key={c.id} className="border-b border-border last:border-b-0">
                  <Link
                    to={`/admin/commandes/${c.id}`}
                    className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-nested text-ink-muted">
                      <Package className="size-5" strokeWidth={1.5} />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-ui text-sm font-medium text-ink transition-colors group-hover:text-brand-blue-600">
                        {c.client}
                      </span>
                      <span className="truncate font-body text-xs text-ink-muted">
                        <span className="font-mono">#{c.numero}</span> · {c.gouvernorat}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Price value={total} size="sm" />
                      <Badge variant={STATUT_BADGE[c.statut]}>{labelStatut(c.statut)}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Catalogue"
          action={
            produits.length ? (
              <LinkBtn onClick={() => navigate("/admin/produits")}>
                Voir tout
                <ArrowRight className="size-3.5" />
              </LinkBtn>
            ) : null
          }
        >
          {produits.length === 0 ? (
            <EmptyState
              icon={Shirt}
              title="Le catalogue est vide"
              description="Les produits ajoutés à la collection apparaîtront ici."
              action={<Button onClick={() => navigate("/admin/produits/nouveau")}>Ajouter un produit</Button>}
            />
          ) : (
            <ul className="-my-2 flex flex-col">
              {recents.map(({ p, stock, etat }) => (
                <li key={p.id} className="border-b border-border last:border-b-0">
                  <Link
                    to={`/admin/produits/${p.id}`}
                    className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface"
                  >
                    <ProduitThumb image={p.images[0] ?? ""} nom={p.nom} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-ui text-sm font-medium text-ink transition-colors group-hover:text-brand-blue-600">
                        {p.nom}
                      </span>
                      <span className="truncate font-body text-xs text-ink-muted">
                        <span className="font-mono">{p.reference || "—"}</span> · {nomCategorie(p.categorieId)}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <PrixProduit produit={p} />
                      <Badge variant={STOCK_BADGE[etat].variant}>{stock} pcs</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
