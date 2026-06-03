import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setLogin } from "@/redux/slices/auth";
import { authApi } from "@/services/api/authApi";
import { setAccessToken } from "@/config/axios.config";
import { Loader2 } from "lucide-react";

const ProtectedRoutes = () => {
    const { isLogin } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const restore = async () => {
            try {
                // Thử lấy access token mới từ httpOnly refresh cookie
                const res = await authApi.refreshToken();
                const token = res.data?.result?.token;
                if (token) {
                    setAccessToken(token);
                    dispatch(setLogin(true));
                }
            } catch {
                // Không có refresh cookie hợp lệ → chưa đăng nhập
            } finally {
                setIsChecking(false);
            }
        };

        restore();
    }, [dispatch]);

    if (isChecking) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <Loader2 className="h-16 w-16 animate-spin text-green-400" />
            </div>
        );
    }

    return isLogin ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
