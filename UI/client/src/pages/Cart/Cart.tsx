import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { getCart, removeCartItem } from "@/redux/thunks/cart";
import { cartApi } from "@/services/api/cartApi";
import { Box, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CartItem } from "@/types/Cart";

function Cart() {
    const { items, status } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch<any>();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(getCart());
    }, [dispatch]);

    useEffect(() => {
        if (items.length > 0) {
            const init: Record<number, number> = {};
            items.forEach((item) => {
                init[item.id] = item.quantity;
            });
            setQuantities(init);
        }
    }, [items]);

    const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));

    const toggleItem = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i.id)));
        }
    };

    const totalPrice = useMemo(
        () =>
            items
                .filter((i) => selectedIds.has(i.id))
                .reduce((sum, item) => sum + item.productPrice * (quantities[item.id] ?? item.quantity), 0),
        [items, selectedIds, quantities]
    );

    const handleChangeQuantity = async (item: CartItem, next: number) => {
        if (next < 1) return;
        const prev = quantities[item.id] ?? item.quantity;
        setQuantities((q) => ({ ...q, [item.id]: next }));
        setUpdatingId(item.id);
        try {
            await cartApi.upsertItem(item.productId, item.productName, item.productPrice, next, item.productImage);
            dispatch(getCart());
        } catch {
            setQuantities((q) => ({ ...q, [item.id]: prev }));
            toast({ variant: "destructive", title: "Cập nhật số lượng thất bại" });
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (itemId: number) => {
        try {
            await dispatch(removeCartItem({ itemId })).unwrap();
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        } catch {
            toast({ variant: "destructive", title: "Xóa sản phẩm thất bại" });
        }
    };

    const handleCheckout = () => {
        if (selectedIds.size === 0) {
            toast({ variant: "destructive", title: "Vui lòng chọn ít nhất một sản phẩm" });
            return;
        }
        navigate("/checkout", { state: { selectedItemIds: Array.from(selectedIds) } });
    };

    const selectedCount = items.filter((i) => selectedIds.has(i.id)).reduce((s, i) => s + (quantities[i.id] ?? i.quantity), 0);

    return (
        <div className="container mx-auto px-4 pb-24 relative pt-24">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
                <span>/</span>
                <span className="text-orange-500">Giỏ hàng</span>
            </div>

            {status === "loading" && items.length === 0 ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : !items?.length ? (
                <div className="text-center py-16">
                    <ShoppingCart className="w-20 h-20 mx-auto text-orange-500 mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">Không có sản phẩm trong giỏ hàng</p>
                    <Button asChild variant="outline" className="hover:text-orange-500 hover:border-orange-500">
                        <Link to="/products">Tiếp tục mua sắm</Link>
                    </Button>
                </div>
            ) : (
                <>
                    {/* Header row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-2 text-sm text-gray-500">
                        <div className="col-span-5 flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                                className="w-4 h-4 accent-orange-500"
                            />
                            <span>Sản phẩm</span>
                        </div>
                        <div className="col-span-2 text-center">Đơn giá</div>
                        <div className="col-span-2 text-center">Số lượng</div>
                        <div className="col-span-2 text-center">Thành tiền</div>
                        <div className="col-span-1 text-center">Xóa</div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 mb-2">
                        {items.map((item) => {
                            const qty = quantities[item.id] ?? item.quantity;
                            const isUpdating = updatingId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 grid grid-cols-12 gap-4 items-center"
                                >
                                    {/* Checkbox + Image + Name */}
                                    <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleItem(item.id)}
                                            className="w-4 h-4 accent-orange-500 flex-shrink-0"
                                        />
                                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {item.productImage ? (
                                                <img
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            ) : (
                                                <Box className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium line-clamp-2 flex-1">{item.productName}</span>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-4 md:col-span-2 text-center">
                                        <span className="text-sm text-orange-500 font-medium">
                                            {item.productPrice.toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleChangeQuantity(item, qty - 1)}
                                            disabled={isUpdating || qty <= 1}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : qty}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleChangeQuantity(item, qty + 1)}
                                            disabled={isUpdating}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="col-span-3 md:col-span-2 text-center">
                                        <span className="text-sm font-semibold text-orange-500">
                                            {(item.productPrice * qty).toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>

                                    {/* Delete */}
                                    <div className="col-span-1 flex justify-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom sticky bar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
                        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
                            <div className="flex items-center gap-2 mr-auto">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleAll}
                                    className="w-4 h-4 accent-orange-500"
                                />
                                <span className="text-sm text-gray-600">
                                    Chọn tất cả ({items.length})
                                </span>
                            </div>

                            <Separator orientation="vertical" className="h-8 hidden sm:block" />

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Tổng tiền:</span>
                                <span className="text-lg font-bold text-orange-500">
                                    {totalPrice.toLocaleString("vi-VN")}đ
                                </span>
                            </div>

                            <Button
                                className="bg-orange-500 hover:bg-orange-600 min-w-[140px]"
                                onClick={handleCheckout}
                                disabled={selectedIds.size === 0}
                            >
                                Mua hàng ({selectedCount})
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Cart;
