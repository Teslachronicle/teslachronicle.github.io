/* Tesla Chronicle · company themes runtime (no dependencies, no network beyond same-origin art/*.svg).
 *
 *   ChronicleThemes.apply('spacex')           → sets <html data-company="spacex">, swaps palette + hero art
 *   ChronicleThemes.filter(events, 'spacex')  → events whose `companies` array contains 'spacex'
 *   ChronicleThemes.primary(event)            → event.companies[0]  (drives card colour)
 *   ChronicleThemes.counts(events)            → { all: n, tesla: n, spacex: n, ... }  (array-contains)
 *
 * Hero art hosts: any element with [data-theme-art="hero"] (or "gallery") gets the company's SVG inlined,
 * so the drawing inherits the theme's --art-* colours. Respects prefers-reduced-motion.
 */
(function (root) {
  'use strict';
  var ORDER = ['all', 'tesla', 'spacex', 'xai', 'x', 'neuralink', 'boring'];
  var COMPANIES = {
    all:       { label: 'All',        name: 'All companies',          hero: 'tesla-lineup',  gallery: ['spacex-lineup', 'optimus', 'boring-tunnel'], tagline: 'One timeline across the companies' },
    tesla:     { label: 'Tesla',      name: 'Tesla',                  hero: 'tesla-lineup',  gallery: ['model-y', 'cybertruck', 'semi', 'megapack', 'optimus', 'supercharger', 'roadster', 'cybercab'], tagline: 'Cars, energy, autonomy, robots' },
    spacex:    { label: 'SpaceX',     name: 'SpaceX',                 hero: 'spacex-lineup', gallery: ['falcon-9', 'falcon-heavy', 'starship', 'dragon', 'starlink'], tagline: 'Launch, Starlink, Starship' },
    xai:       { label: 'xAI',        name: 'xAI',                    hero: null,            gallery: [], tagline: 'Where Tesla and xAI cross' },
    x:         { label: 'X',          name: 'X',                      hero: null,            gallery: [], tagline: 'Where Tesla and X cross' },
    neuralink: { label: 'Neuralink',  name: 'Neuralink',              hero: 'neuralink-n1',  gallery: [], tagline: 'Where Tesla and Neuralink cross' },
    boring:    { label: 'Boring Co.', name: 'The Boring Company',     hero: 'boring-tunnel', gallery: ['model-y'], tagline: 'Where Tesla and The Boring Company cross' }
  };

  var doc = root.document, html = doc && doc.documentElement;
  var reduce = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var svgCache = {}, listeners = [], current = null, seq = 0;

  // Resolve art/ next to this script, so it works from /themes/demo.html and from /timeline.html alike.
  var base = (function () {
    var s = doc && (doc.currentScript || [].slice.call(doc.getElementsByTagName('script')).filter(function (x) { return /themes\.js(\?|$)/.test(x.src); })[0]);
    return s && s.src ? s.src.replace(/themes\.js(\?.*)?$/, '') : 'themes/';
  })();

  function norm(c) { c = String(c == null ? 'all' : c).toLowerCase(); return COMPANIES[c] ? c : 'all'; }
  function companiesOf(e) { return e && Array.isArray(e.companies) && e.companies.length ? e.companies : ['tesla']; }
  function primary(e) { return norm(companiesOf(e)[0]); }
  function has(e, c) { return companiesOf(e).indexOf(c) !== -1; }
  function filter(events, c) { c = norm(c); return c === 'all' ? events.slice() : events.filter(function (e) { return has(e, c); }); }
  function counts(events) {
    var out = { all: events.length };
    ORDER.slice(1).forEach(function (c) { out[c] = 0; });
    events.forEach(function (e) { companiesOf(e).forEach(function (c) { if (c in out && c !== 'all') out[c]++; }); });
    return out;
  }
  function color(c) { return 'var(--co-' + norm(c === 'all' ? 'tesla' : c) + ')'; }

  function loadSvg(slug) {
    if (!slug) return Promise.resolve('');
    if (!svgCache[slug]) {
      svgCache[slug] = fetch(base + 'art/' + slug + '.svg').then(function (r) {
        if (!r.ok) throw new Error('art ' + slug + ' ' + r.status); return r.text();
      }).catch(function (err) { delete svgCache[slug]; throw err; });
    }
    return svgCache[slug];
  }

  function fillHosts(c, token) {
    var cfg = COMPANIES[c], hosts = doc.querySelectorAll('[data-theme-art]');
    return Promise.all([].map.call(hosts, function (el) {
      var kind = el.getAttribute('data-theme-art');
      var slug = kind === 'hero' ? cfg.hero : kind === 'gallery' ? (cfg.gallery[+el.getAttribute('data-index') || 0] || null) : kind;
      if (el.getAttribute('data-slug') === String(slug)) return null;
      var swap = function (svg) {
        if (token !== seq) return;
        el.innerHTML = svg; el.setAttribute('data-slug', String(slug)); el.hidden = !slug;
        el.classList.remove('tc-art-out');
      };
      if (reduce.matches) return loadSvg(slug).then(swap);
      el.classList.add('tc-art-out');
      return Promise.all([loadSvg(slug), new Promise(function (r) { setTimeout(r, 220); })]).then(function (v) { swap(v[0]); });
    })).catch(function (err) { if (root.console) console.warn('[themes] ' + err.message); });
  }

  function apply(company, opts) {
    var c = norm(company), token = ++seq; opts = opts || {};
    var prev = current; current = c;
    var setAttr = function () { html.setAttribute('data-company', c); };
    if (prev === null || reduce.matches || opts.instant) setAttr();
    else if (doc.startViewTransition && !opts.noViewTransition) doc.startViewTransition(setAttr);
    else {
      html.classList.add('tc-switching'); setAttr();
      clearTimeout(apply._t); apply._t = setTimeout(function () { html.classList.remove('tc-switching'); }, 700);
    }
    try { if (opts.persist !== false) root.localStorage.setItem('tc-company', c); } catch (e) { /* private mode */ }
    var done = fillHosts(c, token);
    listeners.forEach(function (fn) { try { fn(c, prev); } catch (e) { console.error(e); } });
    return done;
  }

  root.ChronicleThemes = {
    ORDER: ORDER, COMPANIES: COMPANIES,
    apply: apply, setFilter: apply,
    current: function () { return current; },
    saved: function () { try { return norm(root.localStorage.getItem('tc-company')); } catch (e) { return 'all'; } },
    filter: filter, has: has, primary: primary, companiesOf: companiesOf, counts: counts, color: color,
    loadSvg: loadSvg, artBase: function () { return base; },
    onChange: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  };
})(window);
