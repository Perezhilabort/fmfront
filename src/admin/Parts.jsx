import { useEffect } from 'react';
import { LANG_LABELS } from './constants';

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__panel">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

// Вкладки языков; ✓ — перевод уже заполнен
export function LangTabs({ languages, active, onChange, isFilled }) {
  return (
    <div className="tabs" role="tablist">
      {languages.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={l === active}
          className={`tab${l === active ? ' is-active' : ''}`}
          onClick={() => onChange(l)}
        >
          {LANG_LABELS[l] || l}
          {isFilled(l) ? ' ✓' : ''}
        </button>
      ))}
    </div>
  );
}
