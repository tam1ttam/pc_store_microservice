import { PUBLIC_ROUTES } from "@/constants/routes";
import { Login } from "@/pages";
import { RootState } from "@/redux/store";
import { checkTokenValid } from "@/redux/thunks/auth";
import { getCartCount } from "@/redux/thunks/cart";
import { viewOrder } from "@/redux/thunks/order";
import { getUserInfo } from "@/redux/thunks/user";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

function ProtectedRoutes({ children }: { children: any }) {
    const { pathname } = useLocation();
    const { isLogin, token } = useSelector((state: RootState) => state.auth);
    const [isChecking, setIsChecking] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                const { payload } = await dispatch(checkTokenValid(token) as any);

                if (payload.result.valid) {
                    const { payload: userPayload } = await dispatch(getUserInfo({ token }) as any);
                    if (userPayload.result) {
                        await Promise.all([
                            dispatch(getCartCount({ userId: userPayload.result.id }) as any),
                            dispatch(viewOrder({ userId: userPayload.result.id }) as any)
                        ]);
                    }
                }
            }
            setIsChecking(false);
        };

        checkAuth();
    }, [dispatch, token]);

    if (isChecking) {
        return null;
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
