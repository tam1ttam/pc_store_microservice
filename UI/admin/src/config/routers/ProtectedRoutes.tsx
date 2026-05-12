import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/config/api";
import { clearToken } from "@/redux/authSlice";
import { Loader2 } from "lucide-react";

const ProtectedRoutes = () => {
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const [isValid, setIsValid] = useState<boolean | null>(null);

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsValid(false);
                return;
            }

            try {
                const response = await api.post("/admin/auth/introspect", { token });
                if (response.data.result.valid) {
                    setIsValid(true);
                } else {
                    dispatch(clearToken());
                    setIsValid(false);
                }
            } catch (error) {
                console.error("Introspection failed", error);
                dispatch(clearToken());
                setIsValid(false);
            }
        };

        verifyToken();
    }, [token, dispatch]);

    if (isValid === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <Loader2 className="h-16 w-16 animate-spin text-green-400" />
            </div>
        );
    }

    return isValid ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;