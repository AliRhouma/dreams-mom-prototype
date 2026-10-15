import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Small on-rule building blocks shared by every screen (design-system cheat-sheet):
 * Panel, Stat, Bar, NumInput, Segmented, LinkBtn. Reuse these instead of
 * re-styling a stat tile or a tab switch per screen.
 */

/* ── Panel (static card: uppercase header + body) ──────────────────────── */
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-[1.1rem] py-3">
        <h2 className="font-ui text-[0.78rem] font-medium tracking-[0.06em] text-ink-subtle uppercase">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-[1.1rem]">{children}</div>
    </section>
  )
}

/* ── Stat tile (big value + uppercase label + optional delta) ──────────── */
export function Stat({
  label,
  value,
  tone,
  delta,
  dtone,
}: {
  label: ReactNode
  value: ReactNode
  tone?: "positive" | "negative"
  delta?: ReactNode
  dtone?: "up" | "down"
}) {
  return (
    <div className="rounded-lg border border-border px-5 py-[1.1rem]">
      <div
        className={cn(
          "font-ui text-[2rem] leading-none font-normal tracking-[-0.01em] tabular-nums lining-nums",
          tone === "positive" && "text-success",
          tone === "negative" && "text-danger",
          !tone && "text-ink",
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 font-ui text-[0.68rem] font-medium tracking-[0.1em] text-ink-muted uppercase">
        {label}
      </div>
      {delta ? (
        <div
          className={cn(
            "mt-2 font-body text-[0.76rem]",
            dtone === "up" && "text-success",
            dtone === "down" && "text-danger",
            !dtone && "text-info",
          )}
        >
          {delta}
        </div>
      ) : null}
    </div>
  )
}

/* ── Progress bar — brand blue on a brand-blue-100 track, amber near the limit ── */
export function Bar({
  value,
  warn,
  sm,
}: {
  value: number
  warn?: boolean
  sm?: boolean
}) {
  return (
    <div className={cn("overflow-hidden rounded bg-brand-blue-100", sm ? "h-[5px]" : "h-[7px]")}>
      <div
        className={cn(
          "h-full rounded transition-[width] duration-500",
          warn ? "bg-warning" : "bg-primary",
        )}
        style={{ width: Math.min(Math.max(value, 0), 100) + "%" }}
      />
    </div>
  )
}

/* ── Number input with a unit suffix ───────────────────────────────────── */
export function NumInput({
  value,
  suffix,
  onChange,
  small,
}: {
  value: number
  suffix: string
  onChange: (value: number) => void
  small?: boolean
}) {
  return (
    <div className="relative flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-input-bg text-right font-body text-sm text-ink tabular-nums outline-none transition-colors placeholder:text-ink-disabled focus:border-border-focus",
          small ? "pr-7 pl-2.5" : "pr-12 pl-3",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute font-body text-[0.74rem] text-ink-disabled",
          small ? "right-2.5" : "right-3",
        )}
      >
        {suffix}
      </span>
    </div>
  )
}

/* ── Segmented control (in-screen tabs / filters / mode switch) ────────── */
export type SegOption<T extends string> = {
  value: T
  label: ReactNode
  badge?: ReactNode
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (value: T) => void
  options: SegOption<T>[]
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex max-w-full gap-1 overflow-x-auto rounded-pill border border-border bg-transparent p-1",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-4 py-1.5 font-ui text-[0.76rem] font-medium transition-colors",
              active
                ? "border border-border-second bg-surface-nested text-ink"
                : "border border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {o.label}
            {o.badge != null ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[0.66rem]",
                  active ? "bg-surface-hover" : "bg-accent",
                )}
              >
                {o.badge}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/* ── Inline "+ Ajouter" text action — blue, uppercase ──────────────────── */
export function LinkBtn({
  onClick,
  children,
}: {
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 font-ui text-[0.7rem] font-medium tracking-[0.05em] text-info uppercase transition-opacity hover:opacity-80"
    >
      {children}
    </button>
  )
}
