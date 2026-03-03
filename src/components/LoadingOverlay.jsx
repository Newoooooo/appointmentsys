import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

const LandingPage = lazy(() => import('../pages/Landing.jsx'));
const AuthPage = lazy(() => import('../pages/AuthPage.jsx'));
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard.jsx'));
const CalendarView = lazy(() => import('../pages/schedule/Schedules.jsx'));
const ServicesManagement = lazy(() => import('../pages/services/Services.jsx'));
const StaffManagement = lazy(() => import('../pages/Staff.jsx'));
const HistoryView = lazy(() => import('../pages/History.jsx'));
const KanbanPage = lazy(() => import('../pages/kanban/Kanban.jsx'));
const Customers = lazy(() => import('../pages/Customers.jsx'));
const IntegrationsPage = lazy(() => import('../pages/Integrations.jsx'));
const InquiriesPage = lazy(() => import('../pages/inquiries/Inquiries.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

const App = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingOverlay />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<AuthPage />} />

                    {/* Protected Dashboard Routes */}
                    <Route path="/*" element={<AppLayout />}>
                        <Route path="dashboard" index element={<Dashboard />} />
                        <Route path="calendar" element={<CalendarView />} />
                        <Route path="services" element={<ServicesManagement />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="history" element={<HistoryView />} />
                        <Route path="kanban" element={<KanbanPage />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="integrations" element={<IntegrationsPage />} />
                        <Route path="inquiries" element={<InquiriesPage />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default App;