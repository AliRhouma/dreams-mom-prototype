import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { MessageCircle, Package, Phone, Plus, Search, SearchX, Trash2 } from "lucide-react"

import { useData } from "@/data/useData"
import type { Commande, StatutCommande } from "@/data/seed/commandes"
import { SOURCES_COMMANDE, STATUTS_COMMANDE } from "@/data/seed/commandes"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { Price } from "@/components/kit/Price"
import { Stat } from "@/components/kit/Primitives"
import { Toast, useToast } from "@/components/kit/Toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProduitThumb } from "@/features/produits/ProduitThumb"
import {
  labelSource,
  labelStatut,
  lignesDe,
  nbArticles,
  STATUT_BADGE,
  totalCommande,
} from "@/features/commandes/commande"

type OngletStatut = "toutes" | StatutCommande
const TOUTES = "toutes" as const
const SOURCE_TOUTES = "all"

/**
 * Admin › Commandes — le suivi des commandes. Des onglets de statut (comme la
 * boutique) rythment la page : chaque onglet = une étape du cycle de vie, avec
 * son compteur. Stats utiles, recherche + source, puis un tableau (desktop) ou
 * une liste de cartes (mobile). Le statut se change en ligne, sans ouvrir la
 * commande. Références : ProduitsScreen (tableau/cartes) et AdminDashboard (stats).
 */
