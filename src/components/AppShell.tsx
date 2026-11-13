import { CarFront, CreditCard, Settings, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../services/session';

/**
 * Full-page mobile shell: a slim top bar (card and settings icons on the left)
 * and a bottom menu. No marketing header, footer or dashboard chrome.
 */
export function AppShell() {
  const { session } = useSession();
  const loggedIn = !!session?.isAuthenticated;

  return (
    <div className="app-shell">
      <header className="app-bar">
        <div className="app-bar-actions">
          {loggedIn && <Link to="/card" aria-label="Add or edit card"><CreditCard size={22} /></Link>}
          <Link to="/settings" aria-label="Settings"><Settings size={22} /></Link>
        </div>
        <Link className="app-brand" to="/book">ride<span>usa</span></Link>
        <div className="app-bar-actions app-bar-end" />
      </header>
      <main className="app-main"><Outlet /></main>
      <nav className="app-nav" aria-label="Main">
        <NavLink to={loggedIn ? '/account' : '/login'}><UserRound size={22} /><span>{loggedIn ? 'Account' : 'Log in'}</span></NavLink>
        <NavLink to="/book"><CarFront size={22} /><span>Book ride</span></NavLink>
        <NavLink to="/settings"><Settings size={22} /><span>Settings</span></NavLink>
      </nav>
    </div>
  );
}
