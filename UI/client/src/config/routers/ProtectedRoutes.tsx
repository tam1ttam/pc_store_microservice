import { PUBLIC_ROUTES } from "@/constants/routes";
import { Login } from "@/pages";
import { RootState } from "@/redux/store";
import { clearAuth, setLogin } from "@/redux/slices/auth";
import { clearUser } from "@/redux/slices/user";
import { clearCart } from "@/redux/slices/cart";
import { setUnreadCount } from "@/redux/slices/notification";
import { getCart } from "@/redux/thunks/cart";
import { viewOrder } from "@/redux/thunks/order";
import { getUserInfo } from "@/redux/thunks/user";
import { notificationApi } from "@/services/api/notificationApi";
import { authApi } from "@/services/api/authApi";
import { setAccessToken } from "@/config/axios.config";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

// Các trang chỉ dành cho khách chưa đăng nhập
const AUTH_ONLY_PAGES = ['/login', '/register'];

function ProtectedRoutes({ children }: { children: any }) {
    const { pathname } = useLocation();
    const { isLogin } = useSelector((state: RootState) => state.auth);
    const [isChecking, setIsChecking] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Lắng nghe event khi session hết hạn (access token không thể refresh được)
    // → clear state + điều hướng về login mà KHÔNG hard reload trang
    useEffect(() => {
        const handleSessionExpired = () => {
            dispatch(clearAuth());
            dispatch(clearUser());
            dispatch(clearCart());
            navigate('/login', { replace: true });
        };
        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, [dispatch, navigate]);

    useEffect(() => {
        const restore = async () => {
            try {
                // Thử lấy access token mới từ httpOnly refresh cookie
                const res = await authApi.refreshToken();
                const token = res.data?.result?.token;
                if (token) {
                    setAccessToken(token);
                    dispatch(setLogin(true));

                    const { payload: userPayload } = await dispatch(getUserInfo({}) as any);
                    if (userPayload?.result) {
                        await Promise.all([
                            dispatch(getCart() as any),
                            dispatch(viewOrder() as any),
                        ]);
                    }

                    try {
                        const countRes = await notificationApi.getUnreadCount();
                        dispatch(setUnreadCount((countRes as any).data?.result ?? 0));
                    } catch {
                        // non-fatal
                    }
                }
            } catch {
                // Không có refresh cookie hợp lệ → chưa đăng nhập, giữ isLogin = false
            } finally {
                setIsChecking(false);
            }
        };

        restore();
    }, [dispatch]);

    if (isChecking) {
        return null;
    }

    // Người dùng đã đăng nhập mà cố vào /login hoặc /register → về trang chủ
    if (isLogin && AUTH_ONLY_PAGES.includes(pathname)) {
        return <Navigate to="/" replace />;
    }

    const isPublicRoute = PUBLIC_ROUTES.find((route: string) => {
        const pathParts = pathname.split("/");
        const routeParts = route.split("/");

        if (routeParts[routeParts.length - 1] === "*" && pathParts[0] === routeParts[0]) return true;
        if (pathParts.length === routeParts.length) {
            return routeParts.every((routePart: string, index) => pathParts[index] === routePart || routePart === "*");
        }

        return false;
    });

    if ((isLogin && !isPublicRoute) || isPublicRoute) return children;

    return <Login />;
}

export default ProtectedRoutes;
