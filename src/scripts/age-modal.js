// Client-side age gate: no redirect is possible until server-side Turnstile verification.
function initAgeGate() {
  const trigger = document.querySelector('[data-open-age]');
  const overlay = document.getElementById('age-overlay');
  const form = document.getElementById('age-form');
  const button = document.getElementById('confirm-age');
  const tokenInput = document.getElementById('age-token');
  const status = document.getElementById('age-status');
  const widget = document.getElementById('turnstile-widget');
  if (!trigger || !overlay || !form || !button || !tokenInput || !status || !widget) return;
  const siteKey = overlay.dataset.sitekey?.trim();
  let rendered = false;
  let loading = false;
  function message(text) { status.textContent = text; }
  function reset() { tokenInput.value = ''; button.disabled = true; }
  function render() {
    if (rendered || !window.turnstile || !siteKey) return;
    try {
      window.turnstile.render(widget, {
        sitekey: siteKey,
        theme: 'dark',
        callback(value) { tokenInput.value = value; button.disabled = false; message('Verification complete. Confirm you are over 18.'); },
        'expired-callback'() { reset(); message('Verification expired. Please try again.'); },
        'error-callback'() { reset(); message('Verification failed. Please try again.'); }
      });
      rendered = true;
    } catch { reset(); message('Unable to start verification. Please reload.'); }
  }
  function open(event) {
    event.preventDefault();
    overlay.hidden = false;
    reset();
    if (!siteKey) { message('Verification is not configured. Please contact the site owner.'); return; }
    message('Loading verification…');
    if (window.turnstile) { render(); return; }
    if (loading) return;
    loading = true;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = render;
    script.onerror = () => { loading = false; message('Could not load verification. Check your connection and retry.'); };
    document.head.appendChild(script);
  }
  trigger.addEventListener('click', open);
  form.addEventListener('submit', event => {
    if (!tokenInput.value) { event.preventDefault(); reset(); message('Complete verification before continuing.'); }
    else { button.disabled = true; message('Checking verification…'); }
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAgeGate, { once: true });
else initAgeGate();
