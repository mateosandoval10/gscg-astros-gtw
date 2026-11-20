// The whole page is built from the team's Google Doc (plain text). No sync step.
function parseDoc(text) {
  const sections = []; let sec = null, item = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/’/g, "'"); if (!line) continue;
    const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
    if (m && /^section$/i.test(m[1])) { sec = { title: m[2], layout: 'text', fields: {}, items: [], text: [] }; item = null; sections.push(sec); continue; }
    if (!sec) continue;
    if (!m) { (item ? (item._text = (item._text || []).concat(line)) : sec.text.push(line)); continue; }
    const [_, label, value] = m, key = label.toLowerCase();
    if (key === 'item') { item = { _title: value }; sec.items.push(item); continue; }
    if (item) item[label] = value;
    else if (key === 'layout') sec.layout = value.toLowerCase();
    else sec.fields[label] = value;
  }
  return sections;
}
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = s => String(s || '').replace(/\s/g, '');
const badges = o => (o.Owner || o.Status) ? `<span class="team"><span class="badge who">${esc(o.Owner || 'Unassigned')}</span>${o.Status ? `<span class="badge s-${slug(o.Status)}">${esc(o.Status)}</span>` : ''}</span>` : '';
const SKIP = ['Owner', 'Status', 'Image', '_title', '_text'];
const R = {
  hero: s => `<div class="hero"><div class="wrap">${badges(s.fields)}<h1>${esc(s.fields.Headline || s.title)}</h1><p>${esc(s.fields.Subhead || '')}</p>${s.fields.Button ? `<a class="btn" href="#form">${esc(s.fields.Button)}</a>` : ''}</div></div>`,
  cards: s => `<div class="grid">${s.items.map(i => `<div class="card"><div class="img">${i.Image ? `<img src="${esc(i.Image)}" alt="">` : 'Concept image coming'}</div><div class="bd">${badges(i)}<h3>${esc(i._title)}</h3>${Object.keys(i).filter(k => !SKIP.includes(k)).map(k => `<p><b>${esc(k)}:</b> ${esc(i[k])}</p>`).join('')}</div></div>`).join('')}</div>`,
  table: s => { const cols = [...new Set(s.items.flatMap(i => Object.keys(i).filter(k => !SKIP.includes(k))))];
    return `<div style="overflow:auto"><table><tr><th></th>${cols.map(c => `<th>${esc(c)}</th>`).join('')}<th class="team">Owner</th></tr>${s.items.map(i => `<tr><td><b>${esc(i._title)}</b></td>${cols.map(c => `<td>${esc(i[c] || '')}</td>`).join('')}<td class="team">${badges(i)}</td></tr>`).join('')}</table></div>`; },
  form: s => `<form id="form" onsubmit="event.preventDefault();this.querySelector('.note').textContent='Demo only: nothing was sent.'">${s.items.map(i => `<input placeholder="${esc(i._title)}">`).join('')}<button class="btn" style="border:0;cursor:pointer">Send</button><span class="note">Demo form: nothing is collected.</span></form>`,
  text: s => s.text.map(t => `<p>${esc(t)}</p>`).join(''),
};
let lastText = '';
function render(text) {
  if (text === lastText) return; lastText = text;
  page.innerHTML = parseDoc(text).filter(s => s.layout !== 'hidden').map(s => s.layout === 'hero' ? R.hero(s) :
    `<section><div class="wrap"><h2>${esc(s.title)}</h2>${badges(s.fields)}${s.fields.Intro ? `<p class="lead">${esc(s.fields.Intro)}</p>` : ''}${(R[s.layout] || R.text)(s)}</div></section>`).join('');
}
async function load() {
  try {
    const url = window.DOC_URL + (window.DOC_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
    render(await (await fetch(url)).text());
    live.textContent = 'Live from the team doc · checked ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  } catch (e) { live.textContent = 'Could not reach the team doc'; }
}
tv.onchange = () => document.body.classList.toggle('teamview', tv.checked);
load(); setInterval(load, (window.REFRESH_SECONDS || 30) * 1000);
