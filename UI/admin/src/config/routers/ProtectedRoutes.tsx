import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { checkTokenValid } from "@/redux/thunks/auth";
import { Loader2 } from "lucide-react";

const ProtectedRoutes = () => {
    const { isLogin, token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                await dispatch(checkTokenValid(token) as any);
            }
            setIsChecking(false);
        };
        checkAuth();
    }, [dispatch, token]);

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
