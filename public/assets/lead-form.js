/* Confirm the exact form POST before displaying success. The tracker also watches
   button clicks, so reject invalid clicks before its fallback can queue them. */
const activeLeads = new Map();
const cards = new Map();
document.querySelectorAll('[data-lead-form]').forEach(form => {
  const card = form.parentElement;
  const success = document.createElement('div');
  success.className = 'lead-success'; success.hidden = true;
  success.setAttribute('role', 'status'); success.setAttribute('aria-live', 'polite');
  success.setAttribute('tabindex', '-1');
  success.innerHTML = '<svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="5"/><path d="M21 33.5l7.5 7.5L43.5 25" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg><h2>Request Received</h2><p>We have your hydro jetting request and will review the details. Watch your phone and email for a response.</p><button type="button" class="lead-success__again">Submit another request</button>';
  card.append(success); cards.set(form, {card, success});
  success.querySelector('button').addEventListener('click', () => {
    form.reset(); form.elements.phone.setCustomValidity('');
    form.querySelector('[role="status"]').textContent = '';
    activeLeads.delete(form); success.hidden = true; form.hidden = false;
    form.elements.full_name.focus();
  });
});
function normalizeLead(form) {
  const phone = form.elements.phone;
  const digits = phone.value.replace(/\D/g, '');
  const local = digits.length === 11 && digits.charAt(0) === '1' ? digits.slice(1) : digits;
  if (local.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(local)) {
    phone.value = '+1' + local; phone.setCustomValidity(''); return true;
  }
  phone.setCustomValidity('Please enter a 10-digit US phone number.'); return false;
}
function validLead(form) {
  if (!normalizeLead(form)) { form.elements.phone.reportValidity(); form.elements.phone.focus(); return false; }
  const bad = [...form.querySelectorAll('[required]')].find(el => !el.checkValidity());
  if (bad) { bad.reportValidity(); bad.focus(); return false; }
  return true;
}
document.querySelectorAll('[data-lead-form]').forEach(form => {
  form.elements.phone.addEventListener('blur', () => normalizeLead(form));
  form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
});
document.addEventListener('click', e => {
  const button = e.target.closest('button[type="submit"]');
  if (!button || !button.form || !button.form.matches('[data-lead-form]')) return;
  if (!validLead(button.form)) { activeLeads.delete(button.form); button.form.querySelector('[role="status"]').textContent = ''; e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
document.addEventListener('submit', e => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement) || !form.matches('[data-lead-form]')) return;
  e.preventDefault();
  if (!validLead(form) || form.elements.website.value) { e.stopImmediatePropagation(); return; }
  const current = {name:form.elements.full_name.value.trim(),phone:form.elements.phone.value,
    email:form.elements.email.value.trim(),sent:false};
  activeLeads.set(form,current);
  const status=form.querySelector('[role="status"]'); status.textContent='Submitting...';
  setTimeout(() => {
    if (activeLeads.get(form) === current) {
      activeLeads.delete(form);
      status.textContent='Submission attempted. We cannot confirm receipt here. Please try again or call instead.';
    }
  },12000);
},true);
document.querySelectorAll('[data-lead-form]').forEach(form => form.addEventListener('submit',e => e.preventDefault()));
const nativeLeadFetch = window.fetch.bind(window);
window.fetch = function(url,options) {
  const pending=nativeLeadFetch(url,options);
  try {
    const href=typeof url === 'string' ? url : url && url.url;
    if (href && href.includes('backend.leadconnectorhq.com/external-tracking/events') &&
        options && String(options.method).toUpperCase()==='POST') {
      const event=JSON.parse(options.body),data=event.formData || {};
      for (const [form,current] of activeLeads) {
        if (current.sent || event.type !== 'external_form_submission' ||
            data.full_name !== current.name || data.phone !== current.phone || (data.email || '') !== current.email) continue;
        current.sent=true;
        pending.then(response => response.clone().json().then(body => {
          if (activeLeads.get(form)!==current) return;
          if (response.status!==200 || !body || body.status!=='ok') throw Error('Unconfirmed response');
          activeLeads.delete(form);
          const view=cards.get(form);
          form.querySelector('[role="status"]').textContent='';
          form.hidden=true; view.success.hidden=false;
          view.success.scrollIntoView({behavior:'smooth',block:'center'});
          view.success.focus({preventScroll:true});
        })).catch(() => {
          if (activeLeads.get(form)!==current) return;
          activeLeads.delete(form);
          form.querySelector('[role="status"]').textContent='Submission attempted. We cannot confirm receipt here. Please try again or call instead.';
        });
        break;
      }
    }
  } catch(err) { /* Leave the tracker undisturbed. */ }
  return pending;
};

