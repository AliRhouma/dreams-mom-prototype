import { useEffect, useRef, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react"

import { navLeaves } from "@/lib/navigation"
import { AppSidebar } from "@/components/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/**
 * Reads the sidebar's collapsed/expanded state from the cookie that
 * SidebarProvider writes on every toggle, so it survives a refresh.
 */
function readSidebarDefaultOpen(): boolean {
  if (typeof document === "undefined") return true
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=(true|false)/)
  return match ? match[1] === "true" : true
}

/** Circular icon button in the top-bar action cluster. */
function IconAction({ icon: Icon, label }: { icon: typeof Bell; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-transparent bg-surface text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      <Icon size={17} />
    </button>
  )
}

/** Account chip → dropdown. Closes on outside click or Escape. */
function AccountMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Mon compte"
        title="Mon compte"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-surface py-0.5 pr-1.5 pl-0.5 text-ink transition-colors"
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-surface-nested text-ink">
          <User size={17} />
        </span>
        <ChevronDown
          size={14}
          className={cn("text-ink-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="animate-pop-in absolute right-0 z-50 mt-2 w-[240px] overflow-hidden rounded-xl border border-border bg-surface shadow-deep">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-nested text-ink">
              <User size={18} />
            </span>
            <div className="min-w-0">
              {/* TODO(project): read the signed-in user from the store. */}
              <div className="truncate font-ui text-sm font-medium text-ink">Administrateur démo</div>
              <div className="truncate font-body text-xs text-ink-muted">Back-office</div>
            </div>
          </div>
          <div className="py-1.5">
            <MenuItem icon={User} label="Mon profil" onClick={() => setOpen(false)} />
            <MenuItem icon={Settings} label="Paramètres" onClick={() => setOpen(false)} />
          </div>
          <div className="border-t border-border py-1.5">
            <MenuItem icon={LogOut} label="Se déconnecter" danger onClick={() => navigate("/")} />
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof User
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left font-body text-sm transition-colors hover:bg-surface-hover",
        danger ? "text-danger" : "text-ink-subtle hover:text-ink",
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

/** Top-bar title = the nav leaf that owns the current URL (longest match wins). */
function useCurrentTitle(): string {
  const { pathname } = useLocation()
  const leaves = [...navLeaves].sort((a, b) => b.path.length - a.path.length)
  const leaf = leaves.find((l) =>
    l.exact ? pathname === l.path || pathname === l.path + "/" : pathname.startsWith(l.path),
  )
  return leaf?.label ?? "Page introuvable"
}

/**
 * The app frame: collapsible sidebar (a slide-in drawer under 768px, see
 * hooks/use-mobile) + a fixed top bar + the scrollable content area that every
 * routed screen renders into.
 */
export function AppShell() {
  const title = useCurrentTitle()

  return (
    <SidebarProvider defaultOpen={readSidebarDefaultOpen()}>
      <AppSidebar />
      {/* Viewport-height inset so the content area below is the real scroll
          container — otherwise `position: sticky` inside a screen has no
          scrollport to stick to. */}
      <SidebarInset className="h-svh overflow-hidden">
        <header className="z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface-deep px-4">
          <SidebarTrigger className="text-ink-muted hover:text-ink" />
          <Separator orientation="vertical" className="mr-1 !h-5 bg-border" />
          <h1 className="truncate font-ui text-sm font-semibold tracking-wide text-ink">
            {title}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <IconAction icon={Bell} label="Notifications" />
            <AccountMenu />
          </div>
        </header>

        <div className="min-h-0 flex-1 scroll-pb-24 overflow-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
