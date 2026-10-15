# Dreams Mom — Prototype → Production guide

**Audience:** the engineer/agent who will take this clickable prototype and turn
it into a real, deployed e‑commerce app with a database and a backend.

This repo is a **design + interaction prototype**. It has no backend: every
screen reads and writes an **in‑memory React Context store** seeded on load from
the real Dreams Mom TikTak catalogue. Your job is to keep the UI and flows and
replace the data layer with a real database + API, without redesigning the
screens.

---

## 1. What you are inheriting

- **Stack:** Vite + React 19 + TypeScript, React Router 7, Tailwind v4
  (tokens in `src/styles/index.css`), Radix primitives in `src/components/ui/`.
- **Two experiences, one app:**
  - **Admin back‑office** (`/admin/*`) — on the Dreams Mom design system
    (white + brand blue, DM Serif + Jost). Catalogue, product editor, orders.
  - **Client storefront** (`/client/*`) — re‑skinned with the **Shopco** UI
    (MIT; see `THIRD_PARTY_NOTICES.md`). Home, shop, product, cart/checkout.
- **The store:** `src/data/DataProvider.tsx` holds every collection in
  `useState` and exposes `add/update/remove` per entity through `useData()`
  (`src/data/useData.ts`). **Screens never import seed files for data** — they
  go through `useData()`. This is the seam you will cut: replace the provider's
  internals with API calls; keep the hook's shape so screens don't change.
- **Seed data:** `src/data/seed/*` — types + rows. The real catalogue lives in
  `src/data/seed/tiktak/*.json` (≈251 products, 8 categories, ~3150 variants),
  imported read‑only from the shop's TikTak back‑office. Orders are believable
  mock rows shaped like the real ones.
- **The data contract is already written:** `docs/data-plan.md` is the source of
  truth for every entity and field. Build your schema from it, not from guesses.

### What is real vs. faked (do not mistake one for the other)
- **Real & keep:** entity shapes, field names, relations, the French UI copy,
  all screens and components, the design systems, currency (DT, `formatDT`).
- **Faked & replace:** the in‑memory store (resets on refresh), the cart
  (`panier` slice — session only), order numbers (random), any "ripple" that
  works only because it's one process. No auth, no payments, no file uploads
  (images are CDN URLs or in‑memory object URLs), no real delivery integration.

---

## 2. Target production architecture (recommended)

You can use any stack; this is the path of least resistance given the codebase.

- **Database:** PostgreSQL.
- **ORM / schema:** Prisma (schema in §3). Gives you migrations + typed client.
- **API:** either
  - **(a) Next.js App Router** (move these React screens into it; server
    components + route handlers + server actions), or
  - **(b) keep this Vite SPA** and add a separate API (NestJS / Express / Hono)
    exposing REST or tRPC. Simpler to keep the current repo; see §5.
- **Auth:** admin‑only to start (store staff). Use Auth.js/Lucia or a hosted
  provider. The storefront is public; checkout is guest (name + phone +
  address), matching the prototype (no customer accounts yet).
- **Images:** move off the TikTak CDN. Store in S3/R2/Cloudinary; keep a
  `url` string per image row so the UI (`images[]`) is unchanged.
- **Hosting:** Vercel/Netlify (front), managed Postgres (Neon/Supabase/RDS).
  There is a `vercel.json` already.

---

## 3. Database schema (derived from `docs/data-plan.md`)

IDs are strings in the prototype (slugs like `produit-1312286`). In production
use real primary keys (`cuid`/`uuid`) and keep the TikTak id as an optional
`externalId` for traceability. All money is in **millimes** or a `Decimal` — do
not use floats for money in production (the prototype uses numbers in DT for
display only).

