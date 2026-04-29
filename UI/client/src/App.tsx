import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoutes from "./config/routers/ProtectedRoutes";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/layout/Header";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "./redux/slices/cart";
import { RootState } from "./redux/store";
import { useAppSelector } from "./hooks";
import SocketClient from "./SocketClient";
import AIChatModal from "./components/AIChatModal";
import SellerChatModal from "./components/SellerChatModal";
import { clientRoutes } from "./config/routers/routes";
import { cartApi } from "./services/api/cartApi";
import { orderApi } from "./services/api/orderApi";

function App() {
    const dispatch = useDispatch();
    const [activeChat, setActiveChat] = useState<"ai" | "seller" | null>(null);

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
                    {clientRoutes.map((route) => (
                        <Route key={route.path} path={route.path} element={route.element} />
                    ))}
                </Routes>
                {isLogin && <SocketClient />}
            </ProtectedRoutes>
            <Toaster />

            <div className="flex">
                <AIChatModal
                    isOpen={activeChat === "ai"}
                    onOpen={() => setActiveChat("ai")}
                    onClose={() => setActiveChat(null)}
                    isHidden={activeChat === "seller"}
                />
                <SellerChatModal
                    isOpen={activeChat === "seller"}
                    onOpen={() => setActiveChat("seller")}
                    onClose={() => setActiveChat(null)}
                    isHidden={activeChat === "ai"}
                />
            </div>
        </BrowserRouter>
    );
}

export default App;
