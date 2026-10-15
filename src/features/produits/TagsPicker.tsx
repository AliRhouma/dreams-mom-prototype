import { useState } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"

type Option = { id: string; nom: string }

/**
 * « Tags » — secondary categories. Chosen ones show as removable brand-blue
 * tags; typing filters the rest in a small list under the field.
 */
export function TagsPicker({
  value,
  options,
  onChange,
}: {
  value: string[]
  options: Option[]
  onChange: (ids: string[]) => void
}) {
  const [q, setQ] = useState("")
  const [ouvert, setOuvert] = useState(false)

  const choisis = options.filter((o) => value.includes(o.id))
  const proposes = options.filter(
    (o) => !value.includes(o.id) && o.nom.toLowerCase().includes(q.trim().toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOuvert(true)
          }}
          onFocus={() => setOuvert(true)}
          onBlur={() => setOuvert(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && proposes[0]) {
              e.preventDefault()
              onChange([...value, proposes[0].id])
              setQ("")
            }
            if (e.key === "Escape") setOuvert(false)
          }}
          placeholder="Rechercher des catégories secondaires…"
          aria-label="Ajouter une catégorie secondaire"
          className="pl-9"
        />
        {ouvert ? (
          <ul className="animate-pop-in absolute top-full right-0 left-0 z-30 mt-1 max-h-56 overflow-auto rounded-md border border-border bg-popover p-1 shadow-deep">
            {proposes.length ? (
              proposes.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    // mousedown keeps the field focused (blur would close the list first)
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onChange([...value, o.id])
                      setQ("")
                    }}
                    className="flex w-full rounded-sm px-2.5 py-2 text-left font-body text-sm text-ink-subtle hover:bg-surface-hover hover:text-ink"
                  >
                    {o.nom}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-2.5 py-2 font-body text-sm text-ink-muted">
                {options.length === value.length ? "Toutes les catégories sont déjà ajoutées." : "Aucune catégorie trouvée."}
              </li>
            )}
          </ul>
        ) : null}
      </div>

      {choisis.length ? (
        <ul className="flex flex-wrap gap-2">
          {choisis.map((o) => (
            <li
              key={o.id}
              className="inline-flex items-center gap-1.5 rounded-pill border border-brand-blue-200 bg-brand-blue-50 py-1 pr-1.5 pl-3 font-body text-[0.8125rem] text-brand-blue-600"
            >
              {o.nom}
              <button
                type="button"
                aria-label={`Retirer ${o.nom}`}
                onClick={() => onChange(value.filter((id) => id !== o.id))}
                className="flex size-4 items-center justify-center rounded-full hover:bg-brand-blue-100"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
