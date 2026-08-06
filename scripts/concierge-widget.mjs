const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const contactIcons = {
  whatsapp: '<svg viewBox="0 0 24 24"><path d="M12 2a9.7 9.7 0 0 0-8.4 14.6L2 22l5.6-1.5A9.8 9.8 0 1 0 12 2Z"/><path class="icon-cutout" d="M8.4 6.8c.2-.5.4-.5.8-.5h.6c.2 0 .4.1.5.4l1 2.3c.1.3 0 .5-.2.8l-.8 1c-.2.2-.1.4 0 .6a9 9 0 0 0 3.9 3.4c.3.1.5.1.7-.1l1.2-1.5c.2-.3.5-.3.8-.2l2.2 1c.3.2.5.3.5.6 0 .4-.2 1.8-1.2 2.7-.9.8-2.1 1-3.5.6-1.3-.4-3.1-1.2-5.2-3.1-1.7-1.5-2.9-3.4-3.2-4.8-.4-1.4.2-2.4.7-3 .4-.4.8-.4 1.2-.2Z"/></svg>',
  email: '<svg viewBox="0 0 24 24"><path d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm9 7.2L20.2 7H3.8L12 12.2Zm0 2.4L3 8.9V17h18V8.9l-9 5.7Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M6.6 2.5 10 7.7 7.8 10c1.5 3 3.2 4.7 6.2 6.2l2.3-2.2 5.2 3.4c.6.4.7 1.2.3 1.8l-1.5 2.1c-.4.6-1.2.9-1.9.7C9.7 20.3 3.7 14.3 2 5.6c-.2-.7.1-1.5.7-1.9l2.1-1.5c.6-.4 1.4-.3 1.8.3Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M14 8.2h2.1V5.1c-.4-.1-1.6-.2-3-.2-3 0-5 1.8-5 5.2V13H4.8v3.5h3.3V24h4v-7.5h3.3l.5-3.5H12v-2.5c0-1 .3-2.3 2-2.3Z"/></svg>',
  telegram: '<svg viewBox="0 0 24 24"><path d="m21.5 3.4-3 16.7c-.2 1.2-.9 1.5-1.8.9l-4.6-3.4-2.2 2.2c-.2.2-.5.5-.9.5l.3-4.7 8.6-7.8c.4-.3-.1-.5-.6-.2L6.7 14.3l-4.6-1.4c-1-.3-1-1 .2-1.5L20.2 4c.8-.3 1.5.2 1.3-.6Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm-.1 2A3.1 3.1 0 0 0 4 7.1v9.8A3.1 3.1 0 0 0 7.1 20h9.8a3.1 3.1 0 0 0 3.1-3.1V7.1A3.1 3.1 0 0 0 16.9 4H7.1ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm6-2.3a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z"/></svg>',
};

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
      <a class="vv-assistant-whatsapp" href="${whatsapp}" target="_blank" rel="noreferrer"><span aria-hidden="true">${contactIcons.whatsapp}</span><strong>WhatsApp</strong></a>
      <a class="vv-assistant-secondary vv-assistant-email" href="mailto:info@villavenerecetara.com?subject=${encodeURIComponent(emailSubject)}"><span aria-hidden="true">${contactIcons.email}</span><strong>Email</strong></a>
      <a class="vv-assistant-secondary vv-assistant-phone" href="tel:+393896840764"><span aria-hidden="true">${contactIcons.phone}</span><strong>${esc(phoneLabel)}</strong></a>
      <a class="vv-assistant-social vv-assistant-facebook" href="https://m.me/102737532080459" target="_blank" rel="noreferrer"><span aria-hidden="true">${contactIcons.facebook}</span><strong>Facebook</strong></a>
      <a class="vv-assistant-social vv-assistant-telegram" href="https://t.me/VillaVenereAmalfiCoast" target="_blank" rel="noreferrer"><span aria-hidden="true">${contactIcons.telegram}</span><strong>Telegram</strong></a>
      <a class="vv-assistant-social vv-assistant-instagram" href="https://ig.me/m/villavenerecetara" target="_blank" rel="noreferrer"><span aria-hidden="true">${contactIcons.instagram}</span><strong>Instagram</strong></a>
    </div>
  </section>
</div>`;
}
