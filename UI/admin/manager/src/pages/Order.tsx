import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RootState } from "@/redux/store";
import { MapPin, Package, Truck, User, XCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Order() {
    const { orders } = useSelector((state: RootState) => state.order);

    return (
        <div className="container mx-auto p-6 pt-24">
            <div className="flex items-center gap-2 mb-6 text-gray-600">
                <Link to="/" className="hover:text-orange-500">
                    Trang chủ
                </Link>
                <span>/</span>
                <span className="text-orange-500">Đơn hàng</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Đơn hàng của bạn</h1>

            <div className="grid gap-6">
                {orders.map((order: any) => (
                    <Link key={order.id} to={`/order/${order.id}`}>
                        <Card className="hover:bg-gray-50 transition-all duration-300 border border-gray-200">
                            <CardHeader className="border-b border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <CardTitle className="text-xl font-medium text-gray-800">
                                            Đơn hàng #{order.id}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {order.orderStatus === "DELIVERING" && (
                                                <Truck className="h-4 w-4 text-blue-500" />
                                            )}
                                            {order.orderStatus === "DELIVERED" && (
                                                <Package className="h-4 w-4 text-green-500" />
                                            )}
                                            {order.orderStatus === "CANCELLED" && (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                            <span
                                                className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${order.orderStatus === "DELIVERING" && "bg-blue-100 text-blue-700"}
            ${order.orderStatus === "DELIVERED" && "bg-green-100 text-green-700"}
            ${order.orderStatus === "CANCELLED" && "bg-red-100 text-red-700"}
              `}
                                            >
                                                {order.orderStatus === "DELIVERING" && "Đang giao hàng"}
                                                {order.orderStatus === "DELIVERED" && "Đã giao hàng"}
                                                {order.orderStatus === "CANCELLED" && "Đã hủy"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-primary">
                                        {order.currency === "USD"
                                            ? new Intl.NumberFormat("en-US", {
                                                  style: "currency",
                                                  currency: "USD"
                                              }).format(order.totalPrice)
                                            : new Intl.NumberFormat("vi-VN", {
                                                  style: "currency",
                                                  currency: "VND"
                                              }).format(order.totalPrice)}
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-4 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">
                                            {order.customer.firstName} {order.customer.lastName}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-purple-500" />
                                        <span className="text-sm truncate max-w-[300px]">{order.shipAddress}</span>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{order.items?.length} sản phẩm</span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Order;
