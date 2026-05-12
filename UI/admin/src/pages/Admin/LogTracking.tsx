import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LogTracking: React.FC = () => {
    // This URL should point to your Grafana dashboard.
    // For this to work, Grafana must be configured to allow embedding.
    // You might need to adjust 'anonymous' access and 'allow_embedding' in grafana.ini.
    const grafanaDashboardUrl = "http://localhost:3000/d-solo/loki-logs-dashboard/loki-logs?orgId=1&panelId=1";

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Track Log Service</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Grafana Loki Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Dữ liệu log được lấy trực tiếp từ Grafana. Đảm bảo rằng Grafana, Loki, và Promtail đang chạy.
                    </p>
                    <div className="w-full h-[600px] border rounded-md overflow-hidden">
                        <iframe
                            src={grafanaDashboardUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title="Grafana Loki Logs"
                        ></iframe>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LogTracking;
