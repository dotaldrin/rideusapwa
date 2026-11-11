import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../components/SiteLayout';
import { BookPage } from './Ride/pages/BookRide';
import  NotFoundPage from './public/NotFoundPage';

export function App() {
  return <Routes><Route element={<SiteLayout />}>
   
    <Route path="/book" element={<BookPage />} />
    <Route path="/rides" element={<Navigate to="/book" replace />} />
    <Route path="*" element={<NotFoundPage/>} />
  </Route></Routes>;
}
