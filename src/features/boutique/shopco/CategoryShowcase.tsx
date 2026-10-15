import { Link } from "react-router-dom"

import { ShopImage } from "./ShopImage"

type Tile = { id: string; nom: string; image: string; wide?: boolean }

/**
 * Shopco "browse by style" block — a soft grey rounded panel with category
 * tiles over product imagery. Tiles link to the shop, filtered by category.
 */
export function CategoryShowcase({ title, tiles }: { title: string; tiles: Tile[] }) {
  if (tiles.length === 0) return null
  return (
    <section className="mx-auto max-w-[1240px] px-4 xl:px-0">
      <div className="rounded-[20px] bg-[#F0F0F0] px-6 pb-6 pt-8 md:px-16 md:pb-16 md:pt-14">
        <h2 className="font-display-shopco mb-8 text-center text-[32px] uppercase md:mb-14 md:text-5xl">{title}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 md:gap-5">
          {tiles.map((t, i) => (
            <Link
              key={t.id}
              to={`/client/shop?cat=${t.id}`}
              className={
                "group relative flex h-48 overflow-hidden rounded-[20px] bg-white md:h-72 " +
                (i % 4 === 0 || i % 4 === 3 ? "sm:col-span-2" : "sm:col-span-4")
              }
            >
              <ShopImage
                src={t.image}
                alt={t.nom}
                fit="cover"
                className="absolute inset-0 h-full w-full bg-white"
              />
              <span className="relative z-10 m-6 h-fit rounded-md bg-white/70 px-3 py-1 text-xl font-bold capitalize text-black backdrop-blur-sm md:text-2xl">
                {t.nom.toLowerCase()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
