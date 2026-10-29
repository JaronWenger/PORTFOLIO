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
        # design: "classic" is template/styles.css alone; any other name layers template/designs/<name>.css on top
        self.design = config.get('design', 'classic')
        if self.design != 'classic' and not os.path.exists(os.path.join(TEMPLATE, 'designs', self.design + '.css')):
            sys.exit(f'specs/build.py: unknown design "{self.design}" (no specs/template/designs/{self.design}.css)')

    # --- small pieces -------------------------------------------------------

    def photo(self, root, name, alt, lazy=True, cls=''):
        """<img> if site/<slug>/images/<name>.webp exists, else a placeholder."""
        if name and os.path.exists(os.path.join(self.out, 'images', name + '.webp')):
            return (f'<img src="{root}images/{name}.webp" alt="{escape(alt)}"'
                    + (' loading="lazy"' if lazy else '') + (f' class="{cls}"' if cls else '') + '>')
        label = escape(alt or 'Photo')
        return f'<div class="ph{" " + cls if cls else ""}" role="img" aria-label="{label}"><span>Photo: {label}</span></div>'

    def hero_photo(self, root, name, alt):
        """Hero background photo; with no photo the hero is plain dark (no placeholder box)."""
        if name and os.path.exists(os.path.join(self.out, 'images', name + '.webp')):
            return self.photo(root, name, alt, lazy=False, cls='hero-photo')
        return ''

    def logo_file(self):
        """The spec's logo file name (logo.svg preferred, then logo.webp / logo.png), or None."""
        for name in ('logo.svg', 'logo.webp', 'logo.png'):
            if os.path.exists(os.path.join(self.out, name)):
                return name
        return None

    def logo(self, root):
        name = self.logo_file()
        if name == 'logo.svg':
            return open(os.path.join(self.out, name)).read().strip()
        if name:
            # business.logo_on_light: a logo made for white backgrounds sits on a white plate
            cls = 'logo-img on-light' if self.b.get('logo_on_light') else 'logo-img'
            return f'<img class="{cls}" src="{root}{name}" alt="">'
        if not self.b.get('initials'):
            return ''  # no logo and no initials: the name alone, never a made-up mark
        return f'<span class="monogram" aria-hidden="true">{escape(self.b["initials"])}</span>'

    def brand(self, root):
        # business.logo_has_name: the logo already spells the name, so the text is for screen readers only
        cls = 'visually-hidden' if self.b.get('logo_has_name') else 'wordmark'
        return f'<a class="brand" href="{root}">{self.logo(root)}<span class="{cls}">{escape(self.b["name"])}</span></a>'

    def pair(self, root, before, after, label):
        """Before/after comparison slider: the before photo is clipped over the after photo."""
        after_img = self.photo(root, after, label + ', after')
        before_img = self.photo(root, before, label + ', before', cls='ba-before')
        return (f'<div><figure class="ba">{after_img}{before_img}'
                f'<span class="ba-label ba-label-before">Before</span><span class="ba-label ba-label-after">After</span>'
                f'<input type="range" min="0" max="100" value="50" aria-label="{escape(label)}: drag to compare before and after">'
                f'<span class="ba-line" aria-hidden="true"></span></figure>'
                f'<p class="ba-caption">{escape(label)}</p></div>')

    def service_photo(self, s):
        """A service's main photo: hero_photo, else the first pair's after photo, else its first photo."""
        pairs, photos = s.get('pairs', []), s.get('photos', [])
        return s.get('hero_photo') or (pairs[0][1] if pairs else photos[0][0] if photos else None)

    def phone_link(self, cls, label=None):
        return f'<a class="{cls}" href="tel:{self.b["phone_tel"]}">{PHONE_ICON} {escape(label or self.b["phone_display"])}</a>'

    # --- shared page chrome -------------------------------------------------

    def head(self, root, title, description):
        logo = self.logo_file()
        kind = ' type="image/svg+xml"' if logo == 'logo.svg' else ''
        icon = f'<link rel="icon" href="{root}{logo}"{kind}>' if logo else ''
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

    def page_links(self, root, cls=''):
        """Home-page sections that exist for this business, as nav links."""
        h = self.c['home']
        sections = [('gallery', 'Our Work', h.get('gallery')), ('reviews', 'Reviews', h.get('reviews')),
                    ('about', 'About', True)]
        a = f' class="{cls}"' if cls else ''
        return ''.join(f'<li><a{a} href="{root}#{id_}">{label}</a></li>' for id_, label, on in sections if on)

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
          {self.page_links(root, 'nav-link')}
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
      <ul><li><a href="{root}">Home</a></li>{self.page_links(root)}</ul>
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
        lines = [f'<li><a href="tel:{self.b["phone_tel"]}">{escape(self.b["phone_display"])}</a></li>']
        if self.b.get('email'):
            lines.append(f'<li><a href="mailto:{self.b["email"]}">{escape(self.b["email"])}</a></li>')
        if self.b.get('license'):
            lines.append(f'<li>{escape(self.b["license"])}</li>')
        # Auto shops ask for the vehicle instead of a street address
        hint = e.get('address_hint', 'street, city, zip')
        hint = f' <span class="optional">({escape(hint)})</span>' if hint else ''
        autocomplete = ' autocomplete="street-address"' if 'address_hint' not in e else ''
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
          <label>{escape(e.get('address_label', 'Project address'))}{hint} <input name="address"{autocomplete}></label>
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
        contact = [f'<li><a href="tel:{self.b["phone_tel"]}">{escape(self.b["phone_display"])}</a></li>']
        if self.b.get('email'):
            contact.append(f'<li><a href="mailto:{self.b["email"]}">{escape(self.b["email"])}</a></li>')
        for label, url in self.b.get('social', {}).items():
            contact.append(f'<li><a href="{escape(url)}">{escape(label)}</a></li>')
        if self.b.get('license'):
            contact.append(f'<li>{escape(self.b["license"])}</li>')
        for line in self.b.get('hours', []):
            contact.append(f'<li>{escape(line)}</li>')
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
        # Non-classic designs show each service's photo on its card
        card_photo = (lambda s: self.photo(root, self.service_photo(s), s['name'], cls='card-photo')
                      if self.design != 'classic' and self.service_photo(s) else '')
        cards = ''.join(f'''          <a class="service-card" href="{s["slug"]}/">
            {card_photo(s)}<h3>{escape(s["name"])}</h3>
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
        if self.b.get('areas'):
            about += ('<h3>Areas we serve</h3><ul class="areas">'
                      + ''.join(f'<li>{escape(a)}</li>' for a in self.b['areas']) + '</ul>')

        reviews = ''
        if h.get('reviews'):
            rv = h['reviews']
            quotes = ''.join(f'''          <figure class="review">
            <div class="stars" aria-hidden="true">★★★★★</div>
            <blockquote>{escape(r["quote"])}</blockquote>
            <figcaption>{escape(r["name"])}{", " + escape(r["place"]) if r.get("place") else ""}</figcaption>
          </figure>
''' for r in rv['items'])
            link = (f'<div class="actions"><a class="btn btn-outline-dark" href="{escape(rv["link"])}">{escape(rv["link_label"])} →</a></div>'
                    if rv.get('link') else '')
            reviews = f'''
    <section class="reviews" id="reviews">
      <div class="wrap">
        <span class="eyebrow">{escape(rv.get('eyebrow', 'Reviews'))}</span>
        <h2>{escape(rv['title'])}</h2>
        <div class="review-grid">
{quotes}        </div>
        {link}
      </div>
    </section>
'''

        gallery = ''
        if h.get('gallery'):
            gallery = f'''
    <section id="gallery">
      <div class="wrap">
        <span class="eyebrow">Our work</span>
        <h2>{escape(h.get('gallery_title', 'Recent projects'))}</h2>
        <div class="gallery">{''.join(self.photo(root, n, a) for n, a in h['gallery'])}</div>
      </div>
    </section>
'''
        return (self.head(root, h['title'], h['description']) + self.header(root) + f'''
  <main>
    <section class="hero">
      {self.hero_photo(root, h.get('hero_photo'), h.get('hero_alt', ''))}
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
{reviews}{showcase}
    <section class="about" id="about">
      <div class="wrap about-grid">
        {self.photo(root, h['about'].get('photo'), h['about'].get('photo_alt', 'Owner'), cls='wide' if h['about'].get('photo_wide') else '')}
        <div>
          <span class="eyebrow">{escape(h['about'].get('eyebrow', 'About us'))}</span>
          <h2>{escape(h['about']['title'])}</h2>
          {about}
        </div>
      </div>
    </section>
{gallery}
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
        hero = self.service_photo(s) or self.c['home'].get('hero_photo')
        city = self.b['city']
        return (self.head(root, f'{s["name"]} in {city}, {self.b["state"]} | {self.b["name"]}',
                          f'{s["name"]} in {city} and {self.b["area"]} by {self.b["name"]}. {s["blurb"]}')
                + self.header(root) + f'''
  <main>
    <section class="hero page-hero">
      {self.hero_photo(root, hero, s['name'])}
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
        if self.design != 'classic':
            css += '\n' + open(os.path.join(TEMPLATE, 'designs', self.design + '.css')).read()
            # Designs self-host their fonts so the spec folder stays self-contained (SPECS.md rule 1)
            shutil.copytree(os.path.join(TEMPLATE, 'designs', 'fonts'), os.path.join(self.out, 'fonts'), dirs_exist_ok=True)
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
