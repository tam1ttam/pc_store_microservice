import { ShipCOD } from "@/assets/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import AddressDialog, { type AddressFormData } from "@/components/AddressDialog";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { getCart } from "@/redux/thunks/cart";
import { viewOrder } from "@/redux/thunks/order";
import { post } from "@/services/api.service";
import { voucherApi } from "@/services/api/voucherApi";
import ENDPOINT from "@/constants/endpoint";
import { getAccessToken } from "@/config/axios.config";
import { decodeJwtSub } from "@/utils/jwtUtils";
import { Box, Loader2, MapPin, Tag, Ticket, X, CreditCard } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PaymentModal from "@/components/PaymentModal";

interface Voucher {
    id: number;
    code: string;
    description?: string;
    discountAmount?: number;
    discountPercent?: number;
    maxUsage?: number;
    usedCount?: number;
    maxUsagePerUser?: number;
    expiredAt?: string;
    isActive?: boolean;
    accessType?: "PUBLIC" | "PRIVATE";
}

function Checkout() {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();
    const { toast } = useToast();

    const selectedItemIds: number[] = (location.state as any)?.selectedItemIds ?? [];
    const { items } = useSelector((state: RootState) => state.cart);
    const { info: user } = useSelector((state: RootState) => state.user);

    const selectedItems = items.filter((i) => selectedItemIds.includes(i.id));

    const [address, setAddress] = useState(localStorage.getItem("addressShipping") || "");
    const [addressFormData, setAddressFormData] = useState<AddressFormData | null>(() => {
        try {
            const saved = localStorage.getItem("addressFormData");
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<string>("ship");
    const [isOrdering, setIsOrdering] = useState(false);
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
    const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
    const [showVoucherPicker, setShowVoucherPicker] = useState(false);
    const [voucherLoading, setVoucherLoading] = useState(false);

    useEffect(() => {
        // Clear any existing paymentId when entering checkout to avoid phantom polling
        localStorage.removeItem("paymentId");

        if (selectedItemIds.length === 0) {
            navigate("/cart");
        }
    }, []);

    const subtotal = useMemo(
        () => selectedItems.reduce((sum, i) => sum + i.productPrice * i.quantity, 0),
        [selectedItems]
    );

    const discountAmount = useMemo(() => {
        if (!appliedVoucher) return 0;
        if (appliedVoucher.discountAmount && appliedVoucher.discountAmount > 0) {
            return appliedVoucher.discountAmount;
        }
        if (appliedVoucher.discountPercent && appliedVoucher.discountPercent > 0) {
            return (subtotal * appliedVoucher.discountPercent) / 100;
        }
        return 0;
    }, [appliedVoucher, subtotal]);

    const totalPrice = Math.max(0, subtotal - discountAmount);

    const loadVouchers = async () => {
        try {
            setVoucherLoading(true);
            const res = await voucherApi.getAvailable() as any;
            const list: Voucher[] = res.data?.result ?? [];
            const now = new Date();
            setAvailableVouchers(
                list.filter(
                    (v) =>
                        v.isActive &&
                        (!v.expiredAt || new Date(v.expiredAt) > now) &&
                        (!v.maxUsage || (v.usedCount ?? 0) < v.maxUsage)
                )
            );
        } catch {
            toast({ variant: "destructive", title: t('checkout.voucherLoadFailed') });
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return;
        try {
            setVoucherLoading(true);
            const res = await voucherApi.getAvailable() as any;
            const list: Voucher[] = res.data?.result ?? [];
            const now = new Date();
            const found = list.find(
                (v) =>
                    v.code.toLowerCase() === voucherCode.trim().toLowerCase() &&
                    v.isActive &&
                    (!v.expiredAt || new Date(v.expiredAt) > now) &&
                    (!v.maxUsage || (v.usedCount ?? 0) < v.maxUsage)
            );
            if (!found) {
                toast({ variant: "destructive", title: t('checkout.voucherFailed') });
                return;
            }
            setAppliedVoucher(found);
            toast({ title: t('checkout.voucherApplied') });
        } catch {
            toast({ variant: "destructive", title: t('checkout.voucherApplyFailed') });
        } finally {
            setVoucherLoading(false);
        }
    };

    const handleSelectVoucher = (v: Voucher) => {
        setAppliedVoucher(v);
        setVoucherCode(v.code);
        setShowVoucherPicker(false);
        toast({ title: t('checkout.voucherChosen') });
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode("");
    };

    const handleOrder = async () => {
        if (user?.isActive === false) {
            setShowCompleteProfile(true);
            return;
        }
        if (!address.trim()) {
            toast({ variant: "destructive", title: t('checkout.enterAddress') });
            setShowAddressModal(true);
            return;
        }

        const identityUserId = decodeJwtSub(getAccessToken() ?? "");
        const customerName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.id || "";

        setIsOrdering(true);
        try {
            // All payment methods first create an order in the system
            const result = await post<any>(ENDPOINT.CHECKOUT, {
                customerId: user?.id,
                customerEmail: user?.email,
                customerName,
                shipAddress: address,
                cartItemIds: selectedItemIds,
                paymentMethod, // Pass payment method to BE to set PENDING_PAYMENT if paypal
            });

            if (result.data.code === 1000) {
                const orderId = result.data.result?.id;
                if (!orderId) throw new Error("Order ID missing from response");

                if (appliedVoucher) {
                    try {
                        await voucherApi.apply(orderId, appliedVoucher.code);
                    } catch (e) {
                        console.warn("Voucher apply failed", e);
                    }
                }

                if (paymentMethod === "ship") {
                    toast({ title: t('checkout.orderSuccess') });
                    dispatch(getCart());
                    dispatch(viewOrder());
                    navigate("/order");
                } else if (paymentMethod === "paypal") {
                    setCurrentOrderId(orderId);
                    setIsPaymentModalOpen(true);
                }
            } else {
                throw new Error(result.data.message || t('checkout.orderFailed'));
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast({ variant: "destructive", title: t('checkout.sessionExpired'), description: t('checkout.sessionExpiredDesc') });
                setTimeout(() => window.dispatchEvent(new CustomEvent('auth:session-expired')), 2000);
            } else {
                toast({
                    variant: "destructive",
                    title: t('checkout.orderFailed'),
                    description: error.response?.data?.message || error.message || t('auth.unknownError'),
                });
            }
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <div className="container mx-auto px-4 pb-10 pt-24">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-orange-500 transition-colors">{t('checkout.breadcrumbHome')}</Link>
                <span>/</span>
                <Link to="/cart" className="hover:text-orange-500 transition-colors">{t('cart.title')}</Link>
                <span>/</span>
                <span className="text-orange-500">{t('checkout.title')}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Delivery address */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-orange-500" />
                                {t('checkout.shippingAddress')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-4">
                            {address ? (
                                <p className="text-sm text-gray-700 flex-1">{address}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">{t('checkout.noAddress')}</p>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-500 border-orange-500 hover:bg-orange-50 shrink-0"
                                onClick={() => setShowAddressModal(true)}
                            >
                                {address ? t('checkout.changeAddress') : t('checkout.addAddress')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Products */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{t('checkout.orderedItems', { count: selectedItems.length })}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {selectedItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {item.productImage ? (
                                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <Box className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold text-orange-500">
                                            {(item.productPrice * item.quantity).toLocaleString("vi-VN")}đ
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.productPrice.toLocaleString("vi-VN")}đ {t('checkout.perUnit')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Voucher */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Tag className="w-4 h-4 text-orange-500" />
                                {t('checkout.voucher')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {appliedVoucher ? (
                                <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <Ticket className="w-4 h-4 text-orange-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-orange-600">{appliedVoucher.code}</p>
                                        {appliedVoucher.description && (
                                            <p className="text-xs text-gray-500">{appliedVoucher.description}</p>
                                        )}
                                        <p className="text-xs text-green-600 font-medium">
                                            {t('checkout.discount')} {discountAmount.toLocaleString("vi-VN")}đ
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={handleRemoveVoucher}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder={t('checkout.voucherInputPlaceholder')}
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleApplyVoucher()}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        className="shrink-0 border-orange-500 text-orange-500 hover:bg-orange-50"
                                        onClick={handleApplyVoucher}
                                        disabled={voucherLoading || !voucherCode.trim()}
                                    >
                                        {voucherLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('checkout.applyVoucher')}
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 -ml-2"
                                onClick={() => {
                                    loadVouchers();
                                    setShowVoucherPicker(true);
                                }}
                            >
                                <Ticket className="w-4 h-4 mr-1" />
                                {t('checkout.selectVoucher')}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Payment method */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{t('checkout.paymentMethod')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label
                                        htmlFor="ship"
                                        className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-500 [&:has([data-state=checked])]:border-orange-500 [&:has([data-state=checked])]:bg-orange-50"
                                    >
                                        <img src={ShipCOD} alt="COD" className="w-8 h-8" />
                                        <RadioGroupItem value="ship" id="ship" className="sr-only" />
                                        <span className="text-sm text-center">{t('checkout.codLabel')}</span>
                                    </Label>
                                </div>
                                <div>
                                    <Label
                                        htmlFor="sepay"
                                        className="flex flex-col items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-500 [&:has([data-state=checked])]:border-orange-500 [&:has([data-state=checked])]:bg-orange-50"
                                    >
                                        <CreditCard className="w-8 h-8 text-blue-600" />
                                        <RadioGroupItem value="sepay" id="sepay" className="sr-only" />
                                        <span className="text-sm text-center">{t('checkout.bankTransferLabel') || "Chuyển khoản"}</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Right column — order summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{t('checkout.summaryTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{t('checkout.subtotal', { count: selectedItems.length })}</span>
                                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>{t('checkout.voucherDiscount')}</span>
                                    <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{t('checkout.shippingFee')}</span>
                                <span>{t('checkout.freeShipping')}đ</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-semibold text-base">
                                <span>{t('checkout.totalAmount')}</span>
                                <span className="text-orange-500 text-lg">{totalPrice.toLocaleString("vi-VN")}đ</span>
                            </div>

                            <Button
                                className="w-full bg-orange-500 hover:bg-orange-600 mt-2"
                                size="lg"
                                onClick={handleOrder}
                                disabled={isOrdering || selectedItems.length === 0}
                            >
                                {isOrdering ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        {t('checkout.processing')}
                                    </>
                                ) : paymentMethod === "ship" ? (
                                    t('checkout.placeOrder')
                                ) : (
                                    t('checkout.payViaBank') || "Thanh toán chuyển khoản"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {showCompleteProfile && (
                <ProfileCompletionModal
                    onClose={() => setShowCompleteProfile(false)}
                    prefillAddress={addressFormData}
                />
            )}

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                orderId={currentOrderId ?? 0}
                totalPrice={totalPrice}
                onSuccess={() => {
                    setIsPaymentModalOpen(false);
                    dispatch(getCart());
                    dispatch(viewOrder());
                    navigate("/order");
                }}
            />

            {/* Address dialog — dùng form có cấu trúc + Google Maps */}
            <AddressDialog
                open={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                initialFormData={addressFormData}
                onSave={(formatted, formData) => {
                    setAddress(formatted);
                    setAddressFormData(formData);
                    localStorage.setItem("addressShipping", formatted);
                    localStorage.setItem("addressFormData", JSON.stringify(formData));
                }}
            />

            {/* Voucher picker dialog */}
            <Dialog open={showVoucherPicker} onOpenChange={setShowVoucherPicker}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('checkout.voucherPickerTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {voucherLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                            </div>
                        ) : availableVouchers.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">{t('checkout.noVouchers')}</p>
                        ) : (
                            availableVouchers.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => handleSelectVoucher(v)}
                                    className="w-full flex items-center gap-3 p-3 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
                                >
                                    <Ticket className="w-5 h-5 text-orange-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm text-orange-600">{v.code}</p>
                                            {v.accessType === "PRIVATE" && (
                                                <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 font-medium">{t('checkout.voucherPrivate')}</span>
                                            )}
                                        </div>
                                        {v.description && <p className="text-xs text-gray-500 truncate">{v.description}</p>}
                                        <p className="text-xs text-green-600 font-medium">
                                            {v.discountAmount && v.discountAmount > 0
                                                ? `${t('checkout.discount')} ${v.discountAmount.toLocaleString("vi-VN")}đ`
                                                : `${t('checkout.discount')} ${v.discountPercent}%`}
                                        </p>
                                    </div>
                                    {appliedVoucher?.code === v.code && (
                                        <span className="text-xs text-orange-500 font-medium shrink-0">{t('checkout.voucherSelected')}</span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Checkout;
