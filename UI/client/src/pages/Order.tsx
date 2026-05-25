import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RootState } from "@/redux/store";
import { Clock, MapPin, Package, ShoppingBag, Truck, XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Order() {
    const { t } = useTranslation();
    const { orders, status } = useSelector((state: RootState) => state.order);

    const STATUS_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
        DELIVERING: { label: t('order.status_DELIVERING'), icon: Truck, className: "bg-orange-100 text-orange-700" },
        DELIVERED:  { label: t('order.status_DELIVERED_FULL'), icon: Package, className: "bg-green-100 text-green-700" },
        CANCELLED:  { label: t('order.status_CANCELLED'), icon: XCircle, className: "bg-red-100 text-red-700" },
        PENDING:    { label: t('order.status_PENDING'), icon: Clock, className: "bg-yellow-100 text-yellow-700" },
    };

    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="flex items-center gap-2 mb-6 text-gray-600">
                <Link to="/" className="hover:text-orange-500">
                    {t('order.breadcrumbHome')}
                </Link>
                <span>/</span>
                <span className="text-orange-500">{t('order.breadcrumbOrder')}</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t('order.heading')}</h1>

            {status === "loading" && orders.length === 0 && (
                <div className="text-center py-12 text-gray-400">{t('order.loading')}</div>
            )}

            {status !== "loading" && orders.length === 0 && (
                <div className="text-center py-16">
                    <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400">{t('order.noOrders')}</p>
                </div>
            )}

            <div className="grid gap-6">
                {orders.map((order: any) => {
                    const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.DELIVERING;
                    const StatusIcon = cfg.icon;
                    return (
                        <Link key={order.id} to={`/order/${order.id}`}>
                            <Card className="hover:bg-gray-50 transition-all duration-300 border border-gray-200">
                                <CardHeader className="border-b border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <CardTitle className="text-xl font-medium text-gray-800">
                                                {t('order.orderNumber', { id: order.id })}
                                            </CardTitle>
                                            <Badge className={cfg.className}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {cfg.label}
                                            </Badge>
                                        </div>
                                        <div className="text-lg font-semibold text-orange-500">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                            }).format(order.totalPrice)}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-3 text-gray-600 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-purple-500 shrink-0" />
                                            <span className="text-sm truncate max-w-[300px]">{order.shipAddress}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                                            <span className="text-sm">{order.orderDate}</span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{t('order.itemCount', { count: order.items?.length ?? 0 })}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
