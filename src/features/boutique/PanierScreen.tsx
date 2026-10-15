import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"

import { useData } from "@/data/useData"
import { EmptyState } from "@/components/kit/EmptyState"
import { Field } from "@/components/kit/Field"
import { Price } from "@/components/kit/Price"
import { Panel } from "@/components/kit/Primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GOUVERNORATS } from "@/data/seed/commandes"
import { formatDT } from "@/lib/format"
import { ProduitThumb } from "@/features/produits/ProduitThumb"
import {
  commandeBoutique,
  formulaireVide,
  validerFormulaire,
  type FormulaireClient,
} from "@/features/boutique/commander"
import { ConfirmationCommande } from "@/features/boutique/ProduitVitrineScreen"

const FRAIS = 8

/** Boutique › Panier — récapitulatif + formulaire client → passe la commande. */
export function PanierScreen() {
  const { panier, updateArticlePanier, removeArticlePanier, viderPanier, addCommande, addLigneCommande } = useData()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormulaireClient>(formulaireVide)
  const [tente, setTente] = useState(false)
  const [confirmee, setConfirmee] = useState<number | null>(null)

  const sousTotal = panier.reduce((n, a) => n + a.prixUnitaire * a.quantite, 0)
  const nbArticles = panier.reduce((n, a) => n + a.quantite, 0)
  const total = sousTotal + (panier.length ? FRAIS : 0)
  const erreurs = validerFormulaire(form)
  const valide = Object.keys(erreurs).length === 0 && panier.length > 0
  const set = (k: keyof FormulaireClient, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const changerQte = (id: string, q: number) => updateArticlePanier(id, { quantite: Math.max(1, q) })

  const commander = () => {
    if (!valide) {
      setTente(true)
      return
    }
    const commande = commandeBoutique(form, { remise: 0, remiseType: "montant" })
    const commandeId = addCommande(commande)
    panier.forEach((a) =>
      addLigneCommande({ commandeId, produitId: a.produitId, nom: a.nom, prixUnitaire: a.prixUnitaire, quantite: a.quantite }),
    )
    viderPanier()
    setConfirmee(commande.numero)
  }

  if (panier.length === 0 && confirmee === null) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
        <Link
          to="/client"
          className="mb-6 inline-flex items-center gap-2 font-ui text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Continuer mes achats
        </Link>
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={ShoppingBag}
            title="Votre panier est vide"
            description="Parcourez la collection et ajoutez vos articles préférés."
            action={<Button asChild><Link to="/client">Voir la collection</Link></Button>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-8">
      <div>
        <Link
          to="/client"
          className="mb-4 inline-flex items-center gap-2 font-ui text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Continuer mes achats
        </Link>
        <h1 className="font-display text-[1.75rem] leading-tight font-normal text-ink">Mon panier</h1>
        <p className="font-body text-sm text-ink-muted">
          {nbArticles} article{nbArticles > 1 ? "s" : ""} dans votre panier
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Lignes du panier */}
        <ul className="flex flex-col gap-3">
          {panier.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <ProduitThumb image={a.image} nom={a.nom} size="lg" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate font-ui text-sm font-medium text-ink">{a.nom}</span>
                <span className="font-body text-xs text-ink-muted">{formatDT(a.prixUnitaire)} DT / unité</span>
                <div className="mt-1 flex items-center gap-1 self-start rounded-md border border-border-strong">
                  <button
                    type="button"
                    onClick={() => changerQte(a.id, a.quantite - 1)}
                    aria-label="Diminuer la quantité"
                    disabled={a.quantite <= 1}
                    className="flex size-7 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:opacity-40"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-7 text-center font-ui text-sm text-ink tabular-nums">{a.quantite}</span>
                  <button
                    type="button"
                    onClick={() => changerQte(a.id, a.quantite + 1)}
                    aria-label="Augmenter la quantité"
                    className="flex size-7 items-center justify-center text-ink-muted transition-colors hover:text-ink"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Price value={a.prixUnitaire * a.quantite} size="sm" />
                <button
                  type="button"
                  onClick={() => removeArticlePanier(a.id)}
                  aria-label={`Retirer ${a.nom}`}
                  className="flex size-7 items-center justify-center text-ink-muted transition-colors hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Récap + formulaire */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <Panel title="Récapitulatif">
            <div className="flex flex-col gap-3">
              <LigneRecap label="Sous-total" value={`${formatDT(sousTotal)} DT`} />
              <LigneRecap label="Livraison" value={`${formatDT(FRAIS)} DT`} />
              <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                <span className="font-ui text-base font-medium text-ink">Total</span>
                <Price value={total} size="md" />
              </div>
            </div>
          </Panel>

          <Panel title="Vos coordonnées">
            <div className="flex flex-col gap-3">
              <Field label="Nom et prénom" htmlFor="p-nom" required error={tente ? erreurs.nom : undefined}>
                <Input id="p-nom" value={form.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Nom et prénom" />
              </Field>
              <Field label="Téléphone" htmlFor="p-tel" required error={tente ? erreurs.telephone : undefined}>
                <Input
                  id="p-tel"
                  value={form.telephone}
                  onChange={(e) => set("telephone", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Téléphone"
                  inputMode="numeric"
                  className="font-mono"
                />
              </Field>
              <Field label="Gouvernorat" required error={tente ? erreurs.gouvernorat : undefined}>
                <Select value={form.gouvernorat} onValueChange={(v) => set("gouvernorat", v)}>
                  <SelectTrigger className="h-9 py-0" aria-label="Gouvernorat">
                    <SelectValue placeholder="Choisir un gouvernorat" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOUVERNORATS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Adresse" htmlFor="p-adr" required error={tente ? erreurs.adresse : undefined}>
                <Input id="p-adr" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Adresse" />
              </Field>
              <Button size="lg" className="mt-1 w-full" onClick={commander}>
                <ShoppingBag className="size-4" />
                Passer la commande · {formatDT(total)} DT
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmationCommande
        numero={confirmee}
        onClose={() => setConfirmee(null)}
        onContinuer={() => navigate("/client")}
      />
    </div>
  )
}

function LigneRecap({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-ui text-sm text-ink-muted">{label}</span>
      <span className="font-ui text-sm text-ink tabular-nums">{value}</span>
    </div>
  )
}
