# Data plan — Dreams Mom prototype

The prototype's data slice: every entity the screens show, with **only** the
fields a screen displays or edits. `src/data/seed/*.ts` types and seed rows
follow this file exactly. Update this file first, then the seed, then the store.

> **Status: APPROVED (module 1 — Produits).** Modelled on the shop's real
> back-office (TikTak PRO product form). Seed = the **real Dreams Mom catalogue**
> imported read-only from TikTak (251 products, 8 categories, ~3 150 active
> variants) into `src/data/seed/tiktak/*.json`. Field names follow the form's
> French labels; TikTak ids are kept in our slugs (`produit-1312286`).

## Conventions
- IDs are strings. Seed rows: slugs carrying the TikTak id (`produit-1312286`, `cat-accessoires`). New rows: `crypto.randomUUID()`.
- A child carries its parent's id (`produitId`). Deleting a parent cascades.
- Dates the UI only displays are plain display strings ("12 juin 2026"); use ISO (`2026-06-12`) only when a screen sorts/groups by date.
- Enums are string unions with a `{ value, label }[]` list next to them for selects.
- Derived values (counts, %, "X/Y") are **not** fields — they're computed in render.

## Seed variety checklist (per entity)
- 4–8 rows, varied names and statuses (not all "actif").
- One edge case (overdue / cancelled / error).
- One long name (tests truncation).
- One empty record (no children / no description) to show an empty state.

---

## Entities

Currency: **DT** (dinar tunisien), as in the shop — displayed `148 DT`,
`148,500 DT` when there are millimes.

### Categorie  — "Catégorie *" select on the product form
Seed: `src/data/seed/categories.ts` (+ `tiktak/categories.json`) · Screens: product list filter, product form

| Field | Type | Notes |
|---|---|---|
| id | string | slug (`cat-accessoires`) |
| nom | string | as in the shop: HAUT, BAS, ENSEMBLE, CHAUSSURES, ACCESSOIRES, CAPUCHE, SOLDES, LIMITED SELECTION |

Categories are seed-only in this module (no category screen yet). A category
can't be deleted while products use it — no cascade.

### Produit  — the product
Seed: `src/data/seed/produits.ts` (+ `tiktak/produits.json`) · Screens: `/admin/produits`, `/admin/produits/:produitId`, dashboard

| Field | Type | TikTak label · notes |
|---|---|---|
| id | string | slug |
| nom | string | *Nom du produit \** |
| reference | string | *Référence* (`U917`), mono |
| description | string | *Description* — rich text (HTML string, kit `RichTextEditor`); may be empty |
| codeBarres | string | *Code-barres*; may be empty |
| categorieId | string | *Catégorie \** → Categorie.id; `""` = none yet (113 imported products have none — they show *Sans catégorie* and must get one before saving) |
| categoriesSecondaires | string[] | *Tags* — secondary Categorie ids (not the main one) |
| marque | string | *Marque*; may be empty |
| prix | number | *Prix TTC \** in DT; 0 = not priced yet (shown *Prix à définir*) |
| remise | number | *Remise*; 0 = none |
| remiseType | `"montant" \| "pourcentage"` | DT or % |
| actif | boolean | *Produit actif* — the list's Statut toggle |
| afficherSurSite | boolean | *Afficher sur le site* |
| personnalise | boolean | *Produit personnalisé* |
| images | string[] | *Images du produit* — first = principale; [] → garment-icon tile. Imported = the shop's CDN URLs; uploads = in-memory object URLs |
| gestionStock | boolean | *Activer la gestion de stock* — off: stock not tracked, never "Rupture" |
| aDeclinaisons | boolean | *Ce produit a des déclinaisons* |
| options | string[] | names of the variant options, in column order — as named in the shop (`Couleurs`, `Taille`, `Pointure`, `Taille Pantalon ( USA )`, `choisir Référence`…) |
| stock | number | *Stock disponible* — used when `aDeclinaisons` is false |
| seuilAlerte | number | *Seuil d'alerte* — "Stock faible" when stock ≤ this |
| paliers | PalierQuantite[] | *Prix par quantité* — embedded list, see below |

**PalierQuantite** (embedded in Produit, no own screen): `id`, `quantite` (from N pieces), `remise`, `remiseType` (`"montant"` DT — what the shop uses — or `"pourcentage"`), `texte` (shown to the client, e.g. "2 achetés : −10 %"), `badge` (short label, may be empty), `parDefaut` (boolean — the formula pre-selected; at most one).

Derived, never stored: sale price (prix − remise), total stock (own stock, or the
sum of its déclinaisons), stock status (*En stock* / *Stock faible* / *Rupture*).

### Declinaison  — child of Produit ("Déclinaisons" tab: one combination of option values)
Seed: `src/data/seed/declinaisons.ts` (+ `tiktak/declinaisons.json`) · Screens: `/admin/produits/:produitId`

| Field | Type | Notes |
|---|---|---|
| id | string | slug |
| produitId | string | → Produit.id (**cascade delete**) |
| valeurs | string[] | one value per `Produit.options`, same order (`["Gris", "S"]`); a value may be empty |
| image | string | the variant's photo (TikTak *photo*, usually one of the product's images); `""` = none. The shop switches the main photo to it when the client picks the variant |
| stock | number | per variant |

