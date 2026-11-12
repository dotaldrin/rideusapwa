import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { activateAccount } from '../../../services/accountApi';
import { useSession } from '../../../services/session';

/**
 * Landing page of the link in the forgot-password email
 * (/reset-password?userId=...&code=...). Setting the password also confirms the
 * email address, which is how a cash rider activates their account.
 */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useSession();
  const userId = params.get('userId') ?? '';
  const code = params.get('code') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (password !== confirm) { setErrors(['The two passwords do not match.']); return; }
    setBusy(true);
    setErrors([]);
    try {
      const result = await activateAccount(userId, code, password);
      if (!result.succeeded) { setErrors(result.errors.length ? result.errors : ['The password could not be set.']); return; }
      if (result.email) {
        try { await login(result.email, password); navigate('/pay', { replace: true }); return; }
        catch { /* fall through to the login page */ }
      }
      navigate('/login', { replace: true });
    } catch (failure) {
      setErrors([failure instanceof Error && failure.message ? failure.message : 'The password could not be set.']);
    } finally {
      setBusy(false);
    }
  }

  if (!userId || !code) {
    return (
      <section className="account-page"><div className="ride-panel">
        <h1>Link not valid</h1>
        <p>This link is incomplete or has expired. Ask for a new one from the log in page.</p>
        <Link className="ride-submit" to="/login">Go to log in</Link>
      </div></section>
    );
  }

  return (
    <section className="account-page">
      <form className="ride-panel" onSubmit={submit}>
        <h1>Set your password</h1>
        <p>This activates your account so you can save a card and receive coupons from providers near you.</p>
        <label htmlFor="new-password">New password</label>
        <input id="new-password" type="password" autoComplete="new-password" required minLength={8}
          value={password} onChange={(event) => setPassword(event.target.value)} />
        <label htmlFor="confirm-password">Repeat password</label>
        <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8}
          value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <p className="account-hint">At least 8 characters with an upper case letter, a lower case letter, a number and a symbol.</p>
        {errors.map((text) => <p className="ride-error" role="alert" key={text}>{text}</p>)}
        <button className="ride-submit" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
      </form>
    </section>
  );
}
