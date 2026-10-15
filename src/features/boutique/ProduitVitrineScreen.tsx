import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Minus,
  PackageSearch,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react"

import { useData } from "@/data/useData"
import type { Produit } from "@/data/seed/produits"
import { EmptyState } from "@/components/kit/EmptyState"
import { Field } from "@/components/kit/Field"
import { Price } from "@/components/kit/Price"
import { Toast, useToast } from "@/components/kit/Toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GOUVERNORATS } from "@/data/seed/commandes"
import { formatDT } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  commandeBoutique,
  formulaireVide,
  palierApplicable,
  prixUnitaire,
  remisePalier,
  suffixeVariante,
  validerFormulaire,
  type FormulaireClient,
} from "@/features/boutique/commander"

/** Boutique › fiche produit — l'aperçu client + le formulaire « Commander ». */
export function ProduitVitrineScreen() {
  const { produitId } = useParams()
  const { produits } = useData()
  const produit = produits.find((p) => p.id === produitId)

  if (!produit) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
        <Link
          to="/client"
          className="mb-6 inline-flex items-center gap-2 font-ui text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Retour à la boutique
        </Link>
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={PackageSearch}
            title="Article introuvable"
            description="Cet article n’est plus disponible."
            action={<Button asChild><Link to="/client">Voir la collection</Link></Button>}
          />
        </div>
      </div>
    )
  }
  return <Vitrine key={produit.id} produit={produit} />
}

