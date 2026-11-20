// GSCG group ticket website, built live from the team's Build Doc.
// Doc format: Heading 1 = page, Heading 2 = section, Heading 3 = item inside a section, bullets = "- ", anything else = text.
// The doc's script sends Heading 1 as "# ", Heading 2 as "## ", Heading 3 as "### ".
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home';
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const IMG_RE = /^https?:\/\/\S+\.(png|jpe?g|webp|gif|avif)(\?\S*)?$/i;
const URL_RE = /^https?:\/\/\S+$/i;
const FACT = /^([A-Z][A-Za-z'\/ ]{1,22}):\s+(.+)$/;

// ---------- parse ----------
function blank(title) { return { title, text: [], list: [], facts: {}, imgs: [], links: [], items: [], tip: '' }; }
function parseDoc(text) {
  const pages = []; let pg = null, sec = null, item = null, skipping = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    if (!line) continue;
    if (line.startsWith('# ')) {
      const t = line.slice(2).trim(); skipping = /^start here$/i.test(t);
      if (!skipping) { pg = { title: t, slug: slugify(t), sections: [] }; pages.push(pg); }
      sec = item = null; continue;
    }
    if (skipping || !pg) continue;
    if (line.startsWith('## ')) { sec = blank(line.slice(3).trim()); sec.id = slugify(pg.title + '-' + sec.title); pg.sections.push(sec); item = null; continue; }
    if (!sec) continue;
    if (line.startsWith('### ')) { item = blank(line.slice(4).trim()); sec.items.push(item); continue; }
    const t = item || sec;
    if (/^tip:/i.test(line)) { t.tip = line.replace(/^tip:\s*/i, ''); continue; }
    if (IMG_RE.test(line)) { t.imgs.push(line); continue; }
    if (line.startsWith('- ')) { const b = line.slice(2).trim(); if (IMG_RE.test(b)) t.imgs.push(b); else t.list.push(b); continue; }
    if (URL_RE.test(line)) { t.links.push(line); continue; }
    const m = line.match(FACT);
    if (m && !/^(note|why|how|what)$/i.test(m[1])) { t.facts[m[1].trim()] = m[2].trim(); continue; }
    t.text.push(line);
  }
  return pages;
}
const isEmpty = s => !s.text.length && !s.list.length && !Object.keys(s.facts).length && !s.imgs.length && !s.items.length && !s.links.length;

// ---------- small pieces ----------
const PHOTOS = { home: 'img/hero.jpg', experience: 'img/x-recognition.jpg', seating: 'img/x-crawford.jpg', pricing: 'img/k-insperity.jpg', schedule: 'img/x-lineup.jpg', plan: 'img/stadium.jpg' };
const ROTATE = ['img/x-recognition.jpg', 'img/x-teamphoto.jpg', 'img/x-firstpitch.jpg', 'img/p-mariachi.jpg', 'img/x-runbases.jpg', 'img/n-faith.jpg', 'img/x-playball.jpg', 'img/n-stem.jpg', 'img/x-flag.jpg', 'img/g-train.jpg'];
const DAY = ['img/c-union.jpg', 'img/g-plaza.jpg', 'img/x-lineup.jpg', 'img/x-videoboard.jpg', 'img/x-runbases.jpg', 'img/skyline.jpg'];
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const splitLabel = s => { const m = s.match(/^([^:]{2,40}):\s+(.+)$/); return m ? [m[1], cap(m[2])] : [s, '']; };
const tbcWrap = s => esc(s).replace(/(To confirm|To add[^.]*)/gi, '<span class="tbc">$1</span>');
const paras = s => s.text.map(t => `<p>${tbcWrap(t)}</p>`).join('');
const factsHtml = f => Object.keys(f).length ? `<dl class="facts">${Object.entries(f).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${URL_RE.test(v) ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>` : tbcWrap(v)}</dd></div>`).join('')}</dl>` : '';
const linksHtml = s => s.links.length ? `<div class="links">${s.links.map(l => `<a href="${esc(l)}" target="_blank" rel="noopener">${esc(l.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48))}</a>`).join('')}</div>` : '';
const bulletsHtml = s => s.list.length ? `<ul class="ticks">${s.list.map(b => { const [a, c] = splitLabel(b); return `<li>${c ? `<b>${esc(a)}</b> ${tbcWrap(c)}` : tbcWrap(a)}</li>`; }).join('')}</ul>` : '';
const body = s => paras(s) + factsHtml(s.facts) + bulletsHtml(s) + linksHtml(s);
const head = (s, eyebrow, light) => `<div class="sh${light ? ' light' : ''}">${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ''}<h2>${esc(s.title)}</h2></div>`;
const soon = s => `<div class="soon"><span class="soon-dot"></span><div><b>Coming soon</b><span class="team-only">${s.tip ? esc(cap(s.tip)) : 'The team is building this section in the Build Doc.'}</span></div></div>`;
const btnStart = (cls = '') => `<a class="btn primary ${cls}" href="#${formHref()}">Start your group outing</a>`;
const ICONS = [
  '<path d="M4 12l8-8h8v8l-8 8z"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>',
  '<path d="M4 13a8 8 0 0116 0"/><rect x="2" y="13" width="4" height="7" rx="1.5"/><rect x="18" y="13" width="4" height="7" rx="1.5"/>',
  '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/>',
  '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
];
const icon = i => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i % ICONS.length]}</svg>`;
const itemsOf = s => s.items.length ? s.items.map(i => ({ title: i.title, html: body(i), img: i.imgs[0] })) : s.list.map(b => { const [a, c] = splitLabel(b); return { title: c ? a : '', html: `<p>${tbcWrap(c || a)}</p>`, img: null }; });

// ---------- section layouts ----------
const L = {
  hero(s) {
    const f = s.facts, img = s.imgs[0] || PHOTOS.home;
    const h = f.Headline || s.text[0] || 'Bring your group to Daikin Park';
    const sub = f.Subhead || s.text[1] || '';
    return `<header class="hero" id="${s.id}"><img class="hero-img" src="${esc(img)}" alt=""><div class="hero-shade"></div><div class="wrap hero-in">
      <span class="eyebrow light">Group outings at Daikin Park</span><h1>${esc(h)}</h1>${sub ? `<p class="hero-sub">${tbcWrap(sub)}</p>` : ''}
      <div class="cta-row">${btnStart('lg')}${seatingHref() ? `<a class="btn glass lg" href="#${seatingHref()}">Explore the ballpark</a>` : ''}</div>
      ${isEmpty(s) ? `<p class="team-only hero-tip">Hero: ${esc(s.tip || 'add a headline and one sentence in the Build Doc.')}</p>` : ''}
    </div></header>`;
  },
  tiles(s) {
    const it = itemsOf(s);
    return `${head(s, 'Why groups')}${paras(s)}${it.length ? `<div class="tiles">${it.map((x, n) => `<div class="tile"><div class="ico">${icon(n)}</div>${x.title ? `<h3>${esc(x.title)}</h3>` : ''}${x.html}</div>`).join('')}</div>` : ''}${factsHtml(s.facts)}${linksHtml(s)}`;
  },
  cards(s) {
    const it = itemsOf(s);
    return `${head(s, 'Experiences')}${paras(s)}${it.length ? `<div class="cards">${it.map((x, n) => `<article class="card"><div class="card-img"><img src="${esc(x.img || ROTATE[n % ROTATE.length])}" alt="" loading="lazy"></div><div class="card-body">${x.title ? `<h3>${esc(x.title)}</h3>` : ''}${x.html}</div></article>`).join('')}</div>` : ''}${factsHtml(s.facts)}${linksHtml(s)}`;
  },
  journey(s) {
    const it = itemsOf(s);
    return `${head(s, 'Your day')}${paras(s)}${it.length ? `<ol class="journey">${it.map((x, n) => `<li><div class="j-img"><img src="${esc(x.img || DAY[n % DAY.length])}" alt="" loading="lazy"><span class="j-n">${n + 1}</span></div>${x.title ? `<h3>${esc(x.title)}</h3>` : ''}${x.html}</li>`).join('')}</ol>` : ''}`;
  },
  tiers(s) {
    const it = itemsOf(s);
    return `${head(s, 'Pricing')}${paras(s)}${it.length ? `<div class="tiers">${it.map((x, n) => `<div class="tier"><div class="tier-n">${n + 1}</div>${x.title ? `<h3>${esc(x.title)}</h3>` : ''}${x.html}</div>`).join('')}</div>` : ''}${factsHtml(s.facts)}${linksHtml(s)}`;
  },
  seating(s) {
    return `${head(s, 'Seating')}${paras(s)}<div class="seat-wrap"><div class="stadium" id="stadium"></div><aside class="seat-panel" id="seat-panel" aria-live="polite"></aside></div><div class="zone-chips" id="zone-chips"></div>`;
  },
  timeline(s) {
    const it = itemsOf(s);
    return `${head(s, 'Schedule')}${paras(s)}${it.length ? `<ol class="timeline">${it.map(x => `<li><span class="t-dot"></span>${x.title ? `<h3>${esc(x.title)}</h3>` : ''}${x.html}</li>`).join('')}</ol>` : ''}${factsHtml(s.facts)}`;
  },
  form(s) {
    const qs = s.list.length ? s.list : ['Your name', 'Organization', 'Group type', 'Group size', 'Preferred date or theme night', 'Email'];
    return `<div class="form-grid"><div>${head(s, 'Get started', true)}${paras(s) || '<p>Tell us about your group and a group sales rep will follow up.</p>'}${factsHtml(s.facts)}</div>
      <form class="iform" novalidate>${qs.map(q => /group type/i.test(q) ? `<label>${esc(q)}<select><option>Choose one</option><option>School</option><option>Church or faith group</option><option>Youth sports team</option><option>Nonprofit</option><option>Company</option><option>Family and friends</option><option>Other</option></select></label>`
        : `<label>${esc(q)}<input type="${/email/i.test(q) ? 'email' : /size|number/i.test(q) ? 'number' : 'text'}"></label>`).join('')}
      <div class="form-foot"><button class="btn primary" type="submit">Send</button><span class="note">Demo form: nothing is collected or sent.</span></div></form></div>`;
  },
  contact(s) { return `${head(s, 'Questions')}<div class="contact-card">${body(s)}${s.items.map(i => `<div class="c-item"><h3>${esc(i.title)}</h3>${body(i)}</div>`).join('')}</div>`; },
  faq(s) {
    const qa = []; let cur = null;
    s.items.forEach(i => qa.push({ q: i.title, a: body(i) }));
    if (!qa.length) [...s.list, ...s.text].forEach(l => { const m = l.match(/^(.+?\?)\s*(.*)$/); if (m) { cur = { q: m[1], a: m[2] ? `<p>${tbcWrap(m[2])}</p>` : '' }; qa.push(cur); } else if (cur) cur.a += `<p>${tbcWrap(l)}</p>`; });
    return `${head(s, 'FAQ')}${qa.length ? `<div class="faq">${qa.map(x => `<details><summary>${esc(x.q)}</summary>${x.a}</details>`).join('')}</div>` : body(s)}`;
  },
  editorial(s, pg, n) {
    const img = s.imgs[0] || ROTATE[(n + 3) % ROTATE.length];
    return `<div class="edit${n % 2 ? ' flip' : ''}"><div class="edit-img"><img src="${esc(img)}" alt="" loading="lazy"></div><div class="edit-body">${head(s, pg.title)}${body(s)}${s.items.map(i => `<div class="sub"><h3>${esc(i.title)}</h3>${body(i)}</div>`).join('')}</div></div>`;
  },
};
function layoutOf(s, pg) {
  const t = s.title;
  if (/hero|welcome/i.test(t)) return 'hero';
  if (/why|benefit|reason/i.test(t)) return 'tiles';
  if (/day at the park|journey|your day/i.test(t)) return 'journey';
  if (/pric|tier|cost/i.test(t)) return 'tiers';
  if (/seat|map/i.test(t)) return 'seating';
  if (/date|schedule|calendar/i.test(t)) return 'timeline';
  if (/form|interest|sign up/i.test(t)) return 'form';
  if (/contact|reach/i.test(t)) return 'contact';
  if (/faq|questions/i.test(t)) return 'faq';
  if (/experience|theme|night|package/i.test(t) || /experience/i.test(pg.title)) return 'cards';
  return 'editorial';
}

// ---------- render ----------
let PAGES = [], lastText = '', SEAT = null, stadium = null, selZone = null;
const allSections = () => PAGES.flatMap(p => p.sections.map(s => ({ s, p })));
function formHref() { const f = allSections().find(({ s, p }) => layoutOf(s, p) === 'form'); return f ? '/' + f.p.slug + '/' + f.s.id : '/'; }
function seatingHref() { const f = allSections().find(({ s, p }) => layoutOf(s, p) === 'seating'); return f ? '/' + f.p.slug + '/' + f.s.id : ''; }
function route() { const m = location.hash.match(/^#\/([^/]+)(?:\/(.+))?/); return { page: m ? m[1] : (PAGES[0] && PAGES[0].slug), sec: m && m[2] }; }
function pagePhoto(pg) { const k = Object.keys(PHOTOS).find(k => new RegExp(k, 'i').test(pg.title)); return k ? PHOTOS[k] : ROTATE[PAGES.indexOf(pg) % ROTATE.length]; }

function draw() {
  if (!PAGES.length) { page.innerHTML = '<div class="wrap empty">The Build Doc has no pages yet.</div>'; return; }
  const r = route(); const pg = PAGES.find(p => p.slug === r.page) || PAGES[0];
  nav.innerHTML = PAGES.map(p => `<a href="#/${p.slug}" class="${p === pg ? 'on' : ''}">${esc(p.title)}</a>`).join('');
  navm.innerHTML = nav.innerHTML;
  SEAT = null; let out = '', idx = 0;
  if (!pg.sections.some(s => layoutOf(s, pg) === 'hero')) out += `<header class="phero"><img class="hero-img" src="${esc(pagePhoto(pg))}" alt=""><div class="hero-shade"></div><div class="wrap"><span class="eyebrow light">Group tickets</span><h1>${esc(pg.title)}</h1></div></header>`;
  pg.sections.forEach(s => {
    const k = layoutOf(s, pg);
    if (k === 'hero') { out += L.hero(s, pg); return; }
    if (k === 'seating') SEAT = s;
    const empty = isEmpty(s) && !['seating', 'form'].includes(k);
    out += `<section id="${s.id}" class="sec k-${k}${empty ? ' is-empty' : ''}"><div class="wrap">${empty ? head(s, '') + soon(s) : L[k](s, pg, idx)}</div></section>`;
    idx++;
  });
  out += `<section class="band"><div class="wrap band-in"><div><h2>Ready to bring your group?</h2><p>From a youth team of 20 to a whole school district.</p></div>${btnStart('lg')}</div></section>`;
  page.innerHTML = out;
  if (SEAT) mountStadium();
  page.querySelectorAll('.iform').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); f.querySelector('.note').textContent = 'Demo only: nothing was sent. On the real site this goes to Astros Group Sales.'; }));
  cta.href = '#' + formHref();
  const target = r.sec && document.getElementById(r.sec);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 40); else if (!draw.keep) scrollTo(0, 0);
  draw.keep = false;
}

// ---------- stadium ----------
function zoneItem(id) {
  if (!SEAT) return null;
  const h3 = SEAT.items.find(i => norm(i.title).startsWith(id) || id.startsWith(norm(i.title)));
  if (h3) return { title: h3.title, html: body(h3) };
  const b = SEAT.list.find(l => { const n = norm(splitLabel(l)[0]); return n.startsWith(id) || id.startsWith(n); });
  if (b) { const [a, c] = splitLabel(b); return { title: a, html: `<p>${tbcWrap(c)}</p>` }; }
  return null;
}
function showZone(id) {
  selZone = id; const panel = document.getElementById('seat-panel'); if (!panel) return;
  if (!id) { panel.innerHTML = `<div class="sp-empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg><h3>Pick an area</h3><p>Tap any part of the ballpark to see who it is good for.</p></div>`; return; }
  const z = window.STADIUM_ZONES.find(z => z.id === id), it = zoneItem(id);
  panel.innerHTML = `<div class="sp-head"><span class="sw" style="background:${z.color}"></span><span class="eyebrow">Seating area</span></div><h3>${esc(it ? it.title : z.name)}</h3>${it ? it.html : '<p class="muted">Details coming soon.</p>'}${btnStart('sm')}`;
  document.querySelectorAll('.zone-chips button').forEach(b => b.classList.toggle('on', b.dataset.z === id));
}
function mountStadium() {
  const el = document.getElementById('stadium'); if (!el || !window.renderStadium) return;
  stadium = window.renderStadium(el, { onSelect: showZone });
  const chips = document.getElementById('zone-chips');
  chips.innerHTML = window.STADIUM_ZONES.map(z => `<button data-z="${z.id}"><span class="sw" style="background:${z.color}"></span>${esc(z.name)}</button>`).join('');
  chips.querySelectorAll('button').forEach(b => b.onclick = () => { stadium.select(b.dataset.z); showZone(b.dataset.z); });
  if (selZone) { stadium.select(selZone); showZone(selZone); } else showZone(null);
}

