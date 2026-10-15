import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Eye, PackageSearch, Trash2 } from "lucide-react"

import { useData } from "@/data/useData"
import type { Produit, RemiseType } from "@/data/seed/produits"
import { BackButton } from "@/components/kit/BackButton"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { Field, ToggleRow } from "@/components/kit/Field"
import { Price } from "@/components/kit/Price"
import { Switch } from "@/components/kit/Switch"
import { RichTextEditor } from "@/components/kit/RichTextEditor"
import { NumInput, Panel, Segmented } from "@/components/kit/Primitives"
import { Toast, useToast } from "@/components/kit/Toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDT } from "@/lib/format"
import { ProduitThumb } from "@/features/produits/ProduitThumb"
import { ImagesEditor } from "@/features/produits/ImagesEditor"
import { TagsPicker } from "@/features/produits/TagsPicker"
import { PaliersEditor } from "@/features/produits/PaliersEditor"
import { DeclinaisonsEditor } from "@/features/produits/DeclinaisonsEditor"
import {
  nouvelleLigne,
  prixFinal,
  produitVide,
  sansId,
  STOCK_BADGE,
  stockStatut,
  textePalier,
  type LigneDecl,
} from "@/features/produits/produit"

type Fiche = Omit<Produit, "id">

/** Admin › Produits › Nouveau produit — the full creation page. */
export function NouveauProduitScreen() {
  return <ProduitEditor key="nouveau" />
}

/**
 * Admin › Produits › fiche produit. Route wrapper: resolves the id, shows the
 * not-found state, and remounts the editor per product so its draft resets.
 */
export function ProduitScreen() {
  const { produitId } = useParams()
  const navigate = useNavigate()
  const { produits } = useData()
  const produit = produits.find((p) => p.id === produitId)

  if (!produit) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackButton to="/admin/produits" label="Produits" />
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={PackageSearch}
            title="Produit introuvable"
            description="Il a peut-être été supprimé."
            action={<Button onClick={() => navigate("/admin/produits")}>Retour aux produits</Button>}
          />
        </div>
      </div>
    )
  }
  return <ProduitEditor key={produit.id} produit={produit} />
}

/** Panel subtitle line, like TikTak's "Gérez la visibilité de votre produit". */
function Aide({ children }: { children: React.ReactNode }) {
  return <p className="-mt-1 mb-4 font-body text-sm text-ink-muted">{children}</p>
}

/**
 * Create AND edit, on one page (Shopify-style) instead of TikTak's five tabs,
 * so nothing is hidden behind a tab. Left column follows TikTak's order —
 * informations, catégories, tarification, images, stock; the right column
 * keeps a live preview and the visibility switches in view (sticky on desktop).
 * Edits stay in a local draft committed by one button: in edit mode a save bar
 * appears only when something changed; in create mode it is always there.
 */
