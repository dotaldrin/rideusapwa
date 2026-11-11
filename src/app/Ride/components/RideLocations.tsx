import { useEffect, useId, useRef, useState } from 'react';
import { LocateFixed, MapPin, Search } from 'lucide-react';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';
import { getMapsToken } from '../../../services/maps/azureMapsToken';

type Point = { latitude: number; longitude: number; address: string };
type Match = { address?: { freeformAddress?: string }; position?: { lat: number; lon: number } };

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

export function AddressField({ label, currentLocation, onChange }: {
  label: string;
  currentLocation?: boolean;
  onChange: (point: Point | null) => void;
}) {
  const id = useId();
  const [value, setValue] = useState('');
  const [matches, setMatches] = useState<Point[]>([]);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  function choose(point: Point) {
    setValue(point.address);
    setMatches([]);
    setStatus('');
    onChange(point);
  }

  async function search() {
    if (!value.trim() || busy) return;
    setBusy(true);
    setStatus('');
    try {
      const result = await mapsRequest<{ results?: Match[] }>('search/fuzzy/json', {
        query: value.trim(), limit: '5', countrySet: 'US',
      });
      const options = (result.results ?? []).flatMap(({ address, position }) =>
        address?.freeformAddress && position && Number.isFinite(position.lat) && Number.isFinite(position.lon)
          ? [{ address: address.freeformAddress, latitude: position.lat, longitude: position.lon }] : []);
      setMatches(options);
      if (!options.length) setStatus('No matches. Try a street address with a city or ZIP code.');
    } catch {
      setStatus('Address search is unavailable. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function locate() {
    setBusy(true);
    setStatus('');
    try {
      const { coords: { latitude, longitude } } = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
      const result = await mapsRequest<{ addresses?: Match[] }>('search/address/reverse/json', {
        query: latitude + ',' + longitude,
      });
      const address = result.addresses?.[0]?.address?.freeformAddress;
      if (!address) throw new Error('No address found');
      choose({ address, latitude, longitude });
    } catch {
      setStatus('Could not resolve your current location. Search for your pickup address.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ride-address">
      <div className="ride-label">
        <label htmlFor={id}><MapPin size={18} /> {label}</label>
        {currentLocation && <button className="ride-link" type="button" onClick={locate} disabled={busy}><LocateFixed size={16} /> Use current location</button>}
      </div>
      <div className="ride-address-input">
        <input id={id} value={value} placeholder={'Enter ' + label.toLowerCase()} readOnly={busy}
          onChange={(event) => { setValue(event.target.value); setMatches([]); setStatus(''); onChange(null); }}
          onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void search(); } }} />
        <button type="button" aria-label={'Search ' + label.toLowerCase()} onClick={search} disabled={busy || !value.trim()}><Search size={20} /></button>
      </div>
      {busy && <p role="status">Looking up address…</p>}
      {status && <p role="status">{status}</p>}
      {matches.length > 0 && <ul className="ride-matches">{matches.map((point, index) =>
        <li key={index}><button type="button" onClick={() => choose(point)}>{point.address}</button></li>)}</ul>}
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
