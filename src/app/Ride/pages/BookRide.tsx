import '../styles/bookride.css';
import { AddressField, RouteMap, type Point } from '../components/RideLocations';
import { ArrowRight, Banknote, CarFront, CreditCard, Info, Users } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../../infrastructure/http/apiError';
import { bookCashRide, findDrivers, getActiveRide, getCategories, previewRoute, requestRide } from '../../../services/rideApi';
import { getCashEmail, getPaymentPreference, getStoredCashRide, setCashEmail, storeCashRide } from '../../../services/localStore';
import { useSession } from '../../../services/session';
import {
  RidePaymentType, TariffMeasure, type CreateRideRequest, type DriverRideOption, type RideRate, type RideStopInput,
  type RideTypeCode,
} from '../../../types/contracts';

const rideTypes = ['Taxi', 'Livery', 'Rideshare'] as const;
type RideType = typeof rideTypes[number];

/** What the search returned, kept so the booking sends exactly what was quoted. */
type Search = {
  drivers: DriverRideOption[];
  rideType: RideTypeCode;
  pickup: Point;
  dropoff: Point;
  stops: RideStopInput[];
  distanceMeters: number;
  durationSeconds: number;
  cash: boolean;
};

const stop = ({ latitude, longitude, address }: Point): RideStopInput => ({ latitude, longitude, address });
const message = (failure: unknown, fallback: string) =>
  failure instanceof Error && failure.message ? failure.message : fallback;

const measure: Record<number, string> = {
  [TariffMeasure.Mile]: 'mile', [TariffMeasure.Kilometer]: 'km', [TariffMeasure.Second]: 'second',
  [TariffMeasure.Minute]: 'minute', [TariffMeasure.Trip]: 'trip',
};

/** "2.50", "0.70 per 0.2 mile", "0.50 per minute": one fare-card line in rider terms. */
function rateText({ cost, unitQuantity, unitOfMeasure }: RideRate): string {
  if (cost == null) return 'Varies';
  const unit = unitOfMeasure != null ? measure[unitOfMeasure] : undefined;
  if (!unit) return cost.toFixed(2);
  const quantity = unitQuantity != null && unitQuantity !== 1 ? unitQuantity + ' ' : '';
  return cost.toFixed(2) + ' per ' + quantity + unit;
}

