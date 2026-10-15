import { Plus, Trash2 } from "lucide-react"

import type { PalierQuantite } from "@/data/seed/produits"
import { NumInput } from "@/components/kit/Primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { textePalier } from "@/features/produits/produit"

/**
 * « Prix par quantité » — discount tiers ("from N pieces, X % off"), each with
 * the text and badge the client sees, and one formula selected by default.
 */
export function PaliersEditor({
  paliers,
  onChange,
}: {
  paliers: PalierQuantite[]
  onChange: (paliers: PalierQuantite[]) => void
}) {
  const set = (i: number, patch: Partial<PalierQuantite>) =>
    onChange(paliers.map((p, j) => (j === i ? { ...p, ...patch } : p)))

  const ajouter = () => {
    const dernier = paliers[paliers.length - 1]
    onChange([
      ...paliers,
      {
        id: crypto.randomUUID(),
        quantite: dernier ? dernier.quantite + 1 : 2,
        // the shop discounts in DT; the next tier offers a little more
        remise: dernier ? dernier.remise + 5 : 5,
        remiseType: dernier?.remiseType ?? "montant",
        texte: "",
        badge: "",
        parDefaut: paliers.length === 0,
      },
    ])
  }

  if (paliers.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-second p-4">
        <p className="font-body text-sm text-ink-muted">
          Aucune formule configurée. Ajoutez des formules de quantité pour offrir des remises, par exemple −5 DT dès 2
          pièces.
        </p>
        <Button variant="outline" onClick={ajouter}>
          <Plus className="size-4" />
          Ajouter une formule
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden grid-cols-[88px_88px_minmax(0,1fr)_120px_72px_36px] gap-3 px-0.5 font-ui text-[0.6875rem] font-medium tracking-[0.12em] text-ink-muted uppercase md:grid">
        <span>Dès</span>
        <span>Remise</span>
        <span>Texte affiché</span>
        <span>Badge</span>
        <span className="text-center">Défaut</span>
        <span className="sr-only">Supprimer</span>
      </div>

      {paliers.map((p, i) => (
        <div
          key={p.id}
          className={cn(
            "grid grid-cols-2 gap-2 rounded-md border p-3 md:grid-cols-[88px_136px_minmax(0,1fr)_120px_64px_36px] md:items-center md:gap-3 md:border-0 md:p-0",
            p.parDefaut ? "border-primary" : "border-border",
          )}
        >
          <NumInput value={p.quantite} suffix="pcs" small onChange={(v) => set(i, { quantite: Math.max(1, Math.round(v)) })} />
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <NumInput
                value={p.remise}
                suffix={p.remiseType === "pourcentage" ? "%" : "DT"}
                small
                onChange={(v) => set(i, { remise: Math.max(0, p.remiseType === "pourcentage" ? Math.min(v, 100) : v) })}
              />
            </div>
            <button
              type="button"
              onClick={() =>
                set(i, p.remiseType === "pourcentage" ? { remiseType: "montant" } : { remiseType: "pourcentage", remise: Math.min(p.remise, 100) })
              }
              aria-label={p.remiseType === "pourcentage" ? "Remise en % — passer en DT" : "Remise en DT — passer en %"}
              title="Changer l’unité (DT / %)"
              className="h-9 w-10 shrink-0 rounded-md border border-input font-ui text-xs text-ink-subtle transition-colors hover:bg-surface-hover hover:text-ink"
            >
              {p.remiseType === "pourcentage" ? "%" : "DT"}
            </button>
          </div>
          <Input
            value={p.texte}
            onChange={(e) => set(i, { texte: e.target.value })}
            placeholder={textePalier(p)}
            aria-label="Texte affiché"
            dir="auto"
            className="col-span-2 md:col-span-1"
          />
          <Input
            value={p.badge}
            onChange={(e) => set(i, { badge: e.target.value })}
            placeholder="Ex. Populaire"
            aria-label="Badge"
            dir="auto"
          />
          <label className="flex items-center justify-center gap-2 font-body text-xs text-ink-muted md:justify-center">
            <input
              type="radio"
              name="palier-defaut"
              checked={p.parDefaut}
              onChange={() => onChange(paliers.map((x, j) => ({ ...x, parDefaut: j === i })))}
              className="size-4 accent-[var(--primary)]"
            />
            <span className="md:sr-only">Par défaut</span>
          </label>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Supprimer la formule dès ${p.quantite} pièces`}
            className="col-span-2 justify-self-end text-ink-muted hover:text-danger md:col-span-1"
            onClick={() => {
              const reste = paliers.filter((_, j) => j !== i)
              // keep exactly one default when the default one is removed
              if (p.parDefaut && reste.length) reste[0] = { ...reste[0], parDefaut: true }
              onChange(reste)
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" className="self-start" onClick={ajouter}>
        <Plus className="size-4" />
        Ajouter une formule
      </Button>
    </div>
  )
}
