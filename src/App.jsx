import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import { useInitializeCategories } from './hooks/useInitializeCategories.js';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.jsx'));
const Schedules = lazy(() => import('./pages/schedule/Schedules.jsx'));
const Services = lazy(() => import('./pages/services/Services.jsx'));
const StaffManagement = lazy(() => import('./pages/Staff.jsx'));
const HistoryView = lazy(() => import('./pages/History.jsx'));
const Kanban = lazy(() => import('./pages/kanban/Kanban.jsx'));
const Customers = lazy(() => import('./pages/Customers.jsx'));
const IntegrationsPage = lazy(() => import('./pages/Integrations.jsx'));
const Inquiries = lazy(() => import('./pages/inquiries/Inquiries.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

/** Require authentication + valid role. Redirects to /login if not authed. */
const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfcfc] dark:bg-[#141414]">
                <div className="w-8 h-8 border-2 border-[#F26389] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

/** Redirect already-authenticated users away from the login page. */
const PublicRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fdfcfc] dark:bg-[#141414]">
                <div className="w-8 h-8 border-2 border-[#F26389] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

const AppRoutes = () => {
    useInitializeCategories();

    return (
        <Routes>
            {/* Public Route - login page */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<AuthPage />} />
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/*" element={<AppLayout />}>
                    <Route path="dashboard" index element={<Dashboard />} />
                    <Route path="calendar" element={<Schedules />} />
                    <Route path="services" element={<Services />} />
                    <Route path="staff" element={<StaffManagement />} />
                    <Route path="history" element={<HistoryView />} />
                    <Route path="kanban" element={<Kanban />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="integrations" element={<IntegrationsPage />} />
                    <Route path="inquiries" element={<Inquiries />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#fdfcfc] dark:bg-[#141414]">
                    <div className="w-8 h-8 border-2 border-[#F26389] border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <AppRoutes />
            </Suspense>
        </AuthProvider>
    </BrowserRouter>
);

export default App;