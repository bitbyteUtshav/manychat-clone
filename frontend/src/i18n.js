import { useEffect, useState } from 'react';

const KEY = 'flowbot_lang';
export const getLang = () => localStorage.getItem(KEY) || 'bn';
export const setLang = (l) => {
  localStorage.setItem(KEY, l);
  window.dispatchEvent(new Event('flowbot:lang'));
};

// dict = { bn: {...}, en: {...} }
export function useLang(dict) {
  const [lang, setL] = useState(getLang());
  useEffect(() => {
    const h = () => setL(getLang());
    window.addEventListener('flowbot:lang', h);
    return () => window.removeEventListener('flowbot:lang', h);
  }, []);
  return { lang, t: (k) => dict[lang]?.[k] ?? dict.en[k] ?? k };
}
