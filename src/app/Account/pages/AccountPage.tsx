import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordLink } from '../../../services/accountApi';
import { getHistory } from '../../../services/rideApi';
import { setPaymentPreference } from '../../../services/localStore';
import { useSession } from '../../../services/session';
import { RidePaymentType, RideStatus, type RideTransaction } from '../../../types/contracts';
import { useRequireCustomer } from './useRequireCustomer';

export function AccountPage() {
  const ready = useRequireCustomer();
  const navigate = useNavigate();
  const { session, logout } = useSession();
  const [rides, setRides] = useState<RideTransaction[] | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    getHistory(10).then((list) => { if (!cancelled) setRides(list ?? []); })
      .catch(() => { if (!cancelled) setRides([]); });
    return () => { cancelled = true; };
  }, [ready]);

  if (!ready || !session) return null;

  async function changePassword() {
    if (!session?.email) return;
    try {
      await sendPasswordLink(session.email);
      setNotice('We emailed you a link to change your password.');
    } catch {
      setNotice('The email could not be sent. Try again in a minute.');
    }
  }

  async function signOut() {
    await logout();
    setPaymentPreference(null);
    navigate('/book', { replace: true });
  }

  return (
    <section className="account-page">
      <div className="ride-panel">
        <h1>Account</h1>
        <dl className="ride-facts">
          <div><dt>Email</dt><dd>{session.email}</dd></div>
          <div><dt>Status</dt><dd>{session.emailConfirmed
            ? 'Active: you can receive coupons from providers near you'
            : 'Not activated: set a password from your email to receive coupons'}</dd></div>
        </dl>
        {notice && <p className="ride-notice" role="status">{notice}</p>}
        <button className="ride-link" type="button" onClick={changePassword}>Change password</button>
        <Link className="ride-link" to="/card">Add or edit card</Link>
        <button className="ride-cancel" type="button" onClick={signOut}>Log out</button>
      </div>

      <div className="ride-panel">
        <h2>Recent rides</h2>
        {rides === null && <p role="status">Loading…</p>}
        {rides?.length === 0 && <p>No rides yet.</p>}
        <ul className="ride-history">
          {rides?.map((ride) => (
            <li key={ride.id}><Link to={'/ride/' + ride.id}>
              <strong>{ride.dropoffAddress}</strong>
              <small>{new Date(ride.requestedAt).toLocaleDateString()} · {ride.paymentType === RidePaymentType.Cash ? 'Cash' : 'Card'} · {
                ride.status === RideStatus.Completed ? (ride.actualFare ?? ride.estimatedFare ?? 0).toFixed(2)
                  : ride.status === RideStatus.Cancelled ? 'Cancelled' : 'In progress'}</small>
            </Link></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
