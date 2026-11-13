import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../infrastructure/http/apiError';
import { sendPasswordLink } from '../../../services/accountApi';
import { getCashEmail } from '../../../services/localStore';
import { useSession } from '../../../services/session';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useSession();
  const [email, setEmail] = useState(getCashEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const session = await login(email, password);
      if (!session.roles?.includes('Customer')) {
        setError('This app is for riders. Use the RunDelta provider or driver app for this account.');
        return;
      }
      // First page after login: CASH | CARD.
      navigate('/pay', { replace: true });
    } catch (failure) {
      setError(failure instanceof ApiError && failure.status === 401
        ? 'Email or password is not correct. If you booked a cash ride and never set a password, use the link below.'
        : failure instanceof Error && failure.message ? failure.message : 'Could not log in.');
    } finally {
      setBusy(false);
    }
  }

  async function emailLink() {
    if (busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter your email address first.'); return; }
    setBusy(true);
    setError('');
    try {
      await sendPasswordLink(email);
      setNotice('If that email has a RideUSA account, a link to set your password is on its way.');
    } catch (failure) {
      setError(failure instanceof ApiError && failure.status === 429
        ? 'Too many requests. Wait a minute and try again.' : 'The email could not be sent. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-page">
      <form className="ride-panel" onSubmit={submit}>
        <h1>Log in</h1>
        <p>Log in to pay by card and see your rides. Paying cash does not need an account.</p>
        <label htmlFor="login-email">Email</label>
        <input id="login-email" type="email" inputMode="email" autoComplete="username" required
          value={email} onChange={(event) => setEmail(event.target.value)} />
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" autoComplete="current-password" required
          value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="ride-error" role="alert">{error}</p>}
        {notice && <p className="ride-notice" role="status">{notice}</p>}
        <button className="ride-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Log in'}</button>
        <button className="ride-link" type="button" onClick={emailLink} disabled={busy}>Forgot or never set a password? Email me a link</button>
        <Link className="ride-link" to="/book">Continue without an account (cash)</Link>
      </form>
    </section>
  );
}
