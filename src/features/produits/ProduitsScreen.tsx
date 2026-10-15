import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutGrid, LayoutList, Pencil, Plus, Search, SearchX, Shirt, Trash2 } from "lucide-react"

import { useData } from "@/data/useData"
import type { Produit } from "@/data/seed/produits"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { Switch } from "@/components/kit/Switch"
import { Segmented, Stat } from "@/components/kit/Primitives"
import { Toast, useToast } from "@/components/kit/Toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProduitThumb } from "@/features/produits/ProduitThumb"
import { PrixProduit } from "@/features/produits/PrixProduit"
import { STOCK_BADGE, stockStatut, stockTotal } from "@/features/produits/produit"

type FiltreStatut = "tous" | "actifs" | "inactifs"
type VueMode = "table" | "grille"
const TOUTES = "toutes"
const VUE_CLE = "dm-produits-vue"

/** Remembered view mode (per-viewer convenience; falls back to table). */
function lireVue(): VueMode {
  try {
    return localStorage.getItem(VUE_CLE) === "grille" ? "grille" : "table"
  } catch {
    return "table"
  }
}

/**
 * Admin › Produits — the catalogue. One primary action (Nouveau produit),
 * derived stats, search + category + status filters, then a table on desktop
 * and a card list on phones. The Statut switch toggles a product in place.
 */
