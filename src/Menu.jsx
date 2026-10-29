import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMenu } from './useMenu';
import LanguageSwitcher from './LanguageSwitcher';
import Cart, { AddToCart } from './Cart';

export default function Menu() {
  const { t, i18n } = useTranslation();
  const { categories, loading, error } = useMenu();
  const money = new Intl.NumberFormat(i18n.resolvedLanguage || 'ru');

  const [activeId, setActiveId] = useState(null);
  const navRef = useRef(null);
  const current = activeId ?? (categories[0] ? `cat-${categories[0].id}` : null);

  // Подсвечиваем в списке ту категорию, которая сейчас на экране
  useEffect(() => {
    const sections = document.querySelectorAll('.cat');
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  // На телефоне прокручиваем ленту, чтобы активная кнопка была видна
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [current]);

  return (
    <>
      <div className="topbar">
        <LanguageSwitcher />
      </div>

      <div className="layout">
        <nav className="cat-nav" ref={navRef} aria-label={t('menu.categories')}>
          {categories.map((cat) => {
            const id = `cat-${cat.id}`;
            return (
              <a key={cat.id} href={`#${id}`} aria-current={id === current ? 'true' : undefined}>
                {cat.name}
              </a>
            );
          })}
        </nav>

        <main className={`menu${loading && categories.length ? ' is-loading' : ''}`}>
          {loading && !categories.length && <p className="menu__status">{t('loading')}</p>}
          {error && <p className="menu__status" role="alert">{t('error')}</p>}

          {categories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`} className="cat">
              <h2 className="cat__title">{cat.name}</h2>
              <div className="dishes">
                {cat.dishes.map((dish) => (
                  <article key={dish.id} className="dish">
                    {dish.image_url && (
                      <img className="dish__img" src={dish.image_url} alt="" loading="lazy" />
                    )}
                    <div className="dish__body">
                      <div className="dish__head">
                        <h3 className="dish__name">{dish.name}</h3>
                        <span className="dish__leader" aria-hidden="true" />
                        <span className="dish__price">{money.format(dish.price)}&nbsp;₸</span>
                      </div>
                      {dish.description && <p className="dish__desc">{dish.description}</p>}
                      <div className="dish__foot">
                        {dish.allergens?.length > 0 ? (
                          <ul className="dish__allergens" aria-label={t('allergens.label')}>
                            {dish.allergens.map((a) => (
                              <li key={a}>{t(`allergens.${a}`)}</li>
                            ))}
                          </ul>
                        ) : (
                          <span />
                        )}
                        <AddToCart id={dish.id} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <Cart categories={categories} />
    </>
  );
}
