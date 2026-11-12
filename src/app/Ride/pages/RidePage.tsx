import '../styles/bookride.css';
import { Banknote, CarFront, CheckCircle2, CircleX, Clock, CreditCard, MapPin, Navigation } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../../../infrastructure/http/apiError';
import { cancelRide, getRide, getTaxicard } from '../../../services/rideApi';
import { getStoredCashRide, storeCashRide } from '../../../services/localStore';
import { useSession } from '../../../services/session';
import {
  RidePaymentType, RideStatus, type RideStatusValue, type RideTransaction, type Taxicard,
} from '../../../types/contracts';

const POLL_MS = 5000;

/** Rider-facing wording for each RunDelta.Contracts RideStatus. */
const statusText: Record<RideStatusValue, { title: string; detail: string }> = {
  [RideStatus.Pending]: { title: 'Waiting for your driver', detail: 'Your request was sent. The driver has a short time to accept.' },
  [RideStatus.Created]: { title: 'Request received', detail: 'Your ride is being set up.' },
  [RideStatus.Assigned]: { title: 'Driver accepted', detail: 'Your driver is getting ready to head to you.' },
  [RideStatus.EnRouteToPickup]: { title: 'Driver on the way', detail: 'Your driver is heading to the pickup.' },
  [RideStatus.ArrivedAtPickup]: { title: 'Driver has arrived', detail: 'Meet your driver at the pickup.' },
  [RideStatus.InProgress]: { title: 'On your trip', detail: 'Enjoy the ride.' },
  [RideStatus.Paused]: { title: 'Trip paused', detail: 'Your driver paused the trip.' },
  [RideStatus.Completed]: { title: 'Ride complete', detail: 'Thanks for riding.' },
  [RideStatus.Cancelled]: { title: 'Ride cancelled', detail: 'This ride was cancelled.' },
  [RideStatus.Failed]: { title: 'Ride could not be completed', detail: 'Something went wrong with this ride.' },
};

const steps: { status: RideStatusValue; label: string }[] = [
  { status: RideStatus.Pending, label: 'Requested' },
  { status: RideStatus.Assigned, label: 'Accepted' },
  { status: RideStatus.EnRouteToPickup, label: 'On the way' },
  { status: RideStatus.ArrivedAtPickup, label: 'Arrived' },
  { status: RideStatus.InProgress, label: 'On trip' },
  { status: RideStatus.Completed, label: 'Done' },
];

// The backend lets a rider cancel only before the trip starts.
const cancellable: RideStatusValue[] = [
  RideStatus.Pending, RideStatus.Created, RideStatus.Assigned, RideStatus.EnRouteToPickup, RideStatus.ArrivedAtPickup,
];
const finished: RideStatusValue[] = [RideStatus.Completed, RideStatus.Cancelled, RideStatus.Failed];
// The meter starts when the trip starts, so the fare card is only read from then on.
const metered: RideStatusValue[] = [RideStatus.InProgress, RideStatus.Paused, RideStatus.Completed];

const money = (amount: number | null | undefined, currency?: string | null) =>
  amount == null ? '—' : amount.toFixed(2) + (currency ? ' ' + currency : '');

type CashState = { cashToken?: string; email?: string; justBooked?: boolean } | null;

