import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Hardcoded data simulating response from a discovery service (like Eureka)
const hardcodedServices = [
    { name: "API-GATEWAY", status: "UP", instances: 1 },
    { name: "IDENTITY-SERVICE", status: "UP", instances: 1 },
    { name: "DISCOVERY-SERVICE", status: "UP", instances: 1 },
    { name: "CHAT-SERVICE", status: "DOWN", instances: 0 },
    { name: "PRODUCT-SERVICE", status: "UP", instances: 2 },
    { name: "ORDER-SERVICE", status: "UP", instances: 1 },
    { name: "FILE-SERVICE", status: "UP", instances: 1 },
    { name: "NOTIFICATION-SERVICE", status: "UP", instances: 1 },
];

const ServiceHealth: React.FC = () => {
    const [services, setServices] = useState(hardcodedServices);
    const [isLoading, setIsLoading] = useState(false);

    const fetchServiceHealth = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // In a real app, you'd fetch from your discovery service endpoint
            // For demonstration, we'll just shuffle the statuses
            const updatedServices = services.map(s => ({
                ...s,
                status: Math.random() > 0.2 ? "UP" : "DOWN",
            }));
            setServices(updatedServices);
            setIsLoading(false);
        }, 1000);
    };

    useEffect(() => {
        fetchServiceHealth();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Theo dõi sức khỏe Service</h1>
                <Button onClick={fetchServiceHealth} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Làm mới
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                    <Card key={service.name}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                            <Badge
                                className={service.status === "UP" ? "bg-green-500" : "bg-red-500"}
                            >
                                {service.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{service.instances} Instances</div>
                            <p className="text-xs text-muted-foreground">
                                {service.status === "UP" ? "Đang hoạt động" : "Không thể kết nối"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ServiceHealth;
