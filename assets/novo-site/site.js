(() => {
 'use strict';
 const header = document.querySelector('.site-header');
 const menuButton = document.querySelector('.menu-toggle');
 const menu = document.querySelector('#mobile-menu');
 function closeMenu(returnFocus = false) {
  menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  if (returnFocus) menuButton.focus();
 }
 menuButton.addEventListener('click', () => {
  const open = menu.hidden; menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
 });
 menu.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
 document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(true); });
 document.addEventListener('click', e => { if (!menu.hidden && !header.contains(e.target)) closeMenu(); });
 const sections = [...document.querySelectorAll('main > section[id]')];
 const links = [...document.querySelectorAll('[data-nav]')];
 let ticking = false;
 function updateNavigation() {
  const offset = header.getBoundingClientRect().height + 70;
  let active = sections[0].id;
  for (const section of sections) if (section.getBoundingClientRect().top <= offset) active = section.id;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) active = 'contato';
  for (const link of links) {
   if (link.dataset.nav === active) link.setAttribute('aria-current', 'true');
   else link.removeAttribute('aria-current');
  }
  ticking = false;
 }
 function requestNavigation() { if (!ticking) { ticking = true; requestAnimationFrame(updateNavigation); } }
 function updateHeader() {
  if (innerWidth > 1100 && !menu.hidden) closeMenu();
  document.documentElement.style.setProperty('--header', `${header.offsetHeight}px`);
  requestNavigation();
 }
 addEventListener('scroll', requestNavigation, {passive:true});
 addEventListener('resize', updateHeader, {passive:true});
 updateHeader();
 document.querySelectorAll('.area-toggle').forEach(button => {
  button.addEventListener('click', () => {
   const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
   document.querySelectorAll('.area-toggle').forEach(other => {
    const open = other === button && shouldOpen;
    other.setAttribute('aria-expanded', String(open));
    document.getElementById(other.getAttribute('aria-controls')).hidden = !open;
    other.querySelector('.area-sign').textContent = open ? '−' : '+';
   });
  });
 });
 document.querySelectorAll('[data-area]').forEach(link => link.addEventListener('click', () => {
  const select = document.querySelector('#area');
  select.value = link.dataset.area;
  select.removeAttribute('aria-invalid'); document.querySelector('#erro-area').hidden = true;
 }));
 const profiles = {
  pedro:{name:'Dr. Pedro Paulo Borges Souza',role:'Sócio coordenador',bio:'Coordena a Assessoria Jurídica Empresarial e Previdenciária da BFS, com atuação na consultoria corporativa e na defesa de benefícios em instâncias administrativas e judiciais.'},
  rubeo:{name:'Dr. Rúbeo Carlos da Silva',role:'Sócio coordenador',bio:'Integra a coordenação da BFS Advogados, com atuação em Direito Previdenciário, Cível, Família e Sucessões e atendimento próximo aos clientes.'},
  gildo:{name:'Dr. José Gildo dos Santos',role:'Decano e consultor sênior',bio:'Formado pela Universidade Federal de Goiás em 1983, tem mais de 40 anos de trajetória jurídica, com experiência em Direito do Trabalho e Direito Desportivo.'}
 };
 const dialog = document.querySelector('#profile-dialog');
 document.querySelectorAll('[data-profile]').forEach(button => button.addEventListener('click', () => {
  const profile = profiles[button.dataset.profile];
  document.querySelector('#profile-name').textContent = profile.name;
  document.querySelector('#profile-role').textContent = profile.role;
  document.querySelector('#profile-bio').textContent = profile.bio;
  dialog.showModal();
 }));
 dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
 document.querySelector('#profile-contact').addEventListener('click', () => dialog.close());
 const form = document.querySelector('#contact-form');
 const fields = ['nome','telefone','area'].map(id => document.getElementById(id));
 function isValid(field) {
  const value = field.value.trim();
  if (field.id === 'telefone') {
   const digits = value.replace(/\D/g,'').replace(/^55(?=\d{10,11}$)/,'');
   return /^([1-9]{2})(?:[2-5]\d{7}|9\d{8})$/.test(digits);
  }
  if (field.id === 'nome') return value.length >= 2;
  return Boolean(value);
 }
 function setError(field, invalid) {
  document.getElementById(`erro-${field.id}`).hidden = !invalid;
  if (invalid) field.setAttribute('aria-invalid','true'); else field.removeAttribute('aria-invalid');
 }
 fields.forEach(field => field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => {
  if (field.hasAttribute('aria-invalid')) setError(field, !isValid(field));
 }));
 form.addEventListener('submit', e => {
  e.preventDefault();
  const invalid = fields.filter(field => !isValid(field));
  fields.forEach(field => setError(field, invalid.includes(field)));
  const status = document.querySelector('#form-status');
  if (invalid.length) { status.hidden = true; invalid[0].focus(); return; }
  const text = ['Olá, gostaria de atendimento da BFS Advogados.','',`Nome: ${fields[0].value.trim()}`,`WhatsApp: ${fields[1].value.trim()}`,`Área de interesse: ${fields[2].value}`];
  const message = document.querySelector('#mensagem').value.trim();
  if (message) text.push(`Resumo: ${message}`);
  const url = `https://wa.me/556230876144?text=${encodeURIComponent(text.join('\n'))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  status.replaceChildren(document.createTextNode('Continue no WhatsApp para enviar sua mensagem. Se a janela não abriu, '));
  const fallback = document.createElement('a'); fallback.href = url; fallback.target = '_blank'; fallback.rel = 'noopener noreferrer'; fallback.textContent = 'abra a conversa aqui';
  status.append(fallback, document.createTextNode('.')); status.hidden = false;
 });
})();
