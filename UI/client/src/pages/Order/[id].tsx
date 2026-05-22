import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks";
import { RootState } from "@/redux/store";
import { viewOrder } from "@/redux/thunks/order";
import { orderApi } from "@/services/api/orderApi";
import { Box, Clock, MapPin, Package2, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    DELIVERING: { label: "Đang giao hàng", className: "bg-orange-100 text-orange-700" },
    DELIVERED:  { label: "Đã giao hàng",   className: "bg-green-100 text-green-700" },
    CANCELLED:  { label: "Đã hủy",          className: "bg-red-100 text-red-700" },
    PENDING:    { label: "Chờ xử lý",       className: "bg-yellow-100 text-yellow-700" },
};

function OrderDetail() {
    const dispatch = useDispatch<any>();
    const { id } = useParams<{ id: string }>();
    const { orders } = useSelector((state: RootState) => state.order);
    const order = orders.find((o: any) => String(o.id) === id);
    const { toast } = useToast();
    const [cancelling, setCancelling] = useState(false);

    const handleCancelOrder = async () => {
        if (!id) return;
        setCancelling(true);
        try {
            await orderApi.cancelOrder(Number(id));
            toast({ title: "Đã hủy đơn hàng" });
            dispatch(viewOrder());
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hủy đơn hàng thất bại",
                description: error?.response?.data?.message || "Đã xảy ra lỗi",
            });
        } finally {
            setCancelling(false);
        }
    };

    if (!order) return null;

    const cfg = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.DELIVERING;

    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="flex items-center gap-2 mb-6 text-gray-600">
                <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
                <span>/</span>
                <Link to="/order" className="hover:text-orange-500">Đơn hàng</Link>
                <span>/</span>
                <span className="text-orange-500">Chi tiết đơn hàng</span>
            </div>

            <div className="grid gap-6">
                <Card className="border border-gray-200 shadow-md">
                    <CardHeader className="border-b border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-medium text-gray-800 flex items-center gap-2">
                                <Package2 className="h-5 w-5 text-orange-500" />
                                Đơn hàng #{order.id}
                            </CardTitle>
                            <div className="text-lg font-semibold text-orange-500">
                                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                    order.totalPrice
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-gray-600 mt-4">
                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {order.orderStatus === "DELIVERING" && (
                                        <Truck className="h-5 w-5 text-orange-500" />
                                    )}
                                    {order.orderStatus === "DELIVERED" && (
                                        <Package2 className="h-5 w-5 text-green-500" />
                                    )}
                                    {(order.orderStatus === "CANCELLED" || order.orderStatus === "PENDING") && (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                    <Badge className={cfg.className}>{cfg.label}</Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                <MapPin className="h-5 w-5 text-purple-500 shrink-0" />
                                <div>
                                    <div className="text-sm font-medium">Địa chỉ giao hàng</div>
                                    <div className="text-sm">{order.shipAddress}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-500 shrink-0" />
                                <div>
                                    <div className="text-sm font-medium">Ngày đặt hàng</div>
                                    <div className="text-sm">{order.orderDate}</div>
                                </div>
                            </div>
                        </div>

                        {order.orderStatus === "DELIVERING" && (
                            <div className="pt-4">
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    disabled={cancelling}
                                    onClick={handleCancelOrder}
                                >
                                    {cancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                                </Button>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {(order.items ?? []).map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                                        <Box className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.productName}</h3>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                Số lượng: <span className="font-medium">{item.quantity}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">
                                                    Đơn giá:{" "}
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(item.productPrice)}
                                                </div>
                                                <div className="text-base font-medium text-orange-500">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(item.subtotal)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end border-t pt-6">
                            <div className="text-lg">
                                Tổng tiền:{" "}
                                <span className="font-bold text-orange-500 text-xl">
                                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                        order.totalPrice
                                    )}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default OrderDetail;