function ProduitEditor({ produit }: { produit?: Produit }) {
  const {
    categories,
    produits,
    declinaisons,
    addProduit,
    updateProduit,
    removeProduit,
    addDeclinaison,
    updateDeclinaison,
    removeDeclinaison,
  } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, notify } = useToast()
  const creation = !produit
  const id = produit?.id ?? ""

  const enregistre: Fiche = produit ? sansId(produit) : produitVide("")
  const declsEnregistrees: LigneDecl[] = declinaisons
    .filter((d) => d.produitId === id)
    .map((d) => ({ id: d.id, valeurs: d.valeurs, stock: d.stock }))

  const [fiche, setFiche] = useState<Fiche>(enregistre)
  const [decls, setDecls] = useState<LigneDecl[]>(declsEnregistrees)
  const [descKey, setDescKey] = useState(0) // remounts the rich-text editor on "Annuler"
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const [tente, setTente] = useState(false) // create mode: show errors only after a first try
  const haut = useRef<HTMLDivElement>(null)

  // Toast handed over by the creation page ("Produit créé"), shown once.
  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast
    if (msg) {
      notify(msg)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = <K extends keyof Fiche>(key: K, value: Fiche[K]) => setFiche((f) => ({ ...f, [key]: value }))

  // Derived in render.
  const modifie =
    JSON.stringify(fiche) !== JSON.stringify(enregistre) || JSON.stringify(decls) !== JSON.stringify(declsEnregistrees)
  const stock = fiche.aDeclinaisons ? decls.reduce((n, d) => n + d.stock, 0) : fiche.stock
  const etat = stockStatut(stock, fiche)
  const final = prixFinal(fiche)
  const voirErreurs = !creation || tente
  const erreurNom = fiche.nom.trim() === "" ? "Le nom est obligatoire." : null
  const erreurCategorie = fiche.categorieId === "" ? "Choisissez une catégorie." : null
  const erreurPrix = fiche.prix <= 0 ? "Indiquez un prix supérieur à 0." : null
  const declsIncompletes =
    fiche.aDeclinaisons &&
    (fiche.options.some((o) => o.trim() === "") || decls.some((d) => d.valeurs.every((v) => v.trim() === "")))
  const valide = !erreurNom && !erreurCategorie && !erreurPrix && !declsIncompletes
  const nomCategorie = categories.find((c) => c.id === fiche.categorieId)?.nom ?? "Sans catégorie"
  const marques = [...new Set(produits.map((p) => p.marque.trim()).filter(Boolean))].sort()
  const palierDefaut = fiche.paliers.find((p) => p.parDefaut)

  const propre = (): Fiche => ({
    ...fiche,
    nom: fiche.nom.trim(),
    reference: fiche.reference.trim().toUpperCase(),
    marque: fiche.marque.trim(),
    categoriesSecondaires: fiche.categoriesSecondaires.filter((c) => c !== fiche.categorieId),
    options: fiche.options.map((o) => o.trim()),
    paliers: fiche.paliers.map((p) => ({ ...p, texte: p.texte.trim(), badge: p.badge.trim() })),
  })
  /** Store-ready déclinaison fields (no id, no draft flag). */
  const champsDecl = (d: LigneDecl) => ({ valeurs: d.valeurs.map((v) => v.trim()), stock: d.stock })

  const annuler = () => {
    setFiche(enregistre)
    setDecls(declsEnregistrees)
    setDescKey((k) => k + 1)
  }

  const creer = () => {
    if (!valide) {
      setTente(true)
      haut.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    const nouvelId = addProduit(propre())
    if (fiche.aDeclinaisons) {
      decls.forEach((d) => addDeclinaison({ produitId: nouvelId, ...champsDecl(d) }))
    }
    navigate(`/admin/produits/${nouvelId}`, { replace: true, state: { toast: "Produit créé" } })
  }

  const enregistrer = () => {
    const f = propre()
    updateProduit(id, f)
    setFiche(f)
    const gardees = new Set(decls.filter((d) => !d.nouvelle).map((d) => d.id))
    declsEnregistrees.filter((d) => !gardees.has(d.id)).forEach((d) => removeDeclinaison(d.id))
    // New rows get their store id back, so the draft matches the store right away.
    setDecls(
      decls.map((d) => {
        const champs = champsDecl(d)
        if (d.nouvelle) return { id: addDeclinaison({ produitId: id, ...champs }), ...champs }
        updateDeclinaison(d.id, champs)
        return { id: d.id, ...champs }
      }),
    )
    notify("Modifications enregistrées")
  }

  const quitterCreation = () => (modifie ? setConfirmAbandon(true) : navigate("/admin/produits"))


  const setRemiseType = (remiseType: RemiseType) =>
    setFiche((f) => ({ ...f, remiseType, remise: remiseType === "pourcentage" ? Math.min(f.remise, 100) : f.remise }))

  return (
    <div ref={haut} className="mx-auto flex max-w-[1200px] scroll-mt-6 flex-col gap-6">
      <div>
        {creation ? (
          <button
            type="button"
            onClick={quitterCreation}
            aria-label="Produits"
            title="Produits"
            className="mb-4 inline-flex size-9 items-center justify-center rounded-md border border-border text-ink-muted transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <BackButton to="/admin/produits" label="Produits" />
        )}
        <PageHeader
          title={fiche.nom.trim() || (creation ? "Nouveau produit" : "Sans nom")}
          subtitle={
            creation ? (
              "Remplissez au moins le nom, la catégorie et le prix — le reste peut attendre."
            ) : (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono">{fiche.reference || "Sans référence"}</span>
                <span aria-hidden>·</span>
                <span>{nomCategorie}</span>
                <Badge variant={fiche.actif ? "info" : "default"} dot>
                  {fiche.actif ? "Actif" : "Inactif"}
                </Badge>
              </span>
            )
          }
          actions={
            creation ? null : (
              <>
                <Button asChild variant="outline">
                  <Link to="/client">
                    <Eye className="size-4" />
                    Visualiser
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="text-danger hover:text-danger"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" />
                  Supprimer
                </Button>
              </>
            )
          }
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Left: everything to fill, in TikTak's order ── */}
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Informations générales">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Nom du produit"
                  htmlFor="p-nom"
                  required
                  error={voirErreurs ? erreurNom : null}
                >
                  <Input
                    id="p-nom"
                    autoFocus={creation}
                    value={fiche.nom}
                    onChange={(e) => set("nom", e.target.value)}
                    placeholder="Ex. T-shirt blanc"
                    aria-invalid={voirErreurs && !!erreurNom}
                  />
                </Field>
                <Field label="Référence" htmlFor="p-ref">
                  <Input
                    id="p-ref"
                    value={fiche.reference}
                    onChange={(e) => set("reference", e.target.value)}
                    placeholder="REF-001"
                    className="font-mono uppercase"
                  />
                </Field>
              </div>
              <Field label="Description">
                <RichTextEditor
                  key={descKey}
                  value={fiche.description}
                  onChange={(html) => set("description", html)}
                  placeholder="Description détaillée : matière, coupe, conseils d’entretien…"
                />
              </Field>
              <Field label="Code-barres" htmlFor="p-ean" className="sm:max-w-[calc(50%-0.5rem)]">
                <Input
                  id="p-ean"
                  value={fiche.codeBarres}
                  onChange={(e) => set("codeBarres", e.target.value.replace(/\D/g, ""))}
                  placeholder="123456789"
                  inputMode="numeric"
                  className="font-mono"
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Catégories">
            <Aide>Assignez votre produit à une ou plusieurs catégories.</Aide>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Catégorie" required error={voirErreurs ? erreurCategorie : null}>
                <Select
                  value={fiche.categorieId}
                  onValueChange={(v) =>
                    setFiche((f) => ({
                      ...f,
                      categorieId: v,
                      categoriesSecondaires: f.categoriesSecondaires.filter((c) => c !== v),
                    }))
                  }
                >
                  <SelectTrigger className="h-9 py-0" aria-label="Catégorie">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Marque" htmlFor="p-marque" hint={marques.length ? "Choisissez une marque existante ou tapez-en une nouvelle." : undefined}>
                <Input
                  id="p-marque"
                  list="marques-existantes"
                  value={fiche.marque}
                  onChange={(e) => set("marque", e.target.value)}
                  placeholder="Sélectionner une marque"
                />
                <datalist id="marques-existantes">
                  {marques.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </Field>
              <Field label="Tags" hint="Catégories secondaires où le produit apparaît aussi." className="sm:col-span-2">
                <TagsPicker
                  value={fiche.categoriesSecondaires}
                  options={categories.filter((c) => c.id !== fiche.categorieId)}
                  onChange={(ids) => set("categoriesSecondaires", ids)}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Tarification">
            <Aide>Configurez les prix et conditions de vente.</Aide>
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prix TTC" required error={voirErreurs ? erreurPrix : null}>
                  <NumInput value={fiche.prix} suffix="DT" onChange={(v) => set("prix", Math.max(0, v))} />
                </Field>
                <Field
                  label="Remise"
                  hint={
                    fiche.remise > 0 && fiche.prix > 0
                      ? `Prix affiché : ${formatDT(final)} DT au lieu de ${formatDT(fiche.prix)} DT.`
                      : "Aucune remise."
                  }
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <NumInput
                        value={fiche.remise}
                        suffix={fiche.remiseType === "pourcentage" ? "%" : "DT"}
                        onChange={(v) =>
                          set(
                            "remise",
                            Math.min(Math.max(0, v), fiche.remiseType === "pourcentage" ? 100 : fiche.prix),
                          )
                        }
                      />
                    </div>
                    <Segmented
                      value={fiche.remiseType}
                      onChange={setRemiseType}
                      options={[
                        { value: "montant", label: "DT" },
                        { value: "pourcentage", label: "%" },
                      ]}
                    />
                  </div>
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-5">
                <div>
                  <h3 className="font-ui text-sm font-medium text-ink">Prix par quantité</h3>
                  <p className="font-body text-xs text-ink-muted">
                    Des paliers de remise selon la quantité commandée, avec le texte et le badge vus par le client.
                  </p>
                </div>
                <PaliersEditor paliers={fiche.paliers} onChange={(p) => set("paliers", p)} />
              </div>
            </div>
          </Panel>

          <Panel title="Images">
            <Aide>Ajoutez des images pour présenter votre produit.</Aide>
            <ImagesEditor images={fiche.images} onChange={(imgs) => set("images", imgs)} />
          </Panel>

          <Panel title="Stock du produit">
            <div className="flex flex-col gap-5">
              <ToggleRow
                title="Ce produit a des déclinaisons"
                description="Activez cette option si votre produit a des variantes (couleurs, tailles…)."
                control={
                  <Switch
                    checked={fiche.aDeclinaisons}
                    onChange={(v) => {
                      if (v && fiche.options.length === 0) {
                        // the shop's usual pair; renamable in the editor
                        setFiche((f) => ({ ...f, aDeclinaisons: true, options: ["Couleurs", "Taille"] }))
                        if (decls.length === 0) setDecls([nouvelleLigne(2)])
                      } else set("aDeclinaisons", v)
                    }}
                    label="Ce produit a des déclinaisons"
                  />
                }
              />

              {fiche.aDeclinaisons ? (
                <DeclinaisonsEditor
                  options={fiche.options}
                  lignes={decls}
                  gestionStock={fiche.gestionStock}
                  voirErreurs={voirErreurs}
                  onChange={(options, lignes) => {
                    set("options", options)
                    setDecls(lignes)
                  }}
                />
              ) : null}

              <label className="flex cursor-pointer items-start gap-3 border-t border-border pt-5">
                <input
                  type="checkbox"
                  checked={fiche.gestionStock}
                  onChange={(e) => set("gestionStock", e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-ui text-sm text-ink">Activer la gestion de stock</span>
                  <span className="font-body text-xs text-ink-muted">
                    Décochée : le produit reste toujours disponible à la vente, sans quantité suivie.
                  </span>
                </span>
              </label>

              {fiche.gestionStock ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {!fiche.aDeclinaisons ? (
                    <Field label="Stock disponible">
                      <NumInput
                        value={fiche.stock}
                        suffix="pcs"
                        onChange={(v) => set("stock", Math.max(0, Math.round(v)))}
                      />
                    </Field>
                  ) : null}
                  <Field label="Seuil d’alerte" hint="« Stock faible » à partir de ce nombre.">
                    <NumInput
                      value={fiche.seuilAlerte}
                      suffix="pcs"
                      onChange={(v) => set("seuilAlerte", Math.max(0, Math.round(v)))}
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>

        {/* ── Right: live preview + visibility, kept in view on desktop ── */}
        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-0">
          <Panel title="Aperçu">
            <div className="flex flex-col gap-3">
              <ProduitThumb image={fiche.images[0] ?? ""} nom={fiche.nom} size="xl" />
              <div className="flex flex-col gap-1">
                <span className="font-body text-xs text-ink-muted">
                  {[nomCategorie, fiche.marque.trim()].filter(Boolean).join(" · ")}
                </span>
                <span className="font-display text-[1.25rem] leading-snug text-ink">
                  {fiche.nom.trim() || "Nom du produit"}
                </span>
                {fiche.prix > 0 ? (
                  <Price value={final} original={fiche.prix} />
                ) : (
                  <span className="font-body text-sm text-ink-disabled">Prix à définir</span>
                )}
                {palierDefaut ? (
                  <span className="font-body text-xs text-brand-blue-600">
                    {palierDefaut.texte.trim() || textePalier(palierDefaut)}
                    {palierDefaut.badge.trim() ? ` · ${palierDefaut.badge.trim()}` : ""}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {creation && fiche.gestionStock && stock === 0 ? (
                  // a blank new product isn't "out of stock" yet — it just has none entered
                  <Badge>Stock à définir</Badge>
                ) : (
                  <Badge variant={STOCK_BADGE[etat].variant} dot>
                    {STOCK_BADGE[etat].label}
                    {fiche.gestionStock ? ` · ${stock}` : ""}
                  </Badge>
                )}
                {!fiche.actif ? <Badge>Inactif</Badge> : null}
                {!fiche.afficherSurSite ? <Badge>Masqué du site</Badge> : null}
                {fiche.personnalise ? <Badge variant="info">Personnalisable</Badge> : null}
              </div>
            </div>
          </Panel>

          <Panel title="Affichage">
            <Aide>Gérez la visibilité de votre produit.</Aide>
            <div className="flex flex-col gap-4">
              <ToggleRow
                title="Produit actif"
                description="Inactif : il n’est plus vendu."
                control={<Switch checked={fiche.actif} onChange={(v) => set("actif", v)} label="Produit actif" />}
              />
              <ToggleRow
                title="Afficher sur le site"
                description="Visible dans la boutique en ligne."
                control={
                  <Switch
                    checked={fiche.afficherSurSite}
                    onChange={(v) => set("afficherSurSite", v)}
                    label="Afficher sur le site"
                  />
                }
              />
              <ToggleRow
                title="Produit personnalisé"
                description="Le client peut le personnaliser."
                control={
                  <Switch
                    checked={fiche.personnalise}
                    onChange={(v) => set("personnalise", v)}
                    label="Produit personnalisé"
                  />
                }
              />
            </div>
          </Panel>
        </div>
      </div>

      {/* Save bar — always in create mode, only while modified in edit mode. */}
      {creation || modifie ? (
        <div className="animate-fade-up sticky -bottom-5 z-20 -mx-4 mt-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-bottom-6 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
            <span className={`font-body text-sm ${voirErreurs && !valide ? "text-danger" : "text-ink-muted"}`}>
              {voirErreurs && !valide
                ? "Corrigez les champs en rouge pour enregistrer"
                : creation
                  ? valide
                    ? "Prêt à être ajouté au catalogue"
                    : "Nouveau produit — non enregistré"
                  : "Modifications non enregistrées"}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={creation ? quitterCreation : annuler}>
                Annuler
              </Button>
              {creation ? (
                <Button onClick={creer}>Créer le produit</Button>
              ) : (
                <Button onClick={enregistrer} disabled={!valide}>
                  Enregistrer
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {produit ? (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Supprimer « ${produit.nom} » ?`}
          description="Le produit et ses déclinaisons seront retirés du catalogue."
          confirmLabel="Supprimer"
          onConfirm={() => {
            removeProduit(id)
            navigate("/admin/produits", { state: { toast: "Produit supprimé" } })
          }}
        />
      ) : null}
      <ConfirmDialog
        open={confirmAbandon}
        onOpenChange={setConfirmAbandon}
        title="Abandonner ce produit ?"
        description="Les informations saisies ne seront pas enregistrées."
        confirmLabel="Abandonner"
        cancelLabel="Continuer la saisie"
        onConfirm={() => navigate("/admin/produits")}
      />
      <Toast toast={toast} raised={creation || modifie} />
    </div>
  )
}