export function RidePage() {
  const { rideId: rideIdText } = useParams();
  const rideId = Number(rideIdText);
  const navigate = useNavigate();
  const state = useLocation().state as CashState;
  const { session, isCustomer } = useSession();

  // A visitor follows the ride with the token from their booking; a logged-in customer with their session.
  const stored = getStoredCashRide();
  const cashToken = isCustomer ? undefined
    : state?.cashToken ?? (stored?.rideId === rideId ? stored.token : undefined);
  const cashEmail = state?.email ?? (stored?.rideId === rideId ? stored.email : undefined);

  const [ride, setRide] = useState<RideTransaction | null>(null);
  const [taxicard, setTaxicard] = useState<Taxicard | null>(null);
  const noCard = useRef(false);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [now, setNow] = useState(Date.now);
  const done = useRef(false);

  const load = useCallback(async () => {
    try {
      const current = await getRide(rideId, cashToken);
      setRide(current);
      setError('');
      if (metered.includes(current.status) && !noCard.current) {
        try {
          const card = await getTaxicard(rideId, cashToken);
          if (card) setTaxicard(card);
          else noCard.current = true;   // priced from the driver's rates: stop asking
        } catch { /* keep the last card; the next poll retries */ }
      }
      if (finished.includes(current.status)) {
        done.current = true;
        // The ride is over, so the visitor may book again.
        if (getStoredCashRide()?.rideId === rideId) storeCashRide(null);
      }
    } catch (failure) {
      if (failure instanceof ApiError && (failure.status === 401 || failure.status === 403 || failure.status === 404)) {
        done.current = true;
        if (getStoredCashRide()?.rideId === rideId) storeCashRide(null);
        setError('This ride is not available on this device. Log in to see your rides.');
      } else {
        setError('Could not refresh the ride. Retrying…');
      }
    }
  }, [rideId, cashToken]);

  useEffect(() => {
    if (session === null || !Number.isInteger(rideId) || rideId <= 0) return;
    if (!isCustomer && !cashToken) { setError('This ride is not available on this device. Log in to see your rides.'); return; }
    done.current = false;
    noCard.current = false;
    void load();
    const poll = window.setInterval(() => { if (!done.current && !document.hidden) void load(); }, POLL_MS);
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearInterval(poll); window.clearInterval(tick); };
  }, [session, isCustomer, cashToken, rideId, load]);

  async function cancel() {
    if (!ride || cancelling) return;
    setCancelling(true);
    try {
      setRide(await cancelRide(ride.id, 'Cancelled by rider', cashToken));
      done.current = true;
      if (getStoredCashRide()?.rideId === ride.id) storeCashRide(null);
    } catch (failure) {
      setError(failure instanceof Error && failure.message ? failure.message : 'The ride could not be cancelled.');
      void load();
    } finally {
      setCancelling(false);
    }
  }

  if (!Number.isInteger(rideId) || rideId <= 0) {
    return <section className="ride-workspace"><div className="ride-panel"><h1>Ride not found</h1><Link className="ride-submit" to="/book">Book a ride</Link></div></section>;
  }

  if (!ride) {
    return (
      <section className="ride-workspace"><div className="ride-panel">
        <h1>Your ride</h1>
        {error ? <p className="ride-error" role="alert">{error}</p> : <p role="status">Loading your ride…</p>}
        {error && <Link className="ride-submit" to={isCustomer ? '/book' : '/login'}>{isCustomer ? 'Book a ride' : 'Log in'}</Link>}
      </div></section>
    );
  }

  const text = statusText[ride.status] ?? { title: 'Ride update', detail: '' };
  const cash = ride.paymentType === RidePaymentType.Cash;
  const over = finished.includes(ride.status);
  const reached = (status: RideStatusValue) =>
    ride.status === RideStatus.Paused ? status <= RideStatus.InProgress : status <= ride.status;
  const secondsLeft = ride.status === RideStatus.Pending && ride.expiresAt
    ? Math.max(0, Math.round((Date.parse(ride.expiresAt) - now) / 1000)) : null;
  const live = taxicard && !over ? taxicard.total : null;
  const fare = ride.actualFare ?? (taxicard?.isFinal ? taxicard.total : null) ?? ride.estimatedFare;
  const lines = taxicard?.lines.filter((line) => line.isApplied && line.amount !== 0)
    .sort((a, b) => a.tariffIndex - b.tariffIndex) ?? [];
  const vehicle = [ride.vehicleYear || null, ride.vehicleColor, ride.vehicleMake, ride.vehicleModel, ride.vehicleIdentifier]
    .filter(Boolean).join(' · ');

  return (
    <section className="ride-workspace">
      <div className="ride-panel ride-status" aria-live="polite">
        <p className={'ride-state ' + (ride.status === RideStatus.Completed ? 'ok' : over ? 'bad' : 'live')}>
          {ride.status === RideStatus.Completed ? <CheckCircle2 size={30} /> : over ? <CircleX size={30} /> : <Navigation size={30} />}
        </p>
        <h1>{text.title}</h1>
        <p>{ride.status === RideStatus.Cancelled && ride.cancellationReason ? ride.cancellationReason : text.detail}</p>
        {secondsLeft != null && <p className="ride-countdown"><Clock size={16} /> {secondsLeft > 0 ? secondsLeft + ' s for the driver to accept' : 'Checking with the driver…'}</p>}

        {!over && (
          <ol className="ride-track" aria-label="Ride progress">
            {steps.map(({ status, label }) => (
              <li key={status} className={reached(status) ? 'reached' : ''}
                aria-current={status === ride.status || (ride.status === RideStatus.Paused && status === RideStatus.InProgress) ? 'step' : undefined}>
                <span />{label}
              </li>
            ))}
          </ol>
        )}
      </div>

      {taxicard && (
        <div className="ride-panel ride-meter" aria-live="polite">
          <h2>{taxicard.isFinal ? 'Fare' : 'Live fare'}</h2>
          <p className="ride-meter-total">{money(taxicard.total, taxicard.currency)}</p>
          {taxicard.rateMessage && <p className="ride-meter-rate">{taxicard.rateMessage}</p>}
          {taxicard.rateAlert && <p className="ride-notice" role="status">{taxicard.rateAlert}</p>}
          {lines.length > 0 && (
            <ul className="ride-meter-lines">
              {lines.map((line) => (
                <li key={line.productTariffMemberId}>
                  <span>{line.name}{line.displayDetail && <small>{line.displayDetail}</small>}</span>
                  <span>{line.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          {!taxicard.isFinal && <p className="ride-meter-note">Updates as you travel. The final fare is set when the trip ends.</p>}
        </div>
      )}

      <div className="ride-panel">
        <h2>Trip</h2>
        <dl className="ride-facts">
          <div><dt><MapPin size={16} /> From</dt><dd>{ride.pickupAddress}</dd></div>
          <div><dt><MapPin size={16} /> To</dt><dd>{ride.dropoffAddress}</dd></div>
          {ride.driverName && <div><dt><CarFront size={16} /> Driver</dt><dd>{ride.driverName}{vehicle && <small>{vehicle}</small>}</dd></div>}
          <div><dt>{cash ? <Banknote size={16} /> : <CreditCard size={16} />} {ride.status === RideStatus.Completed ? 'Fare' : live != null ? 'So far' : 'Estimate'}</dt>
            <dd>{money(live ?? fare, ride.currency)}</dd></div>
        </dl>

        <p className={'ride-pay ' + (cash ? 'cash' : 'card')}>
          {cash ? <Banknote size={18} /> : <CreditCard size={18} />}
          {cash
            ? ride.status === RideStatus.Completed
              ? 'Pay your driver ' + money(fare, ride.currency) + ' in cash. Ask the driver if you need a receipt.'
              : 'Cash ride: pay the driver at the end of the trip.'
            : ride.status === RideStatus.Completed
              ? 'Charged to your saved card.'
              : 'Your saved card is charged when the trip ends.'}
        </p>

        {error && <p className="ride-error" role="alert">{error}</p>}

        {cancellable.includes(ride.status) && (
          <button className="ride-cancel" type="button" onClick={cancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel ride'}
          </button>
        )}
        {over && <button className="ride-submit" type="button" onClick={() => navigate('/book')}>Book another ride</button>}
      </div>

      {!isCustomer && cashEmail && (
        <div className="ride-panel ride-activate">
          <h2>Want coupons and card payments?</h2>
          <p>We sent a link to <strong>{cashEmail}</strong> to set your password. Activating your account lets you save a card and receive coupons from providers near you. Paying cash never requires it.</p>
          <Link className="ride-link" to="/login">Already set your password? Log in</Link>
        </div>
      )}
    </section>
  );
}
