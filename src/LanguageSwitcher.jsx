import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العَرَبِيَّة'},
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.slice(0, 2) || 'ru';

  // lang на <html> нужен для доступности и правильных шрифтов
  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);

  return (
    <label className="lang">
      <span className="visually-hidden">{t('menu.language')}</span>
      <select value={current} onChange={(e) => i18n.changeLanguage(e.target.value)}>
        {LANGS.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}
