import { Banknote, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPaymentMethods } from '../../../services/paymentApi';
import { setPaymentPreference } from '../../../services/localStore';
import type { CustomerPaymentMethod } from '../../../types/contracts';
import { useRequireCustomer } from './useRequireCustomer';

/** First page after log in: CASH | CARD. Nothing else on the screen. */
export function PaymentChoicePage() {
  const ready = useRequireCustomer();
  const navigate = useNavigate();
  const [methods, setMethods] = useState<CustomerPaymentMethod[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    getPaymentMethods().then((list) => { if (!cancelled) setMethods(list ?? []); })
      .catch(() => { if (!cancelled) setMethods([]); });
    return () => { cancelled = true; };
  }, [ready]);

  if (!ready) return null;

  const card = methods?.find((method) => method.isDefault) ?? methods?.[0];

  function chooseCash() {
    setPaymentPreference('cash');
    navigate('/book', { replace: true });
  }

  function chooseCard() {
    if (card) {
      setPaymentPreference('card');
      navigate('/book', { replace: true });
    } else {
      // No saved card yet: start the Stripe customer flow, then come back to booking.
      navigate('/card', { state: { thenBook: true } });
    }
  }

  return (
    <section className="pay-choice" aria-labelledby="pay-title">
      <h1 id="pay-title">How will you pay?</h1>
      <div className="pay-options">
        <button type="button" onClick={chooseCash}>
          <Banknote size={44} />
          <strong>CASH</strong>
          <span>Pay the driver at the end of the ride</span>
        </button>
        <button type="button" onClick={chooseCard} disabled={methods === null}>
          <CreditCard size={44} />
          <strong>CARD</strong>
          <span>{methods === null ? 'Checking your card…'
            : card ? card.brand + ' ending ' + card.last4 : 'Add a card to pay in the app'}</span>
        </button>
      </div>
    </section>
  );
}
