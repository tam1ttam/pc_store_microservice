import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ENDPOINTS } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { getCart } from "@/redux/thunks/cart";
import { viewOrder } from "@/redux/thunks/order";
import { post } from "@/services/api.service";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PaymentResult = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const responseCode = searchParams.get("vnp_ResponseCode");
    const isSuccess = responseCode === "00";
    const [isProcessing, setIsProcessing] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();
    const orderProcessed = useRef(false);

    useEffect(() => {
        const createOrder = async () => {
            if (orderProcessed.current) return;

            try {
                if (isSuccess && token && document.cookie.split("; ").find((row) => row.startsWith("orderInfo="))) {
                    orderProcessed.current = true;
                    const orderInfoCookie = document.cookie.split("; ").find((row) => row.startsWith("orderInfo="));

                    if (orderInfoCookie) {
                        const orderInfo = JSON.parse(orderInfoCookie.split("=")[1]);

                        const result = await post<any>(
                            ENDPOINTS.ORDER,
                            {
                                ...orderInfo,
                                orderStatus: "DELIVERING",
                                isPaid: "true"
                            },
                            token as string
                        );

                        if (result.data.code === 1000) {
                            document.cookie = "orderInfo=; path=/; max-age=0";
                            await dispatch(getCart() as any);

                            await dispatch(viewOrder() as any);

                            toast({
                                title: t('vnpay.toastSuccess')
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error creating order:", error);
                toast({
                    variant: "destructive",
                    title: t('vnpay.toastError'),
                    description: t('vnpay.toastErrorDesc')
                });
                navigate("/cart");
            } finally {
                setIsProcessing(false);
            }
        };

        createOrder();
    }, [isSuccess, token, dispatch, navigate]);

    if (isProcessing) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-md mx-auto">
                    <CardContent className="flex flex-col items-center gap-4 py-6">
                        <p className="text-lg">{t('vnpay.processingOrder')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">{t('vnpay.paymentResult')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {isSuccess ? (
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    ) : (
                        <XCircle className="w-16 h-16 text-red-500" />
                    )}
                    <p className="text-lg text-center">
                        {isSuccess ? t('vnpay.paymentSuccess') : t('vnpay.paymentFailed')}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild className="bg-orange-500 hover:bg-orange-600">
                        <Link to="/order">{t('vnpay.viewOrders')}</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentResult;
