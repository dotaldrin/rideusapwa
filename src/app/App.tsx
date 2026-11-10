import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from '../components/SiteLayout';
import { HomePage } from '../pages/HomePage';
import { BookPage } from '../pages/BookPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function App() {
  return <Routes><Route element={<SiteLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/book" element={<BookPage />} />
    <Route path="/rides" element={<Navigate to="/book" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}
