const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

export function conciergeWidget({
  language,
  context,
  bubble,
  panelLabel,
  closeLabel,
  hostName,
  replyTime,
  greeting,
  help,
  startWith,
  phoneLabel,
  launcher,
  whatsappMessage,
}) {
  const animation = context === 'guides' ? 'directions' : 'sea-breeze';
  const frame = `/assets/mascot/animations-v2/${animation}/venere-${animation}-01.webp`;
  const whatsapp = `https://wa.me/393896840764?text=${encodeURIComponent(whatsappMessage)}`;
  const emailSubject = language === 'it'
    ? 'Informazioni da Villa Venere'
    : 'Information from Villa Venere';

  return `<div class="vv-assistant" data-vv-assistant data-vv-context="${esc(context)}" data-vv-animation="${esc(animation)}">
  <button class="vv-assistant-bubble" type="button" data-vv-open>${esc(bubble)}</button>
  <button class="vv-assistant-mascot" type="button" data-vv-open aria-label="${esc(panelLabel)}" aria-expanded="false" aria-controls="vv-assistant-panel-${esc(context)}">
    <img class="vv-assistant-frame is-visible" src="${frame}" width="118" height="160" alt="" aria-hidden="true">
    <img class="vv-assistant-frame" src="${frame}" width="118" height="160" alt="" aria-hidden="true">
  </button>
  <button class="vv-assistant-launcher" type="button" data-vv-open aria-expanded="false" aria-controls="vv-assistant-panel-${esc(context)}">
    <img src="/assets/photo/martina-host-2026.jpeg" width="1200" height="1600" alt="" aria-hidden="true">
    <span><strong>${esc(launcher)}</strong><small>${esc(replyTime)}</small></span>
  </button>
  <section class="vv-assistant-panel" id="vv-assistant-panel-${esc(context)}" aria-hidden="true" aria-label="${esc(panelLabel)}">
    <button class="vv-assistant-close" type="button" data-vv-close aria-label="${esc(closeLabel)}">×</button>
    <header><img src="/assets/photo/martina-host-2026.jpeg" width="1200" height="1600" alt=""><span><strong>${esc(hostName)}</strong><small>${esc(replyTime)}</small></span></header>
    <div class="vv-assistant-message"><strong>${esc(greeting)}</strong><p>${esc(help)}</p></div>
    <p class="vv-assistant-start">${esc(startWith)}</p>
    <div class="vv-assistant-actions">
      <a class="vv-assistant-whatsapp" href="${whatsapp}" target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span><strong>WhatsApp</strong></a>
      <a href="mailto:info@villavenerecetara.com?subject=${encodeURIComponent(emailSubject)}"><span aria-hidden="true">@</span><strong>Email</strong></a>
      <a href="tel:+393896840764"><span aria-hidden="true">☎</span><strong>${esc(phoneLabel)}</strong></a>
    </div>
  </section>
</div>`;
}
