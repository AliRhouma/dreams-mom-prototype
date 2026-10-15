import { Link, NavLink, Outlet, useSearchParams } from "react-router-dom"
import { ArrowLeftRight, ShoppingBag } from "lucide-react"

import { useData } from "@/data/useData"
import { Logo } from "@/components/kit/Logo"
import { cn } from "@/lib/utils"

/**
 * Boutique frame — the client-facing storefront (a shop, not the admin shell):
 * editorial serif wordmark, a thin category nav, a cart button with a live
 * count, and a way back to the role picker so the demo never dead-ends.
 * Référence : l'en-tête de l'ancien ClientSpaceScreen + les cartes de RoleSelect.
 */
export function BoutiqueShell() {
  const { categories, panier } = useData()
  const nbPanier = panier.reduce((n, a) => n + a.quantite, 0)
  const [params] = useSearchParams()
  const catActive = params.get("cat") ?? ""

  // Les catégories mises en avant dans la nav (comme la boutique : quelques entrées).
  const nav = categories.filter((c) => c.nom !== "SOLDES").slice(0, 5)

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-8">
          <Link to="/client" aria-label="Dreams Mom — Boutique" className="flex h-8 shrink-0 items-center">
            <Logo alt="" className="h-8" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <CatLink to="/client" label="Boutique" active={catActive === "" && !params.get("q")} />
            {nav.map((c) => (
              <CatLink key={c.id} to={`/client?cat=${c.id}`} label={c.nom} active={catActive === c.id} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/client/panier"
              aria-label={`Panier${nbPanier ? ` — ${nbPanier} article${nbPanier > 1 ? "s" : ""}` : ""}`}
              className="relative inline-flex size-9 items-center justify-center rounded-md border border-border-strong text-ink transition-colors hover:bg-surface-hover"
            >
              <ShoppingBag className="size-4" />
              {nbPanier > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 flex min-w-[1.1rem] items-center justify-center rounded-pill bg-primary px-1 font-ui text-[0.62rem] font-medium text-primary-foreground tabular-nums">
                  {nbPanier}
                </span>
              ) : null}
            </Link>
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong px-3 font-ui text-sm text-ink transition-colors hover:bg-surface-hover"
            >
              <ArrowLeftRight className="size-4 text-ink-muted" />
              <span className="hidden sm:inline">Changer d’espace</span>
              <span className="sm:hidden">Espaces</span>
            </Link>
          </div>
        </div>

        {/* Nav catégories sur mobile (scroll horizontal) */}
        <div className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          <CatLink to="/client" label="Boutique" active={catActive === "" && !params.get("q")} />
          {nav.map((c) => (
            <CatLink key={c.id} to={`/client?cat=${c.id}`} label={c.nom} active={catActive === c.id} />
          ))}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 text-center">
          <Logo alt="Dreams Mom" className="h-7 opacity-80" />
          <p className="font-body text-xs text-ink-muted">
            Mode masculine · Livraison partout en Tunisie · Paiement à la livraison
          </p>
        </div>
      </footer>
    </div>
  )
}

function CatLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <NavLink
      to={to}
      className={cn(
        "shrink-0 rounded-md px-3 py-1.5 font-ui text-[0.82rem] font-medium tracking-[0.02em] whitespace-nowrap uppercase transition-colors",
        active ? "text-brand-blue-600" : "text-ink-muted hover:text-ink",
      )}
    >
      {label}
    </NavLink>
  )
}
