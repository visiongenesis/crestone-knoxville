(function(){
  var t=document.querySelector('.nav-toggle'),n=document.getElementById('site-nav');
  if(t&&n)t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o)});
  window.dataLayer=window.dataLayer||[];
  function track(e,d){window.dataLayer.push(Object.assign({event:e},d||{}))}
  document.addEventListener('click',function(e){var a=e.target.closest('a[href^="tel:"],a[href^="sms:"]');if(a)track(a.href.indexOf('sms:')===0?'text_click':'phone_click',{where:a.dataset.where||''})});
  document.querySelectorAll('form.lead-form').forEach(function(f){f.addEventListener('submit',function(){track('form_submit',{form:f.dataset.form||''})})});
})();