export function ProduitsScreen() {
  const { produits, categories, declinaisons, updateProduit, removeProduit } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, notify } = useToast()
  const [recherche, setRecherche] = useState("")
  const [categorie, setCategorie] = useState(TOUTES)
  const [statut, setStatut] = useState<FiltreStatut>("tous")
  const [vue, setVue] = useState<VueMode>(lireVue)
  const [aSupprimer, setASupprimer] = useState<Produit | null>(null)

  const changerVue = (v: VueMode) => {
    setVue(v)
    try {
      localStorage.setItem(VUE_CLE, v)
    } catch {
      /* private mode / blocked storage — view just won't persist */
    }
  }

  // Toast handed over by the product page ("Produit supprimé"), shown once.
  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast
    if (msg) {
      notify(msg)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derived in render — never stored.
  const nomCategorie = (id: string) => categories.find((c) => c.id === id)?.nom ?? "Sans catégorie"
  const lignes = produits.map((p) => {
    const stock = stockTotal(p, declinaisons)
    return { p, stock, etat: stockStatut(stock, p) }
  })
  const q = recherche.trim().toLowerCase()
  const visibles = lignes.filter(
    ({ p }) =>
      (statut === "tous" || (statut === "actifs" ? p.actif : !p.actif)) &&
      (categorie === TOUTES || p.categorieId === categorie) &&
      (!q || p.nom.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q)),
  )
  const actifs = produits.filter((p) => p.actif).length
  const faibles = lignes.filter((l) => l.etat === "faible").length
  const ruptures = lignes.filter((l) => l.etat === "rupture").length
  const filtre = q !== "" || categorie !== TOUTES || statut !== "tous"

  const toggle = (p: Produit, actif: boolean) => {
    updateProduit(p.id, { actif })
    notify(actif ? `« ${p.nom} » activé` : `« ${p.nom} » désactivé`)
  }
  const effacer = () => {
    setRecherche("")
    setCategorie(TOUTES)
    setStatut("tous")
  }

  const nouveau = (
    <Button asChild>
      <Link to="/admin/produits/nouveau">
        <Plus className="size-4" />
        Nouveau produit
      </Link>
    </Button>
  )

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <PageHeader
        title="Produits"
        subtitle={
          produits.length
            ? `${produits.length} produit${produits.length > 1 ? "s" : ""} au catalogue`
            : "Le catalogue de la boutique."
        }
        actions={produits.length ? nouveau : null}
      />

      {produits.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={Shirt}
            title="Le catalogue est vide"
            description="Ajoutez un premier produit : il apparaîtra ici et sur le tableau de bord."
            action={nouveau}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Produits" value={produits.length} />
            <Stat label="Actifs" value={`${actifs}/${produits.length}`} />
            <Stat label="Stock faible" value={faibles} />
            <Stat label="Rupture" value={ruptures} tone={ruptures ? "negative" : undefined} />
          </div>

          {/* Toolbar: search · category · status */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher par nom ou référence"
                aria-label="Rechercher un produit"
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Select value={categorie} onValueChange={setCategorie}>
                <SelectTrigger className="h-9 py-0 sm:w-52" aria-label="Filtrer par catégorie">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TOUTES}>Toutes les catégories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Segmented
                value={statut}
                onChange={setStatut}
                options={[
                  { value: "tous", label: "Tous", badge: produits.length },
                  { value: "actifs", label: "Actifs", badge: actifs },
                  { value: "inactifs", label: "Inactifs", badge: produits.length - actifs },
                ]}
              />
              {/* View switcher — table / grid (desktop only; phones stay a card list) */}
              <div className="hidden items-center gap-1 rounded-md border border-border p-1 md:inline-flex">
                <button
                  type="button"
                  onClick={() => changerVue("table")}
                  aria-label="Vue tableau"
                  aria-pressed={vue === "table"}
                  className={`flex size-7 items-center justify-center rounded transition-colors ${
                    vue === "table" ? "bg-surface-nested text-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <LayoutList className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => changerVue("grille")}
                  aria-label="Vue grille"
                  aria-pressed={vue === "grille"}
                  className={`flex size-7 items-center justify-center rounded transition-colors ${
                    vue === "grille" ? "bg-surface-nested text-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {visibles.length === 0 ? (
            <div className="rounded-lg border border-border">
              <EmptyState
                icon={SearchX}
                title="Aucun produit ne correspond"
                description={q ? `Rien pour « ${recherche.trim()} » avec ces filtres.` : "Aucun produit avec ces filtres."}
                action={
                  <Button variant="outline" onClick={effacer}>
                    Effacer les filtres
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop: table */}
              <div className={`${vue === "table" ? "hidden md:block" : "hidden"} overflow-x-auto rounded-lg border border-border`}>
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {["Produit", "Référence", "Prix", "Stock", "Statut", ""].map((h, i) => (
                        <th
                          key={h || i}
                          className={`px-4 py-3 font-ui text-[0.6875rem] font-medium tracking-[0.12em] text-ink-muted uppercase ${i === 5 ? "w-24" : ""}`}
                        >
                          {h ? h : <span className="sr-only">Actions</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map(({ p, stock, etat }) => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/admin/produits/${p.id}`)}
                        className="group cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface"
                      >
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <ProduitThumb image={p.images[0] ?? ""} nom={p.nom} />
                            <div className="flex min-w-0 flex-col">
                              <Link
                                to={`/admin/produits/${p.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="truncate font-ui text-sm font-medium text-ink transition-colors group-hover:text-brand-blue-600"
                              >
                                {p.nom}
                              </Link>
                              <span className="truncate font-body text-xs text-ink-muted">
                                {nomCategorie(p.categorieId)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[0.8125rem] text-ink-muted">
                          {p.reference || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <PrixProduit produit={p} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 font-ui text-sm text-ink tabular-nums">{stock}</span>
                            <Badge variant={STOCK_BADGE[etat].variant}>{STOCK_BADGE[etat].label}</Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Switch
                              checked={p.actif}
                              onChange={(v) => toggle(p, v)}
                              label={p.actif ? `Désactiver ${p.nom}` : `Activer ${p.nom}`}
                            />
                            <span className="font-body text-xs text-ink-muted">{p.actif ? "Actif" : "Inactif"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="icon-sm" aria-label={`Modifier ${p.nom}`}>
                              <Link to={`/admin/produits/${p.id}`} onClick={(e) => e.stopPropagation()}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Supprimer ${p.nom}`}
                              className="text-ink-muted hover:text-danger"
                              onClick={(e) => {
                                e.stopPropagation()
                                setASupprimer(p)
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Desktop: grid */}
              {vue === "grille" ? (
                <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {visibles.map(({ p, stock, etat }) => (
                    <div
                      key={p.id}
                      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-border-strong"
                    >
                      <Link to={`/admin/produits/${p.id}`} className="block">
                        <ProduitThumb image={p.images[0] ?? ""} nom={p.nom} size="xl" className="rounded-none border-0" />
                      </Link>
                      <div className="flex flex-1 flex-col gap-2 p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-col">
                            <Link
                              to={`/admin/produits/${p.id}`}
                              className="truncate font-ui text-sm font-medium text-ink transition-colors group-hover:text-brand-blue-600"
                            >
                              {p.nom}
                            </Link>
                            <span className="truncate font-body text-xs text-ink-muted">
                              <span className="font-mono">{p.reference || "—"}</span> · {nomCategorie(p.categorieId)}
                            </span>
                          </div>
                          <Badge variant={STOCK_BADGE[etat].variant}>{stock}</Badge>
                        </div>
                        <PrixProduit produit={p} />
                        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={p.actif}
                              onChange={(v) => toggle(p, v)}
                              label={p.actif ? `Désactiver ${p.nom}` : `Activer ${p.nom}`}
                            />
                            <span className="font-body text-xs text-ink-muted">{p.actif ? "Actif" : "Inactif"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button asChild variant="ghost" size="icon-sm" aria-label={`Modifier ${p.nom}`}>
                              <Link to={`/admin/produits/${p.id}`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Supprimer ${p.nom}`}
                              className="text-ink-muted hover:text-danger"
                              onClick={() => setASupprimer(p)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Phone: card list */}
              <ul className="flex flex-col gap-3 md:hidden">
                {visibles.map(({ p, stock, etat }) => (
                  <li key={p.id} className="overflow-hidden rounded-lg border border-border">
                    <Link to={`/admin/produits/${p.id}`} className="flex items-center gap-3 p-3 active:bg-surface">
                      <ProduitThumb image={p.images[0] ?? ""} nom={p.nom} size="lg" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="truncate font-ui text-sm font-medium text-ink">{p.nom}</span>
                        <span className="truncate font-body text-xs text-ink-muted">
                          <span className="font-mono">{p.reference || "—"}</span> · {nomCategorie(p.categorieId)}
                        </span>
                        <PrixProduit produit={p} />
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
                      <Badge variant={STOCK_BADGE[etat].variant}>
                        {stock} · {STOCK_BADGE[etat].label}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={p.actif}
                          onChange={(v) => toggle(p, v)}
                          label={p.actif ? `Désactiver ${p.nom}` : `Activer ${p.nom}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Supprimer ${p.nom}`}
                          className="ml-1 text-ink-muted hover:text-danger"
                          onClick={() => setASupprimer(p)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {filtre ? (
                <p className="font-body text-xs text-ink-muted">
                  {visibles.length} sur {produits.length} produits ·{" "}
                  <button type="button" onClick={effacer} className="text-brand-blue-600 hover:underline">
                    Effacer les filtres
                  </button>
                </p>
              ) : null}
            </>
          )}
        </>
      )}


      <ConfirmDialog
        open={aSupprimer !== null}
        onOpenChange={(o) => !o && setASupprimer(null)}
        title={`Supprimer « ${aSupprimer?.nom ?? ""} » ?`}
        description="Le produit et ses déclinaisons seront retirés du catalogue."
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (!aSupprimer) return
          removeProduit(aSupprimer.id)
          notify("Produit supprimé")
          setASupprimer(null)
        }}
      />
      <Toast toast={toast} />
    </div>
  )
}
