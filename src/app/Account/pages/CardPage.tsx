import { CreditCard, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  createSetupIntent, deletePaymentMethod, getPaymentMethods, getStripe, setDefaultPaymentMethod,
  syncPaymentMethods, type StripeClient,
} from '../../../services/paymentApi';
import { getPaymentPreference, setPaymentPreference } from '../../../services/localStore';
import type { CustomerPaymentMethod } from '../../../types/contracts';
import { useRequireCustomer } from './useRequireCustomer';

type StripeForm = { stripe: StripeClient; elements: ReturnType<StripeClient['elements']> };

const text = (failure: unknown, fallback: string) =>
  failure instanceof Error && failure.message ? failure.message : fallback;

/** Add or edit the saved card, using the existing Stripe customer endpoints. */
export function CardPage() {
  const ready = useRequireCustomer();
  const navigate = useNavigate();
  const thenBook = (useLocation().state as { thenBook?: boolean } | null)?.thenBook === true;
  const [methods, setMethods] = useState<CustomerPaymentMethod[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const host = useRef<HTMLDivElement>(null);
  const form = useRef<StripeForm | null>(null);

  const refresh = useCallback(async () => {
    const list = (await getPaymentMethods()) ?? [];
    setMethods(list);
    return list;
  }, []);

  useEffect(() => {
    if (!ready) return;
    refresh().then((list) => { if (list.length === 0) setAdding(true); })
      .catch((failure) => { setMethods([]); setError(text(failure, 'Your cards could not be loaded.')); });
  }, [ready, refresh]);

  // Mount Stripe's card form whenever "add a card" is open.
  useEffect(() => {
    if (!adding || !ready) return;
    let cancelled = false;
    let unmount: (() => void) | undefined;
    setError('');
    (async () => {
      try {
        const [stripe, clientSecret] = await Promise.all([getStripe(), createSetupIntent()]);
        if (cancelled || !host.current) return;
        const elements = stripe.elements({ clientSecret });
        const element = elements.create('payment');
        element.mount(host.current);
        unmount = () => element.unmount();
        form.current = { stripe, elements };
      } catch (failure) {
        if (!cancelled) setError(text(failure, 'Card entry could not be loaded.'));
      }
    })();
    return () => { cancelled = true; form.current = null; unmount?.(); };
  }, [adding, ready]);

  async function save() {
    if (!form.current || busy) return;
    setBusy(true);
    setError('');
    try {
      const { stripe, elements } = form.current;
      const { error: stripeError } = await stripe.confirmSetup({
        elements, redirect: 'if_required', confirmParams: { return_url: window.location.origin + '/card' },
      });
      if (stripeError) { setError(stripeError.message || 'The card could not be saved.'); return; }

      await syncPaymentMethods();
      const list = await refresh();
      setAdding(false);
      if (list.length > 0) {
        setPaymentPreference('card');
        if (thenBook) navigate('/book', { replace: true });
      }
    } catch (failure) {
      setError(text(failure, 'The card could not be saved.'));
    } finally {
      setBusy(false);
    }
  }

  async function act(work: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await work();
      const list = await refresh();
      // With no card left, card payment is no longer possible: fall back to cash.
      if (list.length === 0 && getPaymentPreference() === 'card') setPaymentPreference('cash');
    } catch (failure) {
      setError(text(failure, 'That change could not be saved.'));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return null;

  return (
    <section className="account-page">
      <div className="ride-panel">
        <h1>Your card</h1>
        {methods === null && <p role="status">Loading…</p>}
        {methods?.length === 0 && !adding && <p>No card saved yet.</p>}
        <ul className="card-list">
          {methods?.map((method) => (
            <li key={method.customerPaymentMethodId}>
              <CreditCard size={22} />
              <span><strong>{method.brand} ending {method.last4}</strong>
                <small>Expires {String(method.expirationMonth).padStart(2, '0')}/{method.expirationYear}{method.isDefault ? ' · Used for rides' : ''}</small></span>
              {!method.isDefault && <button className="ride-link" type="button" disabled={busy}
                onClick={() => act(() => setDefaultPaymentMethod(method.customerPaymentMethodId))}>Use this</button>}
              <button className="card-remove" type="button" disabled={busy} aria-label={'Remove card ending ' + method.last4}
                onClick={() => act(() => deletePaymentMethod(method.customerPaymentMethodId))}><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>

        {adding ? (
          <div className="card-form">
            <div ref={host} />
            {error && <p className="ride-error" role="alert">{error}</p>}
            <button className="ride-submit" type="button" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save card'}</button>
            {(methods?.length ?? 0) > 0 && <button className="ride-link" type="button" onClick={() => setAdding(false)} disabled={busy}>Cancel</button>}
          </div>
        ) : (
          <>
            {error && <p className="ride-error" role="alert">{error}</p>}
            <button className="ride-submit" type="button" onClick={() => setAdding(true)} disabled={busy}>Add a card</button>
          </>
        )}
        <button className="ride-link" type="button" onClick={() => { setPaymentPreference('cash'); navigate('/book'); }}>Stay with cash</button>
      </div>
    </section>
  );
}
