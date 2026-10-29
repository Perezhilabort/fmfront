import { useCallback, useEffect, useState } from 'react';
import './admin.css';
import {
  getToken, setToken, fetchAdminMenu, fetchLanguages,
  createCategory, updateCategory, deleteCategory,
  createDish, updateDish, deleteDish, setAvailability,
} from './adminApi';
import LoginForm from './LoginForm';
import DishEditor from './DishEditor';
import CategoryEditor from './CategoryEditor';

const fmt = new Intl.NumberFormat('ru-RU');

export default function Admin() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const logout = useCallback(() => {
    setToken(null);
    setAuthed(false);
  }, []);

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={logout} />;
}

function Dashboard({ onLogout }) {
  const [menu, setMenu] = useState(null);
  const [languages, setLanguages] = useState(['ru']);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState(null); // { type: 'dish' | 'category', item, categoryId }

  // 401 = токен истёк или неверный → возвращаем на страницу входа
  const describeError = useCallback(
    (e) => {
      if (e.response?.status === 401) {
        onLogout();
        return 'Сессия истекла, войдите снова';
      }
      return e.response?.data?.error || 'Не удалось выполнить запрос';
    },
    [onLogout]
  );

  const reload = useCallback(async () => {
    try {
      setMenu(await fetchAdminMenu());
      setError('');
    } catch (e) {
      setError(describeError(e));
    }
  }, [describeError]);

  useEffect(() => {
    reload();
    fetchLanguages().then((d) => setLanguages(d.languages)).catch(() => {});
  }, [reload]);

  const act = async (fn) => {
    try {
      await fn();
      await reload();
    } catch (e) {
      setError(describeError(e));
    }
  };

  const close = () => setEditor(null);
  const catName = (c) => c.translations?.ru?.name ?? `Категория ${c.id}`;

  return (
    <div className="admin">
      <header className="admin__bar">
        <h1>Flavour Market <span>админка</span></h1>
        <div className="admin__bar-actions">
          <a className="a-btn a-btn--ghost a-btn--sm" href="/">Открыть меню</a>
          <button className="a-btn a-btn--ghost a-btn--sm" onClick={onLogout}>Выйти</button>
        </div>
      </header>

      <main className="admin__main">
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="admin__toolbar">
          <button className="a-btn a-btn--primary" onClick={() => setEditor({ type: 'category', item: null })}>
            + Категория
          </button>
        </div>

        {!menu && !error && <p className="muted">Загрузка…</p>}

        {menu?.map((cat) => (
          <section key={cat.id} className="acat">
            <div className="acat__head">
              <h2>{catName(cat)}</h2>
              <div className="acat__actions">
                <button className="a-btn a-btn--sm a-btn--primary" onClick={() => setEditor({ type: 'dish', item: null, categoryId: cat.id })}>
                  + Блюдо
                </button>
                <button className="a-btn a-btn--sm" onClick={() => setEditor({ type: 'category', item: cat })}>Изменить</button>
                <button
                  className="a-btn a-btn--sm a-btn--danger"
                  onClick={() => {
                    if (window.confirm(`Удалить категорию «${catName(cat)}» вместе со всеми блюдами (${cat.dishes.length})?`)) {
                      act(() => deleteCategory(cat.id));
                    }
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>

            {cat.dishes.length === 0 && <p className="muted">В этой категории пока нет блюд</p>}

            <ul className="dishes-admin">
              {cat.dishes.map((d) => {
                const name = d.translations?.ru?.name ?? `Блюдо ${d.id}`;
                return (
                  <li key={d.id} className={d.is_available ? '' : 'is-off'}>
                    {d.image_url ? <img className="thumb" src={d.image_url} alt="" loading="lazy" /> : <span className="thumb thumb--empty" />}
                    <div className="dish-admin__main">
                      <strong>{name}</strong>
                      <span>{fmt.format(d.price)}&nbsp;₸</span>
                    </div>
                    <label className="check">
                      <input type="checkbox" checked={d.is_available} onChange={(e) => act(() => setAvailability(d.id, e.target.checked))} />
                      В наличии
                    </label>
                    <button className="a-btn a-btn--sm" onClick={() => setEditor({ type: 'dish', item: d, categoryId: cat.id })}>Изменить</button>
                    <button
                      className="a-btn a-btn--sm a-btn--danger"
                      onClick={() => {
                        if (window.confirm(`Удалить блюдо «${name}»?`)) act(() => deleteDish(d.id));
                      }}
                    >
                      Удалить
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>

      {editor?.type === 'dish' && (
        <DishEditor
          dish={editor.item}
          categories={menu ?? []}
          defaultCategoryId={editor.categoryId}
          languages={languages}
          describeError={describeError}
          onClose={close}
          onSave={async (payload) => {
            if (editor.item) await updateDish(editor.item.id, payload);
            else await createDish(payload);
            await reload();
            close();
          }}
        />
      )}

      {editor?.type === 'category' && (
        <CategoryEditor
          category={editor.item}
          languages={languages}
          describeError={describeError}
          onClose={close}
          onSave={async (payload) => {
            if (editor.item) await updateCategory(editor.item.id, payload);
            else await createCategory(payload);
            await reload();
            close();
          }}
        />
      )}
    </div>
  );
}
