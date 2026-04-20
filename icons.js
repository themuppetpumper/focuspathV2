// Shared icon sprite injector for FocusPath
(function(){
  var originalSymbols = '';
  var chairSymbols = ''
    + '  <symbol id="ico-home" viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="18">🪑</text></symbol>\n'
    + '  <symbol id="ico-flashcards" viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="18">🪑</text></symbol>\n'
    + '  <symbol id="ico-tests" viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="18">🪑</text></symbol>\n'
    + '  <symbol id="ico-games" viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="18">🪑</text></symbol>\n'
    + '  <symbol id="ico-dictionary" viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="18">🪑</text></symbol>\n'
    + '  <symbol id="ico-stats" viewBox="0 0 24 24"><text x="12" y="18" text-anchor="middle" font-size="18">🪑</text></symbol>\n';

  function inject(){
    if(document.getElementById('fpIconSprite')) return; // already present
    originalSymbols = ''
      + '  <symbol id="ico-home" viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z"/></symbol>\n'
      + '  <symbol id="ico-flashcards" viewBox="0 0 24 24"><rect x="2" y="6" width="16" height="12" rx="2" ry="2"/><path d="M6 6V4h12a2 2 0 0 1 2 2v10h-2"/></symbol>\n'
      + '  <symbol id="ico-tests" viewBox="0 0 24 24"><path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M9 12h6M9 16h6M9 8h2"/></symbol>\n'
      + '  <symbol id="ico-games" viewBox="0 0 24 24"><path d="M6 3h12a3 3 0 0 1 3 3v8a4 4 0 0 1-4 4h-2l-2 2-2-2H9a4 4 0 0 1-4-4V6a3 3 0 0 1 3-3Z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></symbol>\n'
      + '  <symbol id="ico-dictionary" viewBox="0 0 24 24"><path d="M6 2h9.5a4.5 4.5 0 0 1 0 9H8v11a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1Z"/><path d="M8 4v5h7.5a2.5 2.5 0 0 0 0-5H8Z"/></symbol>\n'
      + '  <symbol id="ico-stats" viewBox="0 0 24 24"><path d="M4 20h16"/><rect x="6" y="10" width="3" height="6" rx="1"/><rect x="11" y="6" width="3" height="10" rx="1"/><rect x="16" y="13" width="3" height="3" rx="1"/></symbol>\n';

    var symbols = originalSymbols;
    // If USAF theme is already active on load, start with chairs
    var currentTheme = document.documentElement.getAttribute('data-theme');
    if(currentTheme === 'usaf') symbols = chairSymbols;

    var sprite = '\n<svg id="fpIconSprite" width="0" height="0" style="position:absolute;opacity:0;pointer-events:none" aria-hidden="true">\n'
      + symbols
      + '</svg>';
    document.body.insertAdjacentHTML('afterbegin', sprite);
    if(!document.getElementById('fpIconStyle')){
      var st = document.createElement('style');
      st.id = 'fpIconStyle';
      st.textContent = '.fp-icon{width:20px;height:20px;display:inline-block;fill:currentColor}';
      document.head.appendChild(st);
    }

    // Swap icons on theme change
    window.addEventListener('fpThemeChanged', function(e){
      var sprite = document.getElementById('fpIconSprite');
      if(!sprite) return;
      var theme = e.detail && e.detail.theme;
      var isChair = (theme === 'usaf');
      sprite.innerHTML = isChair ? chairSymbols : originalSymbols;
      // Swap FocusPath brand logo and title
      swapBrandLogo(isChair);
    });

    // Apply on load if already USAF
    if(currentTheme === 'usaf') swapBrandLogo(true);
  }

  var chairLogoSVG = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><text x="24" y="36" text-anchor="middle" font-size="36">🪑</text></svg>';
  var originalLogoSVG = '<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path></svg>';

  function swapBrandLogo(isChair){
    var logo = document.getElementById('fpBrandLogo');
    var text = document.getElementById('fpBrandText');
    if(logo) logo.innerHTML = isChair ? chairLogoSVG : originalLogoSVG;
    if(text) text.textContent = isChair ? 'ChairForce' : 'FocusPath';
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
