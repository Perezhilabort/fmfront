import { useState } from 'react';
import { login, setToken } from './adminApi';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { token } = await login(username.trim(), password);
      setToken(token);
      onLogin();
    } catch (err) {
      setError(
        err.response?.status === 401
          ? 'Неверный логин или пароль'
          : 'Сервер не отвечает. Если он только что проснулся, подождите минуту и попробуйте снова.'
      );
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={submit}>
        <h1>Flavour Market</h1>
        <p className="login__sub">Вход в админку</p>

        <label className="field">
          Логин
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
        </label>
        <label className="field">
          Пароль
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="a-btn a-btn--primary" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      </form>
      <a className="login__back" href="/">← К меню</a>
    </div>
  );
}
