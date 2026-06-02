import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, X } from "lucide-react";
import { post } from "@/services/api.service";
import ENDPOINT from "@/constants/endpoint";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    totalPrice: number;
    onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, orderId, totalPrice, onSuccess }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isPaid, setIsPaid] = useState(false);
    const [isPolling, setIsPolling] = useState(false);

    // SePay Configuration - Should ideally come from API or ENV
    const BANK_CODE = "VCB";
    const ACCOUNT_NUMBER = "123456789";
    const ORDER_PREFIX = "PCSTORE";

    const qrUrl = `https://qr.sepay.vn/img?bank=${BANK_CODE}&acc=${ACCOUNT_NUMBER}&template=compact&amount=${totalPrice}&des=${ORDER_PREFIX}${orderId}`;

    useEffect(() => {
        if (!isOpen || isPaid) return;

        setIsPolling(true);
        const interval = setInterval(async () => {
            try {
                const res = await post<any>(ENDPOINT.ORDER_STATUS(orderId), {});
                if (res.data.code === 1000 && res.data.result?.isPaid) {
                    setIsPaid(true);
                    setIsPolling(false);
                    toast({ title: t("payment.successTitle"), description: t("payment.successDesc") });
                    setTimeout(onSuccess, 2000);
                }
            } catch (error) {
                console.error("Polling payment status failed", error);
            }
        }, 3000);

        return () => {
            clearInterval(interval);
            setIsPolling(false);
        };
    }, [isOpen, isPaid, orderId, t, toast, onSuccess]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm text-center">
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {isPaid ? t("payment.paymentComplete") : t("payment.paymentInstructions")}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    {isPaid ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                            <p className="text-lg font-semibold text-green-600">{t("payment.thankYou")}</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-white border-4 border-gray-100 rounded-xl shadow-sm">
                                <img src={qrUrl} alt="SePay QR" className="w-64 h-64" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-sm text-muted-foreground">{t("payment.scanToPay")}</p>
                                <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                    <p className="text-xs text-gray-500 uppercase font-medium">{t("payment.content")}</p>
                                    <p className="text-lg font-mono font-bold text-gray-800">{ORDER_PREFIX}{orderId}</p>
                                </div>
                            </div>
                            {isPolling && (
                                <div className="flex items-center gap-2 text-sm text-orange-500 animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t("payment.waitingForPayment")}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!isPaid && (
                    <Button variant="outline" onClick={onClose} className="w-full">
                        {t("common.cancel")}
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
