import { useRef, useState } from "react"
import { ImagePlus, Plus, Star, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * « Images du produit » — pick or drop photos; the first one is the principale
 * (shown on cards and the shop). Files become in-memory object URLs: nothing
 * is uploaded, and they vanish on refresh like the rest of the prototype data.
 */
export function ImagesEditor({
  images,
  onChange,
}: {
  images: string[]
  onChange: (images: string[]) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [survol, setSurvol] = useState(false)

  const ajouter = (files: FileList | null) => {
    if (!files?.length) return
    const urls = [...files].filter((f) => f.type.startsWith("image/")).map((f) => URL.createObjectURL(f))
    if (urls.length) onChange([...images, ...urls])
  }
  const choisir = () => input.current?.click()

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          ajouter(e.target.files)
          e.target.value = ""
        }}
      />

      {images.length === 0 ? (
        <button
          type="button"
          onClick={choisir}
          onDragOver={(e) => {
            e.preventDefault()
            setSurvol(true)
          }}
          onDragLeave={() => setSurvol(false)}
          onDrop={(e) => {
            e.preventDefault()
            setSurvol(false)
            ajouter(e.dataTransfer.files)
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
            survol ? "border-primary bg-brand-blue-50" : "border-border-second hover:border-border-strong hover:bg-surface",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-md bg-surface-nested text-ink-muted">
            <ImagePlus className="size-6" strokeWidth={1.5} />
          </span>
          <span className="font-ui text-sm font-medium text-ink">Aucune image ajoutée</span>
          <span className="font-body text-xs text-ink-muted">
            Glissez vos photos ici ou <span className="text-brand-blue-600 underline-offset-2 hover:underline">parcourez</span>{" "}
            — JPG, PNG ou WebP.
          </span>
        </button>
      ) : (
        <ul
          className="grid grid-cols-3 gap-3 sm:grid-cols-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            ajouter(e.dataTransfer.files)
          }}
        >
          {images.map((src, i) => (
            <li
              key={src}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-md border bg-surface-nested",
                i === 0 ? "border-primary" : "border-border",
              )}
            >
              <img src={src} alt={i === 0 ? "Image principale" : `Image ${i + 1}`} className="size-full object-cover" />
              {i === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-primary px-2 py-0.5 font-ui text-[0.625rem] font-medium tracking-[0.08em] text-ink-inverted uppercase">
                  Principale
                </span>
              ) : null}
              <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                {i > 0 ? (
                  <button
                    type="button"
                    aria-label="Définir comme image principale"
                    title="Définir comme principale"
                    onClick={() => onChange([src, ...images.filter((_, j) => j !== i)])}
                    className="flex size-7 items-center justify-center rounded-md bg-background/90 text-ink-subtle shadow-card hover:text-brand-blue-600"
                  >
                    <Star className="size-3.5" />
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label="Retirer l’image"
                  title="Retirer"
                  onClick={() => onChange(images.filter((_, j) => j !== i))}
                  className="flex size-7 items-center justify-center rounded-md bg-background/90 text-ink-subtle shadow-card hover:text-danger"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={choisir}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-second font-body text-xs text-ink-muted transition-colors hover:border-border-strong hover:bg-surface hover:text-ink"
            >
              <Plus className="size-4" />
              Ajouter
            </button>
          </li>
        </ul>
      )}

      {images.length === 0 ? (
        <Button variant="outline" className="self-start" onClick={choisir}>
          <Plus className="size-4" />
          Ajouter des images
        </Button>
      ) : (
        <p className="font-body text-xs text-ink-muted">
          La première image est la principale. Survolez une image pour la mettre en avant ou la retirer.
        </p>
      )}
    </div>
  )
}
