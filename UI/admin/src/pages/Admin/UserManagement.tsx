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

interface Customer {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    city?: string;
}

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
            toast({ variant: "destructive", title: t('userManagement.errorTitle'), description: t('userManagement.loadError') });
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
            toast({ title: t('userManagement.successTitle'), description: t('userManagement.assignSuccess', { username: userName }) });
        } catch {
            toast({ variant: "destructive", title: t('userManagement.errorTitle'), description: t('userManagement.assignError') });
        } finally {
            setUpdatingRole(null);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">{t('userManagement.title')}</h1>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('userManagement.totalUsers', { count: totalElements })}
                        </p>
                    )}
                </div>
                <Input
                    placeholder={t('userManagement.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('userManagement.username')}</TableHead>
                            <TableHead>{t('userManagement.fullName')}</TableHead>
                            <TableHead>{t('userManagement.email')}</TableHead>
                            <TableHead>{t('userManagement.phone')}</TableHead>
                            <TableHead>{t('userManagement.city')}</TableHead>
                            <TableHead className="text-right">{t('userManagement.action')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    {t('userManagement.noData')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell className="font-medium">{customer.userName}</TableCell>
                                    <TableCell>{`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || "—"}</TableCell>
                                    <TableCell>{customer.email || "—"}</TableCell>
                                    <TableCell>{customer.phoneNumber || "—"}</TableCell>
                                    <TableCell>{customer.city || "—"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={updatingRole === customer.userName}
                                            onClick={() => handleAssignAdmin(customer.userName)}
                                        >
                                            {updatingRole === customer.userName ? t('userManagement.updating') : t('userManagement.assignAdmin')}
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
        </div>
    );
};

export default UserManagement;
