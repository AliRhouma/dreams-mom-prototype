import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Check, ShoppingBag } from "lucide-react"

import { useData } from "@/data/useData"
import { cn } from "@/lib/utils"
import { Toast, useToast } from "@/components/kit/Toast"
import { ShopImage } from "@/features/boutique/shopco/ShopImage"
import { PriceRow } from "@/features/boutique/shopco/PriceRow"
import { CartCounter } from "@/features/boutique/shopco/CartCounter"
import { ProductListSec } from "@/features/boutique/shopco/ProductListSec"
import { toProductCardVM, toProductPageVM } from "@/features/boutique/shopco/adapters"
import type { ProductPageVM } from "@/features/boutique/shopco/vm"

/** Map common French colour names to a swatch colour; unknown → neutral dot. */
const COULEURS: Record<string, string> = {
  gris: "#9ca3af", noir: "#111111", blanc: "#ffffff", bege: "#d9c2a6", beige: "#d9c2a6",
  marron: "#6b4423", vert: "#3f5231", "vert militaire": "#4b5320", bleu: "#2f3b57",
  "bleu marine": "#1e293b", rouge: "#b43232", jaune: "#d4a017", orange: "#c2672d",
  rose: "#d48aa0", kaki: "#7c7a4a", camel: "#c19a6b",
}
const estOptionCouleur = (nom: string) => /couleur|coleur/i.test(nom)

/** Boutique › fiche produit — Shopco product header re-skin, real variants. */
export function ProduitVitrineScreen() {
  const { produitId } = useParams()
  const { produits, categories, declinaisons } = useData()
  const produit = produits.find((p) => p.id === produitId)

  if (!produit) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-16 text-center">
        <p className="mb-4 text-black/50">Cet article n’est plus disponible.</p>
        <Link to="/client/shop" className="inline-block rounded-full bg-black px-8 py-3 text-white">
          Voir la collection
        </Link>
      </div>
    )
  }

  const vm = toProductPageVM(produit, categories, declinaisons)
  const related = produits
    .filter((p) => p.id !== produit.id && p.actif && p.afficherSurSite && p.prix > 0 && p.categorieId === produit.categorieId)
    .slice(0, 8)
    .map((p) => toProductCardVM(p, categories))

  return <Vitrine key={produit.id} vm={vm} related={related} />
}

