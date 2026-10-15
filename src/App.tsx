import { BrowserRouter, Route, Routes } from "react-router-dom"
import { FileQuestion } from "lucide-react"

import { navLeaves } from "@/lib/navigation"
import { DataProvider } from "@/data/DataProvider"
import { AppShell } from "@/shells/AppShell"
import { Placeholder } from "@/components/kit/Placeholder"
import { ScrollToTop } from "@/components/ScrollToTop"
import { RoleSelectScreen } from "@/features/roles/RoleSelectScreen"
import { BoutiqueShell } from "@/features/boutique/BoutiqueShell"
import { BoutiqueHome } from "@/features/boutique/BoutiqueHome"
import { BoutiqueShopScreen } from "@/features/boutique/BoutiqueShopScreen"
import { ProduitVitrineScreen } from "@/features/boutique/ProduitVitrineScreen"
import { PanierScreen } from "@/features/boutique/PanierScreen"
import { AdminDashboardScreen } from "@/features/admin/AdminDashboardScreen"
import { ProduitsScreen } from "@/features/produits/ProduitsScreen"
import { NouveauProduitScreen, ProduitScreen } from "@/features/produits/ProduitScreen"
import { CommandesScreen } from "@/features/commandes/CommandesScreen"
import { NouvelleCommandeScreen, CommandeScreen } from "@/features/commandes/CommandeScreen"

/** Admin nav leaves that have a real screen (everything else gets a Placeholder). */
const CUSTOM_ROUTES = new Set(["/admin", "/admin/produits", "/admin/commandes"])

/**
 * <DataProvider> wraps the router (CLAUDE.md).
 * - `/`        role picker (full page, no shell)
 * - `/admin/*` the back-office, inside <AppShell/>; nav leaves without a real
 *              screen yet fall back to the on-brand Placeholder
 * - `/client`  the storefront (BoutiqueShell): home, product preview, cart
 */
export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route index element={<RoleSelectScreen />} />

          <Route path="client" element={<BoutiqueShell />}>
            <Route index element={<BoutiqueHome />} />
            <Route path="shop" element={<BoutiqueShopScreen />} />
            <Route path="produit/:produitId" element={<ProduitVitrineScreen />} />
            <Route path="panier" element={<PanierScreen />} />
          </Route>

          <Route path="admin" element={<AppShell />}>
            <Route index element={<AdminDashboardScreen />} />
            <Route path="produits" element={<ProduitsScreen />} />
            <Route path="produits/nouveau" element={<NouveauProduitScreen />} />
            <Route path="produits/:produitId" element={<ProduitScreen />} />
            <Route path="commandes" element={<CommandesScreen />} />
            <Route path="commandes/nouvelle" element={<NouvelleCommandeScreen />} />
            <Route path="commandes/:commandeId" element={<CommandeScreen />} />

            {navLeaves
              .filter((leaf) => !CUSTOM_ROUTES.has(leaf.path))
              .map((leaf) => (
                <Route
                  key={leaf.path}
                  path={leaf.path.replace(/^\/admin\//, "")}
                  element={<Placeholder title={leaf.label} icon={leaf.icon} />}
                />
              ))}

            <Route
              path="*"
              element={<Placeholder title="Page introuvable" icon={FileQuestion} />}
            />
          </Route>

          <Route path="*" element={<RoleSelectScreen />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  )
}
