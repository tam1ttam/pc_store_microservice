import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

const GRAFANA_BASE = import.meta.env.VITE_GRAFANA_URL ?? "http://localhost:3000";
const GRAFANA_DASHBOARD_URL = `${GRAFANA_BASE}/d-solo/loki-logs-dashboard/loki-logs?orgId=1&panelId=1&theme=light`;

const LogTracking: React.FC = () => {
    const { t } = useTranslation();
    const [iframeError, setIframeError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const handleLoad = () => setLoaded(true);
    const handleError = () => setIframeError(true);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{t('logTracking.title')}</h1>
                <a
                    href={GRAFANA_BASE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    {t('logTracking.openGrafana')} <ExternalLink size={14} />
                </a>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('logTracking.grafanaLogs')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {iframeError ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                            <AlertCircle size={40} className="text-red-400" />
                            <p className="font-medium">{t('logTracking.grafanaError')}</p>
                            <p className="text-sm text-center">
                                {t('logTracking.grafanaRunning')}{" "}
                                <code className="bg-muted px-1 rounded">{GRAFANA_BASE}</code>
                                <br />
                                {t('logTracking.grafanaDashboard')} <code className="bg-muted px-1 rounded">loki-logs-dashboard</code> {t('logTracking.grafanaDashboardCreated')}
                            </p>
                            <a
                                href={GRAFANA_BASE}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 text-blue-600 hover:underline text-sm"
                            >
                                {t('logTracking.grafanaOpenDirect')}
                            </a>
                        </div>
                    ) : (
                        <div className="relative w-full h-[600px] border rounded-md overflow-hidden">
                            {!loaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                                    <p className="text-sm text-muted-foreground">{t('logTracking.grafanaLoading')}</p>
                                </div>
                            )}
                            <iframe
                                src={GRAFANA_DASHBOARD_URL}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Grafana Loki Logs"
                                onLoad={handleLoad}
                                onError={handleError}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LogTracking;
