import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Trash2 } from "lucide-react"

import { useData } from "@/data/useData"
import { CartCounter } from "@/features/boutique/shopco/CartCounter"
import { ShopImage } from "@/features/boutique/shopco/ShopImage"
import { formatPrixDT, produitHref, toCartLineVM } from "@/features/boutique/shopco/adapters"
import {
  commandeBoutique,
  formulaireVide,
  validerFormulaire,
  type FormulaireClient,
} from "@/features/boutique/commander"
import { GOUVERNORATS } from "@/data/seed/commandes"

const LIVRAISON = 8

/**
 * Boutique › Panier — Shopco cart re-skin. Totals come from my cart (panier)
 * and are never recomputed by a widget; "Passer la commande" calls my existing
 * order actions (addCommande + addLigneCommande) so it ripples into the admin.
 */
export function PanierScreen() {
  const { panier, updateArticlePanier, removeArticlePanier, viderPanier, addCommande, addLigneCommande } = useData()
  const [form, setForm] = useState<FormulaireClient>(formulaireVide)
  const [tente, setTente] = useState(false)
  const [confirmee, setConfirmee] = useState<number | null>(null)

  const lignes = panier.map(toCartLineVM)
  const sousTotal = lignes.reduce((n, l) => n + l.lineTotal, 0)
  const total = sousTotal + (lignes.length ? LIVRAISON : 0)
  const erreurs = validerFormulaire(form)
  const valide = Object.keys(erreurs).length === 0 && panier.length > 0
  const set = (k: keyof FormulaireClient, v: string) => setForm((f) => ({ ...f, [k]: v }))

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

  // Confirmation
  if (confirmee !== null) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center px-4 py-24 text-center">
        <CheckCircle2 className="mb-5 size-16 text-black" strokeWidth={1.25} />
        <h1 className="font-display-shopco mb-3 text-[32px] uppercase md:text-[40px]">Commande confirmée</h1>
        <p className="mb-8 max-w-md text-black/60">
          Votre commande <span className="font-medium text-black">#{confirmee}</span> a bien été enregistrée.
          Nous vous appellerons pour confirmer la livraison.
        </p>
        <Link to="/client/shop" className="rounded-full bg-black px-10 py-4 text-white transition-all hover:bg-black/80">
          Continuer mes achats
        </Link>
      </div>
    )
  }

  // Empty
  if (panier.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1240px] flex-col items-center px-4 py-24 text-center text-black/40">
        <ShopImage src="" alt="" className="mb-5 size-20 rounded-full bg-[#F0F0F0]" />
        <p className="mb-5 text-black/60">Votre panier est vide.</p>
        <Link to="/client/shop" className="rounded-full bg-black px-10 py-3.5 text-white transition-all hover:bg-black/80">
          Découvrir la collection
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-20 xl:px-0">
      <div className="mb-5 flex items-center gap-1.5 pt-5 text-sm text-black/60">
        <Link to="/client" className="hover:text-black">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-black">Panier</span>
      </div>
      <h1 className="font-display-shopco mb-5 text-[32px] uppercase md:mb-6 md:text-[40px]">Mon panier</h1>

      <div className="flex flex-col items-start gap-5 lg:flex-row">
        {/* Items */}
        <div className="w-full flex-col space-y-4 rounded-[20px] border border-black/10 p-3.5 md:space-y-6 md:px-6">
          {lignes.map((l, idx) => (
            <div key={l.id}>
              <div className="flex items-start gap-4">
                <Link to={produitHref(panier[idx].produitId)} className="w-full min-w-[100px] max-w-[100px] overflow-hidden rounded-lg sm:max-w-[124px]">
                  <ShopImage src={l.image} alt={l.title} fit="cover" className="aspect-square h-full w-full" />
                </Link>
                <div className="flex w-full flex-col self-stretch">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold xl:text-xl">{l.title}</span>
                    <button
                      type="button"
                      onClick={() => removeArticlePanier(l.id)}
                      aria-label={`Retirer ${l.title}`}
                      className="text-[#FF3333] transition-opacity hover:opacity-70"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                  {l.taille ? (
                    <div className="-mt-0.5 text-xs text-black md:text-sm">
                      Taille : <span className="text-black/60">{l.taille}</span>
                    </div>
                  ) : null}
                  {l.couleur ? (
                    <div className="text-xs text-black md:text-sm">
                      Couleur : <span className="text-black/60">{l.couleur}</span>
                    </div>
                  ) : null}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                    <span className="text-xl font-bold xl:text-2xl">{formatPrixDT(l.lineTotal)}</span>
                    <CartCounter
                      value={l.quantite}
                      onChange={(q) => updateArticlePanier(l.id, { quantite: q })}
                      className="max-h-10 min-w-[105px] max-w-[105px] px-5 py-2 sm:max-w-32"
                    />
                  </div>
                </div>
              </div>
              {idx < lignes.length - 1 ? <hr className="mt-4 border-black/10 md:mt-6" /> : null}
            </div>
          ))}
        </div>

        {/* Summary + checkout */}
        <div className="w-full flex-col space-y-5 rounded-[20px] border border-black/10 p-5 md:px-6 lg:max-w-[505px]">
          <h2 className="text-xl font-bold md:text-2xl">Récapitulatif</h2>
          <div className="flex flex-col space-y-4">
            <Row label="Sous-total" value={formatPrixDT(sousTotal)} />
            <Row label="Livraison" value={formatPrixDT(LIVRAISON)} />
            <hr className="border-black/10" />
            <div className="flex items-center justify-between">
              <span className="text-black md:text-xl">Total</span>
              <span className="text-xl font-bold md:text-2xl">{formatPrixDT(total)}</span>
            </div>
          </div>

          <hr className="border-black/10" />
          <h3 className="font-bold">Vos coordonnées</h3>
          <div className="flex flex-col gap-3">
            <ChampTexte label="Nom et prénom" value={form.nom} onChange={(v) => set("nom", v)} error={tente ? erreurs.nom : undefined} placeholder="Nom et prénom" />
            <ChampTexte label="Téléphone" value={form.telephone} onChange={(v) => set("telephone", v.replace(/[^\d]/g, ""))} error={tente ? erreurs.telephone : undefined} placeholder="Téléphone" mono />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-black/70">Gouvernorat</label>
              <select
                value={form.gouvernorat}
                onChange={(e) => set("gouvernorat", e.target.value)}
                className="rounded-full bg-[#F0F0F0] px-4 py-3 text-sm outline-none"
              >
                <option value="">Choisir un gouvernorat</option>
                {GOUVERNORATS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {tente && erreurs.gouvernorat ? <p className="text-xs text-[#FF3333]">{erreurs.gouvernorat}</p> : null}
            </div>
            <ChampTexte label="Adresse" value={form.adresse} onChange={(v) => set("adresse", v)} error={tente ? erreurs.adresse : undefined} placeholder="Adresse complète" />
          </div>

          <button
            type="button"
            onClick={commander}
            className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-all hover:bg-black/80 md:h-[60px] md:text-base"
          >
            Passer la commande · {formatPrixDT(total)}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-black/60 md:text-xl">{label}</span>
      <span className="font-bold md:text-xl">{value}</span>
    </div>
  )
}

function ChampTexte({
  label,
  value,
  onChange,
  error,
  placeholder,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-black/70">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={mono ? "numeric" : undefined}
        className={
          "rounded-full bg-[#F0F0F0] px-4 py-3 text-sm outline-none placeholder:text-black/40 " +
          (mono ? "font-mono" : "")
        }
      />
      {error ? <p className="text-xs text-[#FF3333]">{error}</p> : null}
    </div>
  )
}
