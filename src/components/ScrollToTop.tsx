import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Every new page starts at the top. BrowserRouter keeps the window where it
 * was, so a long page (the shop, a product) used to open half-way down.
 * Only the path counts: a query change (?cat=…) stays an in-page filter.
 * The admin scrolls inside its own container — AppShell resets that one.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])
  return null
}
