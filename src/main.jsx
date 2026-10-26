import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { applyStoredTheme } from './lib/theme';
import { applySeoMetadata, normalizePath } from './lib/seo';
import { getHostRouteDestination, isAdminHostname } from './lib/adminHostRouting';
import './styles.css';

import { ToastProvider } from './components/ToastProvider';
import { PageNotFound, RouteErrorBoundary } from './components/ErrorExperience';

import Home from './pages/Home';

import {
  Services,
  ServiceDetail,
  Pricing,
  About,
  Contact,
  Legal
} from './pages/PublicPages';

import Auth, {
  Forgot,
  ResetPassword,
  AuthCallback
} from './pages/Auth';

import Protected from './components/Protected';
import AdminProtected from './components/AdminProtected';

// Code-split heavy routes for optimal Core Web Vitals (INP / TBT / FCP)
const Showcase = React.lazy(() => import('./pages/Showcase'));
const LegalPrivacy = React.lazy(() => import('./pages/LegalPrivacy'));
const LeadAssessment = React.lazy(() => import('./pages/LeadAssessment'));
const ServiceSelection = React.lazy(() => import('./pages/ServiceSelection'));

const Dashboard = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Profile = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Profile })));
const Orders = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Orders })));
const Messages = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Messages })));
const Files = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Files })));
const Payments = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Payments })));
const Notifications = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Notifications })));
const Settings = React.lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Settings })));
const AvatarOnboarding = React.lazy(() => import('./pages/AvatarOnboarding'));

const AdminGate = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminGate })));
const AdminUsers = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminUsers })));
const AdminOrders = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminOrders })));
const AdminProjects = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminProjects })));
const AdminPayments = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminPayments })));
const AdminMessages = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminMessages })));
const AdminFiles = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminFiles })));
const AdminServices = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminServices })));
const AdminReviews = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminReviews })));
const AdminNotifications = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminNotifications })));
const AdminSimple = React.lazy(() => import('./pages/Admin').then((m) => ({ default: m.AdminSimple })));
const AdminWorkspace = React.lazy(() => import('./pages/AdminWorkspace'));
const AdminShowcase = React.lazy(() => import('./pages/AdminShowcase'));
const AdminLeads = React.lazy(() => import('./pages/AdminLeads'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));


const DevShadowComparison = import.meta.env.DEV
  ? React.lazy(() => import('./pages/DevShadowComparison'))
  : null;

// Apply the saved preference synchronously as soon as the app entry module executes.
// This keeps startup theme initialization independent of the Settings route.
applyStoredTheme();

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (hash) {
        const targetId = decodeURIComponent(hash.slice(1));
        const target =
          document.getElementById(targetId) ||
          (targetId === 'how-it-works' ? document.getElementById('process') : null) ||
          (targetId === 'process' ? document.getElementById('how-it-works') : null);

        if (target) {
          const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
          target.scrollIntoView({
            block: 'start',
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
          return;
        }
      }

      window.scrollTo(0, 0);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

function TitleManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    applySeoMetadata(normalizePath(pathname));
  }, [pathname]);

  return null;
}

function HomeRoute() {
  const location = useLocation();
  const destination = getHostRouteDestination(window.location.hostname, location.pathname);

  if (destination !== location.pathname) {
    return <Navigate to={{ pathname: destination, search: location.search, hash: location.hash }} replace />;
  }

  if (isAdminHostname(window.location.hostname)) return <AdminEntry />;

  return <Home />;
}

function AdminEntry() {
  return (
    <AdminProtected>
      <AdminGate />
    </AdminProtected>
  );
}

function AdminHostRoute({ children }) {
  const location = useLocation();
  const destination = getHostRouteDestination(window.location.hostname, location.pathname);

  if (destination !== location.pathname) {
    return <Navigate to={{ pathname: destination, search: location.search, hash: location.hash }} replace />;
  }

  return children;
}

function UnknownDashboardRoute() {
  const location = useLocation();
  const destination = getHostRouteDestination(window.location.hostname, location.pathname);

  if (destination !== location.pathname) {
    return <Navigate to={{ pathname: destination, search: location.search, hash: location.hash }} replace />;
  }

  return <PageNotFound />;
}

