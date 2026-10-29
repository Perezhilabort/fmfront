import { useState } from 'react';
import { Modal, LangTabs } from './Parts';
import { LANG_LABELS } from './constants';

export default function CategoryEditor({ category, languages, onSave, onClose, describeError }) {
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 0);
  const [names, setNames] = useState(() =>
    Object.fromEntries(Object.entries(category?.translations ?? {}).map(([l, t]) => [l, t.name]))
  );
  const [lang, setLang] = useState('ru');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const translations = {};
    for (const l of languages) {
      if (names[l]?.trim()) translations[l] = { name: names[l].trim() };
    }
    if (!translations.ru) {
      setLang('ru');
      setError('Название на русском обязательно');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave({ sort_order: Number(sortOrder) || 0, translations });
    } catch (err) {
      setError(describeError(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={category ? 'Редактировать категорию' : 'Новая категория'} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <LangTabs languages={languages} active={lang} onChange={setLang} isFilled={(l) => Boolean(names[l]?.trim())} />
        <label className="field">
          Название ({LANG_LABELS[lang] || lang}){lang === 'ru' && ' *'}
          <input value={names[lang] ?? ''} onChange={(e) => setNames({ ...names, [lang]: e.target.value })} />
        </label>
        <label className="field">
          Порядок в меню (меньше — выше)
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="a-btn a-btn--ghost" onClick={onClose}>Отмена</button>
          <button className="a-btn a-btn--primary" disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </form>
    </Modal>
  );
}
