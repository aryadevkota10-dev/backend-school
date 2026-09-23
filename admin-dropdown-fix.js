/* Devdaha Admin dropdown reliability patch. Use native select controls deliberately:
   they are the browser's most reliable accessible dropdown on desktop and touch devices.
   This script only adds keyboard/focus helpers and never replaces the select. */
(function(){
  'use strict';
  const mark='data-devdaha-native-dropdown-ready';
  function prep(select){
    if(!select||select.hasAttribute(mark)) return;
    select.setAttribute(mark,'1');
    select.style.position='relative';
    select.style.zIndex='20';
    select.addEventListener('keydown',e=>{
      if(e.key==='Enter' || e.key===' '){
        // Let the native select handle opening/selection.
        select.focus();
      }
    });
    select.addEventListener('change',()=>{
      select.dispatchEvent(new CustomEvent('devdaha:dropdown-change',{bubbles:true,detail:{value:select.value}}));
    });
  }
  function init(){document.querySelectorAll('select:not([multiple])').forEach(prep);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});
})();
