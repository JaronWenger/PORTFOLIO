# Spec template

A starting point for "Built Before You Buy" spec sites: a home page plus one
page per service, generated from a single config file. The rules every spec
must follow are in [`../SPECS.md`](../SPECS.md).

This folder is **not published**. Only the output in `site/<slug>/` is.

- `build.py`: the generator
- `template/styles.css`, `template/script.js`: shared design and behavior, copied into each spec
- `examples/painting-company.json`: a fictional painting company (Ridgeline Painting Co.), published at `/template/` as a reference

## Make a new spec

1. **Copy the example config:** `cp specs/examples/painting-company.json specs/<slug>.json`
2. **Fill it in from the prospect's current site:**
   - `slug`, `preview_bar`, `business`, `theme` colors
   - home page wording, services, `estimate` wording
   - Use their own words wherever possible. Don't invent reviews, years in business, awards or prices.
3. **Add their brand and photos** to `site/<slug>/`:
   - Their real logo as `logo.svg`, `logo.webp` or `logo.png`. Never draw one. No logo? Leave it out and the header shows the name alone.
     Set `business.logo_has_name` if the logo spells the name, and `business.logo_on_light` if it was made for a white background.
   - `images/<name>.webp` for every photo name the config uses (`hero`, `owner`, gallery, before/after...).
   - Any photo that's missing renders as a labeled placeholder, so you can see what's left to add.
   - No photos of their own for a slot? Use free stock from Pexels: `python3 specs/stock.py search "query"`, then `python3 specs/stock.py get <id> <slug> <name>` (needs `PEXELS_API_KEY`; see the top of `stock.py`).
   - Convert photos with: `cwebp -q 72 -resize 1600 0 photo.jpg -o site/<slug>/images/name.webp` (use `-resize 0 1600` for portrait photos).
4. **Generate the pages:** `python3 specs/build.py specs/<slug>.json`
5. **Add the noindex rule** to `site/_headers` (the build fails without it):
   ```
   /<slug>/*
     X-Robots-Tag: noindex
   ```
6. **Preview:** `npm run dev`, then open `http://localhost:8788/<slug>/`

Rerun step 4 after any config change. It overwrites the spec's HTML, CSS and JS, but never touches `logo.svg` or `images/`.

## Config notes

- **`preview_bar`** is HTML (it can contain a link). Everything else is plain text.
- **`theme`** keys map to the CSS variables at the top of `template/styles.css`:
  - `dark` and `dark_2`: header, hero, about and footer backgrounds
  - `accent`: buttons and checkmarks
  - `accent_ink`: text on buttons
  - also `soft`, `line`, `ink`, `muted` and `wordmark_font`
- **`home.showcase`** (the before/after section) is optional. Leave it out if the business has no before/after photos.
- **Service pages:**
  - Media: each service can have `pairs` (before/after) or `photos`, or neither.
  - Top photo: `hero_photo` sets it. Without one, the page uses the first pair's after photo, then the first photo, then the home hero.
- **The estimate form is demo-only:** it shows a thank-you and a preview note, and sends nothing. At launch, wire it to a HubSpot form in the owner's own account.

## Earlier specs

`site/elliott-painting/` was hand-built before this template existed, from the same design. It doesn't have a config here, so edit its HTML directly.
