---
name: dreams-mom-design-system
description: >
  The Dreams Mom design system — a LIGHT-ONLY, white menswear theme with a
  single brand blue ("Bleu Dreams" #1A1AA6, from the logo), DM Serif Display
  serif + Jost geometric sans. Apply it when building or restyling ANY screen,
  component, or UI element in this repo: lists, detail pages, forms, modals,
  dashboards, stat tiles, empty states. Triggers on: Dreams Mom, new screen, new
  component, restyle, on-brand, white theme with blue, DM Serif, Jost, or any
  request to extend the existing UI. Read this BEFORE building anything. The look
  is a clean white canvas, hairline borders, tailored tight corners, editorial
  serif titles, and one deep royal blue used with restraint.
user-invocable: true
---

# Dreams Mom — Design System

A **light-only, brand-blue** design system for Dreams Mom, a clothing brand for
men aged **25–45**. The feel is a modern tailor's shop: white space, crisp
hairlines, editorial serif titles, quiet geometric UI text, and one deep royal
blue taken straight from the logo. The product UI is in **French**.

Depth comes from **whitespace, hairline borders and very soft neutral
shadows** — never from gradients, textures or colored fills.

> **Tokens live in [`src/styles/index.css`](../../../src/styles/index.css).**
> Restyle by editing tokens, not components. Tailwind v4 utilities are bound to
> the tokens via `@theme inline`, so prefer utility classes (`bg-surface`,
> `text-ink-muted`, `border-border`, `text-brand-blue-600`, `bg-primary`) over
> raw hex. Raw hex is allowed only when no token fits — leave a comment why.
>
> **Legacy names:** `--green`, `bg-brand`, `--team-home`, `--heat-*` still
> exist for old code but now resolve to the brand blue. Don't use them in new
> code — use `primary` / `brand-blue-*`.
>
> **Visual reference:** the published design-system page (HTML) shows every
> token and component below rendered.

---

## TIER 1 — The six non-negotiable rules

### 1. White canvas, two surface colors
The page is **`#ffffff`** (`bg-background`). Any filled element on it is
**`#f7f7f7`** (`bg-surface`). The only nested fill inside a surface card is
**`#efefef`** (`bg-surface-nested`). Never a third structural shade — separate
regions with a **border** (`border-border` `#e5e5e5`). Hover = faint ink overlay
(`bg-surface-hover`, `rgba(17,17,17,0.04)`), never a new solid layer.

### 2. Brand blue is THE color — used with restraint
**Bleu Dreams** `#1A1AA6` (`bg-primary` / `--brand-blue-600`) is for **primary
buttons, the logo, links, active nav indicator, selected controls, tags.**
Text on blue is white (`text-ink-inverted`). Hover/pressed `--brand-blue-700`
`#13138A`. Tints `brand-blue-50/100` for selected rows and tag fills.
Everything else is **neutral ink on white**. One blue moment per area — if a
card already has a blue button, its icons stay neutral.

### 3. No other decorative colors
- **Status** — `text-success` `#1F7A4D` (en stock, payé, livré), `text-warning`
  `#985F08` (stock faible, en attente), `text-danger` `#C62F3A` (rupture,
  erreur, remboursement) — **real status only**, never decoration.
- **Gold** `--amber` `#8A6420` — only for a "Édition limitée"/premium badge.
- **Purple** `--purple` `#6D4FD8` — **AI / generative actions only.**
- **Avatars** — light neutral gray gradient + `text-ink-subtle`, never a rainbow.

### 4. Inputs & secondary buttons are white + bordered
Inputs/selects: white fill, `border-input` `#949494` (3:1 on white). Secondary/outline
buttons: transparent + `border-border-strong` `#c7c7c7`, ink text; hover
`bg-surface-hover`. Solid fills only for the **primary blue** button and the
**destructive red**.

### 5. Focus is a crisp ink edge
Inputs on focus: **only the border color changes** to `border-focus`
(`#111111`) — no glow, no fill. Buttons/links: `focus-visible` 2px ink outline
or the faint blue ring (`ring-ring`). Never a heavy colored glow.

### 6. Light on weight — let the serif do the talking
- **DM Serif Display** (`font-display`) — page titles (`PageHeader`),
  product/collection names, the wordmark. **Never numbers.** One weight only (**400**) — never fake-bold it.
  Optional *italic* (DM Serif Display Italic) for one-word accents ("*Nouvelle* collection").
- **Jost** (`font-ui` / `font-body`) — everything else. Body 400, sub-titles
  and card titles 500. **Avoid 700 everywhere.**
- Overlines / metric labels: Jost 500, UPPERCASE, tracking `0.12em`, 11–12px.

---

## Visual foundations

**Color.**

| Role | Token / utility | Value |
|---|---|---|
| Page | `bg-background` | `#ffffff` |
| Surface | `bg-surface` | `#f7f7f7` |
| Nested fill | `bg-surface-nested` | `#efefef` |
| Sidebar | `bg-surface-panel` | `#fafafa` |
| Brand / primary | `bg-primary`, `text-brand-blue-600` | `#1a1aa6` |
| Brand hover | `brand-blue-700` | `#13138a` |
| Brand tint | `brand-blue-50` / `100` | `#f0f0fb` / `#e0e0f7` |
| Ink (titles) | `text-ink` | `#111111` |
| Ink subtle | `text-ink-subtle` | `#3d3d3d` |
| Ink muted (body) | `text-ink-muted` | `#666666` |
| Ink disabled | `text-ink-disabled` | `#a8a8a8` |
| Border | `border-border` | `#e5e5e5` |
| Border strong | `border-border-strong` | `#c7c7c7` |
| Input edge | `border-input` | `#949494` (3:1 on white) |
| Success / Warning / Danger | `text-success` … | `#1f7a4d` / `#985f08` / `#c62f3a` |

Full brand ramp `brand-blue-50 … 900`: `#f0f0fb #e0e0f7 #c2c2ee #9393de
#5c5cc9 #2f2fb5 #1a1aa6 #13138a #0e0e6b #09094a`. Neutral ramp
`neutral-0 … 950` is TRUE neutral (R=G=B), never warm or slate.

**Type scale.**

| Style | Font | Size / line | Weight |
|---|---|---|---|
| Display (hero) | DM Serif Display | 48/52 | 400 |
| H1 page title | DM Serif Display | 28/34 | 400 |
| H2 section | Jost | 20/28 | 500 |
| H3 card title | Jost | 16/22 | 500 |
| Body | Jost | 14/22 | 400 |
| Caption | Jost | 12/16 | 400 |
| Overline | Jost | 11/16, caps, 0.12em | 500 |
| Price | Jost, `tabular-nums` | 17/24, tracking 0.01em | 500 |
| Big number (stat tiles: money, counts, %; detail-page price) | Jost, `tabular-nums` | 32/36, tracking −0.01em | 400 |
| Old price (sale) | Jost, `line-through`, `text-ink-disabled` | 13/18 | 400 |
| ID / SKU / phone | mono | 13 | 400 |

**Numbers are never DM Serif.** Render the unit (DT, %) at `0.75em` in
`text-ink-muted` (`89<small>DT</small>`). Sale price in `text-danger` with the
struck-through old price beside it.

**Spacing & layout.** 4px grid. Content max 1400px, 28–32px padding. Sidebar
256px. Cards 20–24px padding (a bit more air than a dense dashboard), 16px gaps.

**Radii — tailored, tight.** `rounded-sm` 2 (inputs) · `rounded-md` 4
(buttons) · `rounded-lg` 8 (cards) · `rounded-xl` 12 (modals) · `rounded-pill`
(badges, avatars, switches).

**Shadows.** Neutral and soft. Most surfaces carry **no shadow** — border only.
`shadow-card` for raised cards on hover, `shadow-deep` for dialogs / popovers /
toasts. No colored glows.

**Card anatomy.**
- **Static card** — white (`bg-background`) + `border-border` + `rounded-lg`.
  Hover (if interactive) brightens the border to `border-border-strong`.
- **Navigable card** — rests white; on hover a `bg-surface` fill grows from the
  top (`origin-top scale-y-0` → `group-hover:scale-y-100`, 260ms,
  `cubic-bezier(0.4,0,0.2,1)`), border → `border-border-strong`, title/icon →
  `text-brand-blue-600`. Reference: the Catalogue rows on `src/features/admin/AdminDashboardScreen.tsx` and the role cards on `src/features/roles/RoleSelectScreen.tsx`.
- **Overlay surfaces** (modal, popover, toast, menu) — white + border +
  `shadow-deep`.

**Motion.** 120–260ms, `cubic-bezier(0.4,0,0.2,1)`, opacity / color / border /
shadow + the navigable-card fill. No bounce, no translate lifts.

---

## Content fundamentals

**Language.** French. Short, functional, a confident men's-shop tone:
*Ajouter*, *Nouvelle collection*, *Enregistrer*, *Voir la fiche*. No
exclamation marks, no emoji, no first person.

**Casing.** Sentence case for text and buttons. UPPERCASE only for overlines,
metric labels, badges and the wordmark.

**Numbers.** Prices in DT, dinar tunisien: `89 DT`, `148,500 DT` with millimes (French format, `formatDT()` in `src/lib/format.ts`, kit `Price`). SKUs/IDs in mono. Every number —
prices, counts, percentages — is Jost with `tabular-nums`; units (DT, %) at 0.75em in `text-ink-muted`.

---

## Iconography

`lucide-react`, 1.75–2px stroke, 16px default. Icons inherit `currentColor`:
`text-ink-muted` idle, `text-ink` active, white on blue buttons, status color
only for status icons. Common: `Shirt`, `ShoppingBag`, `Package`, `Tag`,
`Ruler`, `Users`, `Truck`, `Receipt`, `Settings`, `Plus`, `Search`, `Filter`.

**Logo:** `kit/Logo` — italic DM Serif "Dm" on a brand-blue tile + "DREAMS MOM"
in DM Serif caps, tracking 0.12em, brand blue. Swap in the real SVG later,
keeping the props.

---

## Component cheat-sheet (this repo)

| Need | Use | On-rule styling |
|---|---|---|
| Primary action | `ui/button` default | `bg-primary text-primary-foreground` (blue/white), hover `bg-primary/90` |
| Secondary | `ui/button` `outline` | white + `border-border-strong`, ink text; hover `bg-surface-hover` |
| Ghost | `ui/button` `ghost` | no border; hover `bg-surface-hover` |
| Destructive | `ui/button` `destructive` | `bg-destructive` red, white text |
| AI action | `ui/button` + purple | `bg-purple text-white` — AI only |
| Static card | `div` | white + `border-border` + `rounded-lg` |
| Navigable card | `Link` (see RoleSelectScreen) | fluid `bg-surface` fill on hover, title → `text-brand-blue-600` |
| Back | `kit/BackButton` | icon-only `ArrowLeft`, `size-9`, bordered |
| Input / select | `ui/input`, `ui/select` | white + `border-input`; focus → `border-focus` ink |
| Form field | `kit/Field` (+ `ToggleRow`) | label Jost 500 13px `ink-subtle`, `required` asterisk, hint or `error` in danger; `ToggleRow` = title + description + switch |
| On/off toggle | `kit/Switch` | brand blue when on, neutral off; `role="switch"`, `label` for icon-only use |
| Price | `kit/Price` | `formatDT()` + small muted DT; `original` > `value` → sale (danger + struck old price); sizes sm / md / lg |
| Editor page (large form) | see `features/produits/ProduitScreen` | ONE page for create (`/nouveau`) and edit — not a modal when the form has 4+ sections. Two columns (fields left, sticky preview + switches right), local draft, sticky save bar (always in create, only while modified in edit); errors shown after the first try; `Toast raised` above it |
| Status pill | `kit/Badge` | `success` / `warning` / `danger` for real status; `info` = brand-blue tint |
| Tag / chip | brand blue | `border-brand-blue-600/30 bg-brand-blue-50 text-brand-blue-600` |
| Tabs / segmented | `kit/Primitives` `Segmented` | active = ink text + surface-nested fill (neutral) |
| Sidebar active | `AppSidebar` | `bg-surface-hover text-ink`; blue only on the active indicator |
| Stat tile | `kit/Primitives` `Stat` | Jost 400 32px `tabular-nums` number in ink, units smaller and muted; deltas `text-success`/`text-danger` |
| Progress bar | `kit/Primitives` `Bar` | `bg-primary` normal, `bg-warning` near-limit |
| Inline "+ add" | `kit/Primitives` `LinkBtn` | `text-info` blue, uppercase |
| Page title | `kit/PageHeader` | DM Serif title; actions stack under it on phones |
| Empty state | `kit/EmptyState` | neutral icon tile + short message + one button |
| Form | `kit/FormSheet` | centered modal, ONE close X |
| Confirm destructive | `kit/ConfirmDialog` | red confirm |
| Feedback | `kit/Toast` | bottom-right, 2.6s |
| Person | `kit/Avatar` | light gray initials |
| Table | `kit/DataTable` | header in overline style, row borders only |
| Not built yet | `kit/Placeholder` | keeps nav clickable |

**Decision rule when a color is ambiguous:** primary action, brand mark, link
or selected state? → **blue**. Genuine status? → success/warning/danger.
Otherwise → **neutral ink**. When in doubt, neutral.

---

## When the system doesn't define something

Open 2–3 of the closest existing screens (`features/produits/` is the reference)
and the kit components, study spacing and the blue/neutral split, and extend
that. State which screens you referenced, and end each screen with one line on
the main UX/creative decision.
