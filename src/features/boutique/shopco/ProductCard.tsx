import { Link } from "react-router-dom"

import { ShopImage } from "./ShopImage"
import { PriceRow } from "./PriceRow"
import type { ProductCardVM } from "./vm"

/**
 * Shopco product card (presentational). Receives a ProductCardVM; links via my
 * routing scheme. Star rating is intentionally omitted — my data has no rating
 * field and the task forbids inventing one (see report).
 */
export function ProductCard({ data }: { data: ProductCardVM }) {
  return (
    <Link to={data.href} className="flex flex-col items-start">
      <div className="relative mb-2.5 aspect-square w-full overflow-hidden rounded-[13px] bg-[#F0EEED] lg:rounded-[20px] xl:mb-4">
        <ShopImage src={data.image} alt={data.title} fit="cover" className="h-full w-full rounded-[inherit]" />
        {data.badge === "solde" ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#FF3333] px-3 py-1 text-[11px] font-medium uppercase text-white">
            Solde
          </span>
        ) : data.badge === "edition" ? (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-[11px] font-medium uppercase text-white">
            Édition limitée
          </span>
        ) : null}
      </div>
      <strong className="line-clamp-1 text-black xl:text-xl">{data.title}</strong>
      <PriceRow
        priceFinal={data.priceFinal}
        priceOriginal={data.priceOriginal}
        discountLabel={data.discountLabel}
        size="card"
        className="mt-1"
      />
    </Link>
  )
}
