"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/config/api";
import { format } from "date-fns";

interface HistoryAction {
    id: string;
    user: {
        id: string;
        username: string;
    };
    createdAt: string;
    targetId: string;
    title: string;
    description: string;
    status: string;
    note: string;
}

export default function AuditTrail() {
    const { t } = useTranslation();
    const [history, setHistory] = useState<HistoryAction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/admin/history");
                if (response.data && response.data.result) {
                    setHistory(response.data.result);
                }
            } catch (error) {
                console.error("Failed to fetch audit trail:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getStatusVariant = (status: string) => {
        switch (status.toUpperCase()) {
            case "SUCCESS":
                return "success";
            case "FAILED":
                return "destructive";
            default:
                return "secondary";
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('auditTrail.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('auditTrail.timestamp')}</TableHead>
                                <TableHead>{t('auditTrail.user')}</TableHead>
                                <TableHead>{t('auditTrail.action')}</TableHead>
                                <TableHead>{t('auditTrail.detail')}</TableHead>
                                <TableHead>{t('auditTrail.status')}</TableHead>
                                <TableHead>{t('auditTrail.note')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        {t('auditTrail.loading')}
                                    </TableCell>
                                </TableRow>
                            ) : history.length > 0 ? (
                                history.map((action) => (
                                    <TableRow key={action.id}>
                                        <TableCell>
                                            {format(new Date(action.createdAt), "dd/MM/yyyy HH:mm:ss")}
                                        </TableCell>
                                        <TableCell>{action.user?.username || "N/A"}</TableCell>
                                        <TableCell>{action.title}</TableCell>
                                        <TableCell>{action.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(action.status) as any}>
                                                {action.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{action.note || "-"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        {t('auditTrail.noHistory')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
