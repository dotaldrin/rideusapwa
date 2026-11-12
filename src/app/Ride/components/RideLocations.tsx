import { useEffect, useId, useRef, useState } from 'react';
import { Building2, GraduationCap, Hospital, LocateFixed, MapPin, Plane, Search } from 'lucide-react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { getMapsToken } from '../../../services/maps/azureMapsToken';

export type Point = { latitude: number; longitude: number; address: string; name?: string; kind?: PlaceKind };
export type PlaceKind = 'airport' | 'hospital' | 'school' | 'business' | 'address';
type Match = {
  type?: string;
  poi?: { name?: string; categories?: string[] };
  address?: { freeformAddress?: string };
  position?: { lat: number; lon: number };
};

async function mapsRequest<T>(path: string, query: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const { accessToken, clientId } = await getMapsToken();
  const params = new URLSearchParams({ 'api-version': '1.0', ...query });
  const response = await fetch('https://atlas.microsoft.com/' + path + '?' + params, {
    signal,
    headers: { Authorization: 'Bearer ' + accessToken, 'x-ms-client-id': clientId },
  });
  if (!response.ok) throw new Error('Azure Maps could not complete the address lookup.');
  return response.json() as Promise<T>;
}

function placeKind(match: Match): PlaceKind {
  if (match.type !== 'POI') return 'address';
  const categories = (match.poi?.categories ?? []).join(' ').toLowerCase();
  if (categories.includes('airport')) return 'airport';
  if (/hospital|clinic|medical|health|emergency|doctor|pharmacy/.test(categories)) return 'hospital';
  if (/school|university|college/.test(categories)) return 'school';
  return 'business';
}

function toPoint(match: Match): Point | null {
  const { address, position, poi } = match;
  if (!address?.freeformAddress || !position || !Number.isFinite(position.lat) || !Number.isFinite(position.lon)) return null;
  const name = poi?.name?.trim();
  return {
    // The driver sees this text, so a named place keeps its name in front of the street address.
    address: name ? name + ', ' + address.freeformAddress : address.freeformAddress,
    latitude: position.lat,
    longitude: position.lon,
    name: name || undefined,
    kind: placeKind(match),
  };
}

const kindIcon = { airport: Plane, hospital: Hospital, school: GraduationCap, business: Building2, address: MapPin };
const kindLabel = { airport: 'Airport', hospital: 'Medical', school: 'School', business: 'Business', address: 'Address' };

/**
 * Address box with suggestions as you type. It searches street addresses and
 * named places together (businesses, hospitals, airports, schools), so a rider can
 * type "Mercy Hospital" or "Walmart" instead of a street address. Results are
 * biased toward `near` (the pickup, or the rider's location) when it is known.
 */
