import { Link } from "react-router-dom"
import { ArrowRight, ShieldCheck, ShoppingBag, type LucideIcon } from "lucide-react"

import { Logo } from "@/components/kit/Logo"

type Role = {
  to: string
  icon: LucideIcon
  overline: string
  title: string
  description: string
  points: string[]
}

const ROLES: Role[] = [
  {
    to: "/admin",
    icon: ShieldCheck,
    overline: "Back-office",
    title: "Administrateur",
    description: "Pilotez la boutique : catalogue, commandes et clients.",
    points: ["Gérer le catalogue et les stocks", "Suivre les commandes", "Consulter les clients"],
  },
  {
    to: "/client",
    icon: ShoppingBag,
    overline: "Boutique",
    title: "Client",
    description: "Découvrez la collection et suivez vos achats.",
    points: ["Parcourir la collection", "Gérer son panier", "Suivre ses commandes"],
  },
]

/** One navigable role card — the fluid surface fill from the design system. */
function RoleCard({ role }: { role: Role }) {
  const Icon = role.icon
  return (
    <Link
      to={role.to}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-border-strong focus-visible:border-border-focus"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-top scale-y-0 bg-surface transition-transform duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-y-100"
      />

      <div className="relative z-10 flex flex-1 flex-col gap-5 p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-md bg-surface-nested text-ink-muted transition-colors group-hover:text-brand-blue-600">
          <Icon className="size-6" strokeWidth={1.75} />
        </span>

        <div className="flex flex-col gap-1.5">
          <span className="font-ui text-[0.68rem] font-medium tracking-[0.12em] text-ink-muted uppercase">
            {role.overline}
          </span>
          <h2 className="font-display text-[1.75rem] leading-tight font-normal text-ink transition-colors group-hover:text-brand-blue-600">
            {role.title}
          </h2>
          <p className="font-body text-sm text-ink-muted">{role.description}</p>
        </div>

        <ul className="flex flex-col gap-2">
          {role.points.map((p) => (
            <li key={p} className="flex items-center gap-2.5 font-body text-sm text-ink-subtle">
              <span aria-hidden className="size-1 shrink-0 rounded-full bg-ink-disabled" />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-border px-6 py-4 sm:px-8">
        <span className="font-ui text-sm text-ink transition-colors group-hover:text-brand-blue-600">
          Entrer dans l’espace
        </span>
        <ArrowRight className="size-4 text-ink-disabled transition-colors group-hover:text-brand-blue-600" />
      </div>
    </Link>
  )
}

/**
 * Entry of the prototype — pick a role. Full page, outside the app shell:
 * the admin card enters the back-office, the client card the boutique.
 */
export function RoleSelectScreen() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex h-16 items-center border-b border-border px-4 sm:px-8">
        <Logo className="h-8" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
        <div className="flex w-full max-w-[880px] flex-col gap-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="font-ui text-[0.68rem] font-medium tracking-[0.12em] text-ink-muted uppercase">
              Bienvenue chez Dreams Mom
            </span>
            <h1 className="font-display text-[2.25rem] leading-[1.1] font-normal text-ink text-balance sm:text-[3rem]">
              Choisissez votre <em className="font-normal">espace</em>
            </h1>
            <p className="max-w-md font-body text-[0.95rem] text-ink-muted">
              Deux interfaces pour une même boutique. Vous pourrez changer
              d’espace à tout moment.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {ROLES.map((r) => (
              <RoleCard key={r.to} role={r} />
            ))}
          </div>
        </div>
      </main>

      <footer className="px-4 pb-6 text-center font-body text-xs text-ink-disabled sm:px-8">
        Prototype · données fictives, réinitialisées à chaque rechargement
      </footer>
    </div>
  )
}
