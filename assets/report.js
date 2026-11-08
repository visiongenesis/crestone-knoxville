/* Crestone storm report page (v12). Readable source: _build/src/report.js in the site repository. */
(function () {
'use strict';
var root = document.getElementById('sr'), tpl = document.getElementById('sr-tpl');
if (!root || !tpl || !tpl.content) return;
var S = {};
Array.prototype.forEach.call(tpl.content.querySelectorAll('[data-k]'), function (n) { S[n.getAttribute('data-k')] = n.textContent; });
var status = root.querySelector('.sr-status'), body = root.querySelector('.sr-body');
function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null && txt !== '') e.textContent = txt; return e; }
function push(o) { try { (window.dataLayer = window.dataLayer || []).push(o); } catch (e) {} }
function out(href, txt, cls) { var a = el('a', cls || '', txt); a.href = href; a.target = '_blank'; a.rel = 'noopener'; return a; }
var qs = new URLSearchParams(location.search), req = qs.get('t') ? { t: qs.get('t') } : null;
if (!req) { status.textContent = S.bad_link; return; }
fetch('/api/storm-report/view', { method: 'POST', body: JSON.stringify(req), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } })
.then(function (r) { return r.json(); }).catch(function () { return null; })
.then(function (d) {
if (!d || d.ok !== true || !d.model || !d.model.ok) { status.textContent = d && d.error === 'bad_link' ? S.bad_link : S.down; push({ event: 'storm_report_page', ok: false }); return; }
paint(d.model, d);
push({ event: 'storm_report_page', ok: true, level: d.model.level.key });
});
function block(h, kids) { var s = el('section', 'sr-block'); if (h) s.appendChild(el('h2', 'h3', h)); kids.forEach(function (k) { if (k) s.appendChild(k); }); return s; }
function paint(m, d) {
status.textContent = '';
var meta = el('div', 'sr-meta');
meta.appendChild(el('p', 'sr-prepared', m.prepared));
meta.appendChild(el('p', 'sr-addr', m.address));
if (m.outside) meta.appendChild(el('p', 'sr-note', m.outside));
body.appendChild(meta);
var grid = el('div', 'sr-grid');
var risk = el('div', 'sr-card sr-risk sr-risk--' + m.level.key);
risk.appendChild(el('p', 'sr-k', m.level.h)); risk.appendChild(el('p', 'sr-v', m.level.label)); risk.appendChild(el('p', 'small', m.level.rule));
grid.appendChild(risk);
if (m.sig) {
var sig = el('div', 'sr-card sr-sig');
sig.appendChild(el('p', 'sr-k', m.sig.h)); sig.appendChild(el('p', 'sr-v', m.sig.date)); sig.appendChild(el('p', '', m.sig.text));
grid.appendChild(sig);
}
body.appendChild(grid);
body.appendChild(block(m.count_h, [m.count ? el('p', 'sr-count', m.count) : null, m.radar ? el('p', 'sr-count', m.radar) : null, m.flood ? el('p', 'small', m.flood) : null, m.radar_note ? el('p', 'sr-note', m.radar_note) : null,
el('p', 'small muted', m.rule), m.partial ? el('p', 'sr-note', m.partial) : null]));
var vp = el('p'); vp.appendChild(out(m.verify.url, m.verify.btn, 'btn btn--ink btn--sm'));
body.appendChild(block(m.verify.h, [el('p', '', m.verify.text), vp]));
if (m.table.rows.length) {
var t = el('table', 'sr-table'), th = el('thead'), tr = el('tr');
m.table.th.forEach(function (h) { tr.appendChild(el('th', '', h)); }); th.appendChild(tr); t.appendChild(th);
var tb = el('tbody');
m.table.rows.forEach(function (r) {
var row = el('tr', 'sr-r sr-r--' + r.key);
[r.type, r.size, r.date, r.where].forEach(function (v, i) { var td = el('td', '', v); td.setAttribute('data-label', m.table.th[i]); row.appendChild(td); });
var src = el('td'); src.setAttribute('data-label', m.table.th[4]);
if (r.src) src.appendChild(out(r.src, m.table.src_link)); else src.textContent = m.table.src_none;
row.appendChild(src); tb.appendChild(row);
});
t.appendChild(tb);
var wrap = el('div', 'table-wrap'); wrap.appendChild(t);
body.appendChild(block(m.table.h, [wrap, m.more ? el('p', 'small muted', m.more) : null]));
}
body.appendChild(el('p', 'small muted', m.source));
body.appendChild(el('p', 'small muted', m.source_radar));
body.appendChild(el('p', 'small muted', m.disclaim));
if (m.cta_ins) body.appendChild(el('p', 'sr-ins', m.cta_ins));
var acts = el('p', 'sr-acts');
var bk = el('a', 'btn btn--gold', S.cta_h); bk.href = '#book'; acts.appendChild(bk);
var call = el('a', 'btn btn--outline', S.cta_phone); call.href = root.getAttribute('data-tel'); acts.appendChild(call);
var pdf = el('a', 'btn btn--outline', S.pdf_btn); pdf.href = d.pdf; pdf.setAttribute('download', 'crestone-storm-report.pdf'); acts.appendChild(pdf);
var pr = el('button', 'btn btn--outline', S.print_btn); pr.type = 'button'; pr.addEventListener('click', function () { window.print(); }); acts.appendChild(pr);
body.appendChild(acts);
body.hidden = false;
var f = document.getElementById('f-name'), a = document.getElementById('f-addr');
if (f && d.prefill && d.prefill.first && !f.value) f.value = d.prefill.first;
if (a && d.prefill && d.prefill.address && !a.value) a.value = d.prefill.address;
var note = document.getElementById('f-note');
if (note && !note.value) note.value = m.title + ': ' + m.level.label + '. ' + (m.sig ? m.sig.h + ' ' + m.sig.date + '.' : '');
}
})();
