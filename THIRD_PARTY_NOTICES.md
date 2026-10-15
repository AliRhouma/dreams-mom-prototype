# Third-party notices

## Shopco (next-ecommerce-shopco)

The Dreams Mom client storefront (`src/features/boutique/**`) is visually
re-skinned from **Shopco** by Mohammad Oftadeh, used under the MIT License. The
UI markup and styling were ported to this project's stack (Vite + React Router +
Tailwind v4) as presentational components; none of Shopco's mock data, Redux
store or types were copied.

Source: https://github.com/mohammadoftadeh/next-ecommerce-shopco

```
MIT License

Copyright (c) 2020 Mohammad Oftadeh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Fonts

- **Satoshi** (body) — by Indian Type Foundry, free to use; self-hosted from
  `public/fonts/`. Shipped with Shopco under its repository.
- **Anton** (display) — SIL Open Font License 1.1, loaded from Google Fonts.
  Used as a free substitute for Shopco's **Integral CF**, which is a commercial
  typeface and is **not** bundled. Swap in Integral CF only if a license is held
  (point `.font-display-shopco` at it in `src/styles/storefront.css`).
