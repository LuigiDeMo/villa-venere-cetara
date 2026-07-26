const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav > a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));

const bookingForm = document.querySelector('#booking-form');
bookingForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(bookingForm);
  const params = new URLSearchParams({
    lang: 'en',
    codice: '679766',
    checkin: data.get('checkin'),
    checkout: data.get('checkout'),
    pax: data.get('pax'),
  });
  window.open(`https://book.octorate.com/octobook/site/reservation/index.xhtml?${params}`, '_blank', 'noopener');
});

const contactPanel = document.querySelector('#contact-panel');
const contactLauncher = document.querySelector('.contact-launcher');
const contactClose = document.querySelector('.contact-close');

function setContactOpen(open) {
  contactPanel?.classList.toggle('open', open);
  contactPanel?.setAttribute('aria-hidden', String(!open));
  contactLauncher?.setAttribute('aria-expanded', String(open));
}

contactLauncher?.addEventListener('click', () => setContactOpen(!contactPanel.classList.contains('open')));
contactClose?.addEventListener('click', () => setContactOpen(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setContactOpen(false);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('#contact-widget')) setContactOpen(false);
});
