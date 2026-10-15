---
name: prototype-workflow
description: Step-by-step method for building the Dreams Mom clickable prototype — from an idea or a brief to a full set of on-brand, responsive, data-connected screens. Use at the start of the project, whenever the user describes a new module/feature/screen to build, adds an entity, or asks to "build the prototype", "add a screen", "add a module", or "create the data".
user-invocable: true
---

# Building the prototype — the method

The rules live in `CLAUDE.md` and the look lives in the
`dreams-mom-design-system` skill. This skill is the **order of work**. Follow
the steps in order; don't jump to screens before the data plan is approved.

## Step 0 — Load context (every session)
1. Read `CLAUDE.md`, the `dreams-mom-design-system` skill, and `docs/data-plan.md`.
2. Skim `src/features/produits/` — the reference feature (list → one editor page for create and edit, with a save bar). New features copy its shape.

## Step 1 — Data plan first (stop and get approval)
Turn the brief into `docs/data-plan.md`:
- List the **screens** the brief implies (a list, a detail, a form, a dashboard…).
- From the screens, derive the **entities** and **only the fields those screens show**.
- Mark relations (`childId` → parent) and which deletes cascade.
- Fill the **Screens ↔ entities** table (route · reads · mutates).
- Update the **Entities** line in `CLAUDE.md`'s Per-project block.

Then **show the plan to the user and wait for a yes** before writing code. A wrong
data model is the most expensive mistake in this project.

## Step 2 — Navigation map
Edit `src/lib/navigation.tsx` so every screen in the plan has a nav entry (groups
for sections). Every new leaf is immediately clickable through `<Placeholder/>` —
the whole app is navigable before any screen is real. Typecheck.

## Step 3 — Seed + store, per entity
For each entity in the plan:
1. `src/data/seed/<entity>.ts` — the type (exactly the plan's fields), the enum
   `{ value, label }[]` lists, and **4–8 varied seed rows**: mixed statuses, one
   edge case (overdue/cancelled/error), one long name, one empty record.
   Believable names and copy in the product language — never "Test 1, Test 2".
2. `DataProvider.tsx` — a `useState` slice + `add/update/remove` trio, typed on
   `DataContextValue`. A parent's `remove` cascades to its children.
3. Children reference parents with real seed ids, so every screen shows linked data.

## Step 4 — Screens, one at a time
For each screen, in nav order:
1. **Think first (say it in 2–3 lines):** who is here, the ONE primary action,
   which states exist (empty / filtered-empty / full / not-found / selected).
2. **Reference 2–3 existing screens** for density and spacing, and name them.
3. Build it in `src/features/<feature>/` from kit + ui components only:
   - List: `PageHeader` (one primary action) → derived `Stat` row → `Segmented`
     filter → navigable cards or `DataTable` → `EmptyState`s → `Toast`.
   - Detail: `BackButton` → `PageHeader` with edit/delete → `Panel`s with the
     child collections and inline add → `ConfirmDialog` → not-found state.
   - Forms: `FormSheet` modal (never a side sheet), mounted fresh each open.
4. Wire the route in `App.tsx`, add the path to `CUSTOM_ROUTES`.
5. Every button goes somewhere or does something visible. No dead clicks.
6. Responsive: build the phone layout first, add `sm:`/`lg:` columns.
7. `pnpm typecheck` → fix → run the `verify` skill at desktop **and** 390px.
8. Close with one line: the main UX/creative decision you made.

## Step 5 — Cross-screen pass
When a module is done, drive the **ripple**: create on one screen → counts on the
home/dashboard change; delete a parent → children vanish; empty a list → the
empty state shows. Update `AccueilScreen` stats/tiles to reflect the real modules.

## Step 6 — Keep the reference current
The old Projets example is gone; `features/produits/` is now the reference.
When a newer feature becomes the better example, point the design-system
skill's "Reference" mentions at it.

## Adding a field later
Plan first (`docs/data-plan.md`) → seed type + rows → form modal → the screens
that display it. Never add a field a screen doesn't show.

## Definition of done (per screen)
- [ ] On-brand: white canvas + `#f7f7f7` surface, brand blue only for primary/brand/links/selection, DM Serif Display titles + Jost UI, weights 400/500 (no bold).
- [ ] Tokens only (no raw hex without a comment).
- [ ] Reads/writes only through `useData()`; derived values computed in render.
- [ ] Empty, filtered-empty, and not-found states designed.
- [ ] Hover/active/pressed states + a toast on every mutation.
- [ ] Works at 390px with no horizontal scroll; touch targets reachable without hover.
- [ ] `pnpm typecheck` clean; verified in a browser at both viewports.
