(() => {
  const supported = ['en', 'it', 'fr', 'es', 'de', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'nl', 'pl'];
  const copy = {
    en: ['This page is also available in English.', 'Open in English', 'Close language suggestion'],
    it: ['Questa pagina è disponibile anche in italiano.', 'Apri in italiano', 'Chiudi il suggerimento della lingua'],
    fr: ['Cette page est aussi disponible en français.', 'Ouvrir en français', 'Fermer la suggestion de langue'],
    es: ['Esta página también está disponible en español.', 'Abrir en español', 'Cerrar la sugerencia de idioma'],
    de: ['Diese Seite ist auch auf Deutsch verfügbar.', 'Auf Deutsch öffnen', 'Sprachhinweis schließen'],
    pt: ['Esta página também está disponível em português.', 'Abrir em português', 'Fechar sugestão de idioma'],
    ru: ['Эта страница также доступна на русском языке.', 'Открыть на русском', 'Закрыть выбор языка'],
    zh: ['此页面也提供简体中文版本。', '打开中文版', '关闭语言提示'],
    ja: ['このページは日本語でもご覧いただけます。', '日本語で開く', '言語の案内を閉じる'],
    ko: ['이 페이지는 한국어로도 제공됩니다.', '한국어로 열기', '언어 제안 닫기'],
    ar: ['هذه الصفحة متاحة أيضًا باللغة العربية.', 'افتح بالعربية', 'إغلاق اقتراح اللغة'],
    nl: ['Deze pagina is ook beschikbaar in het Nederlands.', 'Open in het Nederlands', 'Taalsuggestie sluiten'],
    pl: ['Ta strona jest również dostępna po polsku.', 'Otwórz po polsku', 'Zamknij sugestię języka'],
  };
  const normalize = (value) => {
    const language = String(value || '').toLowerCase().split(/[-_]/)[0];
    return supported.includes(language) ? language : null;
  };

  document.querySelectorAll('[data-language-choice]').forEach((link) => link.addEventListener('click', () => {
    try { localStorage.setItem('villaVenereLanguage', link.dataset.languageChoice); } catch (_) {}
  }));

  const current = normalize(document.documentElement.lang);
  let preferred;
  try { preferred = normalize(localStorage.getItem('villaVenereLanguage')); } catch (_) {}
  if (!preferred) preferred = (navigator.languages?.length ? navigator.languages : [navigator.language]).map(normalize).find(Boolean);
  if (!preferred || !current || preferred === current) return;
  try { if (sessionStorage.getItem(`vvLanguageSuggestion:${current}:${preferred}`)) return; } catch (_) {}

  const alternate = [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
    .find((link) => normalize(link.hreflang) === preferred);
  if (!alternate?.href) return;

  const [message, action, closeLabel] = copy[preferred];
  const suggestion = document.createElement('aside');
  suggestion.className = 'vv-language-suggestion';
  suggestion.setAttribute('role', 'status');
  suggestion.dir = preferred === 'ar' ? 'rtl' : 'ltr';
  suggestion.innerHTML = `<p>${message}</p><a href="${alternate.href}" data-language-choice="${preferred}">${action}</a><button type="button" aria-label="${closeLabel}">×</button>`;
  suggestion.querySelector('a').addEventListener('click', () => {
    try { localStorage.setItem('villaVenereLanguage', preferred); } catch (_) {}
  });
  suggestion.querySelector('button').addEventListener('click', () => {
    try { sessionStorage.setItem(`vvLanguageSuggestion:${current}:${preferred}`, '1'); } catch (_) {}
    suggestion.remove();
  });
  document.body.appendChild(suggestion);
})();
