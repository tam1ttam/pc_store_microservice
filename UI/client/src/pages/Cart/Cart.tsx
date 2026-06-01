import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { getCart, removeCartItem } from "@/redux/thunks/cart";
import { cartApi } from "@/services/api/cartApi";
import { Box, Loader2 } from "lucide-react";
import { CartItem } from "@/types/Cart";

function Cart() {
  const { t } = useTranslation();
  const { items, status } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<any>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [changeLoadingId, setChangeLoadingId] = useState<number | null>(null);

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

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i));

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

  const requestRemove = (itemId: number) => {
    setRemoveTargetId(itemId);
  };

  const confirmRemove = async () => {
    if (removeTargetId == null) return;
    const itemId = removeTargetId;
    setRemoveTargetId(null);
    setRemoveLoading(true);
    try {
      await dispatch(removeCartItem({ itemId })).unwrap();
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    } catch {
      toast({ variant: "destructive", title: t('cart.removeFailed') });
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleChangeQuantity = async (item: CartItem, next: number) => {
    if (next < 1) {
      requestRemove(item.id);
      return;
    }
    const prev = quantities[item.id] ?? item.quantity;
    setChangeLoadingId(item.id);
    setQuantities((q) => ({ ...q, [item.id]: next }));
    try {
      await cartApi.upsertItem(item.productId, item.productName, item.productPrice, next, item.productImage);
    } catch {
      setQuantities((q) => ({ ...q, [item.id]: prev }));
      toast({ variant: "destructive", title: t('cart.updateQuantityFailed') });
    } finally {
      setChangeLoadingId(null);
    }
  };

  const handleCheckout = () => {
    if (selectedIds.size === 0) {
      toast({ variant: "destructive", title: t('cart.selectAtLeastOne') });
      return;
    }
    navigate("/checkout", { state: { selectedItemIds: Array.from(selectedIds) } });
  };

  const selectedCount = items
    .filter((i) => selectedIds.has(i.id))
    .reduce((s, i) => s + (quantities[i.id] ?? i.quantity), 0);

  const isChanging = (id: number) => changeLoadingId === id;
  const removeTarget = removeTargetId != null ? items.find((i) => i.id === removeTargetId) : null;

  return (
    <div className="container mx-auto px-4 pb-24 relative pt-24">
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-orange-500 transition-colors">{t('cart.breadcrumbHome')}</Link>
        <span>/</span>
        <span className="text-orange-500">{t('cart.title')}</span>
      </div>

      {status === "loading" && items.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : !items?.length ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-20 h-20 mx-auto text-orange-500 mb-4" />
          <p className="text-muted-foreground text-lg mb-4">{t('cart.emptyMsg')}</p>
          <Button asChild variant="outline" className="hover:text-orange-500 hover:border-orange-500">
            <Link to="/products">{t('cart.continueShopping')}</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-white border border-gray-200 rounded-lg px-4 py-3 mb-2 text-sm text-gray-500">
            <div className="col-span-5 flex items-center gap-3">
              <input
                type="checkbox"
                checked={!!allSelected}
                onChange={toggleAll}
                className="w-4 h-4 accent-orange-500"
              />
              <span>{t('cart.product')}</span>
            </div>
            <div className="col-span-2 text-center">{t('cart.unitPrice')}</div>
            <div className="col-span-2 text-center">{t('cart.quantity')}</div>
            <div className="col-span-2 text-center">{t('cart.amount')}</div>
            <div className="col-span-1 text-center">{t('cart.delete')}</div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-2">
            {items.map((item) => {
              const qty = quantities[item.id] ?? item.quantity;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 grid grid-cols-12 gap-4 items-center"
                >
                  {/* Checkbox + Image + Name */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!selectedIds.has(item.id)}
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
                      disabled={qty <= 1 || !!isChanging(item.id)}
                    >
                      {isChanging(item.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleChangeQuantity(item, qty + 1)}
                      disabled={!!isChanging(item.id)}
                    >
                      {isChanging(item.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
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
                      onClick={() => requestRemove(item.id)}
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
                  checked={!!allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-600">
                  {t('cart.selectAll')} ({items.length})
                </span>
              </div>

              <Separator orientation="vertical" className="h-8 hidden sm:block" />

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t('cart.totalPrice')}</span>
                <span className="text-lg font-bold text-orange-500">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <Button
                className="bg-orange-500 hover:bg-orange-600 min-w-[140px]"
                onClick={handleCheckout}
                disabled={selectedIds.size === 0}
              >
                {t('cart.checkoutItems', { count: selectedCount })}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Confirm remove dialog */}
      <Dialog open={removeTargetId != null} onOpenChange={(open) => { if (!open) setRemoveTargetId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cart.confirmRemoveTitle', 'Xác nhận xóa')}</DialogTitle>
            <DialogDescription>
              {removeTarget
                ? t('cart.confirmRemoveDesc', 'Bạn có chắc muốn xóa {{name}} khỏi giỏ hàng?', {
                  name: removeTarget.productName,
                })
                : t('cart.confirmRemoveGeneric', 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTargetId(null)}
              disabled={removeLoading}
            >
              {t('cart.cancel', 'Hủy')}
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={removeLoading}>
              {removeLoading ? t('cart.removing', 'Đang xóa...') : t('cart.remove', 'Xóa')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Cart;
