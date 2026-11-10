import { useState, type FormEvent } from 'react';
import { ArrowRight, MapPin, Navigation, Route } from 'lucide-react';

type Draft = {pickup: string; dropoff: string; when: 'now' | 'later'};

export function TripDraftForm() {
  const [trip, setTrip] = useState<Draft>({ pickup: '', dropoff: '', when: 'now' });
  const [reviewing, setReviewing] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setReviewing(true); };
  return <form className="trip-card" onSubmit={submit}>
    <div className="trip-heading"><span className="eyebrow">YOUR JOURNEY</span><h2>Where can we take you?</h2><p>Choose your route to get started.</p></div>
    <div className="trip-tabs" role="group" aria-label="Pickup time">
      <button type="button" className={trip.when === 'now' ? 'active' : ''} onClick={() => { setTrip(v=>({...v,when:'now'}));setReviewing(false); }}>Ride now</button>
      <button type="button" className={trip.when === 'later' ? 'active' : ''} onClick={() => { setTrip(v=>({...v,when:'later'}));setReviewing(false); }}>Schedule later</button>
    </div>
    <label className="field"><span><Navigation size={17}/> Pickup location</span><input required autoComplete="street-address" placeholder="Enter pickup address" value={trip.pickup} onChange={e=>{setTrip(v=>({...v,pickup:e.target.value}));setReviewing(false);}}/></label>
    <label className="field"><span><MapPin size={17}/> Destination</span><input required placeholder="Where are you going?" value={trip.dropoff} onChange={e=>{setTrip(v=>({...v,dropoff:e.target.value}));setReviewing(false);}}/></label>
    {trip.when === 'later' && <p className="form-note">Scheduled pickup times will be available when the booking API is connected.</p>}
    <button type="submit" className="primary-button">Review trip <ArrowRight size={19}/></button>
    {reviewing && <div className="draft-review" role="status"><Route size={18}/><div><strong>Trip draft ready</strong><p>{trip.pickup} → {trip.dropoff}</p><p>Live estimates and ride requests are not yet connected. No booking has been submitted.</p></div></div>}
    <p className="form-footnote">No payment or booking is processed on this preview.</p>
  </form>;
}
