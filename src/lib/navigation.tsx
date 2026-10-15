import { LayoutDashboard, Package, Shirt, type LucideIcon } from "lucide-react"

/**
 * Single source of truth for the ADMIN sidebar navigation (all paths live
 * under /admin; the role picker at / and the client space sit outside it).
 * Both the sidebar (src/components/AppSidebar.tsx) and the router
 * (src/App.tsx) read from this tree, so a route and its nav entry can never
 * drift apart. Any leaf without a real screen yet renders the on-brand
 * <Placeholder/> — so every nav entry is clickable from day one.
 *
 * Add each admin module here as it enters docs/data-plan.md.
 */

export type NavLeaf = {
  type: "item"
  label: string
  path: string
  icon: LucideIcon
  /** Active only on an exact match (a root that owns sub-routes). */
  exact?: boolean
}

export type NavGroup = {
  type: "group"
  label: string
  icon: LucideIcon
  /** stable key used for collapsible state */
  key: string
  children: NavLeaf[]
}

export type NavNode = NavLeaf | NavGroup

export const navTree: NavNode[] = [
  { type: "item", label: "Tableau de bord", path: "/admin", icon: LayoutDashboard, exact: true },
  { type: "item", label: "Produits", path: "/admin/produits", icon: Shirt },
  { type: "item", label: "Commandes", path: "/admin/commandes", icon: Package },
]

/** Flattened list of every leaf route — consumed by the router and top bar. */
export const navLeaves: NavLeaf[] = navTree.flatMap((node) =>
  node.type === "group" ? node.children : [node],
)
