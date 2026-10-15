# UI/UX Prototype — CLAUDE.md

A clickable, **design-system-driven UI prototype** with mock data.

## Per-project — fill these in
- **Product:** `Dreams Mom` — a men’s clothing brand (25–45); prototype has two roles: an **Administrateur** back-office (`/admin`) and a **Client** boutique (`/client`), chosen at `/`.
- **Design-system skill:** `dreams-mom-design-system` (in `.claude/skills/`)
- **UI language:** French — set once, stay consistent. (The kit's built-in strings are French; if the product is in another language, translate those too.)
- **Entities:** categories, produits, declinaisons, commandes, lignesCommande — the real Dreams Mom catalogue imported from TikTak + orders modelled on the shop's back-office (see `docs/data-plan.md`)
- **Real backend schema?** none (if one appears, put it in `/docs` as reference only)

> **First session in this repo:** if the Entities line above is still TODO, or
> `docs/data-plan.md` still lists only the example, follow the
> `prototype-workflow` skill — step 1 is to write the data plan and get it
> approved **before** building any screen.

---

This is a **prototype, not a real app.** Goal: screens that look exactly like the
product, navigate between each other, **and behave like real data** — add / edit /
delete persist across screens and ripple into other views. **No backend and no
network:** all data lives in a single in-memory store, seeded on load. A designer
is delivering this to demo look-and-feel, flow, and core interactions.

## TIER 1 — Hard rules
- **Design-first.** Every screen/component uses the `dreams-mom-design-system` skill. Read it before building anything. Match it exactly.
- **Prefer tokens over hex.** Use the semantic tokens from `src/styles/index.css` (e.g. `bg-surface`, `text-ink-muted`, `border-border`, `text-info`). Raw hex is allowed only when no token fits — leave a comment explaining why.
- **In-memory data.** A single React Context store at the app root holds all data, seeded on load from `src/data/seed/*`. Screens read from it and mutate via add / update / remove, so create/edit/delete persist across navigation and show up in other screens. No fetch, no API, no async, no server, no runtime schemas. In memory only — resets on refresh.
- **No real business logic.** Only simple add/edit/delete plus derived display values (counts, rates, totals, "X/Y" summaries, basic sort/filter). Do NOT implement the product's real engine — no domain algorithms, scheduling, scoring, pricing, or workflow rules.
- **Everything navigates.** Buttons, tabs, cards, back arrows route to real screens. The demo must feel clickable end to end. Use `<Placeholder/>` screens for anything not built yet, never dead buttons.
- **Routes, not tab state.** Top-level tabs/screens are nested React Router routes (one URL each). Global data lives in the store; only in-screen UI (open modals, form inputs, filters) uses local state.
- **No over-engineering.** The store is a plain React Context + `useState` — NOT a library; new-row IDs use the built-in `crypto.randomUUID()`. Don't add redundant infrastructure (Zustand, Redux, TanStack Query, Zod, MSW, react-hook-form, another UI kit) unless asked. Real capability libraries (charts, drag-and-drop, canvas, etc.) are fine when a screen genuinely needs one — see Stack.

## TIER 2 — Craft: think UX & creativity on every screen
Before building any screen or component, think like a designer, not a code generator:
- **Purpose first.** Who is on this screen and what is the ONE thing they came to do? Make that primary action the most obvious element; everything else is secondary and visually quieter.
- **Make it feel alive.** Seed varied, believable content in the product's language — different names, a mix of statuses, an edge case (an error/overdue/cancelled), a long name, a near-full and an empty record. Identical rows look fake; variety looks real.
- **Design every state, not just the happy one.** Think through the empty state, the "lots of data" state, and the selected/active state. A thoughtful empty card ("Nothing here yet…") sells the prototype more than a full one. (Empty states also appear after a user deletes everything — handle that.)
- **Interactions must respond.** Hover, active tab, selected row, pressed button, and visible feedback on actions (the kit `Toast`). Clicking should always *feel* like something happened.
- **Hierarchy & rhythm.** Most important info biggest and first; supporting info muted (`text-ink-muted`). Keep a consistent spacing rhythm and let screens breathe.
- **Creative WITHIN the system.** The design-system skill is the ceiling for style — never invent a new palette, font, or foreign look. Creativity means thoughtful composition, good empty-state ideas, and smart use of the existing tokens and components.
- **When the system doesn't define something,** don't guess randomly: open 2-3 of the closest existing screens/components, study their spacing, density, and feeling, and extend that. State which screens you referenced.
- **Tasteful restraint.** Polish with intent (an icon, a status dot, a progress bar) — don't over-decorate.

End each screen by stating, in one line, the main UX/creative decision you made.

## Responsive — every screen, every time
- Mobile-first Tailwind: base classes are the phone layout, `sm:` / `lg:` / `xl:` add columns. Check every screen at **375px** wide as well as desktop — no horizontal page scroll.
- Grids collapse: `grid gap-4 sm:grid-cols-2 xl:grid-cols-3`; stat rows `grid-cols-2 lg:grid-cols-4`.
- `PageHeader` already stacks its actions under the title on phones — use it, don't hand-roll headers.
- Hover-only affordances must stay reachable on touch (`opacity-100 sm:opacity-0 sm:group-hover:opacity-100`).
- Wide tables: wrap in `overflow-x-auto`, or switch to a card list under `sm`.

## Stack (keep it minimal)
- Vite + React + TypeScript.
- Tailwind v4 (tokens in `src/styles/index.css`) + `lucide-react` icons.
- React Router for screen navigation. React Context for the in-memory data store.
- Radix primitives (via `radix-ui`) behind the themed components in `src/components/ui/`.

If asked for something this stack can't cleanly do (drag-and-drop, interactive
canvas, charts, virtualization, complex animations, etc.), read the use case,
pick the best-fit library, install it **with pnpm**, and use it. The "minimal"
rule is about avoiding bloat, not about refusing real capability needs.

