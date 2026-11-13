import { apiFetch } from '../infrastructure/http/apiFetch';
import type { CustomerActivateResult } from '../types/contracts';

/** Sends the forgot-password email. The API answers the same whether or not the email has an account. */
export function sendPasswordLink(email: string): Promise<void> {
  return apiFetch<void>('/api/customer-onboarding/password-link', {
    method: 'POST', body: JSON.stringify({ email: email.trim() }),
  });
}

/** Sets the password from the emailed link; this also confirms the email address. */
export function activateAccount(userId: string, code: string, newPassword: string): Promise<CustomerActivateResult> {
  return apiFetch<CustomerActivateResult>('/api/customer-onboarding/activate', {
    method: 'POST', body: JSON.stringify({ userId, code, newPassword }),
  });
}