// ---------- photo credits ----------
async function credits() {
  try {
    const d = await (await fetch('img/credits.json')).json();
    const used = new Set([...document.querySelectorAll('img')].map(i => (i.getAttribute('src') || '').replace(/^img\/|\.jpg$/g, '')));
    const list = Object.entries(d).filter(([k]) => used.has(k)).map(([, v]) => `<a href="${esc(v.page)}" target="_blank" rel="noopener">${esc(v.artist.split(/\s{2,}|\(/)[0].trim())} (${esc(v.license)})</a>`);
    creditsBox.innerHTML = list.length ? 'Photos: ' + list.join(', ') : '';
  } catch (e) {}
}

// ---------- load ----------
async function load() {
  try {
    const local = /[?&]local=1/.test(location.search);
    const src = local ? 'build-doc.md' : window.DOC_URL;
    let text = await (await fetch(src + (src.includes('?') ? '&' : '?') + 't=' + Date.now())).text();
    if (local || /[?&]preview=1/.test(location.search)) { try { const a = await fetch('.doc-additions.txt'); if (a.ok) text += '\n' + await a.text(); } catch (e) {} }
    if (text === lastText) return;
    lastText = text; PAGES = parseDoc(text); draw.keep = !!page.dataset.ready; draw(); page.dataset.ready = 1; credits();
    live.textContent = 'Live from the Build Doc';
  } catch (e) { live.textContent = 'Could not reach the Build Doc'; }
}
window.addEventListener('hashchange', () => { draw(); credits(); });
document.addEventListener('click', e => { if (e.target.closest('.navm a')) document.body.classList.remove('menu-open'); });
menuBtn.onclick = () => document.body.classList.toggle('menu-open');
tv.onchange = () => document.body.classList.toggle('teamview', tv.checked);
load(); setInterval(load, (window.REFRESH_SECONDS || 20) * 1000);
