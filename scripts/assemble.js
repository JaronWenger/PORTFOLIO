// Runs after `react-scripts build`. Puts the React portfolio under /portfolio
// and the static site (landing page, privacy, specs) at the root of build/:
//
//   build/                  <- site/ copied in (index.html, privacy/, _headers, specs...)
//   build/portfolio/        <- CRA output (homepage is /portfolio in package.json)
//
// It also fails the build if a spec folder breaks the rules in SPECS.md.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const SITE = path.join(ROOT, 'site');

// Folders in site/ that belong to the main site (pages, images). Any other folder in
// site/ is treated as a private spec preview.
const SITE_PAGES = ['privacy', 'images'];

const fail = (message) => {
    console.error(`\nassemble: ${message}\n`);
    process.exit(1);
};

// 1. Move the CRA output into build/portfolio
const portfolio = path.join(BUILD, 'portfolio');
if (fs.existsSync(portfolio)) fail('build/ is already assembled. Run `npm run build` instead.');
const tmp = path.join(ROOT, 'build-portfolio-tmp');
fs.rmSync(tmp, { recursive: true, force: true });
fs.renameSync(BUILD, tmp);
fs.mkdirSync(BUILD);
fs.renameSync(tmp, portfolio);

// 2. Copy the static site to the root
fs.cpSync(SITE, BUILD, { recursive: true, filter: src => path.basename(src) !== '.DS_Store' });

// 3. Check the spec rules
const specs = fs.readdirSync(SITE, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !SITE_PAGES.includes(entry.name))
    .map(entry => entry.name);

const sitemap = fs.readFileSync(path.join(SITE, 'sitemap.xml'), 'utf8');
const headers = fs.readFileSync(path.join(SITE, '_headers'), 'utf8');
const activeHeaders = headers.split('\n').filter(line => !line.trim().startsWith('#')).join('\n');

const htmlFiles = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
});

specs.forEach(slug => {
    if (sitemap.includes(`/${slug}`)) fail(`spec "${slug}" must not be in sitemap.xml`);
    const rule = new RegExp(`^/${slug}/\\*\\s*\\n\\s+X-Robots-Tag:\\s*noindex`, 'm');
    if (!rule.test(activeHeaders)) fail(`spec "${slug}" needs an X-Robots-Tag: noindex rule for /${slug}/* in site/_headers`);
    htmlFiles(path.join(SITE, slug)).forEach(file => {
        const html = fs.readFileSync(file, 'utf8');
        if (!/<meta\s+name="robots"\s+content="noindex,\s*nofollow"/i.test(html)) {
            fail(`${path.relative(ROOT, file)} needs <meta name="robots" content="noindex, nofollow">`);
        }
    });
});

console.log(`assemble: portfolio -> build/portfolio, site -> build/ (${specs.length} spec${specs.length === 1 ? '' : 's'} checked)`);
