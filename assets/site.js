/* Crestone Roofing Knoxville v4. No libraries. */
(function () {
  var dl = window.dataLayer = window.dataLayer || [];
  function push(o) { try { dl.push(o); } catch (e) {} }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  // events: phone_click, text_click, cta_click
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-ev]');
    if (a) push({ event: a.getAttribute('data-ev') });
  });

  // nav: mobile sheet toggle; desktop dropdowns open on hover and :focus-within (CSS), the chevron button
  // toggles one for click and touch and carries aria-expanded; Escape closes the open menu or the sheet.
  var hdr = $('.site-header'), mb = $('.menu-btn');
  function closeSheet(focus) {
    if (hdr && hdr.classList.contains('nav-open')) { hdr.classList.remove('nav-open'); if (mb) { mb.setAttribute('aria-expanded', 'false'); if (focus) mb.focus(); } }
  }
  if (mb) mb.addEventListener('click', function () {
    var open = hdr.classList.toggle('nav-open');
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  function ddSet(li, open) {
    var b = $('.dd-btn', li);
    li.classList.toggle('open', open); li.classList.toggle('shut', !open);
    if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function ddCloseAll(except) { $$('.dd.open').forEach(function (li) { if (li !== except) ddSet(li, false); }); }
  $$('.dd').forEach(function (li) {
    var b = $('.dd-btn', li);
    if (b) b.addEventListener('click', function (e) { e.stopPropagation(); var o = !li.classList.contains('open'); ddCloseAll(li); ddSet(li, o); });
    li.addEventListener('mouseenter', function () { li.classList.remove('shut'); if (b) b.setAttribute('aria-expanded', 'true'); });
    li.addEventListener('mouseleave', function () {
      li.classList.remove('shut');
      if (b && !li.classList.contains('open') && !li.contains(document.activeElement)) b.setAttribute('aria-expanded', 'false');
    });
    li.addEventListener('focusin', function () { if (b && !li.classList.contains('shut')) b.setAttribute('aria-expanded', 'true'); });
    li.addEventListener('focusout', function (e) {
      if (!li.contains(e.relatedTarget)) { li.classList.remove('open'); li.classList.remove('shut'); if (b) b.setAttribute('aria-expanded', 'false'); }
    });
  });
  document.addEventListener('click', function (e) { if (!(e.target.closest && e.target.closest('.dd'))) ddCloseAll(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var li = document.activeElement && document.activeElement.closest && document.activeElement.closest('.dd');
    if (li) { ddSet(li, false); var b = $('.dd-btn', li); if (b) b.focus(); return; }
    ddCloseAll(); closeSheet(true);
  });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { closeSheet(false); }); });

  // lead form: honeypot, validation, fetch submit, no-JS fallback is the plain POST
  $$('.lead-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = f.parentNode, msg = $('.form-msg', box);
      if (f.company_url && f.company_url.value) return;          // bot: drop silently
      var ok = true;
      [['name', 'e-name'], ['phone', 'e-phone'], ['address', 'e-addr']].forEach(function (p) {
        var el = f[p[0]], er = document.getElementById(p[1]), bad = !el.value.trim();
        if (p[0] === 'phone' && !bad) { var d = el.value.replace(/\D/g, ''); bad = !(d.length === 10 || (d.length === 11 && d.charAt(0) === '1')); }
        er.hidden = !bad; el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) return;
      var first = f.name.value.trim().split(/\s+/)[0], phone = f.phone.value.trim();
      var btn = $('button[type=submit]', f); btn.disabled = true;
      fetch(f.action, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r; })
        .then(function () {
          msg.className = 'form-msg ok';
          msg.innerHTML = '<strong></strong><p></p>';
          msg.firstChild.textContent = 'Got it, ' + first + '.';
          msg.lastChild.textContent = "We'll call you at " + phone + ' to set a time. If the roof is leaking right now, call us instead of waiting.';
          f.hidden = true; msg.hidden = false; push({ event: 'form_submit' });
        })
        .catch(function () {
          var tel = ($('.header-phone strong') || {}).textContent || 'us';
          msg.className = 'form-msg bad';
          msg.textContent = "That didn't go through. Please call or text " + tel + " and we'll take it from there.";
          msg.hidden = false; btn.disabled = false;
        });
    });
  });

  // see your roof
  $$('.seeroof').forEach(function (w) {
    var key = w.getAttribute('data-maps-key'), form = $('.seeroof-form', w), input = $('input', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim(); if (!q) { input.focus(); return; }
      var enc = encodeURIComponent(q);
      if (key) {
        var fr = $('.map-frame', w), ifr = document.createElement('iframe');
        ifr.src = 'https://www.google.com/maps/embed/v1/place?key=' + encodeURIComponent(key) + '&q=' + enc + '&maptype=satellite&zoom=19';
        ifr.loading = 'lazy'; ifr.title = 'Satellite view of your address'; ifr.referrerPolicy = 'no-referrer-when-downgrade';
        fr.innerHTML = ''; fr.appendChild(ifr); fr.hidden = false; $('.map-card', w).hidden = true;
        $('.seeroof-after', w).hidden = false;
      } else {
        var gm = 'https://www.google.com/maps/search/?api=1&query=' + enc, lk = $('.seeroof-link', w);
        if (lk) lk.href = gm;
        window.open(gm, '_blank', 'noopener');
        $('.seeroof-note', w).hidden = false; $('.seeroof-after', w).hidden = false;
      }
      push({ event: 'see_roof', mode: key ? 'embed' : 'link' });   // never the address
    });
  });

  // home video: the button is a facade; nothing from YouTube loads until it is pressed, then the
  // privacy-enhanced (youtube-nocookie) player replaces it in the same 16:9 box. No YouTube script or API.
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.video-facade');
    if (!b) return;
    var id = b.getAttribute('data-video-id') || '';
    if (!/^[\w-]{11}$/.test(id)) return;
    var ifr = document.createElement('iframe');
    ifr.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    ifr.title = b.getAttribute('data-video-title') || 'Video';
    ifr.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    ifr.setAttribute('allowfullscreen', '');
    ifr.setAttribute('loading', 'lazy');
    b.parentNode.replaceChild(ifr, b);
    ifr.focus();
  });

  // Ask Crestone: client-side FAQ search. The Ask-X engine can replace [data-askx-slot] later.
  $$('[data-askx-slot]').forEach(function (w) {
    var data = null, form = $('.ask-form', w), input = $('input', form), out = $('.ask-results', w), none = $('.ask-nomatch', w);
    var root = w.getAttribute('data-root') || '';
    var STOP = 'a an and are as at be but by can do does for from how i if in is it its me my of on or our should so that the their them then there this to us was we what when where which who why will with would you your'.split(' ');
    function toks(s) { return (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(function (t) { return STOP.indexOf(t) < 0; }).map(stem); }
    function stem(t) { return t.length > 4 ? t.replace(/(ing|ed|es|s)$/, '') : t; }
    function near(a, b) { return a === b || (a.length > 3 && b.length > 3 && (a.indexOf(b) === 0 || b.indexOf(a) === 0)); }
    function load() {
      if (data) return Promise.resolve(data);
      return fetch(w.getAttribute('data-faq-url')).then(function (r) { return r.json(); }).then(function (d) {
        data = d.map(function (x) { return { x: x, q: toks(x.q), a: toks(x.a) }; }); return data;
      });
    }
    input.addEventListener('focus', function () { load().catch(function () {}); }, { once: true });
    function score(qt, d) {
      var s = 0;
      qt.forEach(function (t) {
        if (d.q.some(function (u) { return near(t, u); })) s += 2;
        if (d.a.some(function (u) { return near(t, u); })) s += 1;
      });
      return s / Math.max(qt.length, 1);
    }
    function ask(q) {
      var qt = toks(q); if (!qt.length) return;
      load().then(function (d) {
        var r = d.map(function (x) { return { x: x.x, s: score(qt, x) }; }).sort(function (a, b) { return b.s - a.s; }).filter(function (r) { return r.s >= 1; }).slice(0, 3);
        out.innerHTML = ''; none.hidden = r.length > 0;
        r.forEach(function (h, i) {
          var el = document.createElement('div'); el.className = 'hit' + (i === 0 ? ' hit--top' : '');
          var h3 = document.createElement('h3'); h3.textContent = h.x.q;
          var p = document.createElement('p'); p.textContent = h.x.a;
          var a = document.createElement('a'); a.href = root + h.x.url; a.textContent = 'Read more';
          el.appendChild(h3); el.appendChild(p); el.appendChild(a); out.appendChild(el);
        });
        push({ event: 'ask_query', q_len: q.length, match: r.length ? r[0].x.id : null });
      }).catch(function () { none.hidden = false; });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    $$('.chip', w).forEach(function (c) { c.addEventListener('click', function () { input.value = c.textContent; ask(c.textContent); }); });
  });
})();
