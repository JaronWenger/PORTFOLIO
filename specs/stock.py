"""Find and add free stock photos from Pexels (https://www.pexels.com/api/).

Needs a free Pexels API key, either in the environment or as a line
`PEXELS_API_KEY=...` in .env.local (gitignored). Never commit it:

    export PEXELS_API_KEY=...

Search (prints photo ids with a preview link):
    python3 specs/stock.py search "painted house exterior" [landscape|portrait|square]

Add a photo to a spec as site/<slug>/images/<name>.webp (needs cwebp):
    python3 specs/stock.py get <photo id> <slug> <name>

Pexels photos are free to use, including commercially, with no attribution
required. Each photo added is still logged to specs/stock-credits.txt.
"""
import json
import os
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://api.pexels.com/v1'


def api_key():
    """PEXELS_API_KEY from the environment, else from .env.local (gitignored)."""
    if os.environ.get('PEXELS_API_KEY'):
        return os.environ['PEXELS_API_KEY']
    env_file = os.path.join(ROOT, '.env.local')
    if os.path.exists(env_file):
        for line in open(env_file):
            name, _, value = line.strip().partition('=')
            if name == 'PEXELS_API_KEY' and value:
                return value.strip('"\'')
    return None


def call(path):
    key = api_key()
    if not key:
        sys.exit('Set PEXELS_API_KEY first (free key: https://www.pexels.com/api/).')
    req = urllib.request.Request(API + path, headers={'Authorization': key, 'User-Agent': 'jaronwenger-specs/1.0'})
    with urllib.request.urlopen(req) as res:
        return json.load(res)


def search(query, orientation=None):
    params = {'query': query, 'per_page': 15}
    if orientation:
        params['orientation'] = orientation
    for p in call('/search?' + urllib.parse.urlencode(params))['photos']:
        print(f'{p["id"]:>10}  {p["width"]}x{p["height"]}  {p["alt"][:70]!r}  by {p["photographer"]}')
        print(f'{"":>10}  {p["src"]["medium"]}')


def get(photo_id, slug, name):
    p = call(f'/photos/{photo_id}')
    out_dir = os.path.join(ROOT, 'site', slug, 'images')
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, name + '.webp')
    landscape = p['width'] >= p['height']
    with tempfile.NamedTemporaryFile(suffix='.jpg') as tmp:
        req = urllib.request.Request(p['src']['original'], headers={'User-Agent': 'jaronwenger-specs/1.0'})
        with urllib.request.urlopen(req) as res:
            tmp.write(res.read())
        tmp.flush()
        size = ['1600', '0'] if landscape else ['0', '1600']
        subprocess.run(['cwebp', '-quiet', '-q', '72', '-resize', *size, '-metadata', 'none', tmp.name, '-o', out], check=True)
    with open(os.path.join(ROOT, 'specs', 'stock-credits.txt'), 'a') as f:
        f.write(f'site/{slug}/images/{name}.webp  Pexels {p["id"]}  {p["photographer"]}  {p["url"]}\n')
    print(f'Added site/{slug}/images/{name}.webp ({os.path.getsize(out) // 1024} KB) from {p["url"]}')


if __name__ == '__main__':
    args = sys.argv[1:]
    if len(args) >= 2 and args[0] == 'search':
        search(args[1], args[2] if len(args) > 2 else None)
    elif len(args) == 4 and args[0] == 'get':
        get(*args[1:])
    else:
        sys.exit(__doc__)
