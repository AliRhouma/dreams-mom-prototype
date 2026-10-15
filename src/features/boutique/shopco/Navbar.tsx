import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeftRight, Menu, Search, ShoppingCart, X } from "lucide-react"

import type { Categorie } from "@/data/seed/categories"
import { cn } from "@/lib/utils"

const STORE = "DREAMS MOM"

/**
 * Shopco top navbar (presentational): store wordmark in the display face, a
 * category menu, a grey search pill (submits to the shop page), the cart button
 * with a live count, and the "changer d'espace" escape hatch (Shopco's user
 * icon). Mobile shows a hamburger overlay menu. Routing is my scheme.
 */
export function Navbar({ cartCount, categories }: { cartCount: number; categories: Categorie[] }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState("")

  const nav = categories.filter((c) => c.nom !== "SOLDES").slice(0, 5)
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/client/shop?q=${encodeURIComponent(q.trim())}` : "/client/shop")
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-30 bg-white">
      <div className="relative mx-auto flex max-w-[1240px] items-center justify-between px-4 py-5 md:justify-start md:py-6 xl:px-0">
        {/* Left: mobile menu + wordmark */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(true)}
            className="mr-4 block md:hidden"
          >
            <Menu className="size-6" />
          </button>
          <Link to="/client" className="font-display-shopco mr-3 text-2xl lg:mr-10 lg:text-[32px]">
            {STORE}
          </Link>
        </div>

        {/* Desktop menu */}
        <ul className="mr-2 hidden items-center gap-6 text-base md:flex lg:mr-7">
          <li>
            <Link to="/client/shop" className="transition-opacity hover:opacity-60">Boutique</Link>
          </li>
          {nav.map((c) => (
            <li key={c.id}>
              <Link to={`/client/shop?cat=${c.id}`} className="capitalize transition-opacity hover:opacity-60">
                {c.nom.toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop search */}
        <form
          onSubmit={submitSearch}
          className="mr-3 hidden flex-1 items-center gap-3 rounded-full bg-[#F0F0F0] px-4 py-3 md:flex lg:mr-10"
        >
          <Search className="size-5 shrink-0 text-black/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Rechercher un article..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
          />
        </form>

        {/* Right: cart + espaces */}
        <div className="flex items-center gap-1">
          <Link to="/client/shop" aria-label="Rechercher" className="p-1 md:hidden">
            <Search className="size-[22px]" />
          </Link>
          <Link to="/client/panier" aria-label="Panier" className="relative p-1">
            <ShoppingCart className="size-[22px]" />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.05rem] items-center justify-center rounded-full bg-black px-1 text-[0.6rem] font-medium text-white tabular-nums">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link to="/" aria-label="Changer d'espace" title="Changer d'espace" className="p-1">
            <ArrowLeftRight className="size-[22px]" />
          </Link>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[78%] max-w-xs bg-white p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display-shopco text-xl">{STORE}</span>
              <button type="button" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={submitSearch} className="mb-5 flex items-center gap-2 rounded-full bg-[#F0F0F0] px-4 py-2.5">
              <Search className="size-4 text-black/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Rechercher..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
              />
            </form>
            <ul className="flex flex-col gap-1">
              <MobileLink to="/client/shop" onClick={() => setMenuOpen(false)}>Boutique</MobileLink>
              {nav.map((c) => (
                <MobileLink key={c.id} to={`/client/shop?cat=${c.id}`} onClick={() => setMenuOpen(false)}>
                  <span className="capitalize">{c.nom.toLowerCase()}</span>
                </MobileLink>
              ))}
              <MobileLink to="/client/panier" onClick={() => setMenuOpen(false)}>Panier</MobileLink>
              <MobileLink to="/" onClick={() => setMenuOpen(false)}>Changer d’espace</MobileLink>
            </ul>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={cn("block rounded-lg px-3 py-2.5 text-[0.95rem] transition-colors hover:bg-[#F0F0F0]")}
      >
        {children}
      </Link>
    </li>
  )
}
