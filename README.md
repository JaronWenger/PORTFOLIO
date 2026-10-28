# jaronwenger.com

Hosted on Cloudflare Pages: pushing to `main` deploys. Cloudflare runs `npm run build` and publishes `build/`.

| Path | What | Source |
|---|---|---|
| `/` | "Built Before You Buy" landing page for local service businesses | `site/index.html` |
| `/privacy/` | Privacy policy | `site/privacy/` |
| `/portfolio/` | Software portfolio (React) | `src/` |
| `/<slug>/` | Private spec sites for prospects (never indexed) | `specs/<slug>.json` → `site/<slug>/` |

## Commands

- `npm start`: run the React portfolio locally
- `npm run build`: build the portfolio, then `scripts/assemble.js` moves it to `build/portfolio/`, copies `site/` to the root of `build/` and checks the spec rules
- `npm run dev`: build, then serve it the way Cloudflare does at `http://localhost:8788`

## Spec sites

- Rules that keep specs private: [`SPECS.md`](SPECS.md)
- How to make one from a config: [`specs/README.md`](specs/README.md)

When a prospect buys, their site moves to its own GitHub repo and Cloudflare Pages project on their domain, and the spec here is taken down.
