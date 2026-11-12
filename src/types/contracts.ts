/**
 * TypeScript mirrors of RunDelta.Contracts. The API serializes property names in
 * camelCase and enums as numbers, so every enum here carries the backend's value.
 * Only the fields this app reads or sends are declared.
 */

/** RunDelta.Contracts.Enums.RideStatus */
export const RideStatus = {
  Pending: 0,
  Created: 10,
  Assigned: 20,
  EnRouteToPickup: 30,
  ArrivedAtPickup: 40,
  InProgress: 50,
  Paused: 55,
  Completed: 60,
  Cancelled: 70,
  Failed: 80,
} as const;
export type RideStatusValue = (typeof RideStatus)[keyof typeof RideStatus];

/** RunDelta.Contracts.Enums.RidePaymentType */
export const RidePaymentType = { Card: 0, Cash: 1 } as const;
export type RidePaymentTypeValue = (typeof RidePaymentType)[keyof typeof RidePaymentType];

/** RunDelta.Contracts.DTO.Ride.RequestRideStopInput */
export interface RideStopInput {
  latitude: number;
  longitude: number;
  address: string;
}

/** RunDelta.Contracts.Responses.Operations.RideCategoryResponse */
export interface RideCategory {
  productCategoryId: number;
  name: string;
  description?: string | null;
}

/** RunDelta.API PreparedRideItinerary (route preview response) */
export interface RoutePreview {
  distanceMeters: number;
  durationSeconds: number;
  geometry?: unknown;
}

/** RunDelta.Contracts.DTO.NearbyDriversQueryDto */
export interface NearbyDriversQuery {
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  productCategoryId: number;
  rideType: RideTypeCode;
  tripDistanceMeters: number;
  tripDurationSeconds: number;
  intermediateStops: RideStopInput[];
  trip: null;
  paymentType: RidePaymentTypeValue;
}

/** RunDelta.Contracts.DTO.DriverRideOptionDto */
export interface DriverRideOption {
  driverId: number;
  driverName: string | null;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehicleColor: string | null;
  vehicleIdentifier: string | null;
  photoUrl: string | null;
  configurationId: number | null;
  productCategoryId: number | null;
  rideType: string | null;
  distanceToPickupMeters: number;
  estimatedPickupSeconds: number | null;
  estimatedFare: number | null;
  currency?: string;
  rateMessage?: string | null;
  requiresNegotiatedFare?: boolean;
  acceptsCash?: boolean;
}

export type RideTypeCode = 'TAXI' | 'LIVERY' | 'RIDESHARE';

/** RunDelta.Contracts.DTO.CreateRideRequestDto */
export interface CreateRideRequest {
  driverId: number;
  productCategoryId: number | null;
  configurationId: number;
  rideType: RideTypeCode;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropoffLatitude: number;
  dropoffLongitude: number;
  dropoffAddress: string;
  distanceMeters: number;
  durationSeconds: number;
  trip: null;
  paymentType: RidePaymentTypeValue;
}

/** RunDelta.Contracts.DTO.RideTransactionDto */
export interface RideTransaction {
  id: number;
  status: RideStatusValue;
  paymentType: RidePaymentTypeValue;
  rideType?: string | null;
  currency?: string | null;
  driverName?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  vehicleColor?: string | null;
  vehicleIdentifier?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  estimatedDistanceMiles: number;
  estimatedFare?: number | null;
  estimatedTravelTimeSeconds: number;
  actualFare?: number | null;
  chargedAmount: number;
  cancellationReason?: string | null;
  requestedAt: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  expiresAt?: string | null;
}

/** RunDelta.Contracts.DTO.CashRide.CashRideResponseDto */
export interface CashRideResponse {
  ride: RideTransaction;
  rideToken: string;
  rideTokenExpiresAt: string;
  passwordEmailSent: boolean;
}

/** RunDelta.Contracts.DTO.AccountSessionDto (and AnonymousSessionResponse) */
export interface AccountSession {
  isAuthenticated: boolean;
  userId?: string;
  email?: string | null;
  emailConfirmed?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  roles?: string[];
}

/** RunDelta.Contracts.DTO.CustomerPaymentMethodDto */
export interface CustomerPaymentMethod {
  customerPaymentMethodId: number;
  brand: string;
  last4: string;
  expirationMonth: number;
  expirationYear: number;
  isDefault: boolean;
  priority: number;
}

/** RunDelta.Contracts.DTO.CashRide.CustomerActivateResultDto */
export interface CustomerActivateResult {
  succeeded: boolean;
  email?: string | null;
  errors: string[];
}
