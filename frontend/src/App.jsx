import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { OnboardingGate, ProtectedRoute, PublicOnlyRoute, SubscriptionGate } from './routes/guards';
import MainTabsLayout from './components/layout/MainTabsLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import PricingPage from './pages/PricingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionExpiredPage from './pages/SubscriptionExpiredPage';
import Avatar from './components/ui/Avatar';
import SubscriptionBadge from './components/subscription/SubscriptionBadge';
import UpgradePrompt from './components/subscription/UpgradePrompt';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import BillingHistoryPage from './pages/BillingHistoryPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import BillingInfoPage from './pages/BillingInfoPage';
import CatalogConfigPage from './pages/CatalogConfigPage';
import IngredientImportPage from './pages/IngredientImportPage';
import IngredientStockPage from './pages/IngredientStockPage';
import IngredientDetailPage from './pages/IngredientDetailPage';
import DashboardPage from './pages/DashboardPage';
import DishListPage from './pages/DishListPage';
import DishFormPage from './pages/DishFormPage';
import DishDetailPage from './pages/DishDetailPage';
import MenuSetListPage from './pages/MenuSetListPage';
import MenuSetFormPage from './pages/MenuSetFormPage';
import MenuSetDetailPage from './pages/MenuSetDetailPage';
import EventListPage from './pages/EventListPage';
import EventFormPage from './pages/EventFormPage';
import EventDetailPage from './pages/EventDetailPage';
import EventReportPage from './pages/EventReportPage';
import EventChecklistPage from './pages/EventChecklistPage';
import { BasketIcon } from './components/ui/Icons';

// QuickLink Component បណ្តោះអាសន្ន សម្រាប់ HomePlaceholder (ទុកជា Backup — មិនលុប)
function QuickLink({ to, icon: Icon, children }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:bg-slate-50">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon width={24} height={24} />
      </span>
      <span className="text-sm font-medium text-slate-800">{children}</span>
    </Link>
  );
}

// ===== Home បណ្តោះអាសន្ន (ជំនួសដោយ DashboardPage ក្នុង 11D — ទុកជា Backup មិនលុប; ឥឡូវមិនប្រើ) =====
// eslint-disable-next-line no-unused-vars
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

      <SubscriptionBadge className="mt-4" />

      <div className="mt-6 grid grid-cols-2 gap-4">
        <QuickLink to="/settings/catalog" icon={BasketIcon}>Catalog</QuickLink>
        <QuickLink to="/ingredients" icon={BasketIcon}>ស្តុកគ្រឿងផ្សំ</QuickLink>
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">Dashboard — Epic 11</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
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
                {/* មិនត្រូវ Lock ពេល Expired: ត្រូវតែចូលបាន ដើម្បីទិញ/ចាកចេញ */}
                {/* ទំព័រ Root "ផ្សេងៗ" — មាន Bottom Nav */}
                <Route element={<MainTabsLayout />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/profile/password" element={<ChangePasswordPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
                <Route path="/subscription-expired" element={<SubscriptionExpiredPage />} />
                <Route path="/checkout/:planId" element={<CheckoutPage />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />

                {/* ផ្នែក Billing មិនត្រូវ Lock */}
                <Route path="/billing" element={<BillingHistoryPage />} />
                <Route path="/billing/transactions/:id" element={<TransactionDetailPage />} />
                <Route path="/billing/info" element={<BillingInfoPage />} />

                {/* Expired → Lockout (ឬ View-only ប្រសិនបើ User ជ្រើស) */}
                <Route element={<SubscriptionGate />}>
                  {/* ទំព័រ Root ៤ — មាន Bottom Nav (Home/Stock/Dishes/Events) */}
                  <Route element={<MainTabsLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/ingredients" element={<IngredientStockPage />} />
                    <Route path="/dishes" element={<DishListPage />} />
                    <Route path="/events" element={<EventListPage />} />
                  </Route>

                  <Route path="/settings/catalog" element={<CatalogConfigPage />} />

                  {/* Epic 8: Ingredients */}
                  <Route path="/ingredients/browse" element={<IngredientImportPage />} />
                  <Route path="/ingredients/:id" element={<IngredientDetailPage />} />

                  {/* Epic 9: Dishes */}
                  <Route path="/dishes/new" element={<DishFormPage />} />
                  <Route path="/dishes/:id" element={<DishDetailPage />} />
                  <Route path="/dishes/:id/edit" element={<DishFormPage />} />

                  {/* Epic 10: Menu Sets */}
                  <Route path="/menu-sets" element={<MenuSetListPage />} />
                  <Route path="/menu-sets/new" element={<MenuSetFormPage />} />
                  <Route path="/menu-sets/:id" element={<MenuSetDetailPage />} />
                  <Route path="/menu-sets/:id/edit" element={<MenuSetFormPage />} />

                  {/* Epic 11–12: Events */}
                  <Route path="/events/new" element={<EventFormPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/events/:id/edit" element={<EventFormPage />} />
                  <Route path="/events/:id/report" element={<EventReportPage />} />
                  <Route path="/events/:id/checklist" element={<EventChecklistPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <UpgradePrompt />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
