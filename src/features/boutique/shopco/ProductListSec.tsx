import { Link } from "react-router-dom"

import { ProductCard } from "./ProductCard"
import type { ProductCardVM } from "./vm"

/**
 * Shopco "section of products" — big centered display title, a horizontal
 * scroll-snap row of cards (CSS scroller instead of embla, to avoid a dep),
 * and a "Voir tout" outline button.
 */
export function ProductListSec({
  title,
  data,
  viewAllLink,
}: {
  title: string
  data: ProductCardVM[]
  viewAllLink?: string
}) {
  if (data.length === 0) return null
  return (
    <section className="mx-auto max-w-[1240px] text-center">
      <h2 className="font-display-shopco mb-8 text-[32px] uppercase md:mb-14 md:text-5xl">{title}</h2>

      <div className="mb-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:gap-5 md:mb-9 xl:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.map((product) => (
          <div key={product.id} className="w-[198px] shrink-0 snap-start sm:w-[295px]">
            <ProductCard data={product} />
          </div>
        ))}
      </div>

      {viewAllLink ? (
        <div className="w-full px-4 text-center sm:px-0">
          <Link
            to={viewAllLink}
            className="inline-block w-full rounded-full border border-black/10 px-[54px] py-4 text-sm font-medium text-black transition-all hover:bg-black hover:text-white sm:w-[218px] sm:text-base"
          >
            Voir tout
          </Link>
        </div>
      ) : null}
    </section>
  )
}
