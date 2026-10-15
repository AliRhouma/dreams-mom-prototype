import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search, SearchX } from "lucide-react"

import { useData } from "@/data/useData"
import type { Produit } from "@/data/seed/produits"
import { EmptyState } from "@/components/kit/EmptyState"
import { Badge } from "@/components/kit/Badge"
import { Input } from "@/components/ui/input"
import { ProduitThumb } from "@/features/produits/ProduitThumb"
import { PrixProduit } from "@/features/produits/PrixProduit"

/**
 * Boutique — la vitrine. Une bannière éditoriale, un filtre par catégorie
 * (piloté par ?cat=), une recherche, puis une grille de produits navigables
 * (chaque carte → la fiche produit). On n'affiche que les produits actifs et
 * visibles sur le site. Référence : ProduitsScreen (grille/états) et RoleSelect
 * (carte navigable au remplissage fluide).
 */
export function BoutiqueHome() {
  const { produits, categories } = useData()
  const [params, setParams] = useSearchParams()
  const cat = params.get("cat") ?? ""
  const [recherche, setRecherche] = useState("")

  const nomCategorie = categories.find((c) => c.id === cat)?.nom
  const enVitrine = useMemo(
    () => produits.filter((p) => p.actif && p.afficherSurSite && p.prix > 0),
    [produits],
  )
  const q = recherche.trim().toLowerCase()
  const visibles = enVitrine.filter(
    (p) =>
      (cat === "" || p.categorieId === cat || p.categoriesSecondaires.includes(cat)) &&
      (!q || p.nom.toLowerCase().includes(q) || p.marque.toLowerCase().includes(q)),
  )

  const setCat = (id: string) => {
    const next = new URLSearchParams(params)
    if (id) next.set("cat", id)
    else next.delete("cat")
    setParams(next, { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
      {/* Bannière */}
      <section className="flex flex-col gap-3 border-b border-border pb-8 text-center">
        <span className="font-ui text-[0.7rem] font-medium tracking-[0.18em] text-brand-blue-600 uppercase">
          Collection homme
        </span>
        <h1 className="font-display text-[2.25rem] leading-tight font-normal text-ink sm:text-[2.75rem]">
          {nomCategorie ? (
            <>
              <span className="italic">{nomCategorie.toLowerCase()}</span>
            </>
          ) : (
            <>
              L’essentiel du vestiaire <span className="italic">masculin</span>
            </>
          )}
        </h1>
        <p className="mx-auto max-w-md font-body text-sm text-ink-muted">
          Des pièces tailleur et streetwear, livrées partout en Tunisie. Paiement à la livraison.
        </p>
      </section>

      {/* Filtres */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un article"
            aria-label="Rechercher un article"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <ChipCat label="Tout" active={cat === ""} onClick={() => setCat("")} />
          {categories
            .filter((c) => enVitrine.some((p) => p.categorieId === c.id || p.categoriesSecondaires.includes(c.id)))
            .map((c) => (
              <ChipCat key={c.id} label={c.nom} active={cat === c.id} onClick={() => setCat(c.id)} />
            ))}
        </div>
      </div>

      {/* Grille */}
      {visibles.length === 0 ? (
        <div className="rounded-lg border border-border">
          <EmptyState
            icon={SearchX}
            title="Aucun article"
            description={q ? `Rien pour « ${recherche.trim()} ».` : "Aucun article dans cette catégorie pour l’instant."}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {visibles.map((p) => (
            <CarteVitrine key={p.id} produit={p} categorie={categories.find((c) => c.id === p.categorieId)?.nom} />
          ))}
        </div>
      )}
    </div>
  )
}

function ChipCat({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "rounded-pill border px-3.5 py-1.5 font-ui text-[0.78rem] font-medium tracking-[0.02em] uppercase transition-colors " +
        (active
          ? "border-brand-blue-600 bg-brand-blue-50 text-brand-blue-600"
          : "border-border-strong text-ink-muted hover:text-ink")
      }
    >
      {label}
    </button>
  )
}

/** Carte produit navigable — image, titre serif, prix (sale-aware). */
function CarteVitrine({ produit, categorie }: { produit: Produit; categorie?: string }) {
  const enSolde = produit.remise > 0
  const edition = categorie === "LIMITED SELECTION"
  return (
    <Link
      to={`/client/produit/${produit.id}`}
      className="group flex flex-col gap-3 outline-none"
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-surface-nested">
        <div className="aspect-[4/5] w-full">
          <ProduitThumb
            image={produit.images[0] ?? ""}
            nom={produit.nom}
            size="xl"
            className="size-full rounded-none border-0 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        {enSolde ? (
          <span className="absolute top-2 left-2">
            <Badge variant="danger">Solde</Badge>
          </span>
        ) : edition ? (
          <span className="absolute top-2 left-2">
            <Badge variant="info">Édition limitée</Badge>
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="truncate font-display text-[1.0625rem] leading-snug font-normal text-ink transition-colors group-hover:text-brand-blue-600">
          {produit.nom}
        </h3>
        <PrixProduit produit={produit} size="sm" />
      </div>
    </Link>
  )
}
