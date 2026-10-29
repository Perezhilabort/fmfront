import { lazy, Suspense } from 'react';
import { CartProvider } from './CartContext';
import Header from './Header';
import Menu from './Menu';

// Код админки загружается только на странице /admin и не утяжеляет меню для гостей
const Admin = lazy(() => import('./admin/Admin'));

export default function App() {
    if (window.location.pathname.replace(/\/+$/, '').startsWith('/admin')) {
        return (
            <Suspense fallback={null}>
                <Admin />
            </Suspense>
        );
    }

    return (
        <CartProvider>
            <Header />
            <Menu />
        </CartProvider>
    );
}
