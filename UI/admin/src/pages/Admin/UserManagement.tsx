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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import UserAccessAnalytics from "@/components/UserAccessAnalytics";
import { X, User, ShieldCheck, Shield, BarChart3, Users, Edit2, Save, CircleX } from "lucide-react";

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
    onUpdateUser: (userName: string, data: any) => Promise<void>;
    onUpdateRole: (userName: string, roleName: string) => Promise<void>;
    roles: any[];
    updating: boolean;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[100px]">{label}</span>
        <span className="text-sm text-gray-800 text-right break-all">{value}</span>
    </div>
);

const DetailPanel: React.FC<DetailPanelProps> = ({ customer, onClose, onUpdateUser, onUpdateRole, roles, updating }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phoneNumber: customer.phoneNumber || "",
        gender: customer.gender || "",
        dob: customer.dob || "",
        role: "USER", // Default
    });

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await userApi.getUserRole(customer.userName);
                const role = res.data?.result || "USER";
                setFormData(prev => ({ ...prev, role }));
            } catch (e) {
                console.error("Failed to fetch user role", e);
            }
        };

        setFormData({
            firstName: customer.firstName || "",
            lastName: customer.lastName || "",
            email: customer.email || "",
            phoneNumber: customer.phoneNumber || "",
            gender: customer.gender || "",
            dob: customer.dob || "",
            role: "USER",
        });
        fetchRole();
    }, [customer]);

    const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—";

    const handleSave = async () => {
        try {
            await onUpdateUser(customer.userName, formData);
            await onUpdateRole(customer.userName, formData.role);
            setIsEditing(false);
        } catch (e) {
            // Error handled by parent
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 sticky top-0">
                    <h2 className="text-lg font-semibold text-gray-800">{t("customer.detail")}</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center py-6 border-b">
                    {customer.avatar ? (
                        <img src={customer.avatar} alt={fullName} className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-200" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                            <User size={36} className="text-blue-400" />
                        </div>
                    )}
                    <p className="mt-3 text-lg font-semibold text-gray-800">{fullName}</p>
                    <p className="text-sm text-gray-500">@{customer.userName}</p>
                    {customer.isActive !== undefined && customer.isActive !== null && (
                        <span className={`mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${customer.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {customer.isActive ? t("customer.active") : t("customer.inactive")}
                        </span>
                    )}
                </div>

                <div className="px-6 py-4 flex-1">
                    {!isEditing ? (
                        <>
                            <InfoRow label={t("customer.customerEmail")} value={customer.email || "—"} />
                            <InfoRow label={t("customer.customerPhone")} value={customer.phoneNumber || "—"} />
                            <InfoRow label={t("customer.detailGender")} value={customer.gender || "—"} />
                            <InfoRow label={t("customer.detailDob")} value={customer.dob || "—"} />
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-gray-500">First Name</Label>
                                    <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-gray-500">Last Name</Label>
                                    <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-gray-500">{t("customer.customerEmail")}</Label>
                                <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-gray-500">{t("customer.customerPhone")}</Label>
                                <Input value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-gray-500">{t("customer.detailGender")}</Label>
                                    <Input value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-gray-500">{t("customer.detailDob")}</Label>
                                    <Input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {Array.isArray(customer.addresses) && customer.addresses.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{t("customer.detailAddresses")}</p>
                            <div className="space-y-2">
                                {customer.addresses.map((addr, i) => {
                                    const parts = [addr.street, addr.ward, addr.city, addr.province, addr.country].filter(Boolean);
                                    return (
                                        <div key={addr.id ?? i} className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                                            {parts.join(", ") || "—"}
                                            {addr.isDefault && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-600 font-medium">{t("customer.defaultAddress")}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t bg-gray-50">
                    <p className="text-xs text-gray-500 mb-3">{t("customer.permissions")}</p>
                    {!isEditing ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="w-full gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                        >
                            <Edit2 size={14} /> {t("common.update") || "Cập nhật thông tin"}
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-gray-500">Role</Label>
                                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role.name} value={role.name}>{role.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" className="flex-1 gap-2" onClick={() => setIsEditing(false)} disabled={updating}>
                                    <CircleX size={14} /> {t("common.cancel") || "Hủy"}
                                </Button>
                                <Button className="flex-1 gap-2" onClick={handleSave} disabled={updating}>
                                    {updating ? <><Shield size={14} className="animate-spin" /> {t("common.processing")}</> : <><Save size={14} /> {t("common.save") || "Lưu"}</>}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserManagement: React.FC = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');
    const pageSize = 10;

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearch]);

    const fetchRoles = useCallback(async () => {
        try {
            const res = await adminApi.getRoles();
            setRoles(res.data?.result ?? []);
        } catch {
            toast({ variant: "destructive", title: t("common.errorTitle") || "Lỗi", description: t("common.loadError") || "Không thể tải danh sách quyền" });
        }
    }, [toast, t]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const fetchCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = debouncedSearch.trim()
                ? await adminApi.searchCustomers(debouncedSearch.trim(), currentPage, pageSize)
                : await adminApi.getCustomers(currentPage, pageSize);

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

    const handleUpdateUser = async (userName: string, data: any) => {
        try {
            await adminApi.updateUserProfile(userName, data);
            toast({ title: t("customer.successTitle"), description: t("customer.updateSuccess") || "Cập nhật thông tin thành công" });
        } catch {
            toast({ variant: "destructive", title: t("customer.failedTitle"), description: t("customer.updateFailed") || "Cập nhật thông tin thất bại" });
            throw new Error("Update profile failed");
        }
    };

    const handleUpdateRole = async (userName: string, roleName: string) => {
        try {
            await adminApi.updateUserRole(userName, roleName);
            toast({ title: t("customer.successTitle"), description: t("customer.roleUpdateSuccess") || "Cập nhật quyền thành công" });
        } catch {
            toast({ variant: "destructive", title: t("customer.failedTitle"), description: t("customer.roleUpdateFailed") || "Cập nhật quyền thất bại" });
            throw new Error("Update role failed");
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold">{t("userManagement.title")}</h1>
                    <div className="flex gap-2 mt-4">
                        <Button
                            variant={activeTab === 'list' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('list')}
                            className="gap-2"
                        >
                            <Users size={16} /> {t("userManagement.tabList") || "Danh sách người dùng"}
                        </Button>
                        <Button
                            variant={activeTab === 'analytics' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('analytics')}
                            className="gap-2"
                        >
                            <BarChart3 size={16} /> {t("userManagement.tabAnalytics") || "Thống kê truy cập"}
                        </Button>
                    </div>
                </div>
                {activeTab === 'list' && (
                    <Input
                        placeholder={t("userManagement.searchPlaceholder")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                )}
            </div>

            {activeTab === 'list' ? (
                <div className="space-y-4">
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
                                            {t("customer.noCustomers")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer, index) => (
                                        <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="text-gray-500">
                                                {currentPage * pageSize + index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
                                            </TableCell>
                                            <TableCell>{customer.userName}</TableCell>
                                            <TableCell>{customer.email || "—"}</TableCell>
                                            <TableCell>{customer.phoneNumber || "—"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)}>
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
                                    <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))} />
                                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                href="#"
                                                isActive={i === currentPage}
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationNext onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))} />
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            ) : (
                <UserAccessAnalytics />
            )}

            {selectedCustomer && (
                <DetailPanel
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onUpdateUser={handleUpdateUser}
                    onUpdateRole={handleUpdateRole}
                    roles={roles}
                    updating={updating}
                />
            )}
        </div>
    );
};

export default UserManagement;