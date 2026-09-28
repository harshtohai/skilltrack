/**
 * Google Website Translator Integration
 * Enables instant dynamic translation to Marathi (or English) across all DOM nodes,
 * charts, tables, and dynamically loaded elements.
 */

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

let isInitialized = false;

export function initGoogleTranslate(targetLang: 'en' | 'mr' = 'en') {
  if (typeof window === 'undefined') return;

  // Set the googtrans cookie to trigger Google Translate
  const domain = window.location.hostname;
  const cookieValue = targetLang === 'mr' ? '/en/mr' : '/en/en';
  
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
  document.cookie = `googtrans=${cookieValue}; path=/;`;

  // Create container if missing
  let container = document.getElementById('google_translate_element');
  if (!container) {
    container = document.createElement('div');
    container.id = 'google_translate_element';
    container.style.display = 'none';
    document.body.appendChild(container);
  }

  // Ensure script is loaded
  if (!document.getElementById('google-translate-script')) {
    window.googleTranslateElementInit = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'mr,en,hi',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            },
            'google_translate_element'
          );
          isInitialized = true;
          applyLanguageSelection(targetLang);
        }
      } catch (err) {
        console.warn('Google Translate initialization error:', err);
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  } else {
    applyLanguageSelection(targetLang);
  }
}

export function switchGoogleTranslate(lang: 'en' | 'mr') {
  const domain = window.location.hostname;
  const cookieValue = lang === 'mr' ? '/en/mr' : '/en/en';
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
  document.cookie = `googtrans=${cookieValue}; path=/;`;

  applyLanguageSelection(lang);
}

function applyLanguageSelection(lang: 'en' | 'mr') {
  setTimeout(() => {
    try {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      }
    } catch (e) {
      console.warn('Google Translate combo selection notice:', e);
    }
  }, 300);
}
