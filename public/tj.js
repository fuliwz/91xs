(function () {
  window._Hasync = window._Hasync || [];

  window._Hasync.push([
    'Histats.start',
    '1,4670594,4,0,0,0,00010000'
  ]);

  window._Hasync.push([
    'Histats.fasi',
    '1'
  ]);

  window._Hasync.push([
    'Histats.track_hits',
    ''
  ]);

  if (document.querySelector('script[data-histats="1"]')) {
    return;
  }

  var hs = document.createElement('script');
  hs.type = 'text/javascript';
  hs.async = true;
  hs.dataset.histats = '1';
  hs.src = 'https://s10.histats.com/js15_as.js';

  (document.head || document.body).appendChild(hs);
})();
