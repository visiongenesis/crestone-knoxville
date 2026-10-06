/* Crestone Roofing, Knoxville. Nav toggle, form focus states, phone-click tracking stub. No frameworks. */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // Form fields: mark the wrapper while focused and once it holds a value.
  document.querySelectorAll('.field input, .field textarea').forEach(function (el) {
    var field = el.closest('.field');
    function sync() { field.classList.toggle('has-value', !!el.value.trim()); }
    el.addEventListener('focus', function () { field.classList.add('is-focused'); });
    el.addEventListener('blur', function () { field.classList.remove('is-focused'); sync(); });
    sync();
  });

  // Tracking stub. Pushes to dataLayer only. Point track() at GA4, GTM or a call-tracking tool later.
  function track(name, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name, page: location.pathname }, data || {}));
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (a) track('phone_click', { where: a.getAttribute('data-where') || 'page' });
  });
  document.querySelectorAll('form.lead-form').forEach(function (f) {
    f.addEventListener('submit', function () { track('lead_form_submit', { form: f.getAttribute('data-form') || 'inspection' }); });
  });

  // Mark the current page in the nav.
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a').forEach(function (a) {
    if ((a.getAttribute('href') || '').split('/').pop() === here) a.setAttribute('aria-current', 'page');
  });
})();