export function BookPage() {
  const navigate = useNavigate();
  const { session, isCustomer } = useSession();
  const loggedIn = isCustomer;

  // A visitor is always cash. A logged-in customer uses the choice they made on the CASH | CARD page.
  const payByCash = !loggedIn || getPaymentPreference() !== 'card';

  const [rideType, setRideType] = useState<RideType>('Taxi');
  const [pickup, setPickup] = useState<Point | null>(null);
  const [dropoff, setDropoff] = useState<Point | null>(null);
  const [stops, setStops] = useState<{ id: string; point: Point | null }[]>([]);
  const [geometry, setGeometry] = useState<unknown>(null);
  const [search, setSearch] = useState<Search | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [email, setEmail] = useState(getCashEmail);
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  // Only one active ride is allowed, so send the rider back to the one in progress.
  useEffect(() => {
    if (session === null) return;
    let cancelled = false;
    if (loggedIn) {
      if (getPaymentPreference() === null) { navigate('/pay', { replace: true }); return; }
      getActiveRide().then((ride) => { if (!cancelled && ride) navigate('/ride/' + ride.id, { replace: true }); })
        .catch(() => { /* booking stays available; the server still enforces one active ride */ });
    } else {
      const stored = getStoredCashRide();
      if (stored) navigate('/ride/' + stored.rideId, { replace: true });
    }
    return () => { cancelled = true; };
  }, [session, loggedIn, navigate]);

  function clearResults() {
    setSearch(null);
    setGeometry(null);
    setSelected(null);
    setError('');
  }

  async function searchDrivers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    clearResults();
    setBusy(true);

    try {
      const intermediateStops = stops.flatMap(({ point }) => point ? [stop(point)] : []);
      if (!pickup || !dropoff || intermediateStops.length !== stops.length) {
        throw new Error('Pick a suggestion for each address.');
      }

      const code = rideType.toUpperCase() as RideTypeCode;
      const categories = await getCategories(loggedIn);
      const category = categories.find(({ name }) => name.trim().toUpperCase() === code);
      if (!category) throw new Error(rideType + ' is currently unavailable.');

      const route = await previewRoute(loggedIn, stop(pickup), stop(dropoff), intermediateStops);
      if (!Number.isFinite(route?.distanceMeters) || route.distanceMeters <= 0 ||
          !Number.isFinite(route.durationSeconds) || route.durationSeconds < 0) {
        throw new Error('The server did not return a valid route.');
      }
      setGeometry(route.geometry);

      const drivers = await findDrivers(loggedIn, {
        pickupLatitude: pickup.latitude,
        pickupLongitude: pickup.longitude,
        dropoffLatitude: dropoff.latitude,
        dropoffLongitude: dropoff.longitude,
        productCategoryId: category.productCategoryId,
        rideType: code,
        tripDistanceMeters: route.distanceMeters,
        tripDurationSeconds: route.durationSeconds,
        intermediateStops,
        trip: null,
        paymentType: payByCash ? RidePaymentType.Cash : RidePaymentType.Card,
      });
      if (!Array.isArray(drivers)) throw new Error('The server did not return a driver list.');

      setSearch({
        drivers: [...drivers].sort((a, b) => a.distanceToPickupMeters - b.distanceToPickupMeters).slice(0, 5),
        rideType: code, pickup, dropoff, stops: intermediateStops,
        distanceMeters: route.distanceMeters, durationSeconds: route.durationSeconds, cash: payByCash,
      });
    } catch (failure) {
      setError(message(failure, 'Driver search failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function book() {
    const driver = search?.drivers.find(({ driverId }) => driverId === selected);
    if (!search || !driver?.configurationId || booking) return;
    setBooking(true);
    setError('');

    const rideRequest: CreateRideRequest = {
      driverId: driver.driverId,
      productCategoryId: driver.productCategoryId,
      configurationId: driver.configurationId,
      rideType: search.rideType,
      pickupLatitude: search.pickup.latitude,
      pickupLongitude: search.pickup.longitude,
      pickupAddress: search.pickup.address,
      dropoffLatitude: search.dropoff.latitude,
      dropoffLongitude: search.dropoff.longitude,
      dropoffAddress: search.dropoff.address,
      distanceMeters: search.distanceMeters,
      durationSeconds: search.durationSeconds,
      trip: null,
      paymentType: search.cash ? RidePaymentType.Cash : RidePaymentType.Card,
    };

    try {
      if (loggedIn) {
        const ride = await requestRide(rideRequest, search.stops);
        navigate('/ride/' + ride.id);
        return;
      }

      const address = email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Enter your email address to book.');
      const booked = await bookCashRide(address, rideRequest, search.stops);
      setCashEmail(address);
      storeCashRide({
        rideId: booked.ride.id, token: booked.rideToken, expiresAt: booked.rideTokenExpiresAt, email: address,
      });
      // The token also travels in navigation state so the ride page works when storage is blocked.
      navigate('/ride/' + booked.ride.id, { state: { cashToken: booked.rideToken, email: address, justBooked: true } });
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 409) {
        setError(failure.message || 'This ride is no longer available. Search again.');
      } else {
        setError(message(failure, 'The ride could not be booked.'));
      }
    } finally {
      setBooking(false);
    }
  }

  const chosen = search?.drivers.find(({ driverId }) => driverId === selected);
  const step = chosen ? 4 : search ? 3 : !pickup ? 0 : !dropoff ? 1 : 2;

  return (
    <section className="book-page">
      <div className="ride-workspace">
        <form className="ride-panel" onSubmit={searchDrivers}>
          <h1>Book a ride</h1>
          <p className={'ride-pay ' + (payByCash ? 'cash' : 'card')}>
            {payByCash ? <Banknote size={18} /> : <CreditCard size={18} />}
            {payByCash ? 'Paying cash to the driver' : 'Paying by saved card'}
            {loggedIn
              ? <Link className="ride-link" to="/pay">Change</Link>
              : <Link className="ride-link" to="/login">Pay by card? Log in</Link>}
          </p>
          <ol className="ride-progress" aria-label="Booking progress">
            {['Pickup', 'Dropoff', 'Ride Type', 'Driver', 'Confirm'].map((label, index) => (
              <li key={label} aria-current={index === step ? 'step' : undefined}><span>{index + 1}</span>{label}</li>
            ))}
          </ol>
          <RouteMap points={[pickup, ...stops.map(({ point }) => point), dropoff]} geometry={geometry} />
          <fieldset disabled={busy || booking}>
            <AddressField label="Pickup" currentLocation onChange={(point) => { setPickup(point); clearResults(); }} />
            <AddressField label="Destination" near={pickup} onChange={(point) => { setDropoff(point); clearResults(); }} />
            {stops.map(({ id }, index) => (
              <div key={id}>
                <AddressField label={'Stop ' + (index + 1)} near={pickup} onChange={(point) => {
                  setStops((items) => items.map((item) => item.id === id ? { id, point } : item));
                  clearResults();
                }} />
                <button className="ride-link" type="button" onClick={() => {
                  setStops((items) => items.filter((item) => item.id !== id));
                  clearResults();
                }}>Remove stop</button>
              </div>
            ))}
            <button className="ride-link ride-add" type="button" onClick={() => {
              setStops((items) => [...items, { id: crypto.randomUUID(), point: null }]);
              clearResults();
            }}>+ Add stop</button>
            <fieldset>
              <legend>Ride type</legend>
              <div className="ride-types">
                {rideTypes.map((type) => (
                  <button key={type} type="button" aria-pressed={rideType === type}
                    className={rideType === type ? 'active' : ''}
                    onClick={() => { setRideType(type); clearResults(); }}>
                    {type === 'Rideshare' ? <Users size={19} /> : <CarFront size={19} />}{type}
                  </button>
                ))}
              </div>
              <p>{rideType === 'Taxi' ? 'Taxi pricing follows the applicable tariff.' : rideType + ' pricing uses driver rates.'}</p>
            </fieldset>
            <p className="ride-note"><Info size={19} /> You can only have one active ride at a time.</p>
            <button className="ride-submit" type="submit">{busy ? 'Finding drivers…' : 'Find available drivers'} <ArrowRight size={19} /></button>
          </fieldset>
          {error && !search && <p className="ride-error" role="alert">{error}</p>}
        </form>

        {search && (
          <section className="ride-panel ride-results" aria-labelledby="select-driver">
            <h2 id="select-driver">Select driver</h2>
            {search.drivers.length === 0 && (
              <p role="status">
                No {rideType.toLowerCase()} drivers {search.cash ? 'who accept cash ' : ''}are available near this pickup.
              </p>
            )}
            {search.drivers.map((driver) => {
              const bookable = !!driver.configurationId && !driver.requiresNegotiatedFare;
              return (
                <label className={'ride-driver' + (bookable ? '' : ' unavailable')} key={driver.driverId}>
                  <span>
                    <input type="radio" name="driver" disabled={!bookable || booking}
                      checked={selected === driver.driverId} onChange={() => setSelected(driver.driverId)} />
                    {driver.photoUrl && <img src={driver.photoUrl} alt="" width={44} height={44} />}
                    <strong>{driver.driverName || 'Driver ' + driver.driverId}</strong>
                  </span>
                  <span>{[driver.vehicleYear || null, driver.vehicleMake, driver.vehicleModel, driver.vehicleColor, driver.vehicleIdentifier].filter(Boolean).join(' · ')}</span>
                  <span>{(driver.distanceToPickupMeters / 1609.344).toFixed(1)} mi from pickup
                    {driver.estimatedPickupSeconds != null && ' · ' + Math.ceil(driver.estimatedPickupSeconds / 60) + ' min'}</span>
                  <span className="ride-fare">{driver.requiresNegotiatedFare ? 'Agreed fare required: call the provider to book'
                    : driver.estimatedFare == null ? 'Fare unavailable'
                      : driver.estimatedFare.toFixed(2) + (driver.currency ? ' ' + driver.currency : '')}</span>
                  {driver.rateMessage && <span>{driver.rateMessage}</span>}
                  {!!driver.rates?.length && (
                    <details className="ride-rates">
                      <summary>{driver.pricingBasis === 'UPFRONT' ? 'How this price is set' : 'Rates'}</summary>
                      <ul>{driver.rates.map((rate, index) => (
                        <li key={index}><span>{rate.name}</span><span>{rateText(rate)}</span></li>
                      ))}</ul>
                      {driver.fareAuthority && <small>Fare set by {driver.fareAuthority}</small>}
                    </details>
                  )}
                </label>
              );
            })}
          </section>
        )}

        {search && chosen && (
          <section className="ride-panel ride-confirm" aria-labelledby="confirm-ride">
            <h2 id="confirm-ride">Confirm</h2>
            <dl>
              <div><dt>From</dt><dd>{search.pickup.address}</dd></div>
              <div><dt>To</dt><dd>{search.dropoff.address}</dd></div>
              <div><dt>Driver</dt><dd>{chosen.driverName || 'Driver ' + chosen.driverId}</dd></div>
              <div><dt>Estimate</dt><dd>{chosen.estimatedFare != null
                ? chosen.estimatedFare.toFixed(2) + (chosen.currency ? ' ' + chosen.currency : '') : 'Shown by driver'}</dd></div>
              <div><dt>Payment</dt><dd>{search.cash ? 'Cash to the driver' : 'Saved card'}</dd></div>
            </dl>
            {!loggedIn && (
              <div className="ride-email">
                <label htmlFor="cash-email">Email</label>
                <input id="cash-email" type="email" inputMode="email" autoComplete="email" required
                  placeholder="you@example.com" value={email} disabled={booking}
                  onChange={(event) => setEmail(event.target.value)} />
                <p>Only your email is needed. We will send a link to set a password, so you can add a card and receive coupons from local providers later. Paying cash never requires it.</p>
              </div>
            )}
            {error && <p className="ride-error" role="alert">{error}</p>}
            <button className="ride-submit" type="button" onClick={book} disabled={booking}>
              {booking ? 'Booking…' : search.cash ? 'Book cash ride' : 'Book ride'} <ArrowRight size={19} />
            </button>
          </section>
        )}
      </div>
    </section>
  );
}
