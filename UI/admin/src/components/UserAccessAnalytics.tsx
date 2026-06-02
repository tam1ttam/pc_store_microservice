import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Clock, Activity } from "lucide-react";
import axios from "axios";

interface UserVisitStat {
    userId: string;
    visitCount: number;
    lastVisit: string;
}

const UserAccessAnalytics = () => {
    const [visits, setVisits] = useState<UserVisitStat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api-gateway/identity-service/api/admin/visits");
            setVisits(response.data.result);
        } catch (error) {
            console.error("Error fetching visits:", error);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng số lượt truy cập</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {visits.reduce((acc, curr) => acc + curr.visitCount, 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {visits.length.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Chi tiết truy cập người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead className="text-right">Số lượt truy cập</TableHead>
                                <TableHead className="text-right">Lần cuối truy cập</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visits.sort((a, b) => b.visitCount - a.visitCount).map((visit, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{visit.userId}</TableCell>
                                    <TableCell className="text-right">{visit.visitCount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            {new Date(visit.lastVisit).toLocaleString("vi-VN")}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {visits.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-gray-500">
                                        Không có dữ liệu truy cập.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserAccessAnalytics;