```prisma
// schema.prisma — PostgreSQL

model Category {
  id        String    @id @default(cuid())
  externalId String?  @unique            // TikTak id, if imported
  nom       String                        // HAUT, BAS, CHAUSSURES, ACCESSOIRES…
  products  Product[] @relation("ProductMain")
  taggedIn  Product[] @relation("ProductTags")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Product {
  id             String   @id @default(cuid())
  externalId     String?  @unique
  nom            String
  reference      String   @default("")
  description    String   @default("")    // rich HTML from the editor
  codeBarres     String   @default("")
  categoryId     String?
  category       Category? @relation("ProductMain", fields: [categoryId], references: [id])
  tags           Category[] @relation("ProductTags")          // categoriesSecondaires
  marque         String   @default("")
  prix           Decimal  @db.Decimal(10,3)                    // prix TTC, DT
  remise         Decimal  @default(0) @db.Decimal(10,3)
  remiseType     RemiseType @default(montant)
  actif          Boolean  @default(true)
  afficherSurSite Boolean @default(true)
  personnalise   Boolean  @default(false)
  gestionStock   Boolean  @default(true)
  aDeclinaisons  Boolean  @default(false)
  options        String[]                                     // ["Couleurs","Taille"]
  stock          Int      @default(0)                         // used when !aDeclinaisons
  seuilAlerte    Int      @default(3)
  images         ProductImage[]
  variants       Variant[]
  paliers        PriceTier[]
  lignes         OrderLine[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  position  Int     @default(0)                               // 0 = principale
}

// « Déclinaison » — one combination of option values, with its own stock + photo
model Variant {
  id        String  @id @default(cuid())
  externalId String? @unique
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  valeurs   String[]                                          // one per Product.options, same order
  stock     Int     @default(0)
  image     String  @default("")
}

// « Prix par quantité » — embedded list in the prototype, its own table here
model PriceTier {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantite   Int                                              // from N pieces
  remise     Decimal  @db.Decimal(10,3)
  remiseType RemiseType @default(montant)
  texte      String   @default("")
  badge      String   @default("")
  parDefaut  Boolean  @default(false)
}

model Order {
  id                  String   @id @default(cuid())
  numero              Int      @unique @default(autoincrement())
  client              String
  telephone           String
  telephoneSecondaire String   @default("")
  gouvernorat         String
  ville               String   @default("")
  adresse             String
  codePostal          String   @default("")
  source              OrderSource @default(site_v2)
  statut              OrderStatus @default(en_attente)
  canalContact        ContactChannel @default(dispo)
  transporteur        String   @default("")
  livraisonGratuite   Boolean  @default(false)
  echange             Boolean  @default(false)
  fraisLivraison      Decimal  @default(0) @db.Decimal(10,3)
  remise              Decimal  @default(0) @db.Decimal(10,3)
  remiseType          RemiseType @default(montant)
  typePaiement        PaymentType @default(espece)
  email               String   @default("")
  messenger           String   @default("")
  dateLivraison       DateTime?
  commentaire         String   @default("")
  lignes              OrderLine[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model OrderLine {
  id           String   @id @default(cuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId    String?                                        // keep nullable: product may be deleted later
  product      Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  nom          String                                         // snapshot at order time
  prixUnitaire Decimal  @db.Decimal(10,3)                     // snapshot
  quantite     Int
}

enum RemiseType     { montant pourcentage }
enum OrderStatus    { panier_abandonne en_attente confirmee pret_a_expedier expediee livree retour_non_recue annulee retour_recue }
enum OrderSource    { site_v2 facebook instagram whatsapp messenger appel }
enum ContactChannel { whatsapp dispo }
enum PaymentType    { espece carte virement }
```

### Relations & cascade rules (keep these — the prototype enforces them)
- Delete a **Product** → cascade its images, variants, price tiers. Its order
  lines keep the name/price snapshot but `productId` → null (don't lose order
  history).
- Delete an **Order** → cascade its lines.
- A **Category** cannot be deleted while products reference it (no cascade).
- **Derived values are never stored** — compute in queries/selectors:
  sale price (`prix − remise`), total stock (own stock or Σ variants), stock
  status (En stock / Stock faible / Rupture), order sous‑total (Σ line
  `prixUnitaire × quantite`), total (sous‑total + frais − remise), article
  counts, per‑tab order counts, CA livré, taux de livraison.

### Not modelled yet (intentionally — add only when a screen needs it)
Per‑order payments ledger, Messenger inbox, manifests/bordereaux, delivery‑
company API sync, partial returns, exchange line mapping, customer accounts,
wishlist, reviews/ratings (the storefront hides these — no data), and a
persisted cart (the prototype cart is session‑only; see §6).

---

## 4. Field mapping: prototype → schema

| Prototype (seed type) | Schema | Notes |
|---|---|---|
| `Categorie.id` (slug) | `Category.id` + `externalId` | keep TikTak id in `externalId` |
| `Produit.images: string[]` | `ProductImage[]` (ordered) | `position 0` = principale |
| `Produit.categoriesSecondaires: string[]` | `Product.tags` (M:N) | |
| `Produit.paliers: PalierQuantite[]` | `PriceTier[]` | was embedded, now a table |
| `Declinaison` | `Variant` | `valeurs[]` aligns to `Product.options` |
| `Commande` | `Order` | `date` → `createdAt`; `numero` → `@unique autoincrement` |
| `LigneCommande` | `OrderLine` | `nom`/`prixUnitaire` are snapshots |
| `ArticlePanier` (panier) | **client/session or `Cart` table** | see §6 |
| `number` prices in DT | `Decimal(10,3)` | 3 decimals = millimes |
| display dates ("14 oct. 2026") | `DateTime` | format in the UI, store ISO |

Enum string unions in the prototype (`statut`, `source`, `remiseType`,
`typePaiement`, `canalContact`) map 1:1 to the Prisma enums above — keep the
same values so the French labels and badge colours keep working.

---

## 5. Migration plan (keep the Vite SPA — lowest‑risk path)

1. **Stand up the DB.** Create the Postgres instance, add Prisma, paste §3,
   `prisma migrate dev`.