function Vitrine({ vm, related }: { vm: ProductPageVM; related: ReturnType<typeof toProductCardVM>[] }) {
  const { addAuPanier } = useData()
  const navigate = useNavigate()
  const { toast, notify } = useToast()

  /**
   * The photo of the variant matching the choice: the exact combination first,
   * else any variant sharing the value just picked (a colour's photo doesn't
   * depend on the size). null = no photo for it, keep the current one.
   */
  const photoPour = (choix: string[], i: number): string | null =>
    vm.variantes.find((v) => v.image && v.valeurs.every((x, k) => !choix[k] || x === choix[k]))?.image ??
    vm.variantes.find((v) => v.image && v.valeurs[i] === choix[i])?.image ??
    null
  /** The photo shown on a colour swatch. */
  const photoDeValeur = (i: number, val: string) => vm.variantes.find((v) => v.image && v.valeurs[i] === val)?.image

  const [variantes, setVariantes] = useState<string[]>(() => vm.options.map((o) => o.valeurs[0] ?? ""))
  // Open on the pre-selected variant's photo, so the picture matches the chosen colour.
  const [selected, setSelected] = useState(() => photoPour(variantes, 0) ?? vm.images[0] ?? "")
  const [quantite, setQuantite] = useState(1)

  const setVariante = (i: number, val: string) => {
    const choix = variantes.map((v, idx) => (idx === i ? val : v))
    setVariantes(choix)
    const photo = photoPour(choix, i)
    if (photo) setSelected(photo)
  }

  const suffixe = useMemo(() => {
    const vals = variantes.filter((v) => v.trim())
    return vals.length ? ` — ${vals.join(" / ")}` : ""
  }, [variantes])

  const ajouter = () => {
    addAuPanier({
      produitId: vm.id,
      nom: vm.title + suffixe,
      prixUnitaire: vm.priceFinal,
      quantite,
      couleur: variantes[0] ?? "",
      taille: variantes[1] ?? "",
      image: selected || (vm.images[0] ?? ""),
    })
    notify(`${quantite} article${quantite > 1 ? "s" : ""} ajouté${quantite > 1 ? "s" : ""} au panier`)
  }
  const acheter = () => {
    ajouter()
    navigate("/client/panier")
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-5 xl:px-0">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-1.5 text-sm text-black/60">
        <Link to="/client" className="hover:text-black">Accueil</Link>
        <span aria-hidden>/</span>
        <Link to="/client/shop" className="hover:text-black">Boutique</Link>
        {vm.category ? (
          <>
            <span aria-hidden>/</span>
            <Link to={`/client/shop?cat=${vm.categoryId}`} className="capitalize hover:text-black">
              {vm.category.toLowerCase()}
            </Link>
          </>
        ) : null}
        <span aria-hidden>/</span>
        <span className="truncate text-black">{vm.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Photos */}
        <div className="flex flex-col-reverse gap-3 lg:flex-row lg:space-x-3.5">
          {vm.images.length > 1 ? (
            <div className="flex w-full items-center justify-center gap-3 lg:w-fit lg:flex-col lg:justify-start lg:space-y-3.5">
              {vm.images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected(img)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    "aspect-square w-full max-w-[111px] overflow-hidden rounded-[13px] xl:max-w-[152px] xl:rounded-[20px]",
                    selected === img ? "ring-2 ring-black" : "",
                  )}
                >
                  <ShopImage src={img} alt={vm.title} fit="cover" className="h-full w-full" />
                </button>
              ))}
            </div>
          ) : null}
          <div className="mx-auto h-full max-h-[530px] min-h-[330px] w-full overflow-hidden rounded-[13px] sm:w-96 sm:rounded-[20px] md:w-full lg:min-h-[380px] xl:min-h-[530px]">
            <ShopImage key={selected} src={selected} alt={vm.title} fit="cover" className="h-full min-h-[330px] w-full lg:min-h-[380px] xl:min-h-[530px]" />
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="font-display-shopco mb-3 text-2xl uppercase md:mb-3.5 md:text-[40px] md:leading-[40px]">
            {vm.title}
          </h1>
          <PriceRow
            priceFinal={vm.priceFinal}
            priceOriginal={vm.priceOriginal}
            discountLabel={vm.discountLabel}
            size="page"
            className="mb-5"
          />

          {vm.descriptionHtml ? (
            <div
              className="mb-5 text-sm text-black/60 [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_ul]:mb-2 sm:text-base"
              dangerouslySetInnerHTML={{ __html: vm.descriptionHtml }}
            />
          ) : (
            <p className="mb-5 text-sm text-black/60 sm:text-base">
              Une pièce essentielle de la collection Dreams Mom.
            </p>
          )}

          <hr className="mb-5 border-black/10" />

          {/* Variant selectors (from real déclinaisons) */}
          {vm.options.map((opt, i) => {
            const couleur = estOptionCouleur(opt.nom)
            return (
              <div key={opt.nom} className="mb-5">
                <span className="mb-4 block text-sm text-black/60 sm:text-base">
                  {couleur ? "Couleur" : `Choisir ${opt.nom.toLowerCase()}`}
                  {couleur && variantes[i] ? <span className="text-black"> : {variantes[i]}</span> : null}
                </span>
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  {opt.valeurs.map((val) => {
                    const actif = variantes[i] === val
                    const photo = couleur ? photoDeValeur(i, val) : undefined
                    if (photo) {
                      return (
                        <button
                          key={val}
                          type="button"
                          title={val}
                          aria-label={val}
                          aria-pressed={actif}
                          onClick={() => setVariante(i, val)}
                          className={cn(
                            "size-11 overflow-hidden rounded-full border border-black/10 ring-offset-2 transition-shadow sm:size-12",
                            actif ? "ring-2 ring-black" : "hover:ring-1 hover:ring-black/30",
                          )}
                        >
                          <ShopImage src={photo} alt={val} fit="cover" className="h-full w-full" imgClassName="hover:scale-100" />
                        </button>
                      )
                    }
                    const hex = couleur ? COULEURS[val.toLowerCase()] : undefined
                    if (hex) {
                      return (
                        <button
                          key={val}
                          type="button"
                          title={val}
                          aria-label={val}
                          aria-pressed={actif}
                          onClick={() => setVariante(i, val)}
                          className="flex size-9 items-center justify-center rounded-full border border-black/10 sm:size-10"
                          style={{ backgroundColor: hex }}
                        >
                          {actif ? (
                            <Check className={cn("size-4", val.toLowerCase() === "blanc" || val.toLowerCase() === "bege" || val.toLowerCase() === "beige" ? "text-black" : "text-white")} />
                          ) : null}
                        </button>
                      )
                    }
                    return (
                      <button
                        key={val}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => setVariante(i, val)}
                        className={cn(
                          "flex max-h-[46px] items-center justify-center rounded-full px-5 py-2.5 text-sm transition-colors lg:px-6 lg:py-3 lg:text-base",
                          actif ? "bg-black font-medium text-white" : "bg-[#F0F0F0] text-black",
                        )}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
                <hr className="mt-5 border-black/10" />
              </div>
            )
          })}

          {/* Add to cart */}
          <div className="flex items-center gap-4">
            <CartCounter value={quantite} onChange={setQuantite} />
            <button
              type="button"
              onClick={ajouter}
              className="h-[52px] flex-1 rounded-full bg-black px-8 text-sm font-medium text-white transition-all hover:bg-black/80 sm:text-base"
            >
              Ajouter au panier
            </button>
          </div>
          <button
            type="button"
            onClick={acheter}
            className="mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-black/15 text-sm font-medium transition-colors hover:bg-black hover:text-white sm:text-base"
          >
            <ShoppingBag className="size-4" />
            Acheter maintenant
          </button>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-16 border-t border-black/10 py-12 md:mt-20 md:py-16">
          <ProductListSec title="Vous aimerez aussi" data={related} />
        </div>
      ) : null}

      <Toast toast={toast} />
    </div>
  )
}
