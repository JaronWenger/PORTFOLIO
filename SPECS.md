# Spec previews ("Built Before You Buy")

A spec is a prospect's site, built before I contact them and hosted privately at
`jaronwenger.com/[slug]/` (e.g. `/nwtree/`). These rules keep specs private and
out of search results.

To start a new spec from the template, see [`specs/README.md`](specs/README.md).

## Rules

1. **One self-contained folder per spec:** `site/[slug]/`. It holds its own HTML,
   images, CSS and fonts. Nothing is shared with the main site, and nothing
   outside the folder is referenced.
2. **Every HTML page in the spec** has this in `<head>`:
   ```html
   <meta name="robots" content="noindex, nofollow">
   ```
3. **Add a header rule** for the slug in `site/_headers` (copy the commented
   `/nwtree/*` example):
   ```
   /nwtree/*
     X-Robots-Tag: noindex
   ```
4. **Never link a spec** from the main site's nav, footer or pages, and never
   add it to `site/sitemap.xml`. The exceptions are the fictional demo
   businesses `/template/`, `/template-tree/` and `/template-pressure-washing/`: the landing page hero links to them as samples. They
   still follow rules 1 to 3 and stay out of the sitemap.
5. **Slugs** are lowercase letters, numbers and hyphens. `privacy`, `images`,
   `portfolio`, `template` and `template-*` (the demos) are taken.

`npm run build` runs `scripts/assemble.js`, which treats every folder in `site/`
except `privacy` and `images` as a spec. It fails the build if a spec is missing the meta tag
or the header rule, or appears in the sitemap. If you add a real page to the
main site as a folder, add its name to `SITE_PAGES` in that script.

## Taking a spec down

Delete `site/[slug]/` and its `_headers` rule, then push.
