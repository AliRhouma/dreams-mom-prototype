import { cn } from "@/lib/utils"

/**
 * On/off toggle (role="switch"). On = brand blue (a selected control), off =
 * neutral. Pass `label` for screen readers when no visible label sits beside it.
 */
export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!checked)
      }}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-pill border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
        checked ? "border-primary bg-primary" : "border-input bg-surface-nested",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-[18px] rounded-full bg-background shadow-card transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
          checked ? "translate-x-[18px]" : "translate-x-[2px]",
        )}
      />
    </button>
  )
}
