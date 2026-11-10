import { ArrowRight, Clock3, MapPinned, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TripDraftForm } from '../features/booking/TripDraftForm';

export function HomePage() {
  return <><section className="hero"><div className="container hero-grid">
    <div className="hero-copy"><span className="hero-pill"><span className="status-dot"/> A better way to move</span><h1>Your city.<br/>Your plans.<br/><em>Your ride.</em></h1><p className="hero-description">Wherever today takes you, RideUSA makes getting there feel simple. Plan your pickup and get moving.</p><Link to="/book" className="text-link">Plan your next trip <ArrowRight size={19}/></Link>
      <div className="hero-stats"><div><strong>One place</strong><span>to plan your ride</span></div><div><strong>More freedom</strong><span>to go your way</span></div></div>
    </div><TripDraftForm/>
  </div><div className="hero-glow" aria-hidden="true"/></section>
  <section className="benefits"><div className="container benefit-grid"><article><MapPinned/><h3>Simple pickup</h3><p>Start with your location and choose where you want to go.</p></article><article><Clock3/><h3>Made for your schedule</h3><p>Plan now, with scheduled rides coming as integration progresses.</p></article><article><ShieldCheck/><h3>RunDelta platform</h3><p>A dedicated customer experience built on shared ride services.</p></article></div></section></>;
}
