import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const EUREKA_URL = `${import.meta.env.VITE_API_URL}/api-gateway/eureka/apps`;

const KNOWN_SERVICES = [
    "API-GATEWAY",
    "IDENTITY-SERVICE",
    "DISCOVERY-SERVICE",
    "USER-SERVICE",
    "PRODUCT-SERVICE",
    "ORDER-SERVICE",
    "CHAT-SERVICE",
    "FILE-SERVICE",
    "NOTIFICATION-SERVICE",
    "SAGA-ORCHESTRATOR-SERVICE",
];

interface ServiceStatus {
    name: string;
    status: "UP" | "DOWN";
}

async function fetchEurekaStatuses(): Promise<ServiceStatus[]> {
    const res = await fetch(EUREKA_URL, {
        headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Eureka returned ${res.status}`);
    const data = await res.json();

    const apps: any[] = data?.applications?.application ?? [];
    const upSet = new Set<string>(
        apps.map((app: any) => (app.name as string).toUpperCase())
    );

    return KNOWN_SERVICES.map((name) => ({
        name,
        status: upSet.has(name) ? "UP" : "DOWN",
    }));
}

const ServiceHealth: React.FC = () => {
    const [services, setServices] = useState<ServiceStatus[]>(
        KNOWN_SERVICES.map((name) => ({ name, status: "DOWN" }))
    );
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const statuses = await fetchEurekaStatuses();
            setServices(statuses);
            setLastUpdated(new Date());
        } catch (e: any) {
            setError("Không thể kết nối tới Discovery Service");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 10_000);
        return () => clearInterval(interval);
    }, [refresh]);

    const upCount = services.filter((s) => s.status === "UP").length;
    const downCount = services.filter((s) => s.status === "DOWN").length;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Trạng thái dịch vụ</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {upCount} UP &nbsp;·&nbsp; {downCount} DOWN
                        {lastUpdated && (
                            <span className="ml-2">
                                · cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN")}
                            </span>
                        )}
                    </p>
                </div>
                <Button onClick={refresh} disabled={isLoading} size="sm">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Làm mới
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {services.map((service) => (
                    <Card key={service.name} className={service.status === "DOWN" ? "border-red-200 bg-red-50" : ""}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {service.name.replace("-SERVICE", "").replace("-", " ")}
                            </CardTitle>
                            <Badge className={service.status === "UP" ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                                {service.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="px-4 pb-3">
                            <p className="text-xs text-muted-foreground">
                                {service.status === "UP" ? "Đang hoạt động" : "Không phản hồi"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ServiceHealth;
