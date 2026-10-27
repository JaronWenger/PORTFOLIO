"""Build a spec site from a business config.

    python3 specs/build.py specs/examples/painting-company.json

Writes site/<slug>/ (home page + one page per service), copying the template
CSS/JS and applying the config's theme. Photos are read from
site/<slug>/images/<name>.webp; any photo that doesn't exist yet renders as a
labeled placeholder. See specs/README.md.
"""
import json
import os
import shutil
import sys
from html import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = os.path.join(ROOT, 'specs', 'template')

PHONE_ICON = ('<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 '
              '1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 '
              '1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>')

CHEVRON = ('<svg class="chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">'
           '<path d="M2.5 4.5 6 8l3.5-3.5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>')
MENU_ICON = ('<svg class="icon-open" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" '
             'stroke-width="2" stroke-linecap="round"/></svg><svg class="icon-close" viewBox="0 0 24 24" fill="none" '
             'aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke-width="2" stroke-linecap="round"/></svg>')

# Config theme key -> CSS variable
THEME_VARS = {
    'ink': '--ink', 'muted': '--muted', 'bg': '--bg', 'soft': '--soft', 'line': '--line',
    'dark': '--dark', 'dark_2': '--dark-2', 'on_dark': '--on-dark', 'on_dark_muted': '--on-dark-muted',
    'accent': '--accent', 'accent_ink': '--accent-ink', 'wordmark_font': '--wordmark-font',
}


class Spec:
    def __init__(self, config):
        self.c = config
        self.b = config['business']
        self.out = os.path.join(ROOT, 'site', config['slug'])
        self.services = config['services']
        self.cta = config.get('cta_label', 'Get a Free Estimate')

    # --- small pieces -------------------------------------------------------

    def photo(self, root, name, alt, lazy=True, cls=''):
        """<img> if site/<slug>/images/<name>.webp exists, else a placeholder."""
        if name and os.path.exists(os.path.join(self.out, 'images', name + '.webp')):
            return (f'<img src="{root}images/{name}.webp" alt="{escape(alt)}"'
                    + (' loading="lazy"' if lazy else '') + (f' class="{cls}"' if cls else '') + '>')
        label = escape(alt or 'Photo')
        return f'<div class="ph{" " + cls if cls else ""}" role="img" aria-label="{label}"><span>Photo: {label}</span></div>'

    def logo(self):
        path = os.path.join(self.out, 'logo.svg')
        if os.path.exists(path):
            return open(path).read().strip()
        return f'<span class="monogram" aria-hidden="true">{escape(self.b["initials"])}</span>'

    def brand(self, root):
        return f'<a class="brand" href="{root}">{self.logo()}<span class="wordmark">{escape(self.b["name"])}</span></a>'

    def pair(self, root, before, after, label):
        """Before/after comparison slider: the before photo is clipped over the after photo."""
        after_img = self.photo(root, after, label + ', after')
        before_img = self.photo(root, before, label + ', before', cls='ba-before')
        return (f'<div><figure class="ba">{after_img}{before_img}'
                f'<span class="ba-label ba-label-before">Before</span><span class="ba-label ba-label-after">After</span>'
                f'<input type="range" min="0" max="100" value="50" aria-label="{escape(label)}: drag to compare before and after">'
                f'<span class="ba-line" aria-hidden="true"></span></figure>'
                f'<p class="ba-caption">{escape(label)}</p></div>')

    def phone_link(self, cls, label=None):
        return f'<a class="{cls}" href="tel:{self.b["phone_tel"]}">{PHONE_ICON} {escape(label or self.b["phone_display"])}</a>'

    # --- shared page chrome -------------------------------------------------

    def head(self, root, title, description):
        icon = (f'<link rel="icon" href="{root}logo.svg" type="image/svg+xml">'
                if os.path.exists(os.path.join(self.out, 'logo.svg')) else '')
        return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Private spec preview: never index (see SPECS.md) -->
  <meta name="robots" content="noindex, nofollow">
  <title>{escape(title)}</title>
  <meta name="description" content="{escape(description)}">
  <meta name="theme-color" content="{escape(self.c.get('theme', {}).get('dark', '#0d0d0d'))}">
  {icon}
  <link rel="stylesheet" href="{root}styles.css">
