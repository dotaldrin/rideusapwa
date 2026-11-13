import { Banknote, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPaymentPreference, setPaymentPreference, type PaymentPreference } from '../../../services/localStore';
import { useSession } from '../../../services/session';

export function SettingsPage() {
  const navigate = useNavigate();
  const { isCustomer } = useSession();
  const [preference, setPreference] = useState<PaymentPreference>(() => getPaymentPreference() ?? 'cash');

  function choose(value: PaymentPreference) {
    if (value === 'card') { navigate('/pay'); return; }   // the CASH | CARD page checks for a saved card
    setPaymentPreference(value);
    setPreference(value);
  }

  return (
    <section className="account-page">
      <div className="ride-panel">
        <h1>Settings</h1>
        <h2>Payment</h2>
        {isCustomer ? (
          <>
            <div className="ride-types settings-pay">
              <button type="button" className={preference === 'cash' ? 'active' : ''} aria-pressed={preference === 'cash'}
                onClick={() => choose('cash')}><Banknote size={19} />Cash</button>
              <button type="button" className={preference === 'card' ? 'active' : ''} aria-pressed={preference === 'card'}
                onClick={() => choose('card')}><CreditCard size={19} />Card</button>
            </div>
            <Link className="ride-link" to="/card">Add or edit card</Link>
            <Link className="ride-link" to="/account">Account and password</Link>
          </>
        ) : (
          <>
            <p>You are booking as a guest and paying cash. Log in to pay by card, see your rides and receive coupons from providers near you.</p>
            <Link className="ride-submit" to="/login">Log in</Link>
          </>
        )}
      </div>
    </section>
  );
}
