import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks";
import { RootState } from "@/redux/store";
import { clearPendingOrders } from "@/redux/slices/orderManage";
import { confirmOrder, fetchPendingOrders } from "@/redux/thunks/orderManage";
import { orderApi } from "@/services/api/orderApi";
import { OrderStatus } from "@/types";

type TabKey = "pending" | "purchased";

export default function OrderManage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pendingOrders, status, error } = useSelector(
    (state: RootState) => state.orderManage
  );
  const { info: user } = useSelector((state: RootState) => state.user);
  const [tab, setTab] = useState<TabKey>("pending");
  const [purchased, setPurchased] = useState<any[]>([]);
  const [loadingPurchased, setLoadingPurchased] = useState(false);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchPendingOrders() as any);
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (error) {
      toast({ title: error, variant: "destructive" });
    }
  }, [error]);

  const handleConfirm = async (orderId: number) => {
    try {
      await dispatch(confirmOrder(orderId) as any);
      toast({ title: "Đã xác nhận đơn hàng" });
    } catch {
      toast({ title: "Xác nhận thất bại", variant: "destructive" });
    }
  };

  const loadPurchased = async () => {
    setLoadingPurchased(true);
    try {
      const res = await orderApi.getOrders();
      const list: any[] = (res as any).data?.result ?? (res as any).data ?? [];
      const filtered = list.filter(
        (o) =>
          o.orderStatus === OrderStatus.PAID ||
          o.orderStatus === OrderStatus.DELIVERING ||
          o.orderStatus === OrderStatus.DELIVERED
      );
      setPurchased(filtered);
    } catch {
      toast({ title: "Không thể tải đơn hàng", variant: "destructive" });
    } finally {
      setLoadingPurchased(false);
    }
  };

  useEffect(() => {
    if (tab === "purchased") {
      loadPurchased();
    }
  }, [tab]);

  const statusLabel: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    PAID: "Đã thanh toán",
    DELIVERING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    DELIVERING: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition ${tab === "pending"
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          Chờ xác nhận ({pendingOrders.length})
        </button>
        <button
          onClick={() => setTab("purchased")}
          className={`px-4 py-2 rounded-lg font-medium transition ${tab === "purchased"
              ? "bg-orange-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          Đã mua
        </button>
      </div>

      {tab === "pending" && (
        <>
          {status === "loading" && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {status === "failed" && (
            <p className="text-center text-red-500 py-8">Không thể tải danh sách đơn chờ</p>
          )}
          {status === "succeeded" && pendingOrders.length === 0 && (
            <p className="text-center text-gray-500 py-8">Không có đơn hàng chờ xác nhận</p>
          )}
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold">Đơn #{order.id}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {order.orderDate}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.orderStatus] ?? "bg-gray-100"}`}
                  >
                    {statusLabel[order.orderStatus] ?? order.orderStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {order.shipAddress}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-orange-600">
                    {order.totalPrice?.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <button
                    onClick={() => handleConfirm(order.id)}
                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
                  >
                    Xác nhận
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {order.items?.length ?? 0} sản phẩm
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "purchased" && (
        <>
          {loadingPurchased && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!loadingPurchased && purchased.length === 0 && (
            <p className="text-center text-gray-500 py-8">Chưa có đơn hàng đã mua</p>
          )}
          <div className="space-y-3">
            {purchased.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/order/${order.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold">Đơn #{order.id}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {order.orderDate}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[order.orderStatus] ?? "bg-gray-100"}`}
                  >
                    {statusLabel[order.orderStatus] ?? order.orderStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {order.shipAddress}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-orange-600">
                    {order.totalPrice?.toLocaleString("vi-VN")} VNĐ
                  </p>
                  <span className="text-xs text-gray-500">
                    {order.items?.length ?? 0} sản phẩm
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
