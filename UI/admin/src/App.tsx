import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoutes from "./config/routers/ProtectedRoutes";
import { Toaster } from "./components/ui/toaster";
import AdminLayout from "./layouts/AdminLayout";
import { Login, NotFound } from "./pages";
import ServiceHealth from "./pages/Admin/ServiceHealth";
import LogTracking from "./pages/Admin/LogTracking";
import UserManagement from "./pages/Admin/UserManagement";
import AuditTrail from "./pages/Admin/AuditTrail";
import Dashboard from "./pages/Admin/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoutes />}>
                    <Route
                        path="/"
                        element={
                            <AdminLayout>
                                <Dashboard />
                            </AdminLayout>
                        }
                    />
                    <Route
                        path="/service-health"
                        element={
                            <AdminLayout>
                                <ServiceHealth />
                            </AdminLayout>
                        }
                    />
                    <Route
                        path="/log-tracking"
                        element={
                            <AdminLayout>
                                <LogTracking />
                            </AdminLayout>
                        }
                    />
                    <Route
                        path="/user-management"
                        element={
                            <AdminLayout>
                                <UserManagement />
                            </AdminLayout>
                        }
                    />
                    <Route
                        path="/audit-trail"
                        element={
                            <AdminLayout>
                                <AuditTrail />
                            </AdminLayout>
                        }
                    />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
}

export default App;