</head>
<body>
  <div class="preview-bar">{self.c['preview_bar']}</div>
'''

    def header(self, root):
        links = ''.join(f'<li><a href="{root}{s["slug"]}/">{escape(s["name"])}</a></li>' for s in self.services)
        cta = escape(self.c.get('header_cta', 'Free Estimate'))
        return f'''  <header class="site-header">
    <div class="wrap">
      {self.brand(root)}
      <nav class="main-nav" aria-label="Main">
        <ul>
          <li class="has-menu">
            <button class="nav-link" type="button" aria-expanded="false" aria-controls="services-menu">Services {CHEVRON}</button>
            <ul class="submenu" id="services-menu">{links}</ul>
          </li>
          <li><a class="nav-link" href="{root}#gallery">Our Work</a></li>
          <li><a class="nav-link" href="{root}#about">About</a></li>
        </ul>
      </nav>
      <a class="header-phone" href="tel:{self.b['phone_tel']}">{PHONE_ICON}{escape(self.b['phone_display'])}</a>
      <a class="btn btn-accent" href="#estimate">{cta}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu">{MENU_ICON}</button>
    </div>
    <div class="mobile-menu" id="mobile-menu" hidden>
      <h3>Services</h3>
      <ul>{links}</ul>
      <h3>Company</h3>
      <ul><li><a href="{root}">Home</a></li><li><a href="{root}#gallery">Our Work</a></li><li><a href="{root}#about">About</a></li></ul>
      <div class="actions">
        <a class="btn btn-accent" href="#estimate">{escape(self.cta)}</a>
        {self.phone_link('btn btn-outline-light')}
      </div>
    </div>
  </header>
'''

    def trust(self):
        items = ''.join(f'<li>{escape(t)}</li>' for t in self.b['trust'])
        return f'''    <div class="trust">
      <div class="wrap"><ul>{items}</ul></div>
    </div>
'''

    def estimate(self, selected=''):
        e = self.c['estimate']
        options = ''.join(f'<option{" selected" if s["name"] == selected else ""}>{escape(s["name"])}</option>'
                          for s in self.services)
        lines = [f'<li><a href="tel:{self.b["phone_tel"]}">{escape(self.b["phone_display"])}</a></li>',
                 f'<li><a href="mailto:{self.b["email"]}">{escape(self.b["email"])}</a></li>']
        if self.b.get('license'):
            lines.append(f'<li>{escape(self.b["license"])}</li>')
        return f'''    <section class="estimate" id="estimate">
      <div class="wrap estimate-grid">
        <div class="estimate-info">
          <span class="eyebrow">{escape(e['eyebrow'])}</span>
          <h2>{escape(e['title'])}</h2>
          <p>{escape(e['text'])}</p>
          <ul class="contact-lines">{''.join(lines)}</ul>
        </div>
        <form class="form estimate-form" data-thanks="{escape(e['thanks'])}">
          <div class="row">
            <label>Name <input name="name" autocomplete="name" required></label>
            <label>Phone <input name="phone" type="tel" autocomplete="tel" required></label>
          </div>
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>{escape(e.get('address_label', 'Project address'))} <span class="optional">(street, city, zip)</span> <input name="address" autocomplete="street-address"></label>
          <label>Service
            <select name="service"><option value="">Choose a service</option>{options}<option>Something else</option></select>
          </label>
          <label><span>{escape(e.get('details_label', 'Project details'))} <span class="optional">(optional)</span></span> <textarea name="details"></textarea></label>
          <button class="btn btn-dark" type="submit">{escape(e['button'])}</button>
        </form>
      </div>
    </section>
