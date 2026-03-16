(function () {
  function init() {
    var el = document.getElementById('nda-print-btn');
    if (el) el.onclick = function () { window.print(); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
