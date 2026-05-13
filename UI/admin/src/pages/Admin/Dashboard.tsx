import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
    ShoppingCart, DollarSign, Users, Package,
    CheckCircle, Clock, XCircle, Wifi, Server,
    RefreshCw,
} from "lucide-react";
import { adminApi } from "@/services/api/adminApi";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    paidOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
}

interface OnlineStats { total: number; managers: number; clients: number; }
interface ManagerInfo { id: string; username: string; }

interface ServiceStatus { name: string; status: "UP" | "DOWN"; }

interface HistoryAction {
    id: string;
    user?: { username?: string };
    createdAt: string;
    title: string;
    status: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EUREKA_URL = `${import.meta.env.VITE_API_URL}/api-gateway/eureka/apps`;

const KNOWN_SERVICES = [
    "API-GATEWAY", "IDENTITY-SERVICE", "USER-SERVICE",
    "PRODUCT-SERVICE", "ORDER-SERVICE", "CHAT-SERVICE",
    "FILE-SERVICE", "NOTIFICATION-SERVICE",
];

const POLL_INTERVAL = 10_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

async function fetchEurekaStatuses(): Promise<ServiceStatus[]> {
    const res = await fetch(EUREKA_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Eureka ${res.status}`);
    const data = await res.json();
    const apps: any[] = data?.applications?.application ?? [];
    const upSet = new Set<string>(apps.map((a: any) => String(a.name).toUpperCase()));
    return KNOWN_SERVICES.map((name) => ({ name, status: upSet.has(name) ? "UP" : "DOWN" }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    icon, label, value, sub, color,
}: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <span className={`p-2 rounded-lg ${color ?? "bg-blue-50 text-blue-600"}`}>{icon}</span>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold">{value}</div>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </CardContent>
        </Card>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
    const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
    const [customerCount, setCustomerCount] = useState<number | null>(null);
    const [productCount, setProductCount] = useState<number | null>(null);
    const [onlineStats, setOnlineStats] = useState<OnlineStats | null>(null);
    const [services, setServices] = useState<ServiceStatus[]>(
        KNOWN_SERVICES.map((name) => ({ name, status: "DOWN" as const }))
    );
    const [auditLog, setAuditLog] = useState<HistoryAction[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Fetchers ──────────────────────────────────────────────────────────────

    const fetchStats = useCallback(async () => {
        const [orders, customers, products] = await Promise.allSettled([
            adminApi.getOrderStats(),
            adminApi.getCustomerCount(),
            adminApi.getProductCount(),
        ]);
        if (orders.status === "fulfilled") setOrderStats((orders.value as any).data?.result ?? null);
        if (customers.status === "fulfilled") setCustomerCount((customers.value as any).data?.result ?? null);
        if (products.status === "fulfilled") setProductCount((products.value as any).data?.result ?? null);
    }, []);

    const fetchOnline = useCallback(async () => {
        try {
            const [idsRes, managersRes] = await Promise.allSettled([
                adminApi.getChatOnlineUserIds(),
                adminApi.getChatManagers(),
            ]);
            const onlineIds: string[] = idsRes.status === "fulfilled"
                ? ((idsRes.value as any).data?.result ?? []) : [];
            const managerList: ManagerInfo[] = managersRes.status === "fulfilled"
                ? ((managersRes.value as any).data?.result ?? []) : [];
            const managerIdSet = new Set(managerList.map((m) => m.id));
            const managers = onlineIds.filter((id) => managerIdSet.has(id)).length;
            setOnlineStats({ total: onlineIds.length, managers, clients: onlineIds.length - managers });
        } catch { /* silent */ }
    }, []);

    const fetchHealth = useCallback(async () => {
        try {
            const statuses = await fetchEurekaStatuses();
            setServices(statuses);
        } catch { /* silent */ }
    }, []);

    const fetchAudit = useCallback(async () => {
        try {
            const res = await adminApi.getAuditHistory();
            const list: HistoryAction[] = (res as any).data?.result ?? [];
            setAuditLog(list.slice(0, 8));
        } catch { /* silent */ }
    }, []);

    // ── Init + polling ────────────────────────────────────────────────────────

    useEffect(() => {
        Promise.allSettled([fetchStats(), fetchOnline(), fetchHealth(), fetchAudit()])
            .finally(() => setLoading(false));
    }, [fetchStats, fetchOnline, fetchHealth, fetchAudit]);

    useEffect(() => {
        const t1 = setInterval(fetchOnline, POLL_INTERVAL);
        const t2 = setInterval(fetchHealth, POLL_INTERVAL);
        const t3 = setInterval(fetchAudit, POLL_INTERVAL);
        return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
    }, [fetchOnline, fetchHealth, fetchAudit]);

    // ── Derived ───────────────────────────────────────────────────────────────

    const upCount = services.filter((s) => s.status === "UP").length;
    const downCount = services.filter((s) => s.status === "DOWN").length;

    // ── Skeleton ──────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}><CardContent className="p-4 h-24 animate-pulse bg-gray-100 rounded" /></Card>
                    ))}
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="p-6 space-y-6">
            {/* ── Row 1: Main stats ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<ShoppingCart size={18} />}
                    label="Tổng đơn hàng"
                    value={orderStats?.totalOrders ?? "—"}
                    sub={`${orderStats?.paidOrders ?? 0} đã thanh toán`}
                    color="bg-blue-50 text-blue-600"
                />
                <StatCard
                    icon={<DollarSign size={18} />}
                    label="Doanh thu"
                    value={orderStats ? formatCurrency(orderStats.totalRevenue) : "—"}
                    color="bg-green-50 text-green-600"
                />
                <StatCard
                    icon={<Users size={18} />}
                    label="Khách hàng"
                    value={customerCount ?? "—"}
                    color="bg-purple-50 text-purple-600"
                />
                <StatCard
                    icon={<Package size={18} />}
                    label="Sản phẩm"
                    value={productCount ?? "—"}
                    color="bg-orange-50 text-orange-600"
                />
            </div>

            {/* ── Row 2: Order status ── */}
            {orderStats && (
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        icon={<Clock size={18} />}
                        label="Đang giao"
                        value={orderStats.pendingOrders}
                        color="bg-yellow-50 text-yellow-600"
                    />
                    <StatCard
                        icon={<CheckCircle size={18} />}
                        label="Đã giao"
                        value={orderStats.completedOrders}
                        color="bg-green-50 text-green-600"
                    />
                    <StatCard
                        icon={<XCircle size={18} />}
                        label="Đã hủy"
                        value={orderStats.cancelledOrders}
                        color="bg-red-50 text-red-600"
                    />
                </div>
            )}

            {/* ── Row 3: Service health + Online users ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Service health grid */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Server size={16} />
                            Trạng thái dịch vụ
                        </CardTitle>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <RefreshCw size={12} className="animate-spin opacity-40" />
                            tự động
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {services.map((svc) => (
                                <div
                                    key={svc.name}
                                    className={`flex items-center justify-between rounded-lg px-3 py-2 border text-xs ${
                                        svc.status === "UP"
                                            ? "border-green-100 bg-green-50"
                                            : "border-red-100 bg-red-50"
                                    }`}
                                >
                                    <span className="font-medium truncate">
                                        {svc.name.replace("-SERVICE", "")}
                                    </span>
                                    <Badge
                                        className={`ml-1 text-[10px] px-1.5 py-0 ${
                                            svc.status === "UP"
                                                ? "bg-green-500 text-white"
                                                : "bg-red-500 text-white"
                                        }`}
                                    >
                                        {svc.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                            {upCount} UP &nbsp;·&nbsp; {downCount} DOWN
                        </p>
                    </CardContent>
                </Card>

                {/* Online users */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Wifi size={16} />
                            Người dùng trực tuyến
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-4xl font-bold text-center py-2">
                            {onlineStats?.total ?? "—"}
                        </div>
                        {onlineStats && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                                    <div className="font-bold text-indigo-700">{onlineStats.managers}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Manager</div>
                                </div>
                                <div className="bg-sky-50 rounded-lg p-3 text-center">
                                    <div className="font-bold text-sky-700">{onlineStats.clients}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Khách hàng</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Row 4: Live audit log ── */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-semibold">Hoạt động gần đây</CardTitle>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <RefreshCw size={12} className="animate-spin opacity-40" />
                        poll 10s
                    </span>
                </CardHeader>
                <CardContent>
                    {auditLog.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu</p>
                    ) : (
                        <div className="space-y-2">
                            {auditLog.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Badge
                                            className={`shrink-0 text-[10px] px-1.5 ${
                                                entry.status === "SUCCESS"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {entry.status}
                                        </Badge>
                                        <span className="font-medium truncate">{entry.title}</span>
                                        <span className="text-muted-foreground text-xs truncate hidden sm:block">
                                            — {entry.user?.username ?? "system"}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                        {format(new Date(entry.createdAt), "dd/MM HH:mm")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;