function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC
      ===================================================== */}

      <Route
        path="/"
        element={<HomeRoute />}
      />

      <Route
        path="/services"
        element={<Services />}
      />

      <Route
        path="/showcase"
        element={<Showcase />}
      />

      <Route
        path="/services/:id"
        element={<ServiceDetail />}
      />

      <Route
        path="/pricing"
        element={<Pricing />}
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
        path="/contact"
        element={<Contact />}
      />

      <Route
        path="/privacy"
        element={<LegalPrivacy />}
      />

      <Route
        path="/privacy-policy"
        element={<LegalPrivacy />}
      />

      <Route
        path="/terms"
        element={<Legal type="terms" />}
      />

      <Route
        path="/refund"
        element={<Legal type="refund" />}
      />


      {/* =====================================================
          AUTH
      ===================================================== */}

      <Route
        path="/login"
        element={<Auth />}
      />

      <Route
        path="/signup"
        element={<Auth signup />}
      />

      <Route
        path="/forgot-password"
        element={<Forgot />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      <Route
        path="/auth/callback"
        element={<AuthCallback />}
      />

      <Route
        path="/onboarding/avatar"
        element={<AdminHostRoute><Protected requireAvatar={false}><AvatarOnboarding /></Protected></AdminHostRoute>}
      />


      {/* =====================================================
          LEAD ASSESSMENT
      ===================================================== */}

      <Route
        path="/assessment"
        element={
          <AdminHostRoute>
            <Protected><LeadAssessment /></Protected>
          </AdminHostRoute>
        }
      />

      {/* =====================================================
          SERVICE SELECTION (POST-ASSESSMENT DECISION)
      ===================================================== */}

      <Route
        path="/service-selection"
        element={
          <AdminHostRoute>
            <Protected><ServiceSelection /></Protected>
          </AdminHostRoute>
        }
      />


      {/* =====================================================
          CLIENT DASHBOARD
      ===================================================== */}

      <Route
        path="/dashboard"
        element={
          <AdminHostRoute>
            <Protected><Dashboard /></Protected>
          </AdminHostRoute>
        }
      />

      <Route
        path="/dashboard/profile"
        element={
          <AdminHostRoute>
            <Protected><Profile /></Protected>
          </AdminHostRoute>
        }
      />

      <Route
        path="/dashboard/orders"
        element={
          <AdminHostRoute>
            <Protected><Orders /></Protected>
          </AdminHostRoute>
        }
      />

      <Route
        path="/dashboard/messages"
        element={
          <AdminHostRoute>
            <Protected><Messages /></Protected>
          </AdminHostRoute>
        }
      />

      <Route
        path="/dashboard/files"
        element={
          <AdminHostRoute>
            <Protected><Files /></Protected>
          </AdminHostRoute>
        }
      />

      <Route
        path="/dashboard/payments"
        element={
          <AdminHostRoute>
            <Protected><Payments /></Protected>
          </AdminHostRoute>
        }
      />

      <Route
        path="/dashboard/notifications"
        element={
          <AdminHostRoute>
            <Protected><Notifications /></Protected>
          </AdminHostRoute>
        }
      />

      <Route
        path="/dashboard/settings"
        element={
          <AdminHostRoute>
            <Protected><Settings /></Protected>
          </AdminHostRoute>
        }
      />

      <Route path="/dashboard/*" element={<UnknownDashboardRoute />} />


      {/* =====================================================
          ADMIN
      ===================================================== */}

      <Route
        path="/admin"
        element={<AdminEntry />}
      />

      <Route
        path="/admin/workspace"
        element={
          <AdminProtected>
            <AdminWorkspace />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminProtected>
            <AdminUsers />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/leads"
        element={
          <AdminProtected>
            <AdminLeads />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <AdminProtected>
            <AdminOrders />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/projects"
        element={
          <AdminProtected>
            <AdminProjects />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <AdminProtected>
            <AdminPayments />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/messages"
        element={
          <AdminProtected>
            <AdminMessages />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/files"
        element={
          <AdminProtected>
            <AdminFiles />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/services"
        element={
          <AdminProtected>
            <AdminServices />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/showcase"
        element={
          <AdminProtected>
            <AdminShowcase />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/reviews"
        element={
          <AdminProtected>
            <AdminReviews />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/coupons"
        element={
          <AdminProtected>
            <AdminSimple title="Coupons" />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <AdminProtected>
            <AdminNotifications />
          </AdminProtected>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <AdminProtected>
            <AdminSettings />
          </AdminProtected>
        }
      />

      {import.meta.env.DEV && DevShadowComparison && (
        <Route
          path="/dev/shadow-comparison"
          element={
            <React.Suspense fallback={<div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading Comparison...</div>}>
              <DevShadowComparison />
            </React.Suspense>
          }
        />
      )}

      <Route
        path="*"
        element={<PageNotFound />}
      />

    </Routes>
  );
}


/* =========================================================
   APP ENTRY
   PRELOADER + ROUTER
   ========================================================= */

createRoot(
  document.getElementById('root')
).render(
  <>
    <BrowserRouter>
      <ToastProvider>
        <ScrollManager />
        <TitleManager />
        <RouteErrorBoundary>
          <React.Suspense fallback={<div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: 'var(--muted, #6d7069)', fontFamily: 'sans-serif', fontSize: '14px' }}>Loading…</div>}>
            <App />
          </React.Suspense>
        </RouteErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  </>
);
