import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  Minus,
  PackageSearch,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react"

import { useData } from "@/data/useData"
import type { Commande, StatutCommande } from "@/data/seed/commandes"
import type { Produit, RemiseType } from "@/data/seed/produits"
import {
  SOURCES_COMMANDE,
  STATUTS_COMMANDE,
  TRANSPORTEURS,
  TYPES_PAIEMENT,
} from "@/data/seed/commandes"
import { BackButton } from "@/components/kit/BackButton"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { Field, ToggleRow } from "@/components/kit/Field"
import { Price } from "@/components/kit/Price"
import { Switch } from "@/components/kit/Switch"
import { NumInput, Panel, Segmented } from "@/components/kit/Primitives"
import { Toast, useToast } from "@/components/kit/Toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDT } from "@/lib/format"
import { ProduitThumb } from "@/features/produits/ProduitThumb"
import {
  commandeVide,
  labelStatut,
  montantRemise,
  sansId,
  STATUT_BADGE,
  type LigneDraft,
} from "@/features/commandes/commande"

type Fiche = Omit<Commande, "id">

/** Admin › Commandes › Nouvelle commande — la page de création. */
export function NouvelleCommandeScreen() {
  return <CommandeEditor key="nouvelle" />
}

/**
 * Admin › Commandes › fiche commande. Résout l'id, montre l'état introuvable,
 * et remonte l'éditeur par commande pour réinitialiser le brouillon.
 */
export function CommandeScreen() {
  const { commandeId } = useParams()
  const navigate = useNavigate()
  const { commandes } = useData()
  const commande = commandes.find((c) => c.id === commandeId)

  if (!commande) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackButton to="/admin/commandes" label="Commandes" />
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={PackageSearch}
            title="Commande introuvable"
            description="Elle a peut-être été supprimée."
            action={<Button onClick={() => navigate("/admin/commandes")}>Retour aux commandes</Button>}
          />
        </div>
      </div>
    )
  }
  return <CommandeEditor key={commande.id} commande={commande} />
}

/** Sous-titre d'aide d'un panneau. */
function Aide({ children }: { children: React.ReactNode }) {
  return <p className="-mt-1 mb-4 font-body text-sm text-ink-muted">{children}</p>
}

/**
 * Créer ET modifier une commande, sur une page (comme ProduitScreen) qui reprend
 * la modale d'édition de la boutique : informations client, informations
 * commande, produits (avec quantités), résumé des totaux ; colonne droite
 * collante avec le statut (le cœur du suivi), les champs avancés et l'historique.
 * Le brouillon local est validé par une barre d'enregistrement.
 */
