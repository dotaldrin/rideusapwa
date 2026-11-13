import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../../services/session';

/** Sends visitors to the log in page. Returns true once a customer session is confirmed. */
export function useRequireCustomer(): boolean {
  const { session, isCustomer } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (session !== null && !isCustomer) navigate('/login', { replace: true });
  }, [session, isCustomer, navigate]);
  return isCustomer;
}
