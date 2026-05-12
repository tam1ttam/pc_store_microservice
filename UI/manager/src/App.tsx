import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoutes from "./config/routers/ProtectedRoutes";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/layout/Header";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "./redux/slices/cart";
import { RootState } from "./redux/store";
import { useAppSelector } from "./hooks";
import SocketClient from "./SocketClient";
import ManagerChatSidebar from "./components/ManagerChatSidebar";
import { managerRoutes } from "./config/routers/routes";
import { cartApi } from "./services/api/cartApi";
import { orderApi } from "./services/api/orderApi";
import AdminLayout from "./layouts/AdminLayout";
import { Customer, OrderPage, Product } from "./pages/Admin";

function App() {
    const dispatch = useDispatch();
    const { info: user } = useSelector((state: RootState) => state.user);
    const isLogin = useAppSelector((state: RootState) => state.auth.isLogin);

    const clearCartApi = async (customerId: string) => {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        await cartApi.deleteAllCart(customerId, headers);
    };

    useEffect(() => {
        const paymentId = localStorage.getItem("paymentId");
        let timerId: any = null;

        if (paymentId && user?.id) {
            timerId = setInterval(() => {
                orderApi.getPaymentStatus(paymentId).then((res) => {
                    const status = res.data;
                    if (status && status === "approved") {
                        clearInterval(timerId);

                        localStorage.removeItem("paymentId");
                        clearCartApi(user?.id);
                        dispatch(clearCart());
                    }
                });
            }, 1000);
        }

        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [user]);

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Header />
            <ProtectedRoutes>
                <Routes>
                    {/* Admin Routes with Layout */}
                    <Route
                        path="/"
                        element={
                            <AdminLayout>
                                <Product />
                            </AdminLayout>
                        }
                    />
                    <Route
                        path="/admin/products"
                        element={
                            <AdminLayout>
                                <Product />
                            </AdminLayout>
                        }
                    />
                    <Route
                        path="/admin/customers"
                        element={
                            <AdminLayout>
                                <Customer />
                            </AdminLayout>
                        }
                    />
                    <Route
                        path="/admin/orders"
                        element={
                            <AdminLayout>
                                <OrderPage />
                            </AdminLayout>
                        }
                    />

                    {/* Other Routes */}
                    {managerRoutes.map((route) => {
                        // Skip admin routes as they're already defined above
                        if (route.path === "/" || route.path?.includes("admin")) {
                            return null;
                        }
                        return <Route key={route.path} path={route.path} element={route.element} />;
                    })}
                </Routes>
                {isLogin && <SocketClient />}
            </ProtectedRoutes>
            <Toaster />

            {isLogin && <ManagerChatSidebar />}
        </BrowserRouter>
    );
}

export default App;