export function CommandesScreen() {
  const { commandes, lignesCommande, updateCommande, removeCommande } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, notify } = useToast()
  const [onglet, setOnglet] = useState<OngletStatut>(TOUTES)
  const [recherche, setRecherche] = useState("")
  const [source, setSource] = useState<string>(SOURCE_TOUTES)
  const [aSupprimer, setASupprimer] = useState<Commande | null>(null)

  // Toast remis par la page de détail ("Commande supprimée"), affiché une fois.
  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast
    if (msg) {
      notify(msg)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Valeurs dérivées — calculées au rendu, jamais stockées.
  const avecTotal = useMemo(
    () =>
      commandes.map((c) => {
        const lignes = lignesDe(c.id, lignesCommande)
        return { c, lignes, total: totalCommande(c, lignes), articles: nbArticles(lignes) }
      }),
    [commandes, lignesCommande],
  )

  const parStatut = (s: StatutCommande) => commandes.filter((c) => c.statut === s).length
  const q = recherche.trim().toLowerCase()
  const visibles = avecTotal.filter(
    ({ c }) =>
      (onglet === TOUTES || c.statut === onglet) &&
      (source === SOURCE_TOUTES || c.source === source) &&
      (!q ||
        c.client.toLowerCase().includes(q) ||
        c.telephone.includes(q) ||
        String(c.numero).includes(q) ||
        c.gouvernorat.toLowerCase().includes(q)),
  )

  // Stats "suivi" : total, CA livré, à traiter (en attente), taux de livraison.
  const livrees = commandes.filter((c) => c.statut === "livree")
  const caLivre = avecTotal
    .filter(({ c }) => c.statut === "livree")
    .reduce((n, { total }) => n + total, 0)
  const aTraiter = parStatut("en-attente")
  const expediables = commandes.filter((c) =>
    ["expediee", "livree", "retour-non-recue", "retour-recue"].includes(c.statut),
  ).length
  const tauxLivraison = expediables ? Math.round((livrees.length / expediables) * 100) : 0

  const filtre = q !== "" || source !== SOURCE_TOUTES || onglet !== TOUTES

  const changerStatut = (c: Commande, statut: StatutCommande) => {
    updateCommande(c.id, { statut })
    notify(`Commande #${c.numero} → ${labelStatut(statut)}`)
  }
  const effacer = () => {
    setRecherche("")
    setSource(SOURCE_TOUTES)
    setOnglet(TOUTES)
  }

  const nouvelle = (
    <Button asChild>
      <Link to="/admin/commandes/nouvelle">
        <Plus className="size-4" />
        Nouvelle commande
      </Link>
    </Button>
  )

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <PageHeader
        title="Commandes"
        subtitle={
          commandes.length
            ? `${commandes.length} commande${commandes.length > 1 ? "s" : ""} · suivi du cycle de vie`
            : "Les commandes de la boutique."
        }
        actions={commandes.length ? nouvelle : null}
      />

      {commandes.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={Package}
            title="Aucune commande"
            description="Les nouvelles commandes apparaîtront ici, prêtes à être suivies étape par étape."
            action={nouvelle}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Commandes" value={commandes.length} />
            <Stat
              label="CA livré"
              value={
                <>
                  {caLivre.toLocaleString("fr-FR")}
                  <span className="ml-1 text-[0.6em] text-ink-muted">DT</span>
                </>
              }
            />
            <Stat label="À traiter" value={aTraiter} tone={aTraiter ? "negative" : undefined} />
            <Stat
              label="Taux de livraison"
              value={
                <>
                  {tauxLivraison}
                  <span className="ml-0.5 text-[0.6em] text-ink-muted">%</span>
                </>
              }
            />
          </div>

          {/* Onglets de statut — une étape par onglet, avec son compteur. */}
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex min-w-max gap-1.5">
              <OngletBtn
                active={onglet === TOUTES}
                onClick={() => setOnglet(TOUTES)}
                label="Toutes"
                count={commandes.length}
              />
              {STATUTS_COMMANDE.map((s) => (
                <OngletBtn
                  key={s.value}
                  active={onglet === s.value}
                  onClick={() => setOnglet(s.value)}
                  label={s.label}
                  count={parStatut(s.value)}
                />
              ))}
            </div>
          </div>

          {/* Recherche · source */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher (client, téléphone, n°, ville…)"
                aria-label="Rechercher une commande"
                className="pl-9"
              />
            </div>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-9 py-0 lg:w-52" aria-label="Filtrer par source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SOURCE_TOUTES}>Toutes les sources</SelectItem>
                {SOURCES_COMMANDE.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {visibles.length === 0 ? (
            <div className="rounded-lg border border-border">
              <EmptyState
                icon={SearchX}
                title="Aucune commande ne correspond"
                description={
                  onglet !== TOUTES
                    ? `Aucune commande « ${labelStatut(onglet as StatutCommande)} » avec ces filtres.`
                    : "Aucune commande avec ces filtres."
                }
                action={
                  filtre ? (
                    <Button variant="outline" onClick={effacer}>
                      Effacer les filtres
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop : tableau */}
              <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {["Réf. / Client", "Contact", "Source / Statut", "Localisation", "Montant", "Produits", ""].map(
                        (h, i) => (
                          <th
                            key={h || i}
                            className={`px-4 py-3 font-ui text-[0.6875rem] font-medium tracking-[0.12em] text-ink-muted uppercase ${
                              i === 6 ? "w-12" : ""
                            }`}
                          >
                            {h ? h : <span className="sr-only">Actions</span>}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visibles.map(({ c, lignes, total, articles }) => (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/admin/commandes/${c.id}`)}
                        className="group cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface"
                      >
                        {/* Réf / Client */}
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 flex-col">
                            <Link
                              to={`/admin/commandes/${c.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="truncate font-ui text-sm font-medium text-ink transition-colors group-hover:text-brand-blue-600"
                            >
                              {c.client}
                            </Link>
                            <span className="font-mono text-xs text-ink-muted">#{c.numero}</span>
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[0.8125rem] text-ink-subtle">{c.telephone}</span>
                            <CanalChip canal={c.canalContact} />
                          </div>
                        </td>
                        {/* Source / Statut */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-ui text-[0.7rem] font-medium tracking-[0.08em] text-ink-muted uppercase">
                              {labelSource(c.source)}
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <StatutSelect value={c.statut} onChange={(s) => changerStatut(c, s)} />
                            </div>
                          </div>
                        </td>
                        {/* Localisation */}
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-ui text-sm text-ink">{c.gouvernorat}</span>
                            <span className="max-w-[16rem] truncate font-body text-xs text-ink-muted">
                              {c.adresse}
                            </span>
                          </div>
                        </td>
                        {/* Montant */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            <Price value={total} size="sm" />
                            <span className="font-body text-xs text-ink-muted">
                              {articles} article{articles > 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        {/* Produits (vignettes) */}
                        <td className="px-4 py-3">
                          <Vignettes lignes={lignes} />
                        </td>
                        {/* Action */}
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Supprimer la commande #${c.numero}`}
                            className="text-ink-muted hover:text-danger"
                            onClick={(e) => {
                              e.stopPropagation()
                              setASupprimer(c)
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablette : liste de cartes */}
              <ul className="flex flex-col gap-3 lg:hidden">
                {visibles.map(({ c, lignes, total, articles }) => (
                  <li key={c.id} className="overflow-hidden rounded-lg border border-border">
                    <Link
                      to={`/admin/commandes/${c.id}`}
                      className="group flex flex-col gap-3 p-4 transition-colors hover:bg-surface"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-ui text-sm font-medium text-ink transition-colors group-hover:text-brand-blue-600">
                            {c.client}
                          </span>
                          <span className="font-mono text-xs text-ink-muted">#{c.numero}</span>
                        </div>
                        <Badge variant={STATUT_BADGE[c.statut]}>{labelStatut(c.statut)}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-col">
                          <span className="font-mono text-[0.8125rem] text-ink-subtle">{c.telephone}</span>
                          <span className="truncate font-body text-xs text-ink-muted">
                            {c.gouvernorat} · {labelSource(c.source)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Vignettes lignes={lignes} />
                          <div className="flex flex-col items-end gap-0.5">
                            <Price value={total} size="sm" />
                            <span className="font-body text-xs text-ink-muted">
                              {articles} art.
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    {/* Changer le statut sans ouvrir la commande */}
                    <div className="flex items-center gap-2 border-t border-border bg-surface/60 px-4 py-2.5">
                      <span className="font-ui text-[0.7rem] font-medium tracking-[0.08em] text-ink-muted uppercase">
                        Statut
                      </span>
                      <StatutSelect value={c.statut} onChange={(s) => changerStatut(c, s)} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={aSupprimer !== null}
        onOpenChange={(o) => !o && setASupprimer(null)}
        title={`Supprimer la commande #${aSupprimer?.numero} ?`}
        description="Cette commande et ses lignes seront retirées. Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (aSupprimer) {
            removeCommande(aSupprimer.id)
            notify(`Commande #${aSupprimer.numero} supprimée`)
            setASupprimer(null)
          }
        }}
      />

      <Toast toast={toast} />
    </div>
  )
}

/* ── Onglet de statut : libellé + compteur, actif en bleu de marque ─────── */
function OngletBtn({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex shrink-0 items-center gap-2 rounded-md border px-3.5 py-2 font-ui text-[0.8125rem] font-medium transition-colors " +
        (active
          ? "border-brand-blue-600 bg-brand-blue-50 text-brand-blue-600"
          : "border-border text-ink-muted hover:border-border-strong hover:text-ink")
      }
    >
      {label}
      <span
        className={
          "rounded-full px-1.5 py-px font-ui text-[0.68rem] tabular-nums " +
          (active ? "bg-brand-blue-600 text-ink-inverted" : "bg-surface-nested text-ink-muted")
        }
      >
        {count}
      </span>
    </button>
  )
}

/* ── Puce de canal de contact (WhatsApp vert / Dispo neutre) ────────────── */
function CanalChip({ canal }: { canal: "whatsapp" | "dispo" }) {
  if (canal === "whatsapp") {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-md border border-success/25 bg-success/10 px-1.5 py-0.5 font-ui text-[0.68rem] font-medium text-success">
        <MessageCircle className="size-3" />
        WhatsApp
      </span>
    )
  }
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border-strong px-1.5 py-0.5 font-ui text-[0.68rem] font-medium text-ink-muted">
      <Phone className="size-3" />
      Dispo
    </span>
  )
}

/* ── Vignettes produits (3 max + « +N ») ────────────────────────────────── */
function Vignettes({ lignes }: { lignes: { id: string; produitId: string; nom: string }[] }) {
  const { produits } = useData()
  const imgDe = (produitId: string) => produits.find((p) => p.id === produitId)?.images[0] ?? ""
  const visibles = lignes.slice(0, 3)
  const reste = lignes.length - visibles.length
  if (lignes.length === 0) {
    return <span className="font-body text-xs text-ink-disabled">—</span>
  }
  return (
    <div className="flex items-center -space-x-2">
      {visibles.map((l) => (
        <ProduitThumb
          key={l.id}
          image={imgDe(l.produitId)}
          nom={l.nom}
          className="size-9 rounded-md ring-2 ring-background"
        />
      ))}
      {reste > 0 ? (
        <span className="flex size-9 items-center justify-center rounded-md bg-surface-nested font-ui text-[0.7rem] text-ink-muted ring-2 ring-background tabular-nums">
          +{reste}
        </span>
      ) : null}
    </div>
  )
}

/* ── Select de statut en ligne (change l'étape sans ouvrir la commande) ─── */
function StatutSelect({
  value,
  onChange,
}: {
  value: StatutCommande
  onChange: (statut: StatutCommande) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as StatutCommande)}>
      <SelectTrigger
        aria-label="Changer le statut"
        className="h-8 w-fit gap-1.5 py-0 pr-2 pl-2.5 font-ui text-[0.78rem]"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUTS_COMMANDE.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
