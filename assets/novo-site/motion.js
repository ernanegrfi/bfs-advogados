(() => {
 'use strict';
 const preference = matchMedia('(prefers-reduced-motion: reduce)');
 const mobile = matchMedia('(max-width: 760px)');
 const running = new Set();
 function play(element, frames, options) {
  if (preference.matches || !element.animate) return null;
  const animation = element.animate(frames, options);
  running.add(animation);
  animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  return animation;
 }
 const panels = new Map();
 function setPanel(button, open) {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  const previous = panels.get(panel);
  const startHeight = panel.hidden ? 0 : panel.getBoundingClientRect().height;
  const startOpacity = panel.hidden ? 0 : Number(getComputedStyle(panel).opacity);
  const startPadding = panel.hidden ? 0 : parseFloat(getComputedStyle(panel).paddingBottom);
  if (previous) { previous.cancel(); panels.delete(panel); }
  button.setAttribute('aria-expanded', String(open));
  button.querySelector('.area-sign').textContent = open ? '−' : '+';
  panel.inert = !open;
  if (!open && panel.contains(document.activeElement)) button.focus({preventScroll:true});
  panel.hidden = false;
  panel.classList.remove('is-moving');
  const endHeight = panel.getBoundingClientRect().height;
  const endPadding = parseFloat(getComputedStyle(panel).paddingBottom);
  function settle() { panel.hidden = !open; panel.classList.remove('is-moving'); }
  if (preference.matches || !panel.animate || (!open && startHeight === 0)) { settle(); return; }
  panel.classList.add('is-moving');
  const animation = play(panel, [
   {height:`${startHeight}px`,opacity:startOpacity,paddingBottom:`${startPadding}px`,transform:open?'translateY(-5px)':'translateY(0)'},
   {height:open?`${endHeight}px`:'0px',opacity:open?1:0,paddingBottom:open?`${endPadding}px`:'0px',transform:open?'translateY(0)':'translateY(-5px)'}
  ], {duration:mobile.matches?280:420,easing:'cubic-bezier(.22,.61,.36,1)'});
  panels.set(panel, animation);
  animation.finished.then(() => { if (panels.get(panel) === animation) { panels.delete(panel); settle(); } }, () => {});
 }
 document.querySelectorAll('.area-toggle').forEach(button => {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  panel.inert = button.getAttribute('aria-expanded') !== 'true';
  button.addEventListener('click', () => {
   const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
   document.querySelectorAll('.area-toggle').forEach(other => {
    const open = other === button && shouldOpen;
    if ((other.getAttribute('aria-expanded') === 'true') !== open) setPanel(other, open);
   });
  });
 });
 if (!preference.matches) {
  const entries = document.querySelectorAll('.hero .eyebrow,.hero-title>span,.hero-description,.hero-bottom');
  entries.forEach((element, index) => play(element,[{opacity:0,transform:`translateY(${mobile.matches?8:14}px)`},{opacity:1,transform:'translateY(0)'}],{duration:mobile.matches?420:650,delay:index*85,easing:'cubic-bezier(.22,.61,.36,1)',fill:'backwards'}));
  const watermark = document.querySelector('.hero-watermark');
  if(watermark) play(watermark,[{opacity:0},{opacity:getComputedStyle(watermark).opacity}],{duration:1100,easing:'ease-out'});
 }
 const observers = [];
 function onceVisible(element, action) {
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
   if(entries.some(entry => entry.isIntersecting)){action();observer.disconnect();}
  }, {threshold:.12});
  observers.push(observer);observer.observe(element);
 }
 document.querySelectorAll('.motion-line-art').forEach(svg => {
  if (preference.matches) return;
  const paths = [...svg.querySelectorAll('path')];
  paths.forEach(path => {path.style.strokeDasharray='1';path.style.strokeDashoffset='1';});
  const target = svg.closest('section') || svg;
  if (!('IntersectionObserver' in window)) {paths.forEach(path=>{path.style.strokeDasharray='';path.style.strokeDashoffset='';});return;}
  onceVisible(target, () => paths.forEach((path,index) => {
   path.style.strokeDashoffset='0';
   play(path,[{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:mobile.matches?900:1800,delay:Math.min(index*90,500),easing:'ease-in-out',fill:'backwards'});
  }));
 });
 const sede = document.querySelector('.sede-photo');
 if(sede) onceVisible(sede, () => play(sede,[{opacity:.3,clipPath:'inset(0 5% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],{duration:mobile.matches?450:850,easing:'cubic-bezier(.22,.61,.36,1)'}));
 const dialog = document.querySelector('#profile-dialog');
 new MutationObserver(records => {
  if(dialog.open && records.some(record=>record.attributeName==='open'))play(dialog,[{opacity:0,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:280,easing:'cubic-bezier(.22,.61,.36,1)'});
 }).observe(dialog,{attributes:true,attributeFilter:['open']});
 preference.addEventListener('change', () => {
  if (!preference.matches) return;
  running.forEach(animation=>animation.finish());
  observers.forEach(observer=>observer.disconnect());
  document.querySelectorAll('.motion-line-art path').forEach(path=>{path.style.strokeDashoffset='0';});
 });
})();
