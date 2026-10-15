import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ArrowLeftRight, ChevronRight } from "lucide-react"

import { Logo } from "@/components/kit/Logo"
import { navTree, type NavGroup, type NavLeaf } from "@/lib/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

/** "/" matches only the home route; every other route also matches its children. */
function useIsActive() {
  const { pathname } = useLocation()
  return (path: string, exact = false) =>
    path === "/" || exact
      ? pathname === path
      : pathname === path || pathname.startsWith(path + "/")
}

/** Wordmark; a collapsed (icon) sidebar keeps the monogram alone. */
function BrandMark() {
  return (
    <Link
      to="/admin"
      className="flex h-8 min-w-0 items-center outline-hidden"
      aria-label="Dreams Mom — Tableau de bord"
    >
      <Logo variant="mark" alt="" className="hidden h-8 group-data-[collapsible=icon]:flex" />
      <Logo alt="" className="h-8 group-data-[collapsible=icon]:hidden" />
    </Link>
  )
}

function NavLeafItem({ leaf, isActive }: { leaf: NavLeaf; isActive: boolean }) {
  const Icon = leaf.icon
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={leaf.label}>
        <Link to={leaf.path} aria-current={isActive ? "page" : undefined}>
          <Icon />
          <span>{leaf.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavGroupItem({
  group,
  isActive,
}: {
  group: NavGroup
  isActive: (path: string) => boolean
}) {
  const { state } = useSidebar()
  const Icon = group.icon
  const hasActiveChild = group.children.some((c) => isActive(c.path))

  return (
    <Collapsible asChild defaultOpen={hasActiveChild} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {/* In icon mode the parent shows the active state when a child is active. */}
          <SidebarMenuButton
            tooltip={group.label}
            isActive={state === "collapsed" && hasActiveChild}
          >
            <Icon />
            <span>{group.label}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 text-ink-muted transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {group.children.map((child) => {
              const ChildIcon = child.icon
              const childActive = isActive(child.path)
              return (
                <SidebarMenuSubItem key={child.path}>
                  <SidebarMenuSubButton asChild isActive={childActive}>
                    <Link to={child.path} aria-current={childActive ? "page" : undefined}>
                      <ChildIcon />
                      <span>{child.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppSidebar() {
  const isActive = useIsActive()
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()

  // Phone drawer: close it once a link has navigated, so the new screen shows.
  useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-10 items-center justify-between gap-2 px-1">
          <BrandMark />
          {/* Collapse toggle — hidden in icon mode (the rail + top-bar trigger re-open it). */}
          <SidebarTrigger className="shrink-0 text-ink-muted hover:text-ink group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navTree.map((node) =>
              node.type === "group" ? (
                <NavGroupItem key={node.key} group={node} isActive={isActive} />
              ) : (
                <NavLeafItem
                  key={node.path}
                  leaf={node}
                  isActive={isActive(node.path, node.exact)}
                />
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Changer d’espace">
              <Link to="/">
                <ArrowLeftRight />
                <span>Changer d’espace</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-2 font-body text-[0.68rem] text-ink-disabled group-data-[collapsible=icon]:hidden">
          Prototype · v0.1
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