## Data layer (in-memory store)
- One provider, `src/data/DataProvider.tsx`, mounted at the app root (wraps the router). It loads `src/data/seed/*` into state on first render.
- It exposes the collections plus per-entity actions: `add<Entity>` / `update<Entity>` / `remove<Entity>`, the same shape for each. Removing a parent cascades to its children.
- Screens read and mutate through a `useData()` hook — never import seed files directly (types are fine).
- New rows get `crypto.randomUUID()` ids. Seed rows keep readable slug ids (`entity-slug`).
- Derived values (counts, rates, "X/Y" summaries) are COMPUTED from the store in render — never stored.
- In memory only; state resets on page refresh.
- **Perf:** every store write re-renders every `useData()` consumer. Never write to the store on every frame of a drag/scroll/resize — keep it in local state and commit once when the gesture ends.

## Reference docs (/docs)
- `docs/data-plan.md` — the prototype data slice: the entities and only the fields the screens show. **The types and the seed in `src/data/seed/` follow this file.**
- If a real backend schema appears (Prisma, SQL, OpenAPI…), put it in `/docs` as **reference only.** Never copy it into the app; look up real field names there.

Data rules:
- Use the real field names where a schema exists. IDs are strings. Give related entities the parent id they belong to.
- Model only what the screens show. Do NOT model backend-only constructs. When a value isn't decided yet, a plain placeholder string is fine.
- Read `docs/data-plan.md` before editing the seed, the store, or any screen that shows data. Add a field only when a screen needs it, and add it to the plan first.

## Structure
```
docs/
  data-plan.md              # prototype data slice (shapes for the store + seed)
src/
  main.tsx  App.tsx         # App.tsx = <DataProvider> wrapping the router
  styles/index.css          # ALL design tokens + Tailwind @theme bridge
  data/
    DataProvider.tsx        # app-root Context store; add/update/remove per entity
    useData.ts              # useData() hook screens call to read + mutate
    seed/<entity>.ts        # type + SEED rows per entity, shaped per docs/data-plan.md
  lib/
    navigation.tsx          # nav tree — drives BOTH the sidebar and the routes
    utils.ts  tint.ts       # cn(), initials/tint helpers
  hooks/use-mobile.ts       # <768px → sidebar becomes a drawer
  shells/AppShell.tsx       # sidebar + top bar + scroll area
  components/
    AppSidebar.tsx
    ui/                     # themed primitives: button, dialog, input, select, sidebar, tooltip…
    kit/                    # shared app components (see the design-system skill cheat-sheet)
  features/
    <feature>/              # one folder per feature: <List>Screen, <Detail>Screen, <X>FormModal
```
`features/produits/` is the **reference feature** (list with search/filters → one editor page for create (`/nouveau`) and edit with a draft + save bar, parent + child entity, empty / filtered-empty / not-found states, toasts). Copy its shape for new features.

## Conventions
- UI strings in the product's language.
- Reuse `components/kit` and `components/ui` — don't re-style the same thing twice. New shared pieces go in `kit/`.
- **Forms and panels are centered modals** (`kit/FormSheet` or `ui/dialog`), not right-side sheets. The only `Sheet` is the mobile nav drawer. Every modal has exactly ONE close X (pass `showCloseButton={false}` when you render your own).
- Destructive actions go through `kit/ConfirmDialog`. Mutations confirm with `kit/Toast`.
- Mount create/edit modals with a fresh `key` (or conditionally) so their draft resets.
- Empty states where they make the demo look real. No spinners faking network calls.
- Light-only theme (white canvas + brand blue) — no dark-mode toggle.

## Touch & drag lessons (learned on the previous prototype)
- A drag surface needs `touch-action: none` on its **whole subtree**, not just the wrapper (it isn't inherited). Emulated touch in Playwright bypasses this — check computed `touch-action` instead of trusting an emulated drag.
- A draggable card inside a horizontal scroller can't be both swipeable and draggable: add a small grip with `touch-action: none` for touch, keep whole-card drag for mouse.
- Pair every drag with **tap-to-place** (tap item → it highlights with an "Annuler" hint → tap target). On a phone the drop target is usually off-screen.
- Supplied illustration SVGs are often print art — check their fills read well on the white canvas (and against `bg-surface`); recolor to ink/brand-blue rather than CSS-`invert()`.

## Autonomy
- Run any terminal command you need on your own — install deps, start/stop the dev server, build, typecheck, git, scripts. Don't pause to ask; call out only notable ones (a new dependency, anything destructive).
- **Always install with `pnpm`** (`pnpm add <pkg>`). `npm install` on a pnpm `node_modules` makes Vite bundle a second React → blank page with "Invalid hook call". Recovery: remove the package dir, `pnpm install`, delete `node_modules/.vite`, restart the dev server.

## Commands
- `pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint`

## Workflow
- Follow the `prototype-workflow` skill: data plan → nav map → screens one by one → verify.
- Build screen by screen, on-brand, wired into the router and the store as you go. Run `pnpm typecheck` after each screen and drive it with the `verify` skill before calling it done.
