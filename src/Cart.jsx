import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useCart } from './CartContext';
import './cart.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const round2 = (n) => Math.round(n * 100) / 100;

/* ---------- Кнопка «+» / счётчик у блюда ---------- */
export function AddToCart({ id }) {
  const { t } = useTranslation();
  const { items, add, dec } = useCart();
  const qty = items[id] || 0;

  if (!qty) {
    return (
      <button type="button" className="add-btn" onClick={() => add(id)} aria-label={t('cart.add')}>
        +
      </button>
    );
  }
  return (
    <div className="stepper" role="group">
      <button type="button" onClick={() => dec(id)} aria-label={t('cart.decrease')}>−</button>
      <span aria-live="polite">{qty}</span>
      <button type="button" onClick={() => add(id)} aria-label={t('cart.increase')}>+</button>
    </div>
  );
}

/* ---------- Esc закрывает окно, фон не прокручивается ---------- */
function useModal(open, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);
}

/* ---------- Корзина: плашка внизу, окно заказа, экран для кассира ---------- */
export default function Cart({ categories }) {
  const { t, i18n } = useTranslation();
  const { items, remove, clear } = useCart();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cashierOpen, setCashierOpen] = useState(false);
  const [ruMenu, setRuMenu] = useState(null);
  const [ruError, setRuError] = useState(false);

  const lang = i18n.resolvedLanguage || 'ru';
  const money = (n) => `${new Intl.NumberFormat(lang).format(n)}\u00A0₸`;

  // Блюда текущего меню по id (на языке гостя)
  const dishes = useMemo(() => {
    const m = new Map();
    categories.forEach((c) => c.dishes.forEach((d) => m.set(String(d.id), d)));
    return m;
  }, [categories]);

  const lines = Object.entries(items)
    .map(([id, qty]) => ({ id, qty, dish: dishes.get(id) }))
    .filter((l) => l.dish);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = round2(lines.reduce((s, l) => s + l.dish.price * l.qty, 0));

  // Убираем из корзины блюда, которых уже нет в меню (стоп-лист, удалили)
  useEffect(() => {
    if (!categories.length) return;
    Object.keys(items).forEach((id) => {
      if (!dishes.has(id)) remove(id);
    });
  }, [dishes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Корзина опустела — закрываем окна
  useEffect(() => {
    if (!lines.length) {
      setSheetOpen(false);
      setCashierOpen(false);
    }
  }, [lines.length]);

  useModal(sheetOpen && !cashierOpen, () => setSheetOpen(false));
  useModal(cashierOpen, () => setCashierOpen(false));

  // Для кассира всегда загружаем меню на русском
  useEffect(() => {
    if (!cashierOpen) return;
    const controller = new AbortController();
    setRuMenu(null);
    setRuError(false);
    axios
      .get(`${API_URL}/menu`, { params: { lang: 'ru' }, signal: controller.signal })
      .then((res) => setRuMenu(res.data.categories))
      .catch((e) => {
        if (e.code !== 'ERR_CANCELED') setRuError(true);
      });
    return () => controller.abort();
  }, [cashierOpen]);

  // Экран телефона не гаснет, пока гость показывает заказ
  useEffect(() => {
    if (!cashierOpen || !('wakeLock' in navigator)) return;
    let lock;
    let cancelled = false;
    navigator.wakeLock
      .request('screen')
      .then((l) => (cancelled ? l.release() : (lock = l)))
      .catch(() => {});
    return () => {
      cancelled = true;
      lock?.release().catch(() => {});
    };
  }, [cashierOpen]);

  const ruDishes = useMemo(() => {
    const m = new Map();
    (ruMenu || []).forEach((c) => c.dishes.forEach((d) => m.set(String(d.id), d)));
    return m;
  }, [ruMenu]);

  const cashierLines = lines.map(({ id, qty, dish }) => {
    const ru = ruDishes.get(id);
    return { id, qty, name: ru?.name ?? dish.name, price: ru?.price ?? dish.price };
  });
  const cashierTotal = round2(cashierLines.reduce((s, l) => s + l.price * l.qty, 0));
  const ruMoney = (n) => `${new Intl.NumberFormat('ru-RU').format(n)}\u00A0₸`;
  const time = useMemo(
    () => (cashierOpen ? new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''),
    [cashierOpen]
  );

  return (
    <>
      {count > 0 && !sheetOpen && !cashierOpen && (
        <div className="cart-bar">
          <button type="button" className="cart-bar__btn" onClick={() => setSheetOpen(true)}>
            <span>
              {t('cart.open')} <span className="cart-bar__count">{count}</span>
            </span>
            <strong>{money(total)}</strong>
          </button>
        </div>
      )}

      {sheetOpen && !cashierOpen && (
        <div className="sheet" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
          <div className="sheet__backdrop" onClick={() => setSheetOpen(false)} />
          <div className="sheet__panel">
            <div className="sheet__head">
              <h2>{t('cart.title')}</h2>
              <button type="button" className="icon-btn" onClick={() => setSheetOpen(false)} aria-label={t('cart.close')} autoFocus>
                ✕
              </button>
            </div>

            <ul className="cart-lines">
              {lines.map(({ id, qty, dish }) => (
                <li key={id} className="cart-line">
                  <span className="cart-line__name">{dish.name}</span>
                  <span className="cart-line__sum">{money(round2(dish.price * qty))}</span>
                  <span className="cart-line__unit">{money(dish.price)}</span>
                  <AddToCart id={id} />
                </li>
              ))}
            </ul>

            <div className="sheet__foot">
              <div className="sum-row">
                <span>{t('cart.total')}</span>
                <strong>{money(total)}</strong>
              </div>
              <button type="button" className="btn btn--primary" onClick={() => setCashierOpen(true)}>
                {t('cart.showCashier')}
              </button>
              <button type="button" className="btn btn--ghost" onClick={clear}>
                {t('cart.clear')}
              </button>
            </div>
          </div>
        </div>
      )}

      {cashierOpen && (
        <div className="cashier" role="dialog" aria-modal="true" aria-label="Заказ для кассира" translate="no">
          <div className="cashier__inner">
            <div className="cashier__top">
              <button type="button" className="btn btn--ghost btn--small" onClick={() => setCashierOpen(false)} autoFocus>
                ← {t('cart.back')}
              </button>
              <time>{time}</time>
            </div>

            <h2 className="cashier__title">Заказ гостя</h2>

            {!ruMenu && !ruError ? (
              <p className="cashier__note">Загрузка…</p>
            ) : (
              <>
                {ruError && (
                  <p className="cashier__note">Не удалось загрузить названия на русском, показаны на языке гостя.</p>
                )}
                <ul className="cashier__lines">
                  {cashierLines.map((l) => (
                    <li key={l.id}>
                      <span className="cashier__qty">{l.qty}×</span>
                      <span className="cashier__name">{l.name}</span>
                      <span className="cashier__price">{ruMoney(round2(l.price * l.qty))}</span>
                    </li>
                  ))}
                </ul>
                <div className="cashier__total">
                  <span>Итого</span>
                  <strong>{ruMoney(cashierTotal)}</strong>
                </div>
                <p className="cashier__count">Всего порций: {count}</p>
              </>
            )}

            <p className="cashier__hint" translate="yes">{t('cart.cashierHint')}</p>
          </div>
        </div>
      )}
    </>
  );
}