2. **Seed from the existing JSON.** Write a one‑off script that reads
   `src/data/seed/tiktak/*.json` and inserts Categories → Products →
   ProductImages → Variants → PriceTiers. This gives you the real catalogue in
   the real DB on day one. (Orders: seed a few from `seed/commandes.ts` or start
   empty.)
3. **Build the API.** Expose endpoints/tRPC that mirror the store's actions,
   one group per entity: list/get/create/update/remove for products, variants,
   orders, order lines; list for categories. Compute derived values server‑side
   (don't send them as columns). Mirror the cascade rules from §3.
4. **Replace the store, not the screens.** Rewrite `src/data/DataProvider.tsx`
   so each collection comes from the API (TanStack Query recommended) and each
   `add/update/remove` calls the API then invalidates. **Keep `useData()`'s
   return shape identical** — if you do, no screen needs to change. Where the
   prototype mutates synchronously, make the UI optimistic so it still feels
   instant.
5. **Images.** Add real upload (S3/R2/Cloudinary) in the product editor
   (`src/features/produits/ProduitScreen.tsx` + `ImagesEditor.tsx`), store
   `ProductImage.url`. Remove the in‑memory object‑URL path.
6. **Auth‑gate `/admin`.** Public storefront stays open; wrap admin routes in a
   session check. Add a login screen; the role picker at `/` can become
   "staff login" vs "boutique".
7. **Checkout → real orders.** The storefront already builds an `Order` +
   `OrderLine[]` on "Passer la commande"/"Acheter maintenant" (see
   `src/features/boutique/commander.ts` and `PanierScreen.tsx`). Point those at
   the create‑order API. Generate `numero` from the DB sequence, not random.
8. **Order lifecycle.** The admin orders screen changes `statut` via the status
   tabs/dropdown — wire those to the update‑order endpoint. The 9 statuses are
   the fulfilment pipeline; keep them.

### If you move to Next.js instead (option b → a)
Port screens into the App Router, turn the `useData()` calls into server
component fetches + server actions, and drop React Router. More work, but you
get SSR/SEO for the storefront (useful for an e‑commerce site). The component
tree, Tailwind tokens and design systems port as‑is.

---

## 6. Cart in production
The prototype cart (`panier` slice in `DataProvider`, `ArticlePanier`) is
**session‑only** and clears on refresh / after an order. For production choose:
- **Guest cart in `localStorage`** (simplest, matches current guest checkout), or
- a **`Cart`/`CartItem` table** keyed by a cart cookie (needed for cross‑device
  or abandoned‑cart recovery — note the `panier-abandonne` order status already
  exists for exactly this).
Either way, **totals are computed from the cart + product price at render/commit
time**, never stored on the line until the order is placed (then snapshot them).

---

## 7. Design system boundaries (don't blur them)
- `/admin` uses the **Dreams Mom** design system — see
  `.claude/skills/dreams-mom-design-system` and `CLAUDE.md`. Tokens in
  `src/styles/index.css`. Keep it on‑brand.
- `/client` uses the **Shopco** re‑skin — components in
  `src/features/boutique/shopco/`, fonts/helpers in `src/styles/storefront.css`
  (Satoshi self‑hosted; Anton substitutes the commercial Integral CF — swap in
  Integral CF only with a license). Keep Shopco's MIT notice
  (`THIRD_PARTY_NOTICES.md`).
- The adapter at `src/features/boutique/shopco/adapters.ts` is the only bridge
  between domain types and the storefront view‑models. When your real types
  arrive, update the adapter — not every storefront component.

---

## 8. Checklist to call it "production"
- [ ] Postgres + Prisma schema from §3, migrations committed.
- [ ] Catalogue seeded from `seed/tiktak/*.json` into the DB.
- [ ] API covers every `useData()` action; derived values computed server‑side.
- [ ] `DataProvider` reads/writes the API; `useData()` shape unchanged; screens untouched.
- [ ] Images uploaded to object storage, not CDN hotlinks or object URLs.
- [ ] `/admin` behind auth; storefront public; guest checkout works end‑to‑end.
- [ ] Orders get real sequential numbers; status pipeline updates persist.
- [ ] Cascades & the "category in use can't be deleted" rule enforced in the DB/API.
- [ ] Money stored as `Decimal` (millimes), formatted as DT in the UI.
- [ ] `pnpm build` + typecheck pass; both experiences verified at phone + desktop.

---

## 9. Pointers
- Data contract: [`docs/data-plan.md`](docs/data-plan.md)
- Project rules & conventions: [`CLAUDE.md`](CLAUDE.md)
- Store seam: [`src/data/DataProvider.tsx`](src/data/DataProvider.tsx), [`src/data/useData.ts`](src/data/useData.ts)
- Admin reference feature: [`src/features/produits/`](src/features/produits/)
- Storefront + adapter: [`src/features/boutique/`](src/features/boutique/)
- Third‑party notices: [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)