export function AddressField({ label, currentLocation, near, onChange }: {
  label: string;
  currentLocation?: boolean;
  near?: { latitude: number; longitude: number } | null;
  onChange: (point: Point | null) => void;
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const [matches, setMatches] = useState<Point[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const chosen = useRef('');
  const nearLat = near?.latitude;
  const nearLon = near?.longitude;

  function choose(point: Point) {
    chosen.current = point.address;
    setValue(point.address);
    setMatches([]);
    setStatus('');
    onChange(point);
  }

  // Search shortly after the rider stops typing; a newer keystroke cancels the older request.
  useEffect(() => {
    const query = value.trim();
    if (query.length < 3 || query === chosen.current) { setBusy(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setBusy(true);
      try {
        const bias: Record<string, string> = nearLat != null && nearLon != null
          ? { lat: String(nearLat), lon: String(nearLon), radius: '80000' } : {};
        const result = await mapsRequest<{ results?: Match[] }>('search/fuzzy/json', {
          query, limit: '7', countrySet: 'US', typeahead: 'true', ...bias,
        }, controller.signal);
        const options = (result.results ?? []).flatMap((match) => { const point = toPoint(match); return point ? [point] : []; });
        setMatches(options);
        setStatus(options.length ? '' : 'No matches. Try a business name, or a street address with a city or ZIP code.');
      } catch (failure) {
        if (failure instanceof DOMException && failure.name === 'AbortError') return;
        setMatches([]);
        setStatus('Search is unavailable. Try again.');
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [value, nearLat, nearLon]);

  async function locate() {
    setLocating(true);
    setStatus('');
    try {
      const { coords: { latitude, longitude } } = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
      const result = await mapsRequest<{ addresses?: Match[] }>('search/address/reverse/json', {
        query: latitude + ',' + longitude,
      });
      const address = result.addresses?.[0]?.address?.freeformAddress;
      if (!address) throw new Error('No address found');
      choose({ address, latitude, longitude, kind: 'address' });
    } catch {
      setStatus('Could not find your current location. Type your pickup address instead.');
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="ride-address">
      <div className="ride-label">
        <label htmlFor={id}><MapPin size={18} /> {label}</label>
        {currentLocation && <button className="ride-link" type="button" onClick={locate} disabled={locating}><LocateFixed size={16} /> {locating ? 'Locating…' : 'Use current location'}</button>}
      </div>
      <div className="ride-address-input">
        <input id={id} value={value} autoComplete="off" inputMode="search" enterKeyHint="search"
          placeholder={currentLocation ? 'Enter pickup address' : 'Business, hospital, airport or address'}
          aria-autocomplete="list" aria-expanded={matches.length > 0}
          onChange={(event) => { chosen.current = ''; setValue(event.target.value); setMatches([]); setStatus(''); onChange(null); }}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (matches[0]) choose(matches[0]); } }} />
        <span className="ride-address-icon" aria-hidden="true"><Search size={20} /></span>
      </div>
      {busy && <p role="status">Searching…</p>}
      {status && !busy && <p role="status">{status}</p>}
      {matches.length > 0 && <ul className="ride-matches">{matches.map((point, index) => {
        const Icon = kindIcon[point.kind ?? 'address'];
        return (
          <li key={index}><button type="button" onClick={() => choose(point)}>
            <Icon size={18} aria-hidden="true" />
            <span><strong>{point.name ?? point.address}</strong>
              <small>{point.name ? point.address.slice(point.name.length + 2) + ' · ' : ''}{kindLabel[point.kind ?? 'address']}</small></span>
          </button></li>
        );
      })}</ul>}
    </div>
  );
}

export function RouteMap({ points, geometry }: { points: (Point | null)[]; geometry: unknown }) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<atlas.Map | null>(null);
  const source = useRef<atlas.source.DataSource | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const token = await getMapsToken();
        if (cancelled || !host.current) return;
        const instance = new atlas.Map(host.current, {
          center: [-96, 38], zoom: 3,
          authOptions: {
            authType: atlas.AuthenticationType.anonymous,
            clientId: token.clientId,
            getToken: (resolve, reject) => {
              void getMapsToken().then(({ accessToken }) => resolve(accessToken), reject);
            },
          },
        });
        map.current = instance;
        instance.events.add('ready', () => {
          if (cancelled) return;
          const data = new atlas.source.DataSource();
          instance.sources.add(data);
          instance.layers.add(new atlas.layer.LineLayer(data, undefined, { strokeColor: '#08243b', strokeWidth: 4 }));
          source.current = data;
          setReady(true);
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }
    void initialize();
    return () => { cancelled = true; map.current?.dispose(); map.current = null; source.current = null; };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!ready || !instance || !source.current) return;
    const positions = points.flatMap((point) => point ? [[point.longitude, point.latitude]] : []);
    const markers = positions.map((position) => new atlas.HtmlMarker({ position, color: '#008eaa' }));
    markers.forEach((marker) => instance.markers.add(marker));
    source.current.clear();
    let route: unknown = geometry;
    if (typeof route === 'string') {
      try { route = JSON.parse(route); } catch { route = null; }
    }
    if (route && typeof route === 'object' && 'type' in route && 'coordinates' in route &&
        (route.type === 'LineString' || route.type === 'MultiLineString')) {
      source.current.add(new atlas.data.Feature(route as atlas.data.LineString | atlas.data.MultiLineString));
    }
    if (positions.length === 1) instance.setCamera({ center: positions[0], zoom: 14 });
    if (positions.length > 1) instance.setCamera({ bounds: atlas.data.BoundingBox.fromPositions(positions), padding: 40 });
    return () => { if (map.current === instance) markers.forEach((marker) => instance.markers.remove(marker)); };
  }, [ready, points, geometry]);

  return <div className="ride-map"><div ref={host} className="ride-map-canvas" aria-label="Trip map" />{failed && <p role="status">Map unavailable. You can still search for drivers.</p>}</div>;
}