**Left out on purpose** (not shown by a screen yet): stock movements history,
per-variant price (7 imported products have one — the product price is used),
inactive variants (100, not imported), purchase / dealer price,
badge colours of quantity formulas, a brands screen (*Marque* is free text with
suggestions), the whole *Website & SEO* page builder.


---

## Module 2 — Commandes  **(APPROVED)**

Modelled on the shop's real order list + edit form (TikTak PRO). The live
dashboard sits behind a captcha login, so the seed is believable Tunisian
orders shaped exactly like the real ones; lines point at real catalogue products.

### Commande  — the order
Seed: `src/data/seed/commandes.ts` · Screens: `/admin/commandes`, `/admin/commandes/:commandeId`, dashboard

| Field | Type | TikTak label · notes |
|---|---|---|
| id | string | slug `cmd-42390` |
| numero | number | the `#42390` shown |
| client | string | *Nom du client \** |
| telephone | string | *Téléphone principal \** — mono |
| telephoneSecondaire | string | *Téléphone supplémentaire*; may be empty |
| gouvernorat | string | *Gouvernement \** |
| ville | string | *Ville* |
| adresse | string | *Adresse complète \** |
| codePostal | string | *Code postal*; may be empty |
| source | enum | *Source* — `site-v2` · `facebook` · `instagram` · `whatsapp` · `messenger` · `appel` |
| statut | enum | the 9 list tabs (below) |
| canalContact | enum | `whatsapp` · `dispo` — the green/grey list chips |
| transporteur | string | *Transporteur*; "" = non sélectionné |
| livraisonGratuite | boolean | *Livraison gratuite* |
| echange | boolean | *Échange* |
| fraisLivraison | number | *Frais de livraison* in DT |
| remise | number | *Remise* (+ `remiseType` montant/% — reuses Produit's RemiseType) |
| typePaiement | enum | `espece` · `carte` · `virement` |
| email | string | *Email*; may be empty |
| messenger | string | *Messenger*; may be empty |
| dateLivraison | string | *Date de livraison prévue* — display string; may be empty |
| commentaire | string | *Commentaire*; may be empty |
| date | string | created date, display string |

**statut enum** (= list tabs): `panier-abandonne` · `en-attente` · `confirmee`
· `pret-a-expedier` · `expediee` · `livree` · `retour-non-recue` · `annulee` ·
`retour-recue`.

### LigneCommande  — child of Commande (cascade delete)
Seed: `src/data/seed/commandes.ts` · Screens: `/admin/commandes/:commandeId`, list thumbnails

| Field | Type | Notes |
|---|---|---|
| id | string | |
| commandeId | string | → Commande.id (**cascade delete**) |
| produitId | string | → Produit.id (reuses the catalogue photo) |
| nom | string | product name, snapshotted on the order |
| prixUnitaire | number | DT, snapshotted |
| quantite | number | |

Derived, never stored: per-tab counts, line subtotal (`prixUnitaire × quantite`),
sous-total (Σ lines), total (sous-total + frais − remise), article count,
CA livré, taux de livraison.

**Left out on purpose:** per-order payments ledger, Messenger inbox, manifests
/ bordereaux, delivery-company API sync, partial returns, exchange line mapping.

### Panier  — cart (client session state, not an imported entity)
Store slice only (`DataProvider`, `ArticlePanier`): `id`, `produitId`, `nom`
(with variant suffix), `prixUnitaire`, `quantite`, `couleur`, `taille`, `image`.
Lives in the store so the header badge and cart screen share it; **resets on
refresh** like everything else, and is emptied when an order is placed. The
boutique "Acheter maintenant" / cart "Passer la commande" both create a real
`Commande` (statut `en-attente`, source `site-v2`) that ripples into the admin.

## Screens ↔ entities
| Route | Reads | Mutates |
|---|---|---|
| `/` | — (role picker: Administrateur / Client) | — |
| `/admin` | produits, declinaisons (counts: produits, actifs, stock faible, rupture; latest products in *Catalogue*) | — |
| `/admin/produits` | produits, categories, declinaisons | updateProduit (statut toggle), removeProduit |
| `/admin/produits/nouveau` | categories, produits (marque suggestions) | addProduit, addDeclinaison — full creation page |
| `/admin/produits/:produitId` | produits, categories, declinaisons | updateProduit, removeProduit, addDeclinaison, updateDeclinaison, removeDeclinaison |
| `/admin/commandes` | commandes, lignesCommande, produits | updateCommande (statut), removeCommande |
| `/admin/commandes/nouvelle` | produits | addCommande, addLigneCommande |
| `/admin/commandes/:commandeId` | commandes, lignesCommande, produits | updateCommande, removeCommande, add/update/removeLigneCommande |
| `/client` | produits, categories (vitrine : produits actifs + afficherSurSite) | — |
| `/client/produit/:produitId` | produits, declinaisons, categories | addCommande, addLigneCommande, addAuPanier |
| `/client/panier` | panier, produits | updateArticlePanier, removeArticlePanier, viderPanier, addCommande, addLigneCommande |
