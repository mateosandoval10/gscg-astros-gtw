// The whole site is built from the team's Google Doc (plain text). No sync step.
// Doc syntax: PAGE: starts a page, SECTION: starts a section, Layout: picks the look,
// Item: starts an item, Link: Label -> page name or URL, Popup: text shown in a pop-up, any "Label: value" is a field.
function parseDoc(text) {
  const pages = []; let pg = null, sec = null, item = null;
  const newPage = name => { pg = { name, slug: toSlug(name), sections: [] }; pages.push(pg); };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/[‘’]/g, "'").replace(/[“”]/g, '"'); if (!line) continue;
    const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
    const key = m ? m[1].trim().toLowerCase() : '';
    if (key === 'page') { newPage(m[2]); sec = item = null; continue; }
    if (key === 'section') {
      if (!pg) newPage('Home');
      sec = { title: m[2], layout: 'text', fields: {}, items: [], text: [], links: [] }; item = null; pg.sections.push(sec); continue;
    }
    if (!sec) continue;
    const target = item || sec;
    if (!m) { (item ? (item._text = (item._text || []).concat(line)) : sec.text.push(line)); continue; }
    const value = m[2];
    if (key === 'item') { item = { _title: value, _links: [], _popup: [] }; sec.items.push(item); continue; }
    if (key === 'link') { (item ? item._links : sec.links).push(parseLink(value)); continue; }
    if (key === 'popup') { if (item) item._popup.push(value); else (sec.popup = sec.popup || []).push(value); continue; }
    if (!item && key === 'layout') { sec.layout = value.toLowerCase(); continue; }
    if (item) item[m[1].trim()] = value; else sec.fields[m[1].trim()] = value;
  }
  return pages;
}
const toSlug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'home';
const parseLink = v => { const [label, to] = v.split(/\s*->\s*/); return { label: label.trim(), to: (to || label).trim() }; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = s => String(s || '').replace(/\s/g, '');
const isUrl = s => /^https?:\/\//i.test(s);
const href = to => isUrl(to) ? esc(to) : '#/' + toSlug(to);
const linkHtml = (l, cls = 'btn ghost') => `<a class="${cls}" href="${href(l.to)}"${isUrl(l.to) ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a>`;
const valueHtml = v => isUrl(v) ? `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(v)}</a>` : esc(v);
const badges = o => (o.Owner || o.Status) ? `<span class="team"><span class="badge who">${esc(o.Owner || 'Unassigned')}</span>${o.Status ? `<span class="badge s-${slug(o.Status)}">${esc(o.Status)}</span>` : ''}</span>` : '';
const SKIP = ['Owner', 'Status', 'Image', '_title', '_text', '_links', '_popup'];
const fields = i => Object.keys(i).filter(k => !SKIP.includes(k));
let POPUPS = [];
const popupBtn = (title, body, img, links) => { POPUPS.push({ title, body, img, links }); return `<button class="btn ghost more" data-pop="${POPUPS.length - 1}">Learn more</button>`; };
const R = {
  hero: s => { const b = s.fields.Button ? parseLink(s.fields.Button) : null;
    return `<div class="hero"><div class="wrap">${badges(s.fields)}<h1>${esc(s.fields.Headline || s.title)}</h1><p>${esc(s.fields.Subhead || '')}</p><div class="row">${b ? `<a class="btn" href="${b.to === b.label ? '#form' : href(b.to)}">${esc(b.label)}</a>` : ''}${s.links.map(l => linkHtml(l, 'btn ghost light')).join('')}</div></div></div>`; },
  cards: s => `<div class="grid">${s.items.map(i => `<div class="card"><div class="img">${i.Image ? `<img src="${esc(i.Image)}" alt="">` : 'Concept image coming'}</div><div class="bd">${badges(i)}<h3>${esc(i._title)}</h3>${fields(i).map(k => `<p><b>${esc(k)}:</b> ${valueHtml(i[k])}</p>`).join('')}${(i._text || []).map(t => `<p>${esc(t)}</p>`).join('')}<div class="row">${i._popup.length ? popupBtn(i._title, i._popup, i.Image, i._links) : ''}${i._links.map(l => linkHtml(l)).join('')}</div></div></div>`).join('')}</div>`,
  table: s => { const cols = [...new Set(s.items.flatMap(fields))];
    return `<div style="overflow:auto"><table><tr><th></th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}<th class="team">Owner</th></tr>${s.items.map(i => `<tr><td><b>${esc(i._title)}</b>${i._popup.length ? '<br>' + popupBtn(i._title, i._popup, i.Image, i._links) : ''}</td>${cols.map(c => `<td>${valueHtml(i[c] || '')}</td>`).join('')}<td class="team">${badges(i)}</td></tr>`).join('')}</table></div>`; },
  form: s => `<form id="form" onsubmit="event.preventDefault();this.querySelector('.note').textContent='Demo only: nothing was sent.'">${s.items.map(i => `<input placeholder="${esc(i._title)}">`).join('')}<button class="btn" style="border:0;cursor:pointer">Send</button><span class="note">Demo form: nothing is collected.</span></form>`,
  text: s => s.text.map(t => `<p>${esc(t)}</p>`).join(''),
  links: s => `<div class="row">${s.items.map(i => linkHtml(i._links[0] || parseLink(i._title + ' -> ' + i._title))).join('')}</div>`,
};
let lastText = '', PAGES = [];
function current() { const want = (location.hash.match(/^#\/(.+)/) || [])[1]; return PAGES.find(p => p.slug === want) || PAGES.find(p => p.sections.some(s => toSlug(s.title) === want)) || PAGES[0]; }
function draw() {
  if (!PAGES.length) return;
  POPUPS = [];
  const cur = current();
  nav.innerHTML = PAGES.length > 1 ? PAGES.map(p => `<a href="#/${p.slug}" class="${p === cur ? 'on' : ''}">${esc(p.name)}</a>`).join('') : '';
  page.innerHTML = cur.sections.filter(s => s.layout !== 'hidden').map(s => s.layout === 'hero' ? R.hero(s) :
    `<section id="s-${toSlug(s.title)}"><div class="wrap"><h2>${esc(s.title)}</h2>${badges(s.fields)}${s.fields.Intro ? `<p class="lead">${esc(s.fields.Intro)}</p>` : ''}${(R[s.layout] || R.text)(s)}${s.layout !== 'hero' && s.links.length ? `<div class="row">${s.links.map(l => linkHtml(l)).join('')}</div>` : ''}${s.popup ? popupBtn(s.title, s.popup, null, []) : ''}</div></section>`).join('');
}
function render(text) { if (text === lastText) return; lastText = text; PAGES = parseDoc(text); draw(); }
function openPopup(p) {
  modal.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-label="${esc(p.title)}"><button class="modal-x" aria-label="Close">&times;</button>${p.img ? `<img src="${esc(p.img)}" alt="">` : ''}<h3>${esc(p.title)}</h3>${p.body.map(t => `<p>${esc(t)}</p>`).join('')}<div class="row">${p.links.map(l => linkHtml(l)).join('')}</div></div>`;
  modal.hidden = false;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-pop]'); if (b) { openPopup(POPUPS[+b.dataset.pop]); return; }
  if (e.target === modal || e.target.closest('.modal-x') || (e.target.closest('.modal-card a') && !e.target.closest('a[target]'))) modal.hidden = true;
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.hidden = true; });
window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/')) return; draw(); const el = document.getElementById('s-' + location.hash.slice(2)); el ? el.scrollIntoView({ behavior: 'smooth' }) : scrollTo(0, 0); });
async function load() {
  try {
    const url = window.DOC_URL + (window.DOC_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
    render(await (await fetch(url)).text());
    live.textContent = 'Live from the team doc · checked ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  } catch (e) { live.textContent = 'Could not reach the team doc'; }
}
tv.onchange = () => document.body.classList.toggle('teamview', tv.checked);
load(); setInterval(load, (window.REFRESH_SECONDS || 30) * 1000);
