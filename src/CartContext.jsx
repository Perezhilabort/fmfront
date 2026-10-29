import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'cart';
const MAX_QTY = 99;
const CartContext = createContext(null);

// В корзине храним только { id блюда: количество }.
// Названия и цены берём из актуального меню, поэтому при смене языка они переводятся сами.
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Object.fromEntries(
      Object.entries(raw).filter(([, q]) => Number.isInteger(q) && q > 0 && q <= MAX_QTY)
    );
  } catch {
    return {};
  }
}

function reducer(state, action) {
  const { id } = action;
  switch (action.type) {
    case 'add':
      return { ...state, [id]: Math.min((state[id] || 0) + 1, MAX_QTY) };
    case 'dec': {
      const next = { ...state };
      const q = (state[id] || 0) - 1;
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    }
    case 'remove': {
      const next = { ...state };
      delete next[id];
      return next;
    }
    case 'clear':
      return {};
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* приватный режим и т.п. — корзина просто не сохранится */
    }
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      add: (id) => dispatch({ type: 'add', id }),
      dec: (id) => dispatch({ type: 'dec', id }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart нужно вызывать внутри <CartProvider>');
  return ctx;
}
