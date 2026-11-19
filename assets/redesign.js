(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var saveData = navigator.connection && navigator.connection.saveData;
  document.querySelectorAll('.ambient-video').forEach(function (video) {
    var box = video.closest('.home-hero, .service-film');
    var button = box && box.querySelector('.motion-toggle');
    if (!button) return;
    var manuallyPaused = false;
    function label() {
      button.textContent = video.paused ? 'Play video' : 'Pause video';
      button.setAttribute('aria-label', video.paused ? 'Play background video' : 'Pause background video');
    }
    function play() {
      if (!video.src) video.src = video.getAttribute('data-src');
      video.muted = true;
      var pending = video.play();
      if (pending && pending.catch) pending.catch(label);
    }
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    video.addEventListener('error', label);
    button.addEventListener('click', function () {
      if (video.paused) { manuallyPaused = false; play(); }
      else { manuallyPaused = true; video.pause(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) video.pause();
          else if (!reduce.matches && !saveData && !manuallyPaused) play();
        });
      }, { threshold: 0.12 }).observe(box);
    } else if (!reduce.matches && !saveData) play();
    function stopForPreference() { if (reduce.matches) video.pause(); }
    if (reduce.addEventListener) reduce.addEventListener('change', stopForPreference);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) video.pause();
    });
  });
}());
