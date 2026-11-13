import { apiFetch } from '../infrastructure/http/apiFetch';
import type { CustomerPaymentMethod } from '../types/contracts';

/** Existing Stripe customer endpoints (api/customer-payments). Login required. */
export function getPaymentMethods(): Promise<CustomerPaymentMethod[]> {
  return apiFetch<CustomerPaymentMethod[]>('/api/customer-payments');
}
export async function createSetupIntent(): Promise<string> {
  const { clientSecret } = await apiFetch<{ clientSecret: string }>('/api/customer-payments/setup-intent', { method: 'POST' });
  return clientSecret;
}
export function syncPaymentMethods(): Promise<unknown> {
  return apiFetch('/api/customer-payments/sync', { method: 'POST' });
}
export function setDefaultPaymentMethod(id: number): Promise<unknown> {
  return apiFetch('/api/customer-payments/' + id + '/default', { method: 'PUT' });
}
export function deletePaymentMethod(id: number): Promise<unknown> {
  return apiFetch('/api/customer-payments/' + id, { method: 'DELETE' });
}

// ---- Stripe.js, loaded from Stripe's own host as Stripe requires -------------
// Only the parts of the Stripe.js surface this app calls are typed here.
interface StripeElement { mount(target: HTMLElement): void; unmount(): void }
interface StripeElements { create(type: 'payment'): StripeElement }
export interface StripeClient {
  elements(options: { clientSecret: string }): StripeElements;
  confirmSetup(options: {
    elements: StripeElements; redirect: 'if_required'; confirmParams?: { return_url: string };
  }): Promise<{ error?: { message?: string } }>;
}
declare global { interface Window { Stripe?: (publishableKey: string) => StripeClient } }

let stripePromise: Promise<StripeClient> | null = null;

function loadScript(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Card entry could not be loaded. Check your connection and try again.'));
    document.head.appendChild(script);
  });
}

export function getStripe(): Promise<StripeClient> {
  stripePromise ??= (async () => {
    const [{ publishableKey }] = await Promise.all([
      apiFetch<{ publishableKey: string | null }>('/api/StripeConfiguration'),
      loadScript(),
    ]);
    if (!publishableKey || !window.Stripe) throw new Error('Card payments are not available right now.');
    return window.Stripe(publishableKey);
  })().catch((error) => { stripePromise = null; throw error; });
  return stripePromise;
}
