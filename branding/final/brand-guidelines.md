# DreamStory — Logo Guidelines

## 1. The logo

The DreamStory mark is a hardcover silhouette with a visible spine, a page block, and a custom opening quotation mark.
It connects the product directly to books and novel writing while remaining compact enough for an app icon.

Use the **horizontal color logo** as the primary signature. Use the stacked version in square layouts, the symbol alone
for the app icon/avatar/favicon, and the wordmark alone only where the symbol would be too small.

## 2. Clear space

Keep clear space equal to the width of the logo's spine (`s`) on all sides. Never let text, borders, images, or UI
controls enter this zone.

## 3. Minimum size

| Version | Screen | Print |
| --- | ---: | ---: |
| Horizontal | 160 px wide | 32 mm wide |
| Stacked | 120 px wide | 24 mm wide |
| Symbol | 24 px | 6 mm |
| Favicon / small symbol | 16 px | — |

At 24 px and below, use `dreamstory-symbol-small-*` or the exported favicon version.

## 4. Colour

| Name | HEX | RGB | CMYK (approx.) | Use |
| --- | --- | --- | --- | --- |
| Ink | `#10232B` | 16 35 43 | 63 19 0 83 | Cover, wordmark, primary type |
| Ink Soft | `#18333D` | 24 51 61 | 61 16 0 76 | Spine separation, dark UI |
| Dream Teal | `#6BC8C1` | 107 200 193 | 47 0 4 22 | Quote accent, active states |
| Paper | `#F7F5EE` | 247 245 238 | 0 1 4 3 | Page field, light background |

CMYK values are working approximations; proof against a physical colour guide before print production.

Approved pairings:

- Full colour on Paper/white.
- White reversed on Ink.
- Ink one-colour on Paper/white.
- Dream Teal one-colour on Paper/white.
- Dark version on Ink or other dark surfaces.

## 5. Typography

The outlined wordmark was built from **Noto Serif SemiBold**. Noto fonts are distributed under the SIL Open Font
License. Do not recreate the logo by typing it; use the supplied outlined SVG.

For product UI, keep the existing `Inter` body/UI stack and a restrained serif display style such as `Noto Serif`,
`Georgia`, or the existing Chinese serif fallback for literary headings.

## 6. Don'ts

Do not stretch or squash the mark, rotate it, add shadows/gradients, recolour it outside the palette, rearrange the
symbol and wordmark, remove the page field, or place it on a busy image without a container. Do not use the standard
colour logo on a dark background; use the dark or reversed file.

## 7. File selection

- `source/dreamstory-logo-horizontal-color.svg` — primary header/web use.
- `source/dreamstory-logo-stacked-color.svg` — square presentation or social profile.
- `source/dreamstory-symbol-color.svg` — symbol master.
- `source/dreamstory-symbol-small-color.svg` — small-size master.
- `source/dreamstory-symbol-white.svg` — dark backgrounds.
- `digital/site.webmanifest`, `digital/favicon.ico`, and the `digital/*icon*.png` files — web/PWA use.

## 8. Legal note

This is a design handoff, not trademark clearance. Before launch, run a professional trademark search and reverse-image
search in the jurisdictions where DreamStory will operate.
