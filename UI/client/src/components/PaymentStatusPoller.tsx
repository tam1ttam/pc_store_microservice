import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/redux/store';
import { clearCart } from '@/redux/slices/cart';
import { orderApi } from '@/services/api/orderApi';
import { cartApi } from '@/services/api/cartApi';

const PaymentStatusPoller = () => {
    const dispatch = useDispatch();
    const { info: user } = useSelector((state: RootState) => state.user);
    const location = useLocation();

    useEffect(() => {
        // Only poll if we are NOT on the checkout page
        // and we are not on the cart page
        if (location.pathname === '/checkout' || location.pathname === '/cart') return;

        const paymentId = localStorage.getItem("paymentId");
        if (!paymentId || !user?.id) return;

        const timerId = setInterval(() => {
            orderApi.getPaymentStatus(paymentId).then((res) => {
                const status = res.data;
                if (status && status === "approved") {
                    localStorage.removeItem("paymentId");
                    cartApi.deleteAllCart(user?.id);
                    dispatch(clearCart());
                }
            }).catch(err => console.error("Payment polling error:", err));
        }, 10000); // Polling every 10 seconds to be very safe

        return () => clearInterval(timerId);
    }, [user, location.pathname, dispatch]);

    return null;
};

export default PaymentStatusPoller;
