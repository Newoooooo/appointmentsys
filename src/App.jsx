import React, {lazy, Suspense} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';

const LandingPage = lazy(() => import('./pages/Landing.jsx'));
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

const App = () => {

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />

                {/* Protected Dashboard Routes */}
                <Route path="/*" element={<AppLayout />}>
                    <Route path="dashboard" index element={<Dashboard />} />
                    <Route path="calendar" element={<Schedules />} />
                    <Route path="services" element={<Services />} />
                    <Route path="staff" element={<StaffManagement />} />
                    <Route path="history" element={<HistoryView />} />
                    <Route path="kanban" element={<Kanban/>} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="integrations" element={<IntegrationsPage />} />
                    <Route path="inquiries" element={<Inquiries />} />
                    <Route path="settings" element={<Settings />} />
                </Route>

                {/* 404 Redirect */}
                <Route path="*" element={<NotFound/>} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;