import banner from './assets/header.webp';

export default function Header() {
  return (
    <header className="site-header">
      <img src={banner} width="1683" height="421" alt="Flavour Market — кофе, еда, атмосфера" />
    </header>
  );
}
