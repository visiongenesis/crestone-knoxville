/* Crestone chat and storm blocks (v10). Readable source: _build/src/chat.js in the site repository. */
(function () {
'use strict';
var AI_ANSWERS = false;
function fill(s, o) { return String(s == null ? '' : s).replace(/\{(\w+)\}/g, function (m, k) { return o && o[k] != null ? o[k] : m; }); }
function and(a, w) { return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' ' + w + ' ' + a[a.length - 1]; }
function plural(pair, n) { var p = String(pair).split('|'); return n === 1 ? p[0] : (p[1] || p[0]); }
function num(x) { return String(+x); }
function dateOf(day, S, year) {
var p = String(day || '').split('-'), m = (S.w_months || '').split(' ')[+p[1] - 1];
return p.length === 3 && m ? m + ' ' + (+p[2]) + (year ? ', ' + p[0] : '') : '';
}
var D = { N: 'north', S: 'south', E: 'east', W: 'west' };
function dir(c) {   // N, NE, NNE ... -> north, northeast, north-northeast
var w = function (x) { return x.split('').map(function (k) { return D[k]; }).join(''); };
return c.length === 3 ? D[c[0]] + '-' + w(c.slice(1)) : w(c);
}
function place(p) {   // NWS "2 SE Powell" -> "2 miles southeast of Powell"
var m = /^(\d+(?:\.\d+)?)\s+([NSEW]{1,3})\s+(.+)$/.exec(String(p || '').trim());
if (m) return m[1] + (m[1] === '1' ? ' mile ' : ' miles ') + dir(m[2]) + ' of ' + m[3];
return String(p || '').trim() || 'location not given';
}
function untilOf(iso) {
try { return new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', weekday: 'long', hour: 'numeric', minute: '2-digit' }); }
catch (e) { return ''; }
}
function where(cs, S) { return cs.length === 1 ? fill(S.w_one, { name: cs[0] }) : fill(S.w_many, { names: and(cs, S.w_and) }); }
function stormView(d, S) {
var v = { alerts: [], line: '', items: [], warn: false };
if (!d || d.ok !== true || !d.sources) { v.line = S.w_down; return v; }
if (d.sources.alerts === 'ok') {
(d.alerts || []).forEach(function (a) {
if (!a || !a.event || !a.counties || !a.counties.length) return;
v.alerts.push(fill(S.w_alert, { event: a.event, where: where(a.counties, S), until: a.until ? untilOf(a.until) : '' }).replace(', until .', '.'));
});
v.warn = d.warning === true;
} else v.alerts.push(S.w_alerts_down);
if (d.sources.reports !== 'ok') { v.line = S.w_down; return v; }
var rs = (d.reports || []).filter(function (r) { return r && r.day && r.county && r.kind; });
if (!rs.length) { v.line = S.w_none; return v; }
var order = ['hail', 'tornado', 'wind damage', 'wind gust'], cnt = {}, cs = [];
rs.forEach(function (r) { cnt[r.kind] = (cnt[r.kind] || 0) + 1; if (cs.indexOf(r.county) < 0) cs.push(r.county); });
var what = order.filter(function (k) { return cnt[k]; }).map(function (k) { return cnt[k] + ' ' + plural(S['w_k_' + k], cnt[k]); });
v.line = fill(S.w_some, { what: and(what, S.w_and), where: where(cs, S) });
v.line = v.line.charAt(0).toUpperCase() + v.line.slice(1);
rs.slice(0, 4).forEach(function (r) {
var w = r.kind === 'hail' ? (r.size ? fill(S.w_hail_size, { size: num(r.size) }) : S.w_hail)
: r.kind === 'wind gust' ? fill(S.w_gust, { size: num(r.size) }) : r.kind === 'tornado' ? S.w_tornado : S.w_damage;
v.items.push(fill(S.w_item, { date: dateOf(r.day, S), what: w, place: place(r.place), county: r.county }));
});
if (rs.length > 4) v.items.push(fill(S.w_more, { n: rs.length - 4 }));
return v;
}
function reportView(d, S) {
if (!d) return { msg: S.r_down };
if (d.ok !== true) return { msg: d.error === 'not_found' ? S.r_notfound : d.error === 'zip_unknown' ? S.r_zipout : d.error === 'bad_input' ? S.r_short : S.r_down };
var v = { head: fill(S.r_for, { place: d.kind === 'zip' ? d.place + ' (' + S.r_zipnote + ')' : d.place }), rows: [], partial: !!d.partial,
outside: d.in_area === false, disclaim: S.r_disclaim, src: S.r_src };
(d.events || []).forEach(function (e) {
if (!e || !e.day || !dateOf(e.day, S, 1)) return;          // never an event without a date
var r = { icon: e.type, when: dateOf(e.day, S, 1) };
if (e.kind === 'warning') {
if (!S['r_' + e.type]) return;
var t = e.hail && e.wind ? S.r_tags : e.hail ? S.r_tag_hail : e.wind ? S.r_tag_wind : '';
r.text = S['r_' + e.type] + (t ? ', ' + fill(t, { hail: num(e.hail), wind: num(e.wind) }) : '');
r.where = S.r_covered;
} else {
var k = { hail: 'r_hail', gust: 'r_gust', damage: 'r_damage', tornado: 'r_tornado' }[e.type];
if (!k || e.mi == null) return;
r.text = fill(S[k], { size: num(e.size) });
r.where = e.mi < 0.1 ? S.r_here : fill(S.r_dist, { mi: Number(e.mi).toFixed(1), dir: e.dir || '' }).trim();
}
v.rows.push(r);
});
var all = v.rows.length;
v.rows = v.rows.slice(0, 12);
if (all > 12) v.more = fill(S.r_more, { n: all - 12 });
if (d.level === 'high') { v.level = fill(S.r_level, { level: S.r_high }); v.rule = S.r_rule_high; }
else if (d.level === 'mid' && all) { v.level = fill(S.r_level, { level: S.r_mid }); v.rule = S.r_rule_mid; }
else if (d.level === 'none' && !all && !d.partial) { v.level = S.r_none; v.rule = S.r_rule; }
else { v.level = fill(S.r_level, { level: S.r_unknown }); v.rule = S.r_rule; }
return v;
}
function smsLink(ua, touch, num, body) {
var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && touch > 1);
return { phone: ios || /Android/i.test(ua), href: 'sms:' + num + (ios ? '&' : '?') + 'body=' + encodeURIComponent(body) };
}
if (typeof module === 'object' && module.exports) { module.exports = { stormView: stormView, reportView: reportView, smsLink: smsLink, place: place }; return; }
var box = document.getElementById('chat'), tpl = document.getElementById('chat-tpl');
if (!box || !tpl || !tpl.content) return;
var S = {}, T = {};
each(tpl.content.querySelectorAll('[data-k]'), function (n) { S[n.getAttribute('data-k')] = n.textContent; T[n.getAttribute('data-k')] = n; });
var ds = box.dataset, root = ds.root || '';
function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
function push(o) { try { (window.dataLayer = window.dataLayer || []).push(o); } catch (e) {} }
function each(l, f) { Array.prototype.forEach.call(l, f); }
function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
function aiAnswer() { return null; }   // the switched-off hook (see AI_ANSWERS); never called while AI_ANSWERS is false
var sl = smsLink(navigator.userAgent || '', navigator.maxTouchPoints || 0, ds.sms, S.sms_body), phone = sl.phone, smsHref = sl.href;
var stormsP = null;
function storms() {
if (stormsP) return stormsP;
var c = ss('cr-storms'); try { c = c && JSON.parse(c); } catch (e) { c = null; }
if (c && Date.now() - c.t < 600000) return (stormsP = Promise.resolve(c.d));
stormsP = fetch(ds.stormsUrl, { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); })
.then(function (d) { ss('cr-storms', JSON.stringify({ t: Date.now(), d: d })); return d; })
.catch(function () { stormsP = null; return null; });
return stormsP;
}
function paintStorms(w, d) {
var v = stormView(d, S), line = w.querySelector('.storms-line'), ul = w.querySelector('.storms-list');
line.textContent = v.alerts.concat([v.line]).join(' ');
ul.textContent = '';
v.items.forEach(function (t) {   // on the page, each report line leads to the booking form
var li = el('li'), bk = w.getAttribute('data-book');
if (bk && t !== v.items[4]) { var a = el('a', '', t); a.href = bk; li.appendChild(a); } else li.textContent = t;
ul.appendChild(li);
});
ul.hidden = !v.items.length;
}
function reportForm(host, onAppt) {   // the page form is in the HTML; the panel gets a copy from the template
var f = host.querySelector('.rep-form');
if (!f) {
var c = T.repform.cloneNode(true), id = 'rep-' + Math.random().toString(36).slice(2, 7);
c.querySelector('input').id = id; c.querySelector('label').htmlFor = id; f = c.querySelector('.rep-form');
while (c.firstChild) host.appendChild(c.firstChild);
}
var inp = f.querySelector('input'), b = f.querySelector('button'), out = host.querySelector('.rep-out');
f.addEventListener('submit', function (e) {
e.preventDefault();
var q = inp.value.trim();
if (!/^\d{5}$/.test(q) && !(/\d/.test(q) && q.length >= 6)) { out.textContent = S.r_short; return; }
out.textContent = S.r_checking; b.disabled = true;
fetch('/api/storm-report', { method: 'POST', body: JSON.stringify({ q: q }), headers: { Accept: 'application/json', 'Content-Type': 'application/json' } })
.then(function (r) { return r.json(); }).catch(function () { return null; })
.then(function (d) { b.disabled = false; paintReport(out, d, onAppt); push({ event: 'storm_report', ok: !!(d && d.ok), level: d && d.level }); });
});
}
function paintReport(out, d, onAppt) {
var v = reportView(d, S);
out.textContent = '';
if (v.msg) { out.appendChild(el('p', '', v.msg)); return; }
var card = el('div', 'rep');
card.appendChild(el('p', 'rep-for', v.head));
if (v.outside) card.appendChild(el('p', 'rep-note', S.r_outside));
card.appendChild(el('p', 'rep-level rep-level--' + (d.level || 'unknown'), v.level));
card.appendChild(el('p', 'chat-small', v.rule));
if (v.partial) card.appendChild(el('p', 'rep-note', S.r_partial));
if (v.rows.length) {
var ul = el('ul', 'rep-list');
v.rows.forEach(function (r) {
var li = el('li', 'rep-i rep-i--' + r.icon);
li.appendChild(el('span', 'rep-t', r.text)); li.appendChild(el('span', 'rep-d', r.when + ' · ' + r.where));
ul.appendChild(li);
});
card.appendChild(ul);
if (v.more) card.appendChild(el('p', 'chat-small', v.more));
}
card.appendChild(el('p', 'chat-small', v.src));
card.appendChild(el('p', 'chat-small', v.disclaim));
var acts = el('div', 'rep-acts'), ap = el('button', 'btn btn--gold btn--sm', S.r_appt); ap.type = 'button';
ap.addEventListener('click', function () { push({ event: 'storm_report_appt' }); onAppt(d.kind === 'address' ? d.place : ''); });
acts.appendChild(ap);
var call = el('a', 'btn btn--outline btn--sm', S.a_call); call.href = ds.tel; acts.appendChild(call);
var tx = el('a', 'btn btn--outline btn--sm', S.a_text); tx.href = smsHref; acts.appendChild(tx);
card.appendChild(acts);
out.appendChild(card);
}
var panel, log, choices, form, input, label, opener = null, state = {}, inputHandler = null;
var fabs = Array.prototype.slice.call(document.querySelectorAll('[data-chat-open]'));
function build() {
panel = el('section', 'chat-panel'); panel.id = 'chat-panel'; panel.hidden = true;
panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'chat-title');
var head = el('div', 'chat-head'), t = el('div', 'chat-ht');
var h = el('p', 'chat-title', S.title); h.id = 'chat-title';
t.appendChild(h); t.appendChild(el('p', 'chat-sub', S.sub)); head.appendChild(t);
var x = el('button', 'chat-x'); x.type = 'button'; x.setAttribute('aria-label', S.close); x.textContent = '×';
x.addEventListener('click', function () { close(true); });
head.appendChild(x); panel.appendChild(head);
log = el('div', 'chat-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite'); panel.appendChild(log);
choices = el('div', 'chat-choices'); panel.appendChild(choices);
form = el('form', 'chat-form'); form.hidden = true;
label = el('label', 'sr-only'); label.htmlFor = 'chat-in';
input = el('input'); input.id = 'chat-in'; input.maxLength = 200;
var send = el('button', 'btn btn--gold btn--sm', S.send); send.type = 'submit';
form.appendChild(label); form.appendChild(input); form.appendChild(send); panel.appendChild(form);
form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (inputHandler) inputHandler(v); });
panel.appendChild(el('p', 'chat-foot', S.foot));
panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(true); } });
document.body.appendChild(panel);
}
function say(txt, who, node) {
var b = el('div', 'chat-msg chat-msg--' + (who || 'bot') + (node && !txt ? ' chat-msg--wide' : ''));
if (txt) b.appendChild(el('p', '', txt));
if (node) b.appendChild(node);
log.appendChild(b); log.scrollTop = log.scrollHeight;
return b;
}
function ask(list, focus) {   // list: [[label, fn]] ; adds a "Start over" at the end of every step but the first
choices.textContent = ''; form.hidden = true; inputHandler = null;
list.forEach(function (c) {
var b;
if (c[2]) { b = el('a', 'chat-c', c[0]); b.href = c[2]; if (c[1]) b.addEventListener('click', c[1]); }
else { b = el('button', 'chat-c', c[0]); b.type = 'button'; b.addEventListener('click', function () { say(c[0], 'me'); c[1](); }); }
if (c[0] === S.b_submit || c[0] === S.c_book || c[0] === S.t_open || c[0] === S.s_call_btn) b.className += ' chat-c--go';
choices.appendChild(b);
});
if (state.step) { var r = el('button', 'chat-c chat-c--q', S.restart); r.type = 'button'; r.addEventListener('click', start); choices.appendChild(r); }
if (focus !== false && choices.firstChild) choices.firstChild.focus();
}
function field(lab, type, auto, fn) {
ask([], false);
label.textContent = lab; input.type = type; input.value = ''; input.placeholder = lab;
input.setAttribute('autocomplete', auto); input.inputMode = type === 'tel' ? 'tel' : 'text';
form.hidden = false; inputHandler = fn; input.focus();
}
function start() {
log.textContent = ''; state = {};
say(S.greet);
ask([[S.c_book, book], [S.c_storm, storm], [S.c_ask, askQ], [S.c_text, text]]);
state.step = 1;
}
function open(how, src, then) {
if (!panel) build();
if (panel.hidden) {
opener = src || null;
panel.hidden = false; document.documentElement.classList.add('chat-on');
fabs.forEach(function (f) { f.setAttribute('aria-expanded', 'true'); });
push({ event: 'chat_open', how: how || 'click' });
} else if (!then) return;
if (then) { log.textContent = ''; state = { step: 1 }; then(); } else if (how === 'alert') alertStart(); else start();
}
function close(user) {
if (!panel || panel.hidden) return;
panel.hidden = true; document.documentElement.classList.remove('chat-on');
fabs.forEach(function (f) { f.setAttribute('aria-expanded', 'false'); });
if (user) ss('cr-chat-closed', '1');
if (opener && opener.focus) opener.focus();
}
function book(note, addr) {
state.note = typeof note === 'string' ? note : ''; state.step = 2;
say(S.b_name);
field(S.l_name, 'text', 'name', function (v) {
if (!v) return say(S.b_name_bad);
state.name = v; say(v, 'me'); state.first = v.split(/\s+/)[0];
say(fill(S.b_phone, { first: state.first }));
field(S.l_phone, 'tel', 'tel', function (p) {
var d = p.replace(/\D/g, '');
if (!(d.length === 10 || (d.length === 11 && d.charAt(0) === '1'))) return say(S.b_phone_bad);
state.phone = p; say(p, 'me');
if (addr) { state.address = addr; say(addr, 'me'); return day(); }
say(S.b_addr);
field(S.l_addr, 'text', 'street-address', function (a) {
if (!a) return say(S.b_addr_bad);
state.address = a; say(a, 'me'); day();
});
});
});
}
function opts(k) { return Array.prototype.map.call(T[k].querySelectorAll('li'), function (li) { return li.textContent; }); }
function day() {
say(S.b_day);
ask(opts('days').map(function (o) { return [o, function () {
state.day = o; say(S.b_time);
ask(opts('times').map(function (t) { return [t, function () { state.time = t; consent(); }]; }));
}]; }));
}
function consent() {
var c = T.consent.cloneNode(true);
each(c.querySelectorAll('input'), function (i, n) { i.id = 'chat-cons-' + n; i.parentNode.htmlFor = i.id; });
say(S.b_consent, 'bot', c);
ask([[S.b_submit, function () { submit(c); }]]);
}
function submit(c) {
ask([], false); say(S.b_sending);
var fd = new FormData();
fd.append('name', state.name); fd.append('phone', state.phone); fd.append('address', state.address);
fd.append('message', state.note || ''); fd.append('preferred_day', state.day); fd.append('time_window', state.time);
each(c.querySelectorAll('input'), function (i) { if (i.checked) fd.append(i.name, 'yes'); i.disabled = true; });
fd.append('source', 'chat'); fd.append('page', location.pathname);
fetch(ds.endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
.then(function (r) { if (!r.ok) throw new Error(r.status); })
.then(function () {
say(fill(S.b_ok, { first: state.first, phone: state.phone }));
ask([[S.a_call, null, ds.tel]]);
push({ event: 'form_submit', form: 'chat' });
})
.catch(function () {
say(S.b_fail);
ask([[S.a_call, null, ds.tel], [S.b_page, null, T.link_book.getAttribute('href')]]);
});
}
function storm() {
state.step = 2; say(S.s_what);
ask([S.s_hail, S.s_wind, S.s_tree, S.s_leak].map(function (w) { return [w, function () {
state.what = w; say(S.s_wet);
ask([[S.s_yes, function () { wet(true); }], [S.s_no, function () { wet(false); }]]);
}]; }));
}
function wet(y) {
var note = fill(S.s_note, { what: state.what, wet: y ? S.s_wet_yes : S.s_wet_no });
if (y) {
say(S.s_call);
return ask([[S.s_call_btn, null, ds.tel], [S.c_book, function () { book(note); }]]);
}
say(S.s_next);
stormCard();
ask([[S.c_book, function () { book(note); }], [S.s_page, null, T.link_storm.getAttribute('href')]]);
}
function stormCard(lead) {
var w = el('div', 'storms storms--chat');
w.appendChild(el('p', 'storms-h', S.w_h));
if (lead) w.appendChild(el('p', 'storms-alert', lead));
w.appendChild(el('p', 'storms-line', S.w_loading));
var ul = el('ul', 'storms-list'); ul.hidden = true; w.appendChild(ul);
w.appendChild(el('p', 'chat-small', S.w_src));
reportForm(w, function (addr) { book(fill(S.s_note, { what: S.r_h, wet: S.s_wet_no }), addr); });
say('', 'bot', w);
storms().then(function (d) { paintStorms(w, d); });
}
function alertStart() {
log.textContent = ''; state = { step: 1 };
storms().then(function (d) {
var a = d && d.alerts && d.alerts.filter(function (x) { return x.warning; })[0];
stormCard(a ? fill(S.w_alert_open, { event: a.event, where: where(a.counties, S) }) : '');
ask([[S.c_book, function () { book(); }], [S.c_storm, storm], [S.c_text, text]], false);
});
}
var faq = null;
var STOP = 'a an and are as at be but by can do does for from how i if in is it its me my of on or our should so that the their them then there this to us was we what when where which who why will with would you your'.split(' ');
function stem(t) { return t.length > 4 ? t.replace(/(ing|ed|es|s)$/, '') : t; }
function toks(s) { return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(function (t) { return STOP.indexOf(t) < 0; }).map(stem); }
function near(a, b) { return a === b || (a.length > 3 && b.length > 3 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)); }
function score(qt, d) {
var s = 0;
qt.forEach(function (t) { if (d.q.some(function (u) { return near(t, u); })) s += 2; if (d.a.some(function (u) { return near(t, u); })) s += 1; });
return s / Math.max(qt.length, 1);
}
function loadFaq() {
if (faq) return Promise.resolve(faq);
return fetch(ds.faqUrl).then(function (r) { return r.json(); }).then(function (d) {
faq = d.map(function (x) { return { x: x, q: toks(x.q), a: toks(x.a) }; }); return faq;
});
}
function askQ() {
state.step = 2; say(S.a_prompt); loadFaq().catch(function () {});
field(S.l_ask, 'text', 'off', function (q) {
var qt = toks(q); if (!qt.length) return;
say(q, 'me');
if (AI_ANSWERS) { var ai = aiAnswer(q); if (ai) return; }
loadFaq().then(function (d) {
var r = d.map(function (x) { return { x: x.x, s: score(qt, x) }; }).sort(function (a, b) { return b.s - a.s; })
.filter(function (h) { return h.s >= 1; }).slice(0, 2);
if (!r.length) return none();
var wrap = el('div', 'chat-hits');
r.forEach(function (h) {
var it = el('div', 'chat-hit'); it.appendChild(el('p', 'chat-hq', h.x.q)); it.appendChild(el('p', '', h.x.a));
var a = el('a', '', S.a_more); a.href = root + h.x.url; it.appendChild(a); wrap.appendChild(it);
});
var all = el('a', '', S.a_faq); all.href = T.link_faq.getAttribute('href'); wrap.appendChild(all);
say(S.a_hits, 'bot', wrap);
after();
push({ event: 'ask_query', where: 'chat', q_len: q.length, match: r[0].x.id });
}).catch(none);
});
}
function none() { say(S.a_none); after(); }
function after() { ask([[S.a_again, askQ], [S.a_text, null, smsHref], [S.a_call, null, ds.tel]]); }
function text() {
state.step = 2;
if (phone) {
say(S.t_phone);
ask([[S.t_open, function () { push({ event: 'text_click', where: 'chat' }); }, smsHref]]);
} else {
var q = T.qr.cloneNode(true), w = el('div', 'chat-qr'); w.appendChild(q);
say(S.t_desk, 'bot', w);
ask([[S.c_book, function () { book(); }]], false);
}
say(S.t_hours);
}
fabs.forEach(function (f) {
f.setAttribute('role', 'button'); f.setAttribute('aria-haspopup', 'dialog'); f.setAttribute('aria-expanded', 'false'); f.setAttribute('aria-controls', 'chat-panel');
f.addEventListener('click', function (e) { e.preventDefault(); if (panel && !panel.hidden) close(true); else open('click', f); });
f.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); f.click(); } });
});
var blocks = document.querySelectorAll('[data-storms]');
if (blocks.length) storms().then(function (d) { each(blocks, function (w) { paintStorms(w, d); }); });
each(document.querySelectorAll('[data-storm-check]'), function (h) {
reportForm(h, function (addr) { open('report', null, function () { book(fill(S.s_note, { what: S.r_h, wet: S.s_wet_no }), addr); }); });
});
setTimeout(function () {
storms().then(function (d) {
if (!d || d.ok !== true || d.warning !== true) return;
fabs.forEach(function (f) { var b = f.querySelector('.chat-badge'); if (b) { b.hidden = false; b.setAttribute('aria-label', S.w_badge); b.textContent = '!'; } });
if (ss('cr-chat-closed') || ss('cr-chat-auto')) return;
ss('cr-chat-auto', '1'); open('alert', null);
});
}, 1500);
})();
