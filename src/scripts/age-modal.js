  // This script reads only public values from the HTML, never server secrets.
  const overlay=document.getElementById('age-overlay');
  const siteKey=overlay?.dataset.sitekey || '';
  const firstPath=overlay?.dataset.back || '/';
  const modal=document.getElementById('age-dialog');
  const open=document.querySelector('[data-open-age]');
  const button=document.getElementById('confirm-age');
  const token=document.getElementById('age-token');
  const fbclid=document.getElementById('age-fbclid');
  const status=document.getElementById('age-status');
  const form=document.getElementById('age-form');
  const deny=document.getElementById('decline-age');
  const widget=document.getElementById('turnstile-widget');
  const params=new URLSearchParams(location.search);
  const clickId=params.get('fbclid');
  if(clickId && /^[\w.-]{1,256}$/.test(clickId)) fbclid.value=clickId;
  let rendered=false;
  function event(name){const json=JSON.stringify({event:name,referrer:document.referrer});if(navigator.sendBeacon)navigator.sendBeacon('/api/events',new Blob([json],{type:'text/plain'}));}
  function loadTurnstile(){
    if(!siteKey){status.textContent='Verification is unavailable until the site owner configures Turnstile.';return;}
    const show=()=>{
      if(rendered || !window.turnstile)return;
      rendered=true;
      window.turnstile.render(widget,{
        sitekey:siteKey,theme:'dark',language:'auto',appearance:'always',size:'flexible',action:'age-confirm','response-field':false,
 ¶»§q«^