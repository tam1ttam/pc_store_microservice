import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoutes from "./config/routers/ProtectedRoutes";
import { Toaster } from "./components/ui/toaster";
import Header from "./components/layout/Header";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "./redux/slices/cart";
import { clearVouchers, fetchAvailableVouchers } from "./redux/slices/voucher";
import { RootState } from "./redux/store";
import { useAppSelector } from "./hooks";
import SocketClient from "./SocketClient";
import SellerChatModal from "./components/SellerChatModal";
import { AiChatBubble } from "./components/ai/AiChatBubble";
import { clientRoutes } from "./config/routers/routes";
import { cartApi } from "./services/api/cartApi";
import { orderApi } from "./services/api/orderApi";
import PaymentStatusPoller from "./components/PaymentStatusPoller";

function App() {
    const dispatch = useDispatch();
    const [activeChat, setActiveChat] = useState<"ai" | "seller" | null>(null);

    const { info: user } = useSelector((state: RootState) => state.user);
    const isLogin = useAppSelector((state: RootState) => state.auth.isLogin);

    const clearCartApi = async (customerId: string) => {
        await cartApi.deleteAllCart(customerId);
    };

    // Tải danh sách voucher khi user đăng nhập / đăng xuất
    useEffect(() => {
        if (isLogin) {
            dispatch(fetchAvailableVouchers() as any);
        } else {
            dispatch(clearVouchers());
        }
    }, [isLogin]);

    return (
        <BrowserRouter>
            <PaymentStatusPoller />
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
                <AiChatBubble />
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
