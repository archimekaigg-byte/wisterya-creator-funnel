const overlay = document.getElementById('age-overlay');
const trigger = document.querySelector('[data-open-age]');
const form = document.getElementById('age-form');
const button = document.getElementById('confirm-age');
const token = document.getElementById('age-token');
const status = document.getElementById('age-status');
const widget = document.getElementById('turnstile-widget');
const siteKey = overlay?.dataset.sitekey;
function openAge() {
  if (!overlay) return;
  overlay.hidden = false;
  if (!siteKey) {
    if (status) status.textContent = 'Verification is unavailable. Please try again later.';
    return;
  }
  if (window.turnstile) { renderChallenge(); return; }
  if (!document.querySelector('script[data-turnstile]')) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = renderChallenge;
    document.head.appendChild(script);
  }
}
let rendered = false;
function renderChallenge() {
  if (rendered || !window.turnstile || !siteKey || !widget) return;
  rendered = true;
  window.turnstile.render(widget, {
    sitekey: siteKey,
    theme: 'dark',
    callback: (value) => { if (token) token.value = value; if (button) button.disabled = false; },
    'expired-callback': () => { if (token) token.value = ''; if (button) button.disabled = true; },
    'error-callback': () => { if (button) button.disabled = true; if (status) status.textContent = 'Verification failed. Please retry.'; }
  });
}
trigger?.addEventListener('click', openAge);
form?.addEventListener('submit', (event) => {
  if (!token?.value) { event.preventDefault(); if (status) status.textContent = 'Complete verification first.'; }
});
