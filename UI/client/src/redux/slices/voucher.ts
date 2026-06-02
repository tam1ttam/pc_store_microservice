import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { voucherApi } from "@/services/api/voucherApi";

export interface AvailableVoucher {
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
    accessType?: "PUBLIC" | "PRIVATE";
}

interface VoucherState {
    available: AvailableVoucher[];
    loaded: boolean;
}

const initialState: VoucherState = {
    available: [],
    loaded: false,
};

export const fetchAvailableVouchers = createAsyncThunk(
    "voucher/fetchAvailable",
    async () => {
        const res = await voucherApi.getAvailable() as any;
        const list: AvailableVoucher[] = res.data?.result ?? [];
        const now = new Date();
        // Lọc client-side: active, chưa hết hạn, chưa hết lượt
        return list.filter(
            (v) =>
                v.isActive &&
                (!v.expiredAt || new Date(v.expiredAt) > now) &&
                (!v.maxUsage || (v.usedCount ?? 0) < v.maxUsage)
        );
    }
);

const voucherSlice = createSlice({
    name: "voucher",
    initialState,
    reducers: {
        clearVouchers(state) {
            state.available = [];
            state.loaded = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAvailableVouchers.fulfilled, (state, action: PayloadAction<AvailableVoucher[]>) => {
            state.available = action.payload;
            state.loaded = true;
        });
        builder.addCase(fetchAvailableVouchers.rejected, (state) => {
            state.available = [];
            state.loaded = true;
        });
    },
});

export const { clearVouchers } = voucherSlice.actions;
export default voucherSlice.reducer;

/**
 * Trả về giá trị giảm của voucher cho sản phẩm giá `price`.
 */
function getVoucherDiscount(v: AvailableVoucher, price: number): number {
    if (v.discountAmount && v.discountAmount > 0) return Math.min(v.discountAmount, price);
    if (v.discountPercent && v.discountPercent > 0) return (price * v.discountPercent) / 100;
    return 0;
}

function isVoucherValid(v: AvailableVoucher): boolean {
    if (!v.isActive) return false;
    if (v.expiredAt && new Date(v.expiredAt) < new Date()) return false;
    if (v.maxUsage != null && (v.usedCount ?? 0) >= v.maxUsage) return false;
    return true;
}

/**
 * Tìm voucher cho discount tốt nhất cho sản phẩm giá `price`.
 * Trả về null nếu không có voucher nào hợp lệ.
 */
export function findBestVoucher(
    price: number,
    vouchers: AvailableVoucher[]
): { voucher: AvailableVoucher; discount: number } | null {
    if (price <= 0 || vouchers.length === 0) return null;
    let best: { voucher: AvailableVoucher; discount: number } | null = null;
    for (const v of vouchers) {
        if (!isVoucherValid(v)) continue;
        const d = getVoucherDiscount(v, price);
        if (d > 0 && (!best || d > best.discount)) {
            best = { voucher: v, discount: d };
        }
    }
    return best;
}

/**
 * Tính khoản giảm tốt nhất có thể áp dụng cho 1 sản phẩm có giá `price`.
 */
export function computeBestDiscount(price: number, vouchers: AvailableVoucher[]): number {
    return findBestVoucher(price, vouchers)?.discount ?? 0;
}
