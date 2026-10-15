---
name: verify
description: Drive the Dreams Mom prototype in a real browser to verify a change end to end — desktop and phone width. Use when confirming a screen, flow, or store mutation actually works at runtime, and before calling any screen done.
---

# Verifying the Dreams Mom prototype

This is a Vite + React SPA with an **in-memory store**. There is no backend, so
verification is always: launch the dev server, drive the UI in a real browser,
screenshot, look at the screenshots.

## 1. Launch

```bash
pnpm dev     # run in the background; picks 5174+ if 5173 is taken — read the port from stdout
```

## 2. Set up the driver (outside the project)

`playwright-core` is **not** a project dependency, and must not become one.
Install it in the session **scratchpad** and keep the driver script there, so
Node resolves it locally and nothing is added to the repo:

```bash
cd "<scratchpad>" && npm init -y >/dev/null && npm install playwright-core
```

`playwright-core` ships no browsers — use the system Chrome:

```js
import { chromium } from "playwright-core"
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
})
```

(If Chrome isn't there, look for `msedge.exe` under `C:/Program Files (x86)/Microsoft/Edge/Application/`.)

## 3. Drive it — twice

Run every flow at **two viewports** and screenshot both:
- desktop: `{ width: 1440, height: 900 }`
- phone: `{ width: 390, height: 844 }`, `isMobile: true, hasTouch: true`

On the phone pass also assert there is no horizontal page scroll:
`await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)`.

Save screenshots in the scratchpad and **Read them** — a passing script with an
ugly or broken layout is not a pass.

## The one gotcha that will bite you

**`page.goto()` wipes the store.** State is in memory and resets on refresh (by
design). Navigate *once* at the start, then drive entirely through in-app clicks
(sidebar links, cards, back buttons). A mid-script `goto` loses every row you
created and looks like a product bug — it's a script bug.

## Useful selectors (shared kit patterns)

- Toasts: `page.getByRole("status")` — auto-dismiss after 2.6s, assert quickly.
- Modals: `page.getByRole("dialog")`; `ConfirmDialog` is also `role=dialog`.
- Sidebar links: `page.getByRole("link", { name: "Produits" })`. On a phone the
  sidebar is a drawer — open it with `getByRole("button", { name: "Toggle Sidebar" })` first.
- Back button: `getByRole("button", { name: "<destination label>" })` (icon-only, label in aria).
- Checkboxes built as buttons: `getByRole("checkbox", { name: "<item title>" })`.

## Checks worth running

Beyond the happy path, the store makes these cheap and revealing:
- **Ripple:** create/edit on one screen → the derived counts on another screen update.
- **Cascade:** delete a parent → its children disappear everywhere.
- **Empty states:** delete everything in a list → the empty card appears, with a working next-step button.
- **Unknown id:** open `/<entity>/does-not-exist` → a "not found" state, not a crash.
- **Console:** collect `page.on("pageerror")` and `console` errors — must be empty.

## Report

Say what you drove, at which viewports, what passed, and what didn't — with the
error text. Delete nothing from the scratchpad you might need to re-run.
