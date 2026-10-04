import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './routes/guards';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ===== Placeholder បណ្តោះអាសន្ន (ជំនួសក្នុង Epic បន្ទាប់) =====
const Placeholder = ({ name }) => <div className="p-6 text-slate-500">{name} — coming soon</div>;

function HomePlaceholder() {
  const { chef, logout } = useAuth();
  const { t } = useTranslation('common');
  return (
    <div className="mx-auto max-w-md p-6">
      <p className="mb-4">👋 {chef?.displayName} ({chef?.language})</p>
      <button onClick={logout} className="h-11 rounded-xl border px-4 text-red-600">
        Logout
      </button>
      <p className="mt-4 text-xs text-slate-400">{t('language.label')}</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePlaceholder />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}