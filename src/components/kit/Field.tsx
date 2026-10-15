import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Label + control (+ optional hint) — the field rhythm of every form
 * (design system: Field). Label in Jost 500 13px ink-subtle, sentence case;
 * `required` adds the asterisk; `error` replaces the hint in danger.
 */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode
  htmlFor?: string
  required?: boolean
  hint?: ReactNode
  error?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="font-ui text-[0.8125rem] font-medium text-ink-subtle">
        {label}
        {required ? <span className="ml-0.5 text-ink-muted">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="font-body text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="font-body text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}

/** A labelled switch row: title + description on the left, the toggle on the right. */
export function ToggleRow({
  title,
  description,
  control,
}: {
  title: ReactNode
  description?: ReactNode
  control: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-ui text-sm text-ink">{title}</span>
        {description ? <span className="font-body text-xs text-ink-muted">{description}</span> : null}
      </div>
      {control}
    </div>
  )
}
