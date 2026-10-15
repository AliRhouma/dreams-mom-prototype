import { Link } from "react-router-dom"

import { ShopImage } from "./ShopImage"

type Stat = { value: string; label: string }

/**
 * Shopco hero — heavy uppercase display headline, lede, a black "Shop Now"
 * pill, a stats row, and a featured image on the right. Entrance animations
 * (framer-motion in Shopco) are intentionally dropped to avoid a dependency.
 */
export function Hero({
  featuredImage,
  stats,
}: {
  featuredImage: string
  stats: Stat[]
}) {
  return (
    <header className="overflow-hidden bg-[#F2F0F1] pt-10 md:pt-24">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 md:grid-cols-2">
        <section className="px-4">
          <h2 className="font-display-shopco mb-5 text-4xl leading-[1.05] md:mb-8 lg:text-[64px] lg:leading-[64px]">
            Trouvez des vêtements qui matchent votre style
          </h2>
          <p className="mb-6 max-w-[545px] text-sm text-black/60 md:mb-8 lg:text-base">
            Parcourez une sélection de pièces masculines, du tailleur au streetwear,
            pensées pour révéler votre style. Livraison partout en Tunisie.
          </p>
          <Link
            to="/client/shop"
            className="mb-5 inline-block w-full rounded-full bg-black px-14 py-4 text-center text-white transition-all hover:bg-black/80 md:mb-12 md:w-52"
          >
            Découvrir
          </Link>
          <div className="flex flex-wrap items-center justify-center md:mb-[116px] md:justify-start md:space-x-3 lg:space-x-6 xl:space-x-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={
                  "flex flex-col " +
                  (i > 0 ? "ml-6 border-l border-black/10 pl-6 md:ml-0 md:border-l-0 md:pl-0" : "")
                }
              >
                <span className="text-2xl font-bold md:text-xl lg:text-3xl xl:mb-2 xl:text-[40px]">{s.value}</span>
                <span className="text-nowrap text-xs text-black/60 xl:text-base">{s.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="relative min-h-[320px] md:min-h-[428px]">
          <ShopImage
            src={featuredImage}
            alt="Collection Dreams Mom"
            fit="cover"
            className="h-full min-h-[320px] w-full bg-transparent md:min-h-[428px]"
          />
          <span aria-hidden className="pointer-events-none absolute right-7 top-10 text-5xl text-black xl:right-10">✦</span>
          <span aria-hidden className="pointer-events-none absolute left-7 top-40 text-3xl text-black md:left-10">✦</span>
        </section>
      </div>
    </header>
  )
}
