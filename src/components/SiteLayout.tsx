import { ArrowUpRight, CarFront } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export function SiteLayout() {
  return <div className="site-shell">
    <header className="site-header"><div className="container header-inner">
      <Link className="brand" to="/"><span className="brand-icon"><CarFront size={21}/></span><span>ride<span className="brand-accent">usa</span><small>BY RUNDELTA</small></span></Link>
      <nav aria-label="Main navigation"><NavLink to="/">Home</NavLink><NavLink to="/book">Book a ride</NavLink></nav>
      <Link className="header-cta" to="/book">Book now <ArrowUpRight size={17}/></Link>
    </div></header>
    <main><Outlet/></main>
    <footer className="site-footer"><div className="container footer-inner"><span>© {new Date().getFullYear()} RideUSA · Powered by RunDelta</span><span>Customer booking portal</span></div></footer>
  </div>;
}