function CommandeEditor({ commande }: { commande?: Commande }) {
  const {
    produits,
    lignesCommande,
    addCommande,
    updateCommande,
    removeCommande,
    addLigneCommande,
    updateLigneCommande,
    removeLigneCommande,
  } = useData()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast, notify } = useToast()
  const creation = !commande
  const id = commande?.id ?? ""

  const enregistre: Fiche = commande ? sansId(commande) : commandeVide()
  const lignesEnregistrees: LigneDraft[] = lignesCommande
    .filter((l) => l.commandeId === id)
    .map((l) => ({ id: l.id, produitId: l.produitId, nom: l.nom, prixUnitaire: l.prixUnitaire, quantite: l.quantite }))

  const [fiche, setFiche] = useState<Fiche>(enregistre)
  const [lignes, setLignes] = useState<LigneDraft[]>(lignesEnregistrees)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmAbandon, setConfirmAbandon] = useState(false)
  const [picker, setPicker] = useState(false)
  const [tente, setTente] = useState(false)
  const haut = useRef<HTMLDivElement>(null)

  // Toast remis par la page de création ("Commande créée"), affiché une fois.
  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast
    if (msg) {
      notify(msg)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = <K extends keyof Fiche>(key: K, value: Fiche[K]) => setFiche((f) => ({ ...f, [key]: value }))

  // Valeurs dérivées — calculées au rendu, jamais stockées.
  const modifie =
    JSON.stringify(fiche) !== JSON.stringify(enregistre) ||
    JSON.stringify(lignes) !== JSON.stringify(lignesEnregistrees)
  const sousTotalLignes = lignes.reduce((n, l) => n + l.prixUnitaire * l.quantite, 0)
  const frais = fiche.livraisonGratuite ? 0 : fiche.fraisLivraison
  const remiseAppliquee = montantRemise(fiche, sousTotalLignes)
  const total = Math.max(0, sousTotalLignes + frais - remiseAppliquee)
  const nbArticles = lignes.reduce((n, l) => n + l.quantite, 0)

  const voirErreurs = !creation || tente
  const erreurClient = fiche.client.trim() === "" ? "Le nom du client est obligatoire." : null
  const erreurTel = fiche.telephone.trim() === "" ? "Le téléphone est obligatoire." : null
  const erreurGouv = fiche.gouvernorat.trim() === "" ? "Indiquez le gouvernorat." : null
  const erreurAdresse = fiche.adresse.trim() === "" ? "L'adresse est obligatoire." : null
  const erreurLignes = lignes.length === 0 ? "Ajoutez au moins un produit." : null
  const valide = !erreurClient && !erreurTel && !erreurGouv && !erreurAdresse && !erreurLignes

  const propre = (): Fiche => ({
    ...fiche,
    client: fiche.client.trim(),
    telephone: fiche.telephone.trim(),
    telephoneSecondaire: fiche.telephoneSecondaire.trim(),
    gouvernorat: fiche.gouvernorat.trim(),
    ville: fiche.ville.trim(),
    adresse: fiche.adresse.trim(),
    codePostal: fiche.codePostal.trim(),
    email: fiche.email.trim(),
    messenger: fiche.messenger.trim(),
    commentaire: fiche.commentaire.trim(),
  })
  const champsLigne = (l: LigneDraft) => ({
    produitId: l.produitId,
    nom: l.nom,
    prixUnitaire: l.prixUnitaire,
    quantite: l.quantite,
  })

  const annuler = () => {
    setFiche(enregistre)
    setLignes(lignesEnregistrees)
  }

  const creer = () => {
    if (!valide) {
      setTente(true)
      haut.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    const nouvelId = addCommande(propre())
    lignes.forEach((l) => addLigneCommande({ commandeId: nouvelId, ...champsLigne(l) }))
    navigate(`/admin/commandes/${nouvelId}`, { replace: true, state: { toast: "Commande créée" } })
  }

  const enregistrer = () => {
    const f = propre()
    updateCommande(id, f)
    setFiche(f)
    const gardees = new Set(lignes.filter((l) => !l.nouvelle).map((l) => l.id))
    lignesEnregistrees.filter((l) => !gardees.has(l.id)).forEach((l) => removeLigneCommande(l.id))
    setLignes(
      lignes.map((l) => {
        const champs = champsLigne(l)
        if (l.nouvelle) return { id: addLigneCommande({ commandeId: id, ...champs }), ...champs }
        updateLigneCommande(l.id, champs)
        return { id: l.id, ...champs }
      }),
    )
    notify("Modifications enregistrées")
  }

  const quitterCreation = () => (modifie ? setConfirmAbandon(true) : navigate("/admin/commandes"))

  const setRemiseType = (remiseType: RemiseType) =>
    setFiche((f) => ({ ...f, remiseType, remise: remiseType === "pourcentage" ? Math.min(f.remise, 100) : f.remise }))

  const ajouterProduit = (p: Produit) => {
    setLignes((list) => {
      const existante = list.find((l) => l.produitId === p.id)
      if (existante) {
        return list.map((l) => (l.id === existante.id ? { ...l, quantite: l.quantite + 1 } : l))
      }
      return [
        ...list,
        { id: crypto.randomUUID(), produitId: p.id, nom: p.nom, prixUnitaire: p.prix, quantite: 1, nouvelle: true },
      ]
    })
    setPicker(false)
  }
  const changerQuantite = (ligneId: string, delta: number) =>
    setLignes((list) =>
      list.map((l) => (l.id === ligneId ? { ...l, quantite: Math.max(1, l.quantite + delta) } : l)),
    )
  const retirerLigne = (ligneId: string) => setLignes((list) => list.filter((l) => l.id !== ligneId))
  const imgDe = (produitId: string) => produits.find((p) => p.id === produitId)?.images[0] ?? ""

  return (
    <div ref={haut} className="mx-auto flex max-w-[1200px] scroll-mt-6 flex-col gap-6">
      <div>
        {creation ? (
          <button
            type="button"
            onClick={quitterCreation}
            aria-label="Commandes"
            title="Commandes"
            className="mb-4 inline-flex size-9 items-center justify-center rounded-md border border-border text-ink-muted transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <BackButton to="/admin/commandes" label="Commandes" />
        )}
        <PageHeader
          title={creation ? "Nouvelle commande" : `Commande #${fiche.numero}`}
          subtitle={
            creation ? (
              "Renseignez le client, l'adresse et au moins un produit."
            ) : (
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{fiche.client || "Client"}</span>
                <span aria-hidden>·</span>
                <span>{fiche.date}</span>
                <Badge variant={STATUT_BADGE[fiche.statut]} dot>
                  {labelStatut(fiche.statut)}
                </Badge>
              </span>
            )
          }
          actions={
            creation ? null : (
              <Button
                variant="outline"
                className="text-danger hover:text-danger"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" />
                Supprimer
              </Button>
            )
          }
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Colonne gauche ── */}
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Informations client">
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom du client" htmlFor="c-nom" required error={voirErreurs ? erreurClient : null}>
                  <Input
                    id="c-nom"
                    autoFocus={creation}
                    value={fiche.client}
                    onChange={(e) => set("client", e.target.value)}
                    placeholder="Ex. Ahmed Abdelkefi"
                    aria-invalid={voirErreurs && !!erreurClient}
                  />
                </Field>
                <Field label="Source de la commande" required>
                  <Select value={fiche.source} onValueChange={(v) => set("source", v as Fiche["source"])}>
                    <SelectTrigger className="h-9 py-0" aria-label="Source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES_COMMANDE.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Téléphone principal" htmlFor="c-tel" required error={voirErreurs ? erreurTel : null}>
                  <Input
                    id="c-tel"
                    value={fiche.telephone}
                    onChange={(e) => set("telephone", e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="20123456"
                    inputMode="numeric"
                    className="font-mono"
                    aria-invalid={voirErreurs && !!erreurTel}
                  />
                </Field>
                <Field label="Téléphone supplémentaire" htmlFor="c-tel2">
                  <Input
                    id="c-tel2"
                    value={fiche.telephoneSecondaire}
                    onChange={(e) => set("telephoneSecondaire", e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="Optionnel"
                    inputMode="numeric"
                    className="font-mono"
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Gouvernorat" htmlFor="c-gouv" required error={voirErreurs ? erreurGouv : null}>
                  <Input
                    id="c-gouv"
                    value={fiche.gouvernorat}
                    onChange={(e) => set("gouvernorat", e.target.value)}
                    placeholder="Ex. Ariana"
                    aria-invalid={voirErreurs && !!erreurGouv}
                  />
                </Field>
                <Field label="Ville" htmlFor="c-ville">
                  <Input
                    id="c-ville"
                    value={fiche.ville}
                    onChange={(e) => set("ville", e.target.value)}
                    placeholder="Ex. Raoued"
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
                <Field label="Adresse complète" htmlFor="c-adr" required error={voirErreurs ? erreurAdresse : null}>
                  <Input
                    id="c-adr"
                    value={fiche.adresse}
                    onChange={(e) => set("adresse", e.target.value)}
                    placeholder="Rue, cité, immeuble…"
                    aria-invalid={voirErreurs && !!erreurAdresse}
                  />
                </Field>
                <Field label="Code postal" htmlFor="c-cp">
                  <Input
                    id="c-cp"
                    value={fiche.codePostal}
                    onChange={(e) => set("codePostal", e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="CP"
                    inputMode="numeric"
                    className="font-mono"
                  />
                </Field>
              </div>
              <Field label="Commentaire" htmlFor="c-com">
                <textarea
                  id="c-com"
                  value={fiche.commentaire}
                  onChange={(e) => set("commentaire", e.target.value)}
                  placeholder="Commentaire supplémentaire…"
                  rows={2}
                  className="w-full resize-y rounded-sm border border-input bg-input-bg px-3 py-2 font-body text-sm text-ink outline-none transition-colors placeholder:text-ink-disabled focus:border-border-focus"
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Informations commande">
            <div className="flex flex-col gap-4">
              <Field label="Transporteur">
                <Select
                  value={fiche.transporteur || "none"}
                  onValueChange={(v) => set("transporteur", v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-9 py-0" aria-label="Transporteur">
                    <SelectValue placeholder="Sélectionner un transporteur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Non sélectionné</SelectItem>
                    {TRANSPORTEURS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <ToggleRow
                title="Livraison gratuite"
                description="Les frais de livraison ne sont pas facturés au client."
                control={
                  <Switch
                    checked={fiche.livraisonGratuite}
                    onChange={(v) => set("livraisonGratuite", v)}
                    label="Livraison gratuite"
                  />
                }
              />
              <div className="border-t border-border" />
              <ToggleRow
                title="Échange"
                description="Cette commande est un échange d'un article précédent."
                control={<Switch checked={fiche.echange} onChange={(v) => set("echange", v)} label="Échange" />}
              />
            </div>
          </Panel>

          {/* ── Produits de la commande ── */}
          <Panel
            title="Produits de la commande"
            action={
              <Button variant="outline" size="sm" onClick={() => setPicker(true)}>
                <Plus className="size-4" />
                Ajouter
              </Button>
            }
          >
            {lignes.length === 0 ? (
              <div className="py-2">
                <EmptyState
                  icon={ShoppingBag}
                  title="Aucun produit"
                  description="Ajoutez des produits du catalogue à cette commande."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setPicker(true)}>
                      <Plus className="size-4" />
                      Ajouter un produit
                    </Button>
                  }
                />
                {voirErreurs && erreurLignes ? (
                  <p className="text-center font-body text-xs text-danger">{erreurLignes}</p>
                ) : null}
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {lignes.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <ProduitThumb image={imgDe(l.produitId)} nom={l.nom} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-ui text-sm font-medium text-ink">{l.nom}</span>
                      <span className="font-body text-xs text-ink-muted">
                        {formatDT(l.prixUnitaire)} DT / unité
                      </span>
                    </div>
                    {/* Pas à pas de quantité */}
                    <div className="flex items-center gap-1 rounded-md border border-border-strong">
                      <button
                        type="button"
                        onClick={() => changerQuantite(l.id, -1)}
                        aria-label="Diminuer la quantité"
                        disabled={l.quantite <= 1}
                        className="flex size-7 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center font-ui text-sm text-ink tabular-nums">{l.quantite}</span>
                      <button
                        type="button"
                        onClick={() => changerQuantite(l.id, 1)}
                        aria-label="Augmenter la quantité"
                        className="flex size-7 items-center justify-center text-ink-muted transition-colors hover:text-ink"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="w-20 text-right font-ui text-sm font-medium text-ink tabular-nums">
                      {formatDT(l.prixUnitaire * l.quantite)} DT
                    </span>
                    <button
                      type="button"
                      onClick={() => retirerLigne(l.id)}
                      aria-label={`Retirer ${l.nom}`}
                      className="flex size-7 shrink-0 items-center justify-center text-ink-muted transition-colors hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {lignes.length > 0 ? (
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="font-ui text-sm text-ink-muted">
                  Total des produits · {nbArticles} article{nbArticles > 1 ? "s" : ""}
                </span>
                <Price value={sousTotalLignes} size="sm" />
              </div>
            ) : null}
          </Panel>

          {/* ── Résumé de la commande ── */}
          <Panel title="Résumé de la commande">
            <div className="flex flex-col gap-3">
              <LigneResume label="Sous-total" value={`${formatDT(sousTotalLignes)} DT`} />
              <div className="flex items-center justify-between gap-4">
                <span className="font-ui text-sm text-ink-muted">Frais de livraison</span>
                {fiche.livraisonGratuite ? (
                  <span className="font-ui text-sm text-success">Gratuite</span>
                ) : (
                  <div className="w-28">
                    <NumInput
                      value={fiche.fraisLivraison}
                      suffix="DT"
                      onChange={(v) => set("fraisLivraison", v)}
                      small
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-ui text-sm text-ink-muted">Remise</span>
                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <NumInput
                      value={fiche.remise}
                      suffix={fiche.remiseType === "pourcentage" ? "%" : "DT"}
                      onChange={(v) =>
                        set("remise", fiche.remiseType === "pourcentage" ? Math.min(100, v) : v)
                      }
                      small
                    />
                  </div>
                  <Segmented
                    value={fiche.remiseType}
                    onChange={(v) => setRemiseType(v as RemiseType)}
                    options={[
                      { value: "montant", label: "DT" },
                      { value: "pourcentage", label: "%" },
                    ]}
                  />
                </div>
              </div>
              {remiseAppliquee > 0 ? (
                <LigneResume label="Remise appliquée" value={`− ${formatDT(remiseAppliquee)} DT`} tone="danger" />
              ) : null}
              <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-3">
                <span className="font-ui text-base font-medium text-ink">Total</span>
                <Price value={total} size="md" />
              </div>
            </div>
          </Panel>
        </div>

        {/* ── Colonne droite (collante) ── */}
        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-0">
          <Panel title="Statut de la commande">
            <Aide>Faites avancer la commande dans son cycle de vie.</Aide>
            <Select value={fiche.statut} onValueChange={(v) => set("statut", v as StatutCommande)}>
              <SelectTrigger className="h-10 py-0" aria-label="Statut">
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
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={STATUT_BADGE[fiche.statut]} dot>
                {labelStatut(fiche.statut)}
              </Badge>
            </div>
          </Panel>

          <Panel title="Champs avancés">
            <div className="flex flex-col gap-4">
              <Field label="Email" htmlFor="c-email">
                <Input
                  id="c-email"
                  type="email"
                  value={fiche.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="client@email.com"
                />
              </Field>
              <Field label="Type de paiement">
                <Select value={fiche.typePaiement} onValueChange={(v) => set("typePaiement", v as Fiche["typePaiement"])}>
                  <SelectTrigger className="h-9 py-0" aria-label="Type de paiement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES_PAIEMENT.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Messenger" htmlFor="c-msg">
                <Input
                  id="c-msg"
                  value={fiche.messenger}
                  onChange={(e) => set("messenger", e.target.value)}
                  placeholder="Nom d'utilisateur Messenger"
                />
              </Field>
              <Field label="Date de livraison prévue" htmlFor="c-date">
                <Input
                  id="c-date"
                  value={fiche.dateLivraison}
                  onChange={(e) => set("dateLivraison", e.target.value)}
                  placeholder="Ex. 18 oct. 2026"
                />
              </Field>
            </div>
          </Panel>

          {!creation ? (
            <Panel title="Historique">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface-nested text-ink-muted">
                  <Clock className="size-4" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="font-ui text-sm text-ink">Commande créée</span>
                  <span className="font-body text-xs text-ink-muted">{fiche.date}</span>
                </div>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      {/* Barre d'enregistrement — toujours en création, seulement si modifié en édition. */}
      {creation || modifie ? (
        <div className="animate-fade-up sticky -bottom-5 z-20 -mx-4 mt-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:-bottom-6 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
            <span className={`font-body text-sm ${voirErreurs && !valide ? "text-danger" : "text-ink-muted"}`}>
              {voirErreurs && !valide
                ? "Corrigez les champs en rouge pour enregistrer"
                : creation
                  ? valide
                    ? "Prête à être enregistrée"
                    : "Nouvelle commande — non enregistrée"
                  : "Modifications non enregistrées"}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={creation ? quitterCreation : annuler}>
                Annuler
              </Button>
              {creation ? (
                <Button onClick={creer}>Créer la commande</Button>
              ) : (
                <Button onClick={enregistrer} disabled={!valide}>
                  Enregistrer les modifications
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Sélecteur de produit du catalogue */}
      <ProduitPicker open={picker} onOpenChange={setPicker} onPick={ajouterProduit} />

      {commande ? (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Supprimer la commande #${commande.numero} ?`}
          description="La commande et ses lignes seront retirées. Cette action est irréversible."
          confirmLabel="Supprimer"
          destructive
          onConfirm={() => {
            removeCommande(id)
            navigate("/admin/commandes", { state: { toast: `Commande #${commande.numero} supprimée` } })
          }}
        />
      ) : null}
      <ConfirmDialog
        open={confirmAbandon}
        onOpenChange={setConfirmAbandon}
        title="Abandonner cette commande ?"
        description="Les informations saisies ne seront pas enregistrées."
        confirmLabel="Abandonner"
        cancelLabel="Continuer la saisie"
        destructive
        onConfirm={() => navigate("/admin/commandes")}
      />
      <Toast toast={toast} raised={creation || modifie} />
    </div>
  )
}

/* ── Ligne du résumé (libellé muté + valeur) ────────────────────────────── */
function LigneResume({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-ui text-sm text-ink-muted">{label}</span>
      <span className={`font-ui text-sm tabular-nums ${tone === "danger" ? "text-danger" : "text-ink"}`}>
        {value}
      </span>
    </div>
  )
}

/* ── Sélecteur de produit : liste du catalogue avec recherche ───────────── */
function ProduitPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (produit: Produit) => void
}) {
  const { produits } = useData()
  const [q, setQ] = useState("")
  const terme = q.trim().toLowerCase()
  const resultats = produits
    .filter((p) => p.actif)
    .filter((p) => !terme || p.nom.toLowerCase().includes(terme) || p.reference.toLowerCase().includes(terme))
    .slice(0, 50)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Ajouter un produit</DialogTitle>
          <DialogDescription>Choisissez un produit du catalogue à ajouter à la commande.</DialogDescription>
        </DialogHeader>
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un produit"
              aria-label="Rechercher un produit"
              className="pl-9"
            />
          </div>
        </div>
        <div className="max-h-[22rem] overflow-y-auto p-2">
          {resultats.length === 0 ? (
            <EmptyState icon={PackageSearch} title="Aucun produit" description="Aucun produit ne correspond." />
          ) : (
            <ul className="flex flex-col">
              {resultats.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onPick(p)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface"
                  >
                    <ProduitThumb image={p.images[0] ?? ""} nom={p.nom} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-ui text-sm font-medium text-ink">{p.nom}</span>
                      <span className="font-mono text-xs text-ink-muted">{p.reference || "Sans réf."}</span>
                    </div>
                    <Price value={p.prix} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
