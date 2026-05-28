import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Eye, ShoppingCart, DollarSign } from "lucide-react";
import axios from "axios";

interface ProductStat {
    productId: string;
    productName: string;
    totalRevenue: number;
    totalProfit: number;
    totalSold: number;
    viewCount: number;
}

const ProductAnalytics = () => {
    const [stats, setStats] = useState<ProductStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch revenue and sales from order-service
            const orderRes = await axios.get("/api-gateway/order-service/analytics/products");
            const orderData = orderRes.data.result;

            // Fetch view counts from product-service
            const productRes = await axios.get("/api-gateway/product-service/products/analytics");
            const productData = productRes.data.result;

            // Merge data
            const mergedStats = orderData.map((item: any) => {
                const productInfo = productData.find((p: any) => p._id === item.productId);
                return {
                    ...item,
                    viewCount: productInfo ? productInfo.viewCount : 0
                };
            });

            setStats(mergedStats);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.reduce((acc, curr) => acc + curr.totalRevenue, 0).toLocaleString()} VND
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng sản phẩm đã bán</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.reduce((acc, curr) => acc + curr.totalSold, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng lượt xem</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.reduce((acc, curr) => acc + curr.viewCount, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết thống kê sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sản phẩm</TableHead>
                                <TableHead className="text-right">Lượt xem</TableHead>
                                <TableHead className="text-right">Số lượng bán</TableHead>
                                <TableHead className="text-right">Doanh thu</TableHead>
                                <TableHead className="text-right">Lợi nhuận</TableHead>
                                <TableHead className="text-right">Tỷ lệ chuyển đổi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.map((stat) => (
                                <TableRow key={stat.productId}>
                                    <TableCell className="font-medium">{stat.productName}</TableCell>
                                    <TableCell className="text-right">{stat.viewCount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{stat.totalSold.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{stat.totalRevenue.toLocaleString()} VND</TableCell>
                                    <TableCell className="text-right text-green-600 font-semibold">
                                        {stat.totalProfit.toLocaleString()} VND
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {stat.viewCount > 0
                                            ? ((stat.totalSold / stat.viewCount) * 100).toFixed(2) + "%"
                                            : "0%"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProductAnalytics;
