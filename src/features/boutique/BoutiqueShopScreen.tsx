import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"

import { useData } from "@/data/useData"
import { cn } from "@/lib/utils"
import { ProductCard } from "@/features/boutique/shopco/ProductCard"
import { toProductCardVM } from "@/features/boutique/shopco/adapters"
import { prixFinal } from "@/features/produits/produit"

type Tri = "pertinence" | "prix-asc" | "prix-desc" | "nom"
const PAR_PAGE = 9

const TRIS: { value: Tri; label: string }[] = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "nom", label: "Nom (A–Z)" },
]

/**
 * Boutique › Shop — Shopco listing re-skin. Only the controls my data can back
 * are wired: category filter, text search (?q), sort, and real client-side
 * pagination. Shopco's price / colour / size / dress-style filters are dropped
 * (no backing query layer) — see report.
 */
export function BoutiqueShopScreen() {
  const { produits, categories } = useData()
  const [params, setParams] = useSearchParams()
  const cat = params.get("cat") ?? ""
  const q = (params.get("q") ?? "").trim().toLowerCase()
  const page = Math.max(1, Number(params.get("page")) || 1)
  const [tri, setTri] = useState<Tri>("pertinence")
  const [filtresOuverts, setFiltresOuverts] = useState(false)

  const enVitrine = useMemo(
    () => produits.filter((p) => p.actif && p.afficherSurSite && p.prix > 0),
    [produits],
  )

  const filtres = enVitrine.filter(
    (p) =>
      (cat === "" || p.categorieId === cat || p.categoriesSecondaires.includes(cat)) &&
      (!q || p.nom.toLowerCase().includes(q) || p.marque.toLowerCase().includes(q)),
  )
  const tries = [...filtres].sort((a, b) => {
    if (tri === "prix-asc") return prixFinal(a) - prixFinal(b)
    if (tri === "prix-desc") return prixFinal(b) - prixFinal(a)
    if (tri === "nom") return a.nom.localeCompare(b.nom)
    return 0
  })

  const total = tries.length
  const pages = Math.max(1, Math.ceil(total / PAR_PAGE))
  const pageSure = Math.min(page, pages)
  const debut = (pageSure - 1) * PAR_PAGE
  const visibles = tries.slice(debut, debut + PAR_PAGE).map((p) => toProductCardVM(p, categories))

  const titre = categories.find((c) => c.id === cat)?.nom ?? "Tous les produits"

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== "page") next.delete("page")
    setParams(next, { replace: true })
  }
  const dispoCats = categories.filter((c) =>
    enVitrine.some((p) => p.categorieId === c.id || p.categoriesSecondaires.includes(c.id)),
  )

  const Sidebar = (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">Filtres</span>
        <SlidersHorizontal className="size-5 text-black/40" />
      </div>
      <hr className="border-black/10" />
      <div className="flex flex-col gap-1">
        <CatRow label="Toutes les catégories" active={cat === ""} onClick={() => setParam("cat", "")} />
        {dispoCats.map((c) => (
          <CatRow key={c.id} label={c.nom} active={cat === c.id} onClick={() => setParam("cat", c.id)} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-5 xl:px-0">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-1.5 text-sm text-black/60">
        <Link to="/client" className="hover:text-black">Accueil</Link>
        <span aria-hidden>/</span>
        <span className="text-black">{titre}</span>
      </div>

      <div className="flex items-start gap-5">
        {/* Desktop sidebar */}
        <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] w-[295px] shrink-0 self-start overflow-y-auto rounded-[20px] border border-black/10 p-5 md:block md:p-6">
          {Sidebar}
        </aside>

        <div className="flex-1">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-[32px] font-bold capitalize">{titre.toLowerCase()}</h1>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-black/60">
                {total === 0 ? "0 article" : `${debut + 1}–${Math.min(debut + PAR_PAGE, total)} sur ${total}`}
              </span>
              <label className="flex items-center gap-1.5 text-sm">
                <span className="hidden text-black/60 sm:inline">Trier&nbsp;:</span>
                <select
                  value={tri}
                  onChange={(e) => setTri(e.target.value as Tri)}
                  className="rounded-full border border-black/10 bg-transparent px-3 py-1.5 text-sm font-medium outline-none"
                >
                  {TRIS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => setFiltresOuverts(true)}
                className="flex size-9 items-center justify-center rounded-full bg-[#F0F0F0] md:hidden"
                aria-label="Filtres"
              >
                <SlidersHorizontal className="size-4" />
              </button>
            </div>
          </div>

          {q ? (
            <div className="mb-4 flex items-center gap-2 text-sm text-black/60">
              Résultats pour « <span className="font-medium text-black">{params.get("q")}</span> »
              <button onClick={() => setParam("q", "")} className="underline">effacer</button>
            </div>
          ) : null}

          {visibles.length === 0 ? (
            <div className="rounded-[20px] border border-black/10 py-20 text-center text-black/50">
              Aucun article ne correspond.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
              {visibles.map((p) => (
                <ProductCard key={p.id} data={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 ? (
            <>
              <hr className="my-8 border-black/10" />
              <div className="flex items-center justify-between">
                <PagerBtn disabled={pageSure <= 1} onClick={() => setParam("page", String(pageSure - 1))}>
                  <ChevronLeft className="size-4" /> Précédent
                </PagerBtn>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pages }).slice(0, 7).map((_, i) => {
                    const n = i + 1
                    return (
                      <button
                        key={n}
                        onClick={() => setParam("page", String(n))}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-lg text-sm tabular-nums transition-colors",
                          n === pageSure ? "bg-black/5 font-medium text-black" : "text-black/60 hover:bg-black/5",
                        )}
                      >
                        {n}
                      </button>
                    )
                  })}
                </div>
                <PagerBtn disabled={pageSure >= pages} onClick={() => setParam("page", String(pageSure + 1))}>
                  Suivant <ChevronRight className="size-4" />
                </PagerBtn>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtresOuverts ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Fermer" className="absolute inset-0 bg-black/40" onClick={() => setFiltresOuverts(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[20px] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold">Filtres</span>
              <button onClick={() => setFiltresOuverts(false)} aria-label="Fermer"><X className="size-5" /></button>
            </div>
            <div className="flex flex-col gap-1">
              <CatRow label="Toutes les catégories" active={cat === ""} onClick={() => { setParam("cat", ""); setFiltresOuverts(false) }} />
              {dispoCats.map((c) => (
                <CatRow key={c.id} label={c.nom} active={cat === c.id} onClick={() => { setParam("cat", c.id); setFiltresOuverts(false) }} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CatRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-left text-[0.95rem] capitalize transition-colors",
        active ? "bg-black/5 font-medium text-black" : "text-black/60 hover:bg-black/5",
      )}
    >
      {label.toLowerCase()}
    </button>
  )
}

function PagerBtn({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