function Vitrine({ produit }: { produit: Produit }) {
  const { categories, declinaisons, addCommande, addLigneCommande, addAuPanier } = useData()
  const navigate = useNavigate()
  const { toast, notify } = useToast()

  const categorie = categories.find((c) => c.id === produit.categorieId)?.nom
  const unite = prixUnitaire(produit)
  const avis = 12 + (produit.id.charCodeAt(produit.id.length - 1) % 40) // décoratif, stable

  // Valeurs d'options depuis les déclinaisons (ex. Couleurs → Gris/Noir…).
  const valeursParOption = useMemo(() => {
    const mesDecls = declinaisons.filter((d) => d.produitId === produit.id)
    return produit.options.map((_, i) => [
      ...new Set(mesDecls.map((d) => d.valeurs[i]).filter((v) => v && v.trim())),
    ])
  }, [declinaisons, produit])

  const [imgActive, setImgActive] = useState(0)
  const [variantes, setVariantes] = useState<string[]>(() => valeursParOption.map((vals) => vals[0] ?? ""))
  const [quantite, setQuantite] = useState(1)
  const [form, setForm] = useState<FormulaireClient>(formulaireVide)
  const [tente, setTente] = useState(false)
  const [confirmee, setConfirmee] = useState<number | null>(null)

  const setVariante = (i: number, val: string) =>
    setVariantes((list) => list.map((v, idx) => (idx === i ? val : v)))

  // Prix / offres.
  const sousTotal = unite * quantite
  const palier = palierApplicable(produit, quantite)
  const remise = palier ? remisePalier(palier, sousTotal) : 0
  const total = Math.max(0, sousTotal - remise)

  const erreurs = validerFormulaire(form)
  const valide = Object.keys(erreurs).length === 0
  const set = (k: keyof FormulaireClient, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const nomAvecVariante = produit.nom + suffixeVariante(variantes)

  const acheter = () => {
    if (!valide) {
      setTente(true)
      return
    }
    const commande = commandeBoutique(form, { remise, remiseType: palier?.remiseType ?? "montant" })
    const commandeId = addCommande(commande)
    addLigneCommande({ commandeId, produitId: produit.id, nom: nomAvecVariante, prixUnitaire: unite, quantite })
    // Le numéro (généré par commandeVide) sert de confirmation client.
    setConfirmee(commande.numero)
  }

  const ajouterPanier = () => {
    addAuPanier({
      produitId: produit.id,
      nom: nomAvecVariante,
      prixUnitaire: unite,
      quantite,
      couleur: variantes[0] ?? "",
      taille: variantes[1] ?? "",
      image: produit.images[0] ?? "",
    })
    notify(`${quantite} article${quantite > 1 ? "s" : ""} ajouté${quantite > 1 ? "s" : ""} au panier`)
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-1.5 font-body text-xs text-ink-muted">
        <Link to="/client" className="transition-colors hover:text-ink">Boutique</Link>
        <span aria-hidden>/</span>
        {categorie ? (
          <>
            <Link to={`/client?cat=${produit.categorieId}`} className="transition-colors hover:text-ink">
              {categorie}
            </Link>
            <span aria-hidden>/</span>
          </>
        ) : null}
        <span className="truncate text-ink-subtle">{produit.nom}</span>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        {/* ── Galerie ── */}
        <Galerie images={produit.images} nom={produit.nom} active={imgActive} onSelect={setImgActive} />

        {/* ── Colonne commande ── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {categorie ? (
              <span className="font-ui text-[0.68rem] font-medium tracking-[0.14em] text-ink-muted uppercase">
                {categorie}
              </span>
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-[1.75rem] leading-tight font-normal text-ink">{produit.nom}</h1>
              <Price value={unite} original={produit.remise > 0 ? produit.prix : undefined} size="md" className="shrink-0" />
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-0.5 text-amber" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </span>
              <span className="font-body text-xs text-ink-muted">{avis} avis vérifiés</span>
            </div>
          </div>

          {/* Options (Couleur, Taille…) */}
          {produit.options.map((nomOption, i) =>
            valeursParOption[i]?.length ? (
              <div key={nomOption} className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-ui text-[0.8125rem] font-medium text-ink-subtle">{nomOption}</span>
                  <span className="font-body text-xs text-ink-muted">{variantes[i]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {valeursParOption[i].map((val) => {
                    const actif = variantes[i] === val
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setVariante(i, val)}
                        aria-pressed={actif}
                        className={cn(
                          "min-w-[2.75rem] rounded-md border px-3 py-2 font-ui text-sm transition-colors",
                          actif
                            ? "border-brand-blue-600 bg-brand-blue-50 text-brand-blue-600"
                            : "border-border-strong text-ink hover:border-ink",
                        )}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null,
          )}

          {/* Offre spéciale (paliers) */}
          {produit.paliers.length ? (
            <div className="flex flex-col gap-2">
              <span className="font-ui text-[0.8125rem] font-medium text-ink-subtle">Offre spéciale</span>
              <div className="flex flex-col gap-2">
                <OffreLigne
                  active={!palier}
                  onClick={() => setQuantite(1)}
                  titre={`Acheter 1 à ${formatDT(unite)} DT seulement`}
                  total={`${formatDT(unite)} DT`}
                />
                {produit.paliers.map((pal) => {
                  const base = unite * pal.quantite
                  const net = Math.max(0, base - remisePalier(pal, base))
                  return (
                    <OffreLigne
                      key={pal.id}
                      active={palier?.id === pal.id}
                      onClick={() => setQuantite(pal.quantite)}
                      titre={pal.texte || `Acheter ${pal.quantite} avec remise`}
                      total={`${formatDT(net)} DT`}
                      original={`${formatDT(base)} DT`}
                      badge={pal.parDefaut ? "Meilleure offre" : pal.badge || undefined}
                    />
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* Formulaire commander */}
          <div className="rounded-xl border border-dashed border-brand-blue-600/40 bg-brand-blue-50/40 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nom et prénom" htmlFor="v-nom" required error={tente ? erreurs.nom : undefined}>
                <Input
                  id="v-nom"
                  value={form.nom}
                  onChange={(e) => set("nom", e.target.value)}
                  placeholder="Nom et prénom"
                  aria-invalid={tente && !!erreurs.nom}
                />
              </Field>
              <Field label="Téléphone" htmlFor="v-tel" required error={tente ? erreurs.telephone : undefined}>
                <Input
                  id="v-tel"
                  value={form.telephone}
                  onChange={(e) => set("telephone", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Téléphone"
                  inputMode="numeric"
                  className="font-mono"
                  aria-invalid={tente && !!erreurs.telephone}
                />
              </Field>
              <Field label="Gouvernorat" required error={tente ? erreurs.gouvernorat : undefined}>
                <Select value={form.gouvernorat} onValueChange={(v) => set("gouvernorat", v)}>
                  <SelectTrigger className="h-9 py-0" aria-label="Gouvernorat" aria-invalid={tente && !!erreurs.gouvernorat}>
                    <SelectValue placeholder="Choisir un gouvernorat" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOUVERNORATS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Adresse" htmlFor="v-adr" required error={tente ? erreurs.adresse : undefined}>
                <Input
                  id="v-adr"
                  value={form.adresse}
                  onChange={(e) => set("adresse", e.target.value)}
                  placeholder="Adresse"
                  aria-invalid={tente && !!erreurs.adresse}
                />
              </Field>
            </div>

            {/* Total + quantité */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 rounded-md border border-border-strong">
                <button
                  type="button"
                  onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer la quantité"
                  disabled={quantite <= 1}
                  className="flex size-9 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-ui text-sm text-ink tabular-nums">{quantite}</span>
                <button
                  type="button"
                  onClick={() => setQuantite((q) => q + 1)}
                  aria-label="Augmenter la quantité"
                  className="flex size-9 items-center justify-center text-ink-muted transition-colors hover:text-ink"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-ui text-[0.68rem] font-medium tracking-[0.1em] text-ink-muted uppercase">
                  Total
                </span>
                <Price value={total} size="md" />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button size="lg" className="w-full" onClick={acheter}>
                <ShoppingBag className="size-4" />
                Acheter maintenant
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={ajouterPanier}>
                <Plus className="size-4" />
                Ajouter au panier
              </Button>
            </div>
          </div>

          {/* Réassurance */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Reassurance icon={Truck} texte="Livraison 48–72h" />
            <Reassurance icon={ShieldCheck} texte="Paiement à la livraison" />
            <Reassurance icon={Check} texte="Échange sous 7 jours" />
          </div>

          {produit.description ? (
            <div className="border-t border-border pt-5">
              <h2 className="mb-2 font-ui text-sm font-medium text-ink">Description</h2>
              <div
                className="prose-vitrine font-body text-sm leading-relaxed text-ink-subtle [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_ul]:mb-2"
                // Description HTML éditée dans le back-office (champ riche du produit).
                dangerouslySetInnerHTML={{ __html: produit.description }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Confirmation de commande */}
      <ConfirmationCommande
        numero={confirmee}
        onClose={() => setConfirmee(null)}
        onContinuer={() => navigate("/client")}
      />

      <Toast toast={toast} />
    </div>
  )
}

/* ── Galerie d'images ───────────────────────────────────────────────────── */
function Galerie({
  images,
  nom,
  active,
  onSelect,
}: {
  images: string[]
  nom: string
  active: number
  onSelect: (i: number) => void
}) {
  const [casses, setCasses] = useState<Record<number, boolean>>({})
  const principale = images[active]
  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-20">
      <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface-nested">
        {principale && !casses[active] ? (
          <img
            src={principale}
            alt={nom}
            className="size-full object-cover"
            onError={() => setCasses((c) => ({ ...c, [active]: true }))}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-disabled">
            <ShoppingBag className="size-16" strokeWidth={1.25} />
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-md border bg-surface-nested transition-colors",
                i === active ? "border-brand-blue-600" : "border-border hover:border-border-strong",
              )}
            >
              {img && !casses[i] ? (
                <img
                  src={img}
                  alt=""
                  className="size-full object-cover"
                  onError={() => setCasses((c) => ({ ...c, [i]: true }))}
                />
              ) : (
                <span className="flex size-full items-center justify-center text-ink-disabled">
                  <ShoppingBag className="size-5" />
                </span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/* ── Une ligne d'offre spéciale (radio) ─────────────────────────────────── */
function OffreLigne({
  active,
  onClick,
  titre,
  total,
  original,
  badge,
}: {
  active: boolean
  onClick: () => void
  titre: string
  total: string
  original?: string
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
        active ? "border-brand-blue-600 bg-brand-blue-50" : "border-border hover:border-border-strong",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          active ? "border-brand-blue-600" : "border-border-strong",
        )}
      >
        {active ? <span className="size-2 rounded-full bg-brand-blue-600" /> : null}
      </span>
      <span className="min-w-0 flex-1 font-ui text-sm text-ink">{titre}</span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="font-ui text-sm font-medium text-ink tabular-nums">{total}</span>
        {original ? <s className="font-body text-xs text-ink-disabled">{original}</s> : null}
      </span>
      {badge ? (
        <span className="absolute -top-2 right-3 rounded-pill bg-danger px-2 py-0.5 font-ui text-[0.6rem] font-medium tracking-[0.04em] text-white uppercase">
          {badge}
        </span>
      ) : null}
    </button>
  )
}

function Reassurance({ icon: Icon, texte }: { icon: typeof Truck; texte: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
      <Icon className="size-4 shrink-0 text-brand-blue-600" strokeWidth={1.75} />
      <span className="font-body text-xs text-ink-subtle">{texte}</span>
    </div>
  )
}

/* ── Dialogue de confirmation ───────────────────────────────────────────── */
export function ConfirmationCommande({
  numero,
  onClose,
  onContinuer,
}: {
  numero: number | null
  onClose: () => void
  onContinuer: () => void
}) {
  return (
    <Dialog open={numero !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm text-center" showCloseButton={false}>
        <div className="flex flex-col items-center gap-4 py-2">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-8" strokeWidth={1.75} />
          </span>
          <div className="flex flex-col gap-1.5">
            <DialogTitle className="font-display text-[1.5rem] font-normal text-ink">Commande confirmée</DialogTitle>
            <DialogDescription className="font-body text-sm text-ink-muted">
              Votre commande <span className="font-mono text-ink-subtle">#{numero}</span> a bien été enregistrée.
              Nous vous appellerons pour confirmer la livraison.
            </DialogDescription>
          </div>
          <Button className="w-full" onClick={onContinuer}>
            Continuer mes achats
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
