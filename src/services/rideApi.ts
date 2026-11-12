import { ApiError } from '../infrastructure/http/apiError';
import { apiFetch } from '../infrastructure/http/apiFetch';
import type {
  CashRideResponse, CreateRideRequest, DriverRideOption, NearbyDriversQuery,
  RideCategory, RideStopInput, RideTransaction, RoutePreview, Taxicard,
} from '../types/contracts';

/**
 * Two callers, one set of functions.
 *  - Visitor (not logged in): the anonymous api/cash-rides endpoints. Cash only.
 *  - Logged-in customer: the existing customer endpoints, cash or card.
 */
function post<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), headers });
}

const cashRideAuth = (token: string): HeadersInit => ({ Authorization: 'CashRide ' + token });

export function getCategories(loggedIn: boolean): Promise<RideCategory[]> {
  return apiFetch<RideCategory[]>(loggedIn ? '/api/ride-categories' : '/api/cash-rides/categories');
}

export function previewRoute(
  loggedIn: boolean, pickup: RideStopInput, dropoff: RideStopInput, intermediateStops: RideStopInput[],
): Promise<RoutePreview> {
  return post<RoutePreview>(loggedIn ? '/api/ride-routes/preview' : '/api/cash-rides/route-preview',
    { pickup, dropoff, intermediateStops });
}

export function findDrivers(loggedIn: boolean, query: NearbyDriversQuery): Promise<DriverRideOption[]> {
  return post<DriverRideOption[]>(loggedIn ? '/api/Ride/available-drivers' : '/api/cash-rides/available-drivers', query);
}

/** Logged-in customer: cash or card, decided by rideRequest.paymentType. */
export function requestRide(rideRequest: CreateRideRequest, intermediateStops: RideStopInput[]): Promise<RideTransaction> {
  return post<RideTransaction>('/api/ride-routes/requests', { rideRequest, intermediateStops });
}

/** Visitor: cash ride with only an email. */
export function bookCashRide(
  email: string, rideRequest: CreateRideRequest, intermediateStops: RideStopInput[],
): Promise<CashRideResponse> {
  return post<CashRideResponse>('/api/cash-rides', { email, rideRequest, intermediateStops });
}

export function getRide(rideId: number, cashToken?: string): Promise<RideTransaction> {
  return cashToken
    ? apiFetch<RideTransaction>('/api/cash-rides/' + rideId, { headers: cashRideAuth(cashToken) })
    : apiFetch<RideTransaction>('/api/RideTransaction/' + rideId);
}

/**
 * The live fare card for a ride, or null when the ride has none (rides priced from
 * the driver's own rates have no card, and the API answers 404 for those).
 */
export async function getTaxicard(rideId: number, cashToken?: string): Promise<Taxicard | null> {
  try {
    const card = cashToken
      ? await apiFetch<Taxicard | undefined>('/api/cash-rides/' + rideId + '/taxicard', { headers: cashRideAuth(cashToken) })
      : await apiFetch<Taxicard | undefined>('/api/RideTransaction/' + rideId + '/taxicard');
    return card ?? null;
  } catch (failure) {
    if (failure instanceof ApiError && failure.status === 404) return null;
    throw failure;
  }
}

export function cancelRide(rideId: number, reason: string, cashToken?: string): Promise<RideTransaction> {
  return cashToken
    ? post<RideTransaction>('/api/cash-rides/' + rideId + '/cancel', { reason }, cashRideAuth(cashToken))
    : post<RideTransaction>('/api/RideTransaction/' + rideId + '/cancel', { reason });
}

/** 204 (undefined) when the customer has no ride in progress. */
export function getActiveRide(): Promise<RideTransaction | undefined> {
  return apiFetch<RideTransaction | undefined>('/api/RideTransaction/active');
}

export function getHistory(take = 10): Promise<RideTransaction[]> {
  return apiFetch<RideTransaction[]>('/api/RideTransaction/history?take=' + take);
}
