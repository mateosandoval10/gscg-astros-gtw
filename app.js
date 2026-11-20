// Builds the whole site from the team Google Doc, written as a normal doc:
// Heading 1 = a part of the site, Heading 2 = an item, "Label: value" = a labeled detail, everything else = text.
// The doc's script sends headings as "# " and "## " and bullets as "- ".
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const isUrl = s => /^https?:\/\//i.test(s);
const tbc = v => /to (confirm|add)/i.test(v || '');
const FIELD = /^([A-Z][A-Za-z'\/ ]{1,22}):\s+(.+)$/;

function parseDoc(text) {
  const sections = []; let sec = null, item = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
    if (!line) continue;
    if (line.startsWith('# ')) { sec = { title: line.slice(2).trim(), fields: {}, text: [], list: [], items: [] }; sec.id = slugify(sec.title); sections.push(sec); item = null; continue; }
    if (!sec) continue;
    if (line.startsWith('## ') || line.startsWith('### ')) { item = { title: line.replace(/^#+\s*/, ''), fields: {}, text: [], list: [] }; sec.items.push(item); continue; }
    const t = item || sec;
    if (line.startsWith('- ')) { t.list.push(line.slice(2)); continue; }
    const m = line.match(FIELD);
    if (m && !/^request$/i.test(m[1])) { t.fields[m[1].trim()] = m[2].trim(); continue; }
    t.text.push(line);
  }
  return sections;
}

const KINDS = [
  ['hidden', /request|instruction|how this doc/i], ['hero', /welcome|hero/i], ['benefits', /why|benefit/i],
  ['experiences', /experience|theme day|package/i], ['tiers', /tier|pricing|price/i], ['seating', /seat|stadium|ballpark map/i],
  ['schedule', /schedule|calendar/i], ['journey', /day at the park|visual|gallery|photo/i], ['rewards', /reward|leader/i],
  ['contact', /contact/i], ['form', /form|interest|get started/i], ['faq', /faq|question/i],
];
const kindOf = s => (KINDS.find(([, re]) => re.test(s.title)) || ['generic'])[0];

const team = o => (o.fields.Owner || o.fields.Status) ? `<span class="team">${o.fields.Owner ? `<span class="badge who">${esc(o.fields.Owner)}</span>` : ''}${o.fields.Status ? `<span class="badge st-${norm(o.fields.Status)}">${esc(o.fields.Status)}</span>` : ''}</span>` : '';
const SKIP = ['Owner', 'Status', 'Image', 'Intro', 'Headline', 'Subhead', 'Button'];
const facts = (o, only) => Object.entries(o.fields).filter(([k]) => !SKIP.includes(k) && (!only || only.includes(k)))
  .map(([k, v]) => `<div class="fact"><dt>${esc(k)}</dt><dd class="${tbc(v) ? 'tbc' : ''}">${isUrl(v) ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(v)}</dd></div>`).join('');
const paras = o => o.text.map(t => `<p>${esc(t)}</p>`).join('');
const intro = s => s.fields.Intro ? `<p class="lead">${esc(s.fields.Intro)}</p>` : (s.text[0] ? `<p class="lead">${esc(s.text[0])}</p>` : '');
const head = (s, eyebrow) => `<div class="sec-head"><span class="eyebrow">${eyebrow}</span><h2>${esc(s.title)}</h2>${team(s)}${intro(s)}</div>`;
const img = (o, label) => o.fields.Image ? `<img src="${esc(o.fields.Image)}" alt="${esc(o.title)}" loading="lazy">` : `<div class="ph"><span>${label || 'Concept image'}</span></div>`;

const ICONS = [
  '<path d="M4 12l8-8h8v8l-8 8z"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>',
  '<path d="M4 13a8 8 0 0116 0"/><rect x="2" y="13" width="4" height="7" rx="1.5"/><rect x="18" y="13" width="4" height="7" rx="1.5"/>',
  '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M7 10h2M11 10h2M15 10h2"/>',
  '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/>',
  '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
];
const icon = i => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i % ICONS.length]}</svg>`;

let POP = [];
const popBtn = (o, label = 'See details') => { POP.push(o); return `<button class="link-btn" data-pop="${POP.length - 1}">${label}<span aria-hidden="true"> &rarr;</span></button>`; };

const R = {
  hero: s => {
    const f = s.fields;
    return `<header class="hero" id="${s.id}"><div class="hero-bg" aria-hidden="true"></div><div class="wrap hero-in">
      ${team(s)}<span class="eyebrow light">Group tickets &middot; Daikin Park</span>
      <h1>${esc(f.Headline || s.title)}</h1><p class="hero-sub">${esc(f.Subhead || '')}</p>
      <div class="hero-cta"><a class="btn primary" href="#${formId}">${esc(f.Button || 'Start your group outing')}</a><a class="btn ghost light" href="#${seatId}">Explore the ballpark</a></div>
    </div></header>`;
  },
  benefits: s => `${head(s, 'Why groups')}<div class="benefits">${s.items.map((i, n) => `<div class="benefit">${team(i)}<div class="ico">${icon(n)}</div><h3>${esc(i.title)}</h3>${paras(i)}</div>`).join('')}</div>`,
  experiences: s => `${head(s, 'Experiences')}<div class="exp-grid">${s.items.map((i, n) => `<article class="exp">
      <div class="exp-top c${n % 6}"><span class="exp-n">${String(n + 1).padStart(2, '0')}</span>${img(i, 'Concept image')}</div>
      <div class="exp-body">${team(i)}<h3>${esc(i.title)}</h3><dl class="facts">${facts(i, ['When', 'Good for'])}</dl>${i.text[0] ? `<p class="clamp">${esc(i.text[0])}</p>` : ''}${popBtn(i)}</div></article>`).join('')}</div>`,
  tiers: s => `${head(s, 'Pricing')}<div class="tiers">${s.items.map((i, n) => `<div class="tier">${team(i)}<div class="tier-n">${esc(i.title.replace(/[^0-9]/g, '') || n + 1)}</div><div class="tier-name">${esc(i.title)}</div><dl class="facts">${facts(i)}</dl>${paras(i)}</div>`).join('')}</div>`,
  seating: s => `${head(s, 'Seating')}<div class="seat-wrap"><div class="stadium" id="stadium"></div><aside class="seat-panel" id="seat-panel" aria-live="polite"></aside></div><div class="zone-chips" id="zone-chips"></div>`,
  schedule: s => `${head(s, 'Schedule')}<ol class="timeline">${s.items.map(i => `<li>${team(i)}<span class="t-dot"></span><h3>${esc(i.title)}</h3>${paras(i)}<dl class="facts">${facts(i)}</dl></li>`).join('')}</ol>`,
  journey: s => `${head(s, 'A day at the park')}<ol class="journey">${s.items.map((i, n) => `<li>${team(i)}<div class="j-img">${img(i, 'Concept image')}</div><span class="j-n">${n + 1}</span><h3>${esc(i.title)}</h3>${paras(i)}</li>`).join('')}</ol>`,
  rewards: s => `${head(s, 'Group leaders')}<div class="ladder">${s.items.map((i, n) => `<div class="rung" style="--h:${40 + n * 20}%">${team(i)}<div class="bar"></div><h3>${esc(i.title)}</h3><dl class="facts">${facts(i)}</dl>${paras(i)}</div>`).join('')}</div>`,
  contact: s => `${head(s, 'Contact')}<div class="contacts">${s.items.map(i => `<div class="contact">${team(i)}<h3>${esc(i.title)}</h3><dl class="facts">${facts(i)}</dl>${paras(i)}</div>`).join('')}</div>`,
  form: s => {
    const fields = (s.list.length ? s.list : ['Your name', 'Organization', 'Group size', 'Email']);
    return `${head(s, 'Get started')}<form class="iform" id="iform" novalidate>${fields.map(q => /group type/i.test(q)
      ? `<label>${esc(q)}<select><option>Choose one</option><option>School</option><option>Church</option><option>Youth sports team</option><option>Nonprofit</option><option>Company</option><option>Family or friends</option><option>Other</option></select></label>`
      : `<label>${esc(q)}<input type="${/email/i.test(q) ? 'email' : /size/i.test(q) ? 'number' : 'text'}" ${/date|theme/i.test(q) ? 'id="pref"' : ''}></label>`).join('')}
      <div class="form-foot"><button class="btn primary" type="submit">Send</button><span class="note" id="form-note">Demo form: nothing is collected or sent.</span></div></form>`;
  },
  faq: s => `${head(s, 'FAQ')}<div class="faq">${s.items.map(i => `<details>${team(i)}<summary>${esc(i.title)}</summary>${paras(i)}<dl class="facts">${facts(i)}</dl></details>`).join('')}</div>`,
  generic: s => `${head(s, 'More')}${paras({ text: s.text.slice(s.fields.Intro ? 0 : 1) })}<div class="exp-grid">${s.items.map(i => `<article class="exp"><div class="exp-body">${team(i)}<h3>${esc(i.title)}</h3><dl class="facts">${facts(i)}</dl>${paras(i)}</div></article>`).join('')}</div>`,
};

let SECTIONS = [], lastText = '', formId = 'interest-form', seatId = 'seating', seatSec = null, stadium = null, selZone = null;

function render(text) {
  if (text === lastText) return; lastText = text;
  SECTIONS = parseDoc(text); POP = [];
  const shown = SECTIONS.filter(s => kindOf(s) !== 'hidden');
  formId = (shown.find(s => kindOf(s) === 'form') || {}).id || 'interest-form';
  seatSec = shown.find(s => kindOf(s) === 'seating'); seatId = seatSec ? seatSec.id : 'seating';
  page.innerHTML = shown.map(s => { const k = kindOf(s); return k === 'hero' ? R.hero(s) : `<section id="${s.id}" class="sec k-${k}"><div class="wrap">${R[k](s)}</div></section>`; }).join('')
    + `<footer class="foot"><div class="wrap">A GSCG concept for Houston Astros Group Sales. Not an official Astros page. Content marked "To confirm" is not yet verified.</div></footer>`;
  nav.innerHTML = shown.filter(s => !['hero'].includes(kindOf(s))).map(s => `<a href="#${s.id}">${esc(s.title.replace(/^(Why groups choose Daikin Park)$/, 'Why groups').replace(/ and /, ' & '))}</a>`).join('');
  cta.href = '#' + formId;
  if (seatSec) mountStadium();
  const f = document.getElementById('iform');
  if (f) f.addEventListener('submit', e => { e.preventDefault(); document.getElementById('form-note').textContent = 'Demo only: nothing was sent. In the real site this goes to Astros Group Sales.'; });
  spy();
  if (!render.done && location.hash.length > 1) { const el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(() => el.scrollIntoView(), 60); }
  render.done = true;
}

function zoneInfo(id) {
  const z = (window.STADIUM_ZONES || []).find(z => z.id === id) || { name: id, color: '#999' };
  const item = seatSec && seatSec.items.find(i => norm(i.title) === id);
  return { z, item };
}
function showZone(id) {
  selZone = id; const panel = document.getElementById('seat-panel'); if (!panel) return;
  if (!id) { panel.innerHTML = `<div class="sp-empty"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg><h3>Pick an area</h3><p>Tap any part of the ballpark to see who it is good for and what is included.</p></div>`; return; }
  const { z, item } = zoneInfo(id);
  panel.innerHTML = `<div class="sp-head"><span class="sw" style="background:${z.color}"></span><span class="eyebrow">Seating area</span></div><h3>${esc(item ? item.title : z.name)}</h3>${item ? team(item) : ''}
    <dl class="facts">${item ? facts(item) : ''}</dl>${item ? paras(item) : '<p class="tbc">Details: To confirm.</p>'}
    <a class="btn primary sm" href="#${formId}" data-zone-plan="${esc(item ? item.title : z.name)}">Plan an outing here</a>`;
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

function openPop(i) {
  modal.innerHTML = `<div class="m-card" role="dialog" aria-modal="true" aria-label="${esc(i.title)}"><button class="m-x" aria-label="Close">&times;</button>
    <div class="m-img">${img(i, 'Concept image')}</div><div class="m-body">${team(i)}<h3>${esc(i.title)}</h3><dl class="facts">${facts(i)}</dl>${paras(i)}${i.list.length ? `<ul>${i.list.map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}
    <a class="btn primary sm" href="#${formId}" data-close>Plan this outing</a></div></div>`;
  modal.hidden = false; modal.querySelector('.m-x').focus();
}
document.addEventListener('click', e => {
  const p = e.target.closest('[data-pop]'); if (p) { openPop(POP[+p.dataset.pop]); return; }
  if (e.target === modal || e.target.closest('.m-x') || e.target.closest('[data-close]')) modal.hidden = true;
  const z = e.target.closest('[data-zone-plan]'); if (z) setTimeout(() => { const pref = document.getElementById('pref'); if (pref) pref.value = 'Seating: ' + z.dataset.zonePlan; }, 50);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.hidden = true; });

function spy() {
  const links = [...nav.querySelectorAll('a')];
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section.sec').forEach(s => io.observe(s));
}

async function load() {
  try {
    const local = /[?&]local=1/.test(location.search);
    let text = local ? await (await fetch('template.md?t=' + Date.now())).text() : await (await fetch(window.DOC_URL + (window.DOC_URL.includes('?') ? '&' : '?') + 't=' + Date.now())).text();
    if (local || /[?&]preview=1/.test(location.search)) { try { const a = await fetch('.doc-additions.txt'); if (a.ok) text += '\n' + await a.text(); } catch (e) {} }
    render(text);
    live.textContent = 'Live from the team doc';
  } catch (e) { live.textContent = 'Could not reach the team doc'; }
}
tv.onchange = () => document.body.classList.toggle('teamview', tv.checked);
load(); setInterval(load, (window.REFRESH_SECONDS || 30) * 1000);