'''

    def footer(self, root):
        links = ''.join(f'<li><a href="{root}{s["slug"]}/">{escape(s["name"])}</a></li>' for s in self.services)
        contact = [f'<li><a href="tel:{self.b["phone_tel"]}">{escape(self.b["phone_display"])}</a></li>',
                   f'<li><a href="mailto:{self.b["email"]}">{escape(self.b["email"])}</a></li>']
        for label, url in self.b.get('social', {}).items():
            contact.append(f'<li><a href="{escape(url)}">{escape(label)}</a></li>')
        if self.b.get('license'):
            contact.append(f'<li>{escape(self.b["license"])}</li>')
        return f'''  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          {self.brand(root)}
          <p>{escape(self.b['footer_blurb'])}</p>
        </div>
        <div><h3>Services</h3><ul>{links}</ul></div>
        <div><h3>Contact</h3><ul>{''.join(contact)}</ul></div>
      </div>
      <div class="footer-bottom">© {self.c.get('year', 2026)} {escape(self.b['legal_name'])}.</div>
    </div>
  </footer>

  <div class="action-bar">
    {self.phone_link('btn btn-outline-light', 'Call')}
    <a class="btn btn-accent" href="#estimate">{escape(self.c.get('header_cta', 'Free Estimate'))}</a>
  </div>
  <script src="{root}script.js"></script>
</body>
</html>
'''

    # --- pages --------------------------------------------------------------

    def home(self):
        root = './'
        h = self.c['home']
        cards = ''.join(f'''          <a class="service-card" href="{s["slug"]}/">
            <h3>{escape(s["name"])}</h3>
            <p>{escape(s["blurb"])}</p>
            <span class="more">Learn more →</span>
          </a>
''' for s in self.services)

        showcase = ''
        if h.get('showcase'):
            sc = h['showcase']
            pairs = ''.join(self.pair(root, b, a, label) for b, a, label in sc['pairs'])
            link = (f'<div class="actions"><a class="btn btn-outline-dark" href="{sc["link"]}/">{escape(sc["link_label"])} →</a></div>'
                    if sc.get('link') else '')
            showcase = f'''
    <section id="showcase">
      <div class="wrap">
        <span class="eyebrow">{escape(sc['eyebrow'])}</span>
        <h2>{escape(sc['title'])}</h2>
        <p class="lead">{escape(sc['lead'])}</p>
        <div class="pairs">{pairs}</div>
        {link}
      </div>
    </section>
'''
        about = ''.join(f'<p>{escape(p)}</p>' for p in h['about']['paragraphs'])
        gallery = ''.join(self.photo(root, n, a) for n, a in h['gallery'])
        return (self.head(root, h['title'], h['description']) + self.header(root) + f'''
  <main>
    <section class="hero">
      {self.photo(root, h.get('hero_photo'), h.get('hero_alt', ''), lazy=False, cls='hero-photo')}
      <div class="wrap">
        <span class="eyebrow">{escape(h['eyebrow'])}</span>
        <h1>{escape(h['headline'])}</h1>
        <p class="lead">{escape(h['lead'])}</p>
        <div class="actions">
          <a class="btn btn-accent" href="#estimate">{escape(self.cta)}</a>
          {self.phone_link('btn btn-outline-light')}
        </div>
      </div>
    </section>
{self.trust()}
    <section class="services" id="services">
      <div class="wrap">
        <span class="eyebrow">{escape(h['services_eyebrow'])}</span>
        <h2>{escape(h['services_title'])}</h2>
        <div class="service-grid">
{cards}        </div>
      </div>
    </section>
{showcase}
    <section class="about" id="about">
      <div class="wrap about-grid">
        {self.photo(root, h['about'].get('photo'), h['about'].get('photo_alt', 'Owner'))}
        <div>
          <span class="eyebrow">About us</span>
          <h2>{escape(h['about']['title'])}</h2>
          {about}
        </div>
      </div>
    </section>

    <section id="gallery">
      <div class="wrap">
        <span class="eyebrow">Our work</span>
        <h2>Recent projects</h2>
        <div class="gallery">{gallery}</div>
      </div>
    </section>

