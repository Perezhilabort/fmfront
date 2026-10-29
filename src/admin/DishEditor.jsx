import { useState } from 'react';
import { Modal, LangTabs } from './Parts';
import { ALLERGENS, LANG_LABELS } from './constants';

export default function DishEditor({ dish, categories, defaultCategoryId, languages, onSave, onClose, describeError }) {
  const [form, setForm] = useState(() => ({
    category_id: defaultCategoryId ?? categories[0]?.id ?? '',
    price: dish?.price ?? '',
    image_url: dish?.image_url ?? '',
    sort_order: dish?.sort_order ?? 0,
    is_available: dish?.is_available ?? true,
    allergens: dish?.allergens ?? [],
    translations: dish?.translations ?? {},
  }));
  const [lang, setLang] = useState('ru');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setText = (field, value) =>
    setForm((f) => ({
      ...f,
      translations: { ...f.translations, [lang]: { ...f.translations[lang], [field]: value } },
    }));
  const toggleAllergen = (code) =>
    set({ allergens: form.allergens.includes(code) ? form.allergens.filter((a) => a !== code) : [...form.allergens, code] });

  async function submit(e) {
    e.preventDefault();
    const translations = {};
    for (const l of languages) {
      const t = form.translations[l];
      if (t?.name?.trim()) translations[l] = { name: t.name.trim(), description: t.description?.trim() || null };
    }
    if (!translations.ru) {
      setLang('ru');
      setError('Название на русском обязательно');
      return;
    }
    const price = Number(form.price);
    if (form.price === '' || !Number.isFinite(price) || price < 0) {
      setError('Укажите цену числом');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave({
        category_id: Number(form.category_id),
        price,
        image_url: form.image_url.trim(),
        sort_order: Number(form.sort_order) || 0,
        is_available: form.is_available,
        allergens: form.allergens,
        translations,
      });
    } catch (err) {
      setError(describeError(err));
      setBusy(false);
    }
  }

  const current = form.translations[lang] ?? {};

  return (
    <Modal title={dish ? 'Редактировать блюдо' : 'Новое блюдо'} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <div className="grid2">
          <label className="field">
            Категория
            <select value={form.category_id} onChange={(e) => set({ category_id: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.translations?.ru?.name ?? `Категория ${c.id}`}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Цена, ₸
            <input type="number" min="0" step="any" value={form.price} onChange={(e) => set({ price: e.target.value })} required />
          </label>
        </div>

        <label className="field">
          Ссылка на фото
          <input value={form.image_url} onChange={(e) => set({ image_url: e.target.value })} placeholder="https://… или /images/cappuccino.webp" />
        </label>
        {form.image_url.trim() && (
          <img key={form.image_url} className="preview" src={form.image_url.trim()} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        )}

        <LangTabs languages={languages} active={lang} onChange={setLang} isFilled={(l) => Boolean(form.translations[l]?.name?.trim())} />
        <label className="field">
          Название ({LANG_LABELS[lang] || lang}){lang === 'ru' && ' *'}
          <input value={current.name ?? ''} onChange={(e) => setText('name', e.target.value)} />
        </label>
        <label className="field">
          Описание ({LANG_LABELS[lang] || lang})
          <textarea rows="3" value={current.description ?? ''} onChange={(e) => setText('description', e.target.value)} />
        </label>

        <fieldset className="allergens">
          <legend>Аллергены</legend>
          {ALLERGENS.map(([code, label]) => (
            <label key={code} className="check">
              <input type="checkbox" checked={form.allergens.includes(code)} onChange={() => toggleAllergen(code)} />
              {label}
            </label>
          ))}
        </fieldset>

        <div className="grid2">
          <label className="field">
            Порядок в категории
            <input type="number" value={form.sort_order} onChange={(e) => set({ sort_order: e.target.value })} />
          </label>
          <label className="check check--box">
            <input type="checkbox" checked={form.is_available} onChange={(e) => set({ is_available: e.target.checked })} />
            Есть в наличии
          </label>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal__actions">
          <button type="button" className="a-btn a-btn--ghost" onClick={onClose}>Отмена</button>
          <button className="a-btn a-btn--primary" disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
        </div>
      </form>
    </Modal>
  );
}
