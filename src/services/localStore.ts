/**
 * Small per-device conveniences only. Storage can be unavailable (private mode,
 * blocked cookies), so every access is guarded and the app works without it.
 */
function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* storage unavailable: the value simply is not remembered */ }
}

export type PaymentPreference = 'cash' | 'card';
const PREFERENCE_KEY = 'rideusa.paymentPreference';
const CASH_RIDE_KEY = 'rideusa.cashRide';
const EMAIL_KEY = 'rideusa.cashEmail';

export function getPaymentPreference(): PaymentPreference | null {
  const value = read(PREFERENCE_KEY);
  return value === 'cash' || value === 'card' ? value : null;
}
export function setPaymentPreference(value: PaymentPreference | null): void {
  write(PREFERENCE_KEY, value);
}

/** The ride token a visitor received for their cash booking. One ride at a time. */
export interface StoredCashRide { rideId: number; token: string; expiresAt: string; email: string }

export function getStoredCashRide(): StoredCashRide | null {
  const raw = read(CASH_RIDE_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredCashRide>;
    if (typeof value.rideId !== 'number' || typeof value.token !== 'string' ||
        typeof value.expiresAt !== 'string' || typeof value.email !== 'string') return null;
    if (Date.parse(value.expiresAt) <= Date.now()) { write(CASH_RIDE_KEY, null); return null; }
    return value as StoredCashRide;
  } catch { return null; }
}
export function storeCashRide(value: StoredCashRide | null): void {
  write(CASH_RIDE_KEY, value ? JSON.stringify(value) : null);
}

/** Remembered so a returning cash rider does not retype their email. */
export function getCashEmail(): string { return read(EMAIL_KEY) ?? ''; }
export function setCashEmail(value: string): void { write(EMAIL_KEY, value || null); }
