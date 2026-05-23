import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api/adminApi";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Ticket, Trash, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AccessType = "PUBLIC" | "PRIVATE";

interface VoucherForm {
    code: string;
    description: string;
    discountAmount: string;
    discountPercent: string;
    maxUsage: string;
    maxUsagePerUser: string;
    expiredAt: string;
    isActive: boolean;
    accessType: AccessType;
    userId: string;
}

interface VoucherItem {
    id: number;
    code: string;
    description?: string;
    discountAmount?: number;
    discountPercent?: number;
    maxUsage?: number;
    usedCount?: number;
    maxUsagePerUser?: number;
    expiredAt?: string;
    isActive?: boolean;
    accessType?: AccessType;
    userId?: string;
}

const PAGE_SIZE = 15;

const emptyForm = (): VoucherForm => ({
    code: "",
    description: "",
    discountAmount: "",
    discountPercent: "",
    maxUsage: "",
    maxUsagePerUser: "",
    expiredAt: "",
    isActive: true,
    accessType: "PUBLIC",
    userId: "",
});

const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "—");

export default function Voucher() {
    const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
    const [page, setPage] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<VoucherForm>(emptyForm());
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // User picker state
    const [userSearch, setUserSearch] = useState("");
    const [userResults, setUserResults] = useState<any[]>([]);
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: string; display: string } | null>(null);
    const userSearchTimer = useRef<any>(null);

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const res = await adminApi.listVouchers();
            setVouchers(res.data.result ?? []);
        } catch {
            toast({ title: "Không thể tải danh sách voucher", variant: "destructive" });
        }
    };

    const paged = vouchers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(vouchers.length / PAGE_SIZE);

    const reset = () => {
        setForm(emptyForm());
        setEditingId(null);
        setUserSearch("");
        setUserResults([]);
        setSelectedUser(null);
    };

    const handleUserSearchChange = (value: string) => {
        setUserSearch(value);
        clearTimeout(userSearchTimer.current);
        if (!value.trim()) { setUserResults([]); return; }
        userSearchTimer.current = setTimeout(async () => {
            setIsSearchingUser(true);
            try {
                const res = await adminApi.searchCustomers(value.trim());
                setUserResults(res.data.result?.content ?? []);
            } catch {
                setUserResults([]);
            } finally {
                setIsSearchingUser(false);
            }
        }, 400);
    };

    const selectUser = (u: any) => {
        set("userId", u.id);
        setSelectedUser({
            id: u.id,
            display: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.userName,
        });
        setUserSearch("");
        setUserResults([]);
    };

    const clearSelectedUser = () => {
        set("userId", "");
        setSelectedUser(null);
    };

    const handleOpen = (v?: VoucherItem) => {
        if (v) {
            setEditingId(v.id);
            setForm({
                code: v.code,
                description: v.description ?? "",
                discountAmount: v.discountAmount ? String(v.discountAmount) : "",
                discountPercent: v.discountPercent ? String(v.discountPercent) : "",
                maxUsage: v.maxUsage ? String(v.maxUsage) : "",
                maxUsagePerUser: v.maxUsagePerUser ? String(v.maxUsagePerUser) : "",
                expiredAt: v.expiredAt ? v.expiredAt.slice(0, 16) : "",
                isActive: v.isActive ?? true,
                accessType: v.accessType ?? "PUBLIC",
                userId: v.userId ?? "",
            });
            if (v.accessType === "PRIVATE" && v.userId) {
                setSelectedUser({ id: v.userId, display: v.userId });
            } else {
                setSelectedUser(null);
            }
        } else {
            reset();
        }
        setIsOpen(true);
    };

    const set = (field: keyof VoucherForm, value: any) => setForm((f) => ({ ...f, [field]: value }));

    const handleSubmit = async () => {
        if (!form.code.trim()) {
            toast({ title: "Vui lòng nhập mã voucher", variant: "destructive" });
            return;
        }
        if (form.accessType === "PRIVATE" && !form.userId.trim()) {
            toast({ title: "Vui lòng nhập User ID cho voucher cá nhân", variant: "destructive" });
            return;
        }
        if (!form.discountAmount && !form.discountPercent) {
            toast({ title: "Vui lòng nhập giá trị giảm (số tiền hoặc phần trăm)", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const payload = {
                code: form.code.trim().toUpperCase(),
                description: form.description || null,
                discountAmount: form.discountAmount ? Number(form.discountAmount) : null,
                discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
                maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
                maxUsagePerUser: form.accessType === "PUBLIC" && form.maxUsagePerUser ? Number(form.maxUsagePerUser) : null,
                expiredAt: form.expiredAt || null,
                isActive: form.isActive,
                accessType: form.accessType,
                userId: form.accessType === "PRIVATE" ? form.userId.trim() : null,
            };
            if (editingId != null) {
                await adminApi.updateVoucher(editingId, payload);
                toast({ title: "Cập nhật voucher thành công" });
            } else {
                await adminApi.createVoucher(payload);
                toast({ title: "Tạo voucher thành công" });
            }
            setIsOpen(false);
            reset();
            fetchVouchers();
        } catch (err: any) {
            toast({
                title: "Thất bại",
                description: err?.response?.data?.message ?? "Có lỗi xảy ra",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Xóa voucher này?")) return;
        setIsDeleting(id);
        try {
            await adminApi.deleteVoucher(id);
            toast({ title: "Đã xóa voucher" });
            fetchVouchers();
        } catch {
            toast({ title: "Xóa thất bại", variant: "destructive" });
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="container mx-auto py-6 pt-24">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Ticket className="h-6 w-6 text-orange-500" />
                    Quản lý Voucher
                </h1>

                <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) reset(); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpen()}>
                            <Plus className="mr-2 h-4 w-4" /> Tạo Voucher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingId != null ? "Cập nhật Voucher" : "Tạo Voucher mới"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-2">
                            {/* Access type toggle */}
                            <div className="grid gap-2">
                                <Label>Loại voucher</Label>
                                <div className="flex gap-2">
                                    {(["PUBLIC", "PRIVATE"] as AccessType[]).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => set("accessType", t)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                                form.accessType === t
                                                    ? t === "PUBLIC"
                                                        ? "bg-blue-500 text-white border-blue-500"
                                                        : "bg-purple-500 text-white border-purple-500"
                                                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            {t === "PUBLIC" ? "Công khai" : "Cá nhân"}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    {form.accessType === "PUBLIC"
                                        ? "Ai cũng có thể dùng mã này. Mỗi lần dùng, số lượng giảm 1."
                                        : "Chỉ user được chỉ định mới dùng được. Dùng xong là hết."}
                                </p>
                            </div>

                            {/* Code */}
                            <div className="grid gap-2">
                                <Label>Mã voucher *</Label>
                                <Input
                                    value={form.code}
                                    onChange={(e) => set("code", e.target.value.toUpperCase())}
                                    placeholder={form.accessType === "PUBLIC" ? "VD: SUMMER2025" : "VD: USR-TAM-XK92"}
                                />
                            </div>

                            {/* User picker (private only) */}
                            {form.accessType === "PRIVATE" && (
                                <div className="grid gap-2">
                                    <Label>Người dùng *</Label>

                                    {selectedUser ? (
                                        <div className="flex items-center gap-2 p-2.5 rounded-md border border-purple-200 bg-purple-50">
                                            <User className="w-4 h-4 text-purple-500 shrink-0" />
                                            <span className="text-sm font-medium text-purple-800 flex-1 truncate">
                                                {selectedUser.display}
                                            </span>
                                            <button type="button" onClick={clearSelectedUser} className="p-0.5 hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                                <Input
                                                    className="pl-8"
                                                    placeholder="Tìm theo SĐT, email, tên..."
                                                    value={userSearch}
                                                    onChange={(e) => handleUserSearchChange(e.target.value)}
                                                />
                                            </div>
                                            {(isSearchingUser || userResults.length > 0) && (
                                                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                                    {isSearchingUser && (
                                                        <div className="px-3 py-2 text-sm text-gray-400">Đang tìm...</div>
                                                    )}
                                                    {!isSearchingUser && userResults.map((u) => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => selectUser(u)}
                                                            className="w-full text-left px-3 py-2 hover:bg-purple-50 text-sm flex flex-col border-b border-gray-100 last:border-0"
                                                        >
                                                            <span className="font-medium text-gray-800">
                                                                {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.userName}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {u.phoneNumber} {u.email ? `· ${u.email}` : ""}
                                                            </span>
                                                        </button>
                                                    ))}
                                                    {!isSearchingUser && userSearch && userResults.length === 0 && (
                                                        <div className="px-3 py-2 text-sm text-gray-400">Không tìm thấy</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label>Mô tả</Label>
                                <Input
                                    value={form.description}
                                    onChange={(e) => set("description", e.target.value)}
                                    placeholder="Mô tả ngắn về voucher"
                                />
                            </div>

                            {/* Discount */}
                            <div className="grid gap-2">
                                <Label>Giảm giá (chỉ điền 1 trong 2)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-gray-500">Số tiền (VND)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={form.discountAmount}
                                            onChange={(e) => { set("discountAmount", e.target.value); set("discountPercent", ""); }}
                                            placeholder="VD: 50000"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">Phần trăm (%)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form.discountPercent}
                                            onChange={(e) => { set("discountPercent", e.target.value); set("discountAmount", ""); }}
                                            placeholder="VD: 10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Max usage */}
                            <div className={`grid gap-2 ${form.accessType === "PUBLIC" ? "grid-cols-2" : ""}`}>
                                <div className="grid gap-2">
                                    <Label>Số lượng tổng (để trống = không giới hạn)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={form.maxUsage}
                                        onChange={(e) => set("maxUsage", e.target.value)}
                                        placeholder="VD: 100"
                                    />
                                </div>
                                {form.accessType === "PUBLIC" && (
                                    <div className="grid gap-2">
                                        <Label>Tối đa / user (để trống = không giới hạn)</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={form.maxUsagePerUser}
                                            onChange={(e) => set("maxUsagePerUser", e.target.value)}
                                            placeholder="VD: 1"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Expiry */}
                            <div className="grid gap-2">
                                <Label>Ngày hết hạn (để trống = không hết hạn)</Label>
                                <Input
                                    type="datetime-local"
                                    value={form.expiredAt}
                                    onChange={(e) => set("expiredAt", e.target.value)}
                                />
                            </div>

                            {/* Active */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => set("isActive", e.target.checked)}
                                    className="w-4 h-4 accent-blue-500"
                                />
                                <Label htmlFor="isActive">Kích hoạt</Label>
                            </div>

                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? "Đang lưu..." : editingId != null ? "Cập nhật" : "Tạo Voucher"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Giảm giá</TableHead>
                        <TableHead>Đã dùng / Tổng</TableHead>
                        <TableHead>Tối đa / user</TableHead>
                        <TableHead>Hết hạn</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paged.map((v) => (
                        <TableRow key={v.id}>
                            <TableCell className="font-mono font-semibold">{v.code}</TableCell>
                            <TableCell>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        v.accessType === "PRIVATE"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-blue-100 text-blue-700"
                                    }`}
                                >
                                    {v.accessType === "PRIVATE" ? "Cá nhân" : "Công khai"}
                                </span>
                            </TableCell>
                            <TableCell>
                                {v.discountAmount
                                    ? formatVND(v.discountAmount)
                                    : v.discountPercent
                                    ? `${v.discountPercent}%`
                                    : "—"}
                            </TableCell>
                            <TableCell>
                                {v.usedCount ?? 0}
                                {v.maxUsage ? ` / ${v.maxUsage}` : " / ∞"}
                            </TableCell>
                            <TableCell>
                                {v.accessType === "PUBLIC" ? (v.maxUsagePerUser ?? "∞") : "—"}
                            </TableCell>
                            <TableCell>{formatDate(v.expiredAt)}</TableCell>
                            <TableCell>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        v.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}
                                >
                                    {v.isActive ? "Đang hoạt động" : "Tắt"}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon" onClick={() => handleOpen(v)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleDelete(v.id)}
                                        disabled={isDeleting === v.id}
                                    >
                                        {isDeleting === v.id ? "..." : <Trash className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {paged.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-gray-400 py-8">
                                Chưa có voucher nào
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                        <ChevronLeft className="h-4 w-4" /> Trước
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                        {page + 1} / {totalPages}
                    </span>
                    <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                        Tiếp <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