{self.estimate()}  </main>

''' + self.footer(root))

    def service_page(self, s):
        root = '../'
        others = ''.join(f'<li><a href="{root}{o["slug"]}/">{escape(o["name"])}</a></li>'
                         for o in self.services if o is not s)
        includes = ''.join(f'<li>{escape(i)}</li>' for i in s['includes'])
        photos = s.get('photos', [])
        pairs = s.get('pairs', [])
        media = ''
        if pairs:
            media = '<div class="pairs">' + ''.join(self.pair(root, b, a, label) for b, a, label in pairs) + '</div>'
        elif photos:
            media = '<div class="photo-row">' + ''.join(self.photo(root, n, a) for n, a in photos) + '</div>'
        hero = s.get('hero_photo') or (pairs[0][1] if pairs else photos[0][0] if photos else self.c['home'].get('hero_photo'))
        city = self.b['city']
        return (self.head(root, f'{s["name"]} in {city}, {self.b["state"]} | {self.b["name"]}',
                          f'{s["name"]} in {city} and {self.b["area"]} by {self.b["name"]}. {s["blurb"]}')
                + self.header(root) + f'''
  <main>
    <section class="hero page-hero">
      {self.photo(root, hero, s['name'], lazy=False, cls='hero-photo')}
      <div class="wrap">
        <p class="breadcrumb"><a href="{root}">Home</a> / Services</p>
        <h1>{escape(s["name"])} in {escape(city)}</h1>
        <p class="lead">{escape(s["blurb"])}</p>
        <div class="actions">
          <a class="btn btn-accent" href="#estimate">{escape(self.cta)}</a>
          {self.phone_link('btn btn-outline-light')}
        </div>
      </div>
    </section>
{self.trust()}
    <section>
      <div class="wrap content-grid">
        <div>
          <h2>{escape(s.get("content_title", s["name"] + " done right"))}</h2>
          <p class="lead">{escape(s["intro"])}</p>
          <h3>What's included</h3>
          <ul class="checklist">{includes}</ul>
          {media}
        </div>
        <aside class="side-card">
          <h3>Other services</h3>
          <ul>{others}</ul>
        </aside>
      </div>
    </section>

{self.estimate(s["name"])}  </main>

''' + self.footer(root))

    # --- output -------------------------------------------------------------

    def write(self):
        os.makedirs(self.out, exist_ok=True)
        theme = self.c.get('theme', {})
        overrides = ''.join(f'  {THEME_VARS[k]}: {v};\n' for k, v in theme.items() if k in THEME_VARS)
        css = open(os.path.join(TEMPLATE, 'styles.css')).read()
        with open(os.path.join(self.out, 'styles.css'), 'w') as f:
            f.write(css + (f'\n/* Theme: {self.b["name"]} (from specs config) */\n:root {{\n{overrides}}}\n' if overrides else ''))
        shutil.copy(os.path.join(TEMPLATE, 'script.js'), os.path.join(self.out, 'script.js'))
        with open(os.path.join(self.out, 'index.html'), 'w') as f:
            f.write(self.home())
        for s in self.services:
            os.makedirs(os.path.join(self.out, s['slug']), exist_ok=True)
            with open(os.path.join(self.out, s['slug'], 'index.html'), 'w') as f:
                f.write(self.service_page(s))
        print(f'specs/build.py: wrote site/{self.c["slug"]}/ ({1 + len(self.services)} pages)')
        print(f'  Next: add "/{self.c["slug"]}/*" with X-Robots-Tag: noindex to site/_headers if it is not there yet.')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    with open(sys.argv[1]) as f:
        Spec(json.load(f)).write()
