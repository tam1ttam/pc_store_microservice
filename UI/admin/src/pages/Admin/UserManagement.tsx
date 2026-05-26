import React, { useState, useEffect, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { adminApi } from "@/services/api/adminApi";
import { X, User, ShieldCheck, Shield } from "lucide-react";

interface AddressItem {
    id?: string;
    country?: string;
    province?: string;
    city?: string;
    ward?: string;
    street?: string;
    isDefault?: boolean;
    phoneContacts?: string[];
}

interface Customer {
    id: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    avatar?: string;
    dob?: string;
    gender?: string;
    isActive?: boolean;
    addresses?: AddressItem[];
}

interface DetailPanelProps {
    customer: Customer;
    onClose: () => void;
    onGrantAdmin: (userName: string) => Promise<void>;
    updatingRole: string | null;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[100px]">{label}</span>
        <span className="text-sm text-gray-800 text-right break-all">{value}</span>
    </div>
);

const DetailPanel: React.FC<DetailPanelProps> = ({ customer, onClose, onGrantAdmin, updatingRole }) => {
    const { t } = useTranslation();
    const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—";
    const isUpdating = updatingRole === customer.userName;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 sticky top-0">
                    <h2 className="text-lg font-semibold text-gray-800">{t("customer.detail")}</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center py-6 border-b">
                    {customer.avatar ? (
                        <img
                            src={customer.avatar}
                            alt={fullName}
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-200"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                            <User size={36} className="text-blue-400" />
                        </div>
                    )}
                    <p className="mt-3 text-lg font-semibold text-gray-800">{fullName}</p>
                    <p className="text-sm text-gray-500">@{customer.userName}</p>
                    {customer.isActive !== undefined && customer.isActive !== null && (
                        <span
                            className={`mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                customer.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                            }`}
                        >
                            {customer.isActive ? t("customer.active") : t("customer.inactive")}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="px-6 py-4 flex-1">
                    <InfoRow label={t("customer.customerEmail")} value={customer.email || "—"} />
                    <InfoRow label={t("customer.customerPhone")} value={customer.phoneNumber || "—"} />
                    <InfoRow label={t("customer.detailGender")} value={customer.gender || "—"} />
                    <InfoRow label={t("customer.detailDob")} value={customer.dob || "—"} />

                    {/* Addresses */}
                    {Array.isArray(customer.addresses) && customer.addresses.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                {t("customer.detailAddresses")}
                            </p>
                            <div className="space-y-2">
                                {customer.addresses.map((addr, i) => {
                                    const parts = [addr.street, addr.ward, addr.city, addr.province, addr.country].filter(Boolean);
                                    return (
                                        <div key={addr.id ?? i} className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                                            {parts.join(", ") || "—"}
                                            {addr.isDefault && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-600 font-medium">
                                                    {t("customer.defaultAddress")}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Grant Admin action */}
                <div className="px-6 py-4 border-t bg-gray-50">
                    <p className="text-xs text-gray-500 mb-3">{t("customer.permissions")}</p>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => onGrantAdmin(customer.userName)}
                        className="w-full gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                        {isUpdating ? (
                            <><Shield size={14} className="animate-spin" /> {t("common.processing")}</>
                        ) : (
                            <><ShieldCheck size={14} /> {t("customer.grantAdmin")}</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const UserManagement: React.FC = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const pageSize = 10;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearch]);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            let res: any;
            if (debouncedSearch.trim()) {
                res = await adminApi.searchCustomers(debouncedSearch.trim(), currentPage, pageSize);
            } else {
                res = await adminApi.getCustomers(currentPage, pageSize);
            }
            const page = res.data?.result;
            setCustomers(page?.content ?? []);
            setTotalPages(page?.totalPages ?? 0);
            setTotalElements(page?.totalElements ?? 0);
        } catch {
            toast({ variant: "destructive", title: t("userManagement.errorTitle"), description: t("userManagement.loadError") });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, debouncedSearch, toast, t]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleAssignAdmin = async (userName: string) => {
        setUpdatingRole(userName);
        try {
            await adminApi.updateUserRole(userName);
            toast({
                title: t("customer.successTitle"),
                description: t("customer.grantAdminSuccess", { username: userName }),
            });
        } catch {
            toast({
                variant: "destructive",
                title: t("customer.failedTitle"),
                description: t("customer.grantAdminFailed"),
            });
        } finally {
            setUpdatingRole(null);
        }
    };

    const skeletonCols = 6;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">{t("userManagement.title")}</h1>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {t("userManagement.totalUsers", { count: totalElements })}
                        </p>
                    )}
                </div>
                <Input
                    placeholder={t("userManagement.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">{t("customer.stt")}</TableHead>
                            <TableHead>{t("customer.customerName")}</TableHead>
                            <TableHead>{t("customer.customerUsername")}</TableHead>
                            <TableHead>{t("customer.customerEmail")}</TableHead>
                            <TableHead>{t("customer.customerPhone")}</TableHead>
                            <TableHead className="text-right">{t("customer.viewDetail")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: skeletonCols }).map((__, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={skeletonCols} className="text-center text-muted-foreground py-8">
                                    {t("customer.noCustomers")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer, index) => (
                                <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="text-gray-500">{currentPage * pageSize + index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                        {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
                                    </TableCell>
                                    <TableCell>{customer.userName}</TableCell>
                                    <TableCell>{customer.email || "—"}</TableCell>
                                    <TableCell>{customer.phoneNumber || "—"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedCustomer(customer)}
                                        >
                                            {t("customer.viewDetail")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationPrevious
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                            />
                            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                                const page = i;
                                return (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            isActive={page === currentPage}
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                                        >
                                            {page + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationNext
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                            />
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {selectedCustomer && (
                <DetailPanel
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onGrantAdmin={handleAssignAdmin}
                    updatingRole={updatingRole}
                />
            )}
        </div>
    );
};

export default UserManagement;
