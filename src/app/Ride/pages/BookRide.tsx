import '../styles/bookride.css';
import { AddressField, RouteMap } from '../components/RideLocations';
import { ArrowRight, CarFront, Users, Info } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { apiFetch } from '../../../infrastructure/http/apiFetch';

const rideTypes = ['Taxi', 'Livery', 'Rideshare'] as const;
type RideType = typeof rideTypes[number];
type Point = { address: string; latitude: number; longitude: number };
type Category = { name: string; productCategoryId: number };
type RoutePreview = { distanceMeters: number; durationSeconds: number; geometry?: unknown };
type Candidate = {
  driverId: number;
  driverName: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleColor: string | null;
  vehicleIdentifier: string | null;
  photoUrl: string | null;
  distanceToPickupMeters: number;
  estimatedPickupSeconds: number | null;
  estimatedFare: number | null;
  currency?: string;
  rateMessage?: string | null;
  requiresNegotiatedFare?: boolean;
};

async function post<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function BookPage() {
  const { state } = useLocation();
  const [rideType, setRideType] = useState<RideType>('Taxi');
  const [results, setResults] = useState<Candidate[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickup, setPickup] = useState<Point | null>(null);
  const [dropoff, setDropoff] = useState<Point | null>(null);
  const [stops, setStops] = useState<{ id: string; point: Point | null }[]>([]);
  const [geometry, setGeometry] = useState<unknown>(null);
  const [error, setError] = useState('');

  function clearResults() {
    setResults(null);
    setGeometry(null);
    setSelected(null);
    setError('');
  }

  async function findDrivers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    clearResults();
    setBusy(true);

    try {
      const intermediateStops = stops.flatMap(({ point }) => point ? [point] : []);
      if (!pickup || !dropoff || intermediateStops.length !== stops.length) {
        throw new Error('Select a search result for each address.');
      }
      const session = await apiFetch<{ isAuthenticated: boolean; roles: string[] }>('/api/Account/me');
      if (!session?.isAuthenticated || !session.roles.includes('Customer')) {
        throw new Error('Sign in as a Customer to find available drivers.');
      }

      const categories = await apiFetch<Category[]>('/api/ride-categories');
      const code = rideType.toUpperCase();
      const category = categories.find(({ name }) => name.trim().toUpperCase() === code);
      if (!category) throw new Error(rideType + ' is currently unavailable.');

      const route = await post<RoutePreview>('/api/ride-routes/preview', {
        pickup, dropoff, intermediateStops,
      });
      if (!Number.isFinite(route?.distanceMeters) || route.distanceMeters <= 0 ||
          !Number.isFinite(route.durationSeconds) || route.durationSeconds < 0) {
        throw new Error('The server did not return a valid route.');
      }

      setGeometry(route.geometry);
      const drivers = await post<Candidate[]>('/api/Ride/available-drivers', {
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
      });
      if (!Array.isArray(drivers)) throw new Error('The server did not return a driver list.');
      setResults([...drivers].sort((a, b) => a.distanceToPickupMeters - b.distanceToPickupMeters).slice(0, 5));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Driver search failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="book-page">
      <div className="ride-workspace">
        <form className="ride-panel" onSubmit={findDrivers}>
          <h1>Create Ride</h1>
          {typeof state?.request === 'string' && <p>{state.request}</p>}
          <ol className="ride-progress" aria-label="Booking progress">
            {['Pickup', 'Dropoff', 'Ride Type', 'Driver', 'Confirm'].map((step, index) => (
              <li key={step} aria-current={index === (results ? 3 : !pickup ? 0 : !dropoff ? 1 : 2) ? 'step' : undefined}>
                <span>{index + 1}</span>{step}
              </li>
            ))}
          </ol>
          <RouteMap points={[pickup, ...stops.map(({ point }) => point), dropoff]} geometry={geometry} />
          <fieldset disabled={busy}>
            <AddressField label="Pickup Address" currentLocation onChange={(point) => { setPickup(point); clearResults(); }} />
            <AddressField label="Dropoff Address" onChange={(point) => { setDropoff(point); clearResults(); }} />
            {stops.map(({ id }, index) => (
              <div key={id}>
                <AddressField label={'Stop ' + (index + 1)} onChange={(point) => {
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
            }}>+ Add Stop</button>
            <fieldset>
              <legend>Ride Type</legend>
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
            <button className="ride-submit" type="submit">{busy ? 'Finding drivers…' : 'Find Available Drivers'} <ArrowRight size={19} /></button>
          </fieldset>
          {error && <p role="alert">{error}</p>}
        </form>
        {results && (
          <section className="ride-panel ride-results" aria-labelledby="select-driver">
            <h2 id="select-driver">Select Driver</h2>
            {results.length === 0 && <p role="status">No {rideType.toLowerCase()} drivers are available near this pickup.</p>}
            {results.map((driver) => (
              <label className="ride-driver" key={driver.driverId}>
                <span>
                  <input type="radio" name="driver" checked={selected === driver.driverId}
                    onChange={() => setSelected(driver.driverId)} />
                  {driver.photoUrl && <img src={driver.photoUrl} alt="" width={44} height={44} />}
                  <strong>{driver.driverName || 'Driver ' + driver.driverId}</strong>
                </span>
                <span>{[driver.vehicleYear || null, driver.vehicleMake, driver.vehicleModel, driver.vehicleColor, driver.vehicleIdentifier].filter(Boolean).join(' · ')}</span>
                <span>{(driver.distanceToPickupMeters / 1609.344).toFixed(1)} mi from pickup
                  {driver.estimatedPickupSeconds != null && ' · ' + Math.ceil(driver.estimatedPickupSeconds / 60) + ' min'}</span>
                <span>{driver.requiresNegotiatedFare ? 'Agreed fare required' :
                  driver.estimatedFare == null ? 'Fare unavailable' :
                    driver.estimatedFare.toFixed(2) + (driver.currency ? ' ' + driver.currency : '')}</span>
                {driver.rateMessage && <span>{driver.rateMessage}</span>}
              </label>
            ))}
          </section>
        )}
      </div>
    </section>
  );
}
