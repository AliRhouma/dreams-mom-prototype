import { useState } from "react"
import { Plus, Search, Trash2, X } from "lucide-react"

import { LinkBtn, NumInput } from "@/components/kit/Primitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/kit/EmptyState"
import { nouvelleLigne, type LigneDecl } from "@/features/produits/produit"

/** Rows above this get a filter box — one imported product has 272 variants. */
const SEUIL_FILTRE = 12

/**
 * « Déclinaisons » — TikTak's model: the product names its options (Couleurs,
 * Taille, Pointure…) and each déclinaison is one value per option + its stock.
 * Options are editable column headers; rows follow them.
 */
export function DeclinaisonsEditor({
  options,
  lignes,
  onChange,
  gestionStock,
  voirErreurs,
}: {
  options: string[]
  lignes: LigneDecl[]
  onChange: (options: string[], lignes: LigneDecl[]) => void
  gestionStock: boolean
  voirErreurs: boolean
}) {
  const [filtre, setFiltre] = useState("")
  const n = options.length
  const colonnes = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr)) 112px 36px` }

  const setLigne = (id: string, patch: Partial<LigneDecl>) =>
    onChange(options, lignes.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const setValeur = (l: LigneDecl, i: number, v: string) =>
    setLigne(l.id, { valeurs: l.valeurs.map((x, j) => (j === i ? v : x)) })
  const ajouterLigne = () => onChange(options, [...lignes, nouvelleLigne(n)])
  const ajouterOption = () =>
    onChange([...options, ""], lignes.map((l) => ({ ...l, valeurs: [...l.valeurs, ""] })))
  const retirerOption = (i: number) =>
    onChange(
      options.filter((_, j) => j !== i),
      lignes.map((l) => ({ ...l, valeurs: l.valeurs.filter((_, j) => j !== i) })),
    )

  const q = filtre.trim().toLowerCase()
  const visibles = q ? lignes.filter((l) => l.valeurs.join(" ").toLowerCase().includes(q)) : lignes
  const total = lignes.reduce((s, l) => s + l.stock, 0)
  const optionsVides = options.some((o) => o.trim() === "")

  return (
    <div className="flex flex-col gap-4">
      {/* Options (column names) */}
      <div className="flex flex-col gap-2">
        <span className="font-ui text-[0.8125rem] font-medium text-ink-subtle">Options</span>
        <div className="flex flex-wrap items-center gap-2">
          {options.map((o, i) => (
            <div key={i} className="flex items-center gap-1 rounded-md border border-border bg-surface py-1 pr-1 pl-1">
              <Input
                value={o}
                onChange={(e) => onChange(options.map((x, j) => (j === i ? e.target.value : x)), lignes)}
                placeholder="Ex. Taille"
                aria-label={`Nom de l’option ${i + 1}`}
                aria-invalid={voirErreurs && o.trim() === ""}
                // sized to its text: the shop uses long names like « Taille Pantalon ( USA ) »
                style={{ width: `${Math.min(Math.max(o.length, 9), 28) + 3}ch` }}
                className="h-7 max-w-full border-transparent bg-background px-2 text-sm"
              />
              {n > 1 ? (
                <button
                  type="button"
                  aria-label={`Retirer l’option ${o || i + 1}`}
                  title="Retirer l’option"
                  onClick={() => retirerOption(i)}
                  className="flex size-6 items-center justify-center rounded-sm text-ink-muted hover:bg-surface-hover hover:text-danger"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          ))}
          {n < 3 ? (
            <Button variant="ghost" size="sm" onClick={ajouterOption}>
              <Plus className="size-3.5" />
              Option
            </Button>
          ) : null}
        </div>
        {voirErreurs && optionsVides ? (
          <p className="font-body text-xs text-danger">Donnez un nom à chaque option.</p>
        ) : null}
      </div>

      {lignes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-second">
          <EmptyState
            title="Aucune déclinaison"
            description="Ajoutez une combinaison (ex. Noir / M) pour suivre son stock."
            action={
              <Button variant="outline" onClick={ajouterLigne}>
                <Plus className="size-4" />
                Ajouter une déclinaison
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {lignes.length > SEUIL_FILTRE ? (
            <div className="relative sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
              <Input
                value={filtre}
                onChange={(e) => setFiltre(e.target.value)}
                placeholder={`Filtrer les ${lignes.length} déclinaisons`}
                aria-label="Filtrer les déclinaisons"
                className="pl-9"
              />
            </div>
          ) : null}

          <div className="hidden gap-3 px-0.5 font-ui text-[0.6875rem] font-medium tracking-[0.12em] text-ink-muted uppercase sm:grid" style={colonnes}>
            {options.map((o, i) => (
              <span key={i} className="truncate">
                {o.trim() || `Option ${i + 1}`}
              </span>
            ))}
            <span>{gestionStock ? "Stock" : "Stock (non suivi)"}</span>
            <span className="sr-only">Supprimer</span>
          </div>

          <div className="flex flex-col gap-2 sm:gap-1.5">
            {visibles.map((l) => {
              const vide = l.valeurs.every((v) => v.trim() === "")
              return (
                <div
                  key={l.id}
                  className="grid grid-cols-2 gap-2 rounded-md border border-border p-2 sm:grid sm:gap-3 sm:border-0 sm:p-0 max-sm:!grid-cols-2"
                  style={colonnes}
                >
                  {options.map((o, i) => (
                    <Input
                      key={i}
                      value={l.valeurs[i] ?? ""}
                      onChange={(e) => setValeur(l, i, e.target.value)}
                      placeholder={o.trim() || `Option ${i + 1}`}
                      aria-label={o.trim() || `Option ${i + 1}`}
                      aria-invalid={voirErreurs && vide}
                    />
                  ))}
                  <NumInput
                    value={l.stock}
                    suffix="pcs"
                    onChange={(v) => setLigne(l.id, { stock: Math.max(0, Math.round(v)) })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Retirer la déclinaison ${l.valeurs.filter(Boolean).join(" / ") || ""}`.trim()}
                    className="justify-self-end text-ink-muted hover:text-danger"
                    onClick={() => onChange(options, lignes.filter((x) => x.id !== l.id))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )
            })}
            {q && visibles.length === 0 ? (
              <p className="py-2 font-body text-sm text-ink-muted">Aucune déclinaison pour « {filtre.trim()} ».</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <LinkBtn onClick={ajouterLigne}>
              <Plus className="size-3.5" />
              Ajouter une déclinaison
            </LinkBtn>
            <span className="font-body text-xs text-ink-muted">
              {lignes.length} déclinaison{lignes.length > 1 ? "s" : ""} · stock total{" "}
              <span className="font-ui text-sm text-ink tabular-nums">{total}</span> pcs
            </span>
          </div>
          {voirErreurs && lignes.some((l) => l.valeurs.every((v) => v.trim() === "")) ? (
            <p className="font-body text-xs text-danger">Chaque déclinaison doit avoir au moins une valeur.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
