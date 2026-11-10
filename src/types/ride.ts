/** UI types only; map these to confirmed RunDelta.Contracts DTOs before live booking. */
export type RideProduct = 'taxi' | 'livery' | 'rideshare';
export interface TripDraft { pickupAddress: string; destinationAddress: string; product?: RideProduct; }
