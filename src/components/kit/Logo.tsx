import { cn } from "@/lib/utils"

/**
 * Dreams Mom brand — an italic DM Serif "Dm" monogram in a brand-blue tile next
 * to the "DREAMS MOM" wordmark set in DM Serif caps (echoes the real logo).
 * Placeholder until real brand art arrives: swap this for an <img> of the SVG
 * in `src/assets/brand/` and keep the same props.
 *
 * `variant="mark"` keeps the tile alone, for a collapsed sidebar.
 * Pass `alt=""` when the logo sits inside a link that already carries a label.
 */
export function Logo({
  variant = "wordmark",
  alt = "Dreams Mom",
  className,
}: {
  variant?: "wordmark" | "mark"
  alt?: string
  className?: string
}) {
  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("inline-flex shrink-0 items-center gap-2.5 select-none", className)}
    >
      <span className="flex aspect-square h-full min-h-7 items-center justify-center rounded-md bg-primary font-display text-[0.95rem] font-normal italic text-ink-inverted">
        Dm
      </span>
      {variant === "wordmark" ? (
        <span className="font-display text-[0.95rem] font-normal tracking-[0.12em] whitespace-nowrap text-brand-blue-600 uppercase">
          Dreams Mom
        </span>
      ) : null}
    </span>
  )
}
