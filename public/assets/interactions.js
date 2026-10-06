const toggle=document.querySelector('[data-mobile-menu]');
if(toggle){toggle.innerHTML="<svg class=\"mobile-menu-hamburger\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M3 6h18M3 12h18M3 18h18\" /></svg><svg class=\"mobile-menu-x\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"m6 6 12 12M18 6 6 18\" /></svg>";toggle.setAttribute("aria-label","Toggle navigation");const panel=document.createElement('nav');panel.className='sat-mobile-panel';panel.hidden=true;panel.setAttribute('aria-label','Mobile navigation');const nav=document.querySelector('header .sat-desktop-nav')||document.querySelector('header nav');if(nav){panel.innerHTML=nav.innerHTML;panel.querySelectorAll('[data-mobile-menu]').forEach(el=>el.remove());}toggle.closest('header')?.append(panel);toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));});panel.addEventListener('click',e=>{if(e.target.closest('a')){panel.hidden=true;toggle.setAttribute('aria-expanded','false')}})}
// Restore accordion behavior from the visible exported answers.
document.querySelectorAll('[data-faq-toggle]').forEach(button=>{const panel=button.nextElementSibling;if(!panel)return;button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));panel.style.display=open?'block':'none';panel.classList.toggle('sf-hidden',!open);});});
const selections={};document.querySelectorAll('[data-intake-choice]').forEach(button=>{button.addEventListener('click',()=>{const key=button.dataset.intakeChoice;document.querySelectorAll('[data-intake-choice]').forEach(other=>{if(other.dataset.intakeChoice===key){other.setAttribute('aria-pressed',String(other===button));other.style.borderColor=other===button?'#00d6ec':'';}});selections[key]=button.textContent.trim();const form=button.closest('form');const submit=form.querySelector('[type="submit"]');if(submit)submit.disabled=Object.keys(selections).length<3;let field=form.querySelector('[name="system_choices"]');if(!field){field=document.createElement('input');field.type='hidden';field.name='system_choices';form.append(field);}field.value=JSON.stringify(selections);});});
document.querySelectorAll('[data-area-choice]').forEach(button=>button.addEventListener('click',()=>{const area=button.closest('section');const selected=area.querySelector('[data-selected-area]');if(selected)selected.textContent=button.textContent.trim();area.querySelectorAll('[data-area-choice]').forEach(b=>{b.style.background=b===button?'#00d6ec22':'';b.setAttribute('aria-pressed',String(b===button))})}));

document.addEventListener('click',e=>{document.querySelectorAll('header .sat-desktop-nav details[open]').forEach(d=>{if(!d.contains(e.target))d.removeAttribute('open')})});

/* Desktop dropdowns open on hover; touch/mobile keeps the existing tap controls. */
(function () {
  var groups = [].slice.call(document.querySelectorAll('header .navlinks__dropdown, header .site-nav__dropdown, header .dd, header .sat-desktop-nav details, header nav#nav > details'));
  function desktop(group) {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false;
    var header = group.closest('header');
    var toggle = header && header.querySelector('[data-menu-button], [data-menu], [data-mobile-menu], .site-header__toggle, button.menu');
    return !toggle || getComputedStyle(toggle).display === 'none';
  }
  function set(group, open) {
    if (group.tagName === 'DETAILS') group.open = open;
    else group.classList.toggle(group.classList.contains('site-nav__dropdown') ? 'is-open' : 'open', open);
    var trigger = group.querySelector('button, summary');
    if (trigger) trigger.setAttribute('aria-expanded', String(open));
  }
  groups.forEach(function (group) {
    var trigger = group.querySelector('button, summary');
    if (!trigger) return;
    group.addEventListener('mouseenter', function () {
      if (!desktop(group)) return;
      groups.forEach(function (other) { if (other !== group) set(other, false); });
      set(group, true);
    });
    group.addEventListener('mouseleave', function () { if (desktop(group)) set(group, false); });
    group.addEventListener('focusin', function () { if (desktop(group)) set(group, true); });
    group.addEventListener('focusout', function (event) { if (desktop(group) && !group.contains(event.relatedTarget)) set(group, false); });
    trigger.addEventListener('click', function (event) {
      if (!desktop(group) || event.detail === 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      set(group, true);
    }, true);
    group.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { trigger.focus(); set(group, false); }
    });
  });
  window.addEventListener('resize', function () { groups.forEach(function (group) { set(group, false); }); });
})();
