import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api/adminApi";
import { Order, OrderAdmin } from "@/types";
import { ChevronLeft, ChevronRight, CreditCard, DollarSign, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";

const OrderPage = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { toast } = useToast();

    const fetchOrders = async () => {
        try {
            const response = await adminApi.listOrders(page);
            setOrders(response.data.result?.content ?? []);
            setTotalPages(response.data.result?.totalPages ?? 0);
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("order.fetchError"),
                description: t("order.fetchErrorDesc")
            });
        }
    };

    const handleUpdatePayment = async (orderId: string) => {
        try {
            await adminApi.updatePaymentStatus(orderId);
            toast({
                title: t("order.updatePaymentSuccess"),
                description: t("order.updatePaymentSuccessDesc")
            });
            fetchOrders();
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("order.updatePaymentError"),
                description: t("order.updatePaymentErrorDesc")
            });
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const getOrderStats = () => {
        const total = orders?.length ?? 0;
        const paid = orders?.filter((order) => order.paid).length ?? 0;
        const unpaid = total - paid;
        return { total, paid, unpaid };
    };

    const stats = getOrderStats();

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            setPage(page + 1);
        }
    };

    return (
        <div className="p-6 space-y-8 pt-24">
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("order.totalOrders")}</CardTitle>
                        <Package className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("order.paidOrders")}</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t("order.unpaidOrders")}</CardTitle>
                        <CreditCard className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.unpaid}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">{t("order.colOrderId")}</TableHead>
                            <TableHead className="font-semibold">{t("order.colCustomer")}</TableHead>
                            <TableHead className="font-semibold">{t("order.colOrderDate")}</TableHead>
                            <TableHead className="font-semibold">{t("order.colTotalPrice")}</TableHead>
                            <TableHead className="font-semibold">{t("order.colStatus")}</TableHead>
                            <TableHead className="font-semibold">{t("order.colPayment")}</TableHead>
                            <TableHead className="font-semibold">{t("order.colAction")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell className="font-medium text-muted-foreground">
                                    {order.customer?.firstName} {order.customer?.lastName}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {order.orderDate
                                        ? new Date(String(order.orderDate).replace("ICT", "+0700")).toLocaleString(
                                              "vi-VN",
                                              {
                                                  timeZone: "Asia/Ho_Chi_Minh",
                                                  year: "numeric",
                                                  month: "2-digit",
                                                  day: "2-digit",
                                                  hour: "2-digit",
                                                  minute: "2-digit"
                                              }
                                          )
                                        : t("order.emptyDate")}
                                </TableCell>
                                <TableCell className="font-medium">{order.totalPrice.toLocaleString()} VNĐ</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={order.orderStatus === "DELIVERED" ? "default" : "secondary"}
                                        className={`
                                            ${
                                                order.orderStatus === "DELIVERED"
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                            }
                                            transition-colors duration-200
                                        `}
                                    >
                                        {order.orderStatus ?? t("order.emptyDate")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={order.paid ? "default" : "destructive"}
                                        className={`
                                            ${
                                                order.paid
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : "bg-red-100 text-red-800 hover:bg-red-200"
                                            }
                                            transition-colors duration-200
                                        `}
                                    >
                                        {order.paid ? t("order.paid") : t("order.unpaid")}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => handleUpdatePayment(order.id)}
                                        disabled={order.paid}
                                        variant={order.paid ? "ghost" : "default"}
                                        className={`hover:shadow-sm transition-all ${
                                            order.paid ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
                                        }`}
                                    >
                                        {t("order.updatePayment")}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={page === 0}
                        className="hover:bg-muted/50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {t("order.previous")}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {t("order.pageInfo", { current: page + 1, total: totalPages })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={page === totalPages - 1}
                        className="hover:bg-muted/50"
                    >
                        {t("order.next")}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
