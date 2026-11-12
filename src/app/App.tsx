import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { BookPage } from './Ride/pages/BookRide';
import { RidePage } from './Ride/pages/RidePage';
import { LoginPage } from './Account/pages/LoginPage';
import { ResetPasswordPage } from './Account/pages/ResetPasswordPage';
import { PaymentChoicePage } from './Account/pages/PaymentChoicePage';
import { CardPage } from './Account/pages/CardPage';
import { AccountPage } from './Account/pages/AccountPage';
import { SettingsPage } from './Account/pages/SettingsPage';
import NotFoundPage from './public/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/book" replace />} />
        <Route path="/book" element={<BookPage />} />
        <Route path="/rides" element={<Navigate to="/book" replace />} />
        <Route path="/ride/:rideId" element={<RidePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pay" element={<PaymentChoicePage />} />
        <Route path="/card" element={<CardPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
