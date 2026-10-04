import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingGate, ProtectedRoute, PublicOnlyRoute } from './routes/guards';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import Avatar from './components/ui/Avatar';

// ===== Home បណ្តោះអាសន្ន (ជំនួសដោយ Dashboard ក្នុង Epic 11) =====
function HomePlaceholder() {
  const { chef } = useAuth();
  return (
    <div className="mx-auto max-w-md p-6">
      <Link to="/profile" className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-card">
        <Avatar src={chef?.avatarUrl} name={chef?.displayName} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{chef?.displayName}</p>
          <p className="truncate text-sm text-slate-500">{chef?.email}</p>
        </div>
      </Link>
      <p className="mt-6 text-sm text-slate-400">Dashboard — Epic 11</p>
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
            {/* Onboarding នៅខាងក្រៅ Gate (ជៀសវាង Loop) */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<OnboardingGate />}>
              <Route path="/" element={<HomePlaceholder />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/profile/password" element={<ChangePasswordPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
