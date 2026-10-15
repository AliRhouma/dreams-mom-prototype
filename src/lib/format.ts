/** "148" / "148,500" — DT in French format, millimes only when there are some. */
export function formatDT(value: number): string {
  const rounded = Math.round(value * 1000) / 1000
  return Number.isInteger(rounded)
    ? rounded.toLocaleString("fr-FR")
    : rounded.toLocaleString("fr-FR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })
}
