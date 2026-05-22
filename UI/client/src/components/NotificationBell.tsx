import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
    markAllRead,
    markActionDoneLocal,
    markOneRead,
    NotificationItem,
    setNotifications,
    setUnreadCount,
} from "@/redux/slices/notification";
import { notificationApi } from "@/services/api/notificationApi";

function formatCreatedAt(raw: string | number[]): string {
    try {
        if (Array.isArray(raw)) {
            const [y, mo, d, h = 0, mi = 0] = raw as number[];
            return new Date(y, mo - 1, d, h, mi).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        return new Date(raw as string).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "";
    }
}

function typeIcon(type: string) {
    const map: Record<string, string> = {
        LOGIN: "🔑",
        REGISTER: "🎉",
        ORDER_PLACED: "🛒",
        SYSTEM: "⚙️",
    };
    return map[type] ?? "🔔";
}

export default function NotificationBell() {
    const dispatch = useDispatch();
    const { items, unreadCount, status } = useSelector((state: RootState) => state.notification);
    const { isLogin } = useSelector((state: RootState) => state.auth);

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"all" | "unread">("all");
    const [selected, setSelected] = useState<NotificationItem | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close panel on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Load notifications when panel opens for the first time
    const [loaded, setLoaded] = useState(false);
    const handleOpen = async () => {
        setOpen((v) => !v);
        if (!loaded) {
            setLoaded(true);
            try {
                const res = await notificationApi.getNotifications(false);
                const list = (res as any).data?.result ?? [];
                dispatch(setNotifications(list));
                const unread = list.filter((n: NotificationItem) => !n.isRead).length;
                dispatch(setUnreadCount(unread));
            } catch {
                // ignore
            }
        }
    };

    const handleClickItem = async (item: NotificationItem) => {
        setSelected(item);
        if (!item.isRead) {
            try {
                await notificationApi.markAsRead(item.id);
                dispatch(markOneRead(item.id));
            } catch {
                // ignore
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            dispatch(markAllRead());
        } catch {
            // ignore
        }
    };

    const handleActionDone = async (item: NotificationItem) => {
        try {
            await notificationApi.markActionDone(item.id);
            dispatch(markActionDoneLocal(item.id));
            setSelected((prev) => (prev?.id === item.id ? { ...prev, actionDone: true, isRead: true } : prev));
        } catch {
            // ignore
        }
    };

    if (!isLogin) return null;

    const displayed = tab === "unread" ? items.filter((n) => !n.isRead) : items;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-orange-500/10 hover:ring-2 hover:ring-orange-400 hover:scale-105 transition-all"
            >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[10px] font-medium rounded-full min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-gray-800 text-sm">Thông báo</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        {(["all", "unread"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                                    tab === t
                                        ? "text-orange-500 border-b-2 border-orange-500"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {t === "all" ? "Tất cả" : `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-80">
                        {status === "loading" && (
                            <div className="flex justify-center py-8">
                                <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                        {status !== "loading" && displayed.length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-10">Không có thông báo</div>
                        )}
                        {displayed.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleClickItem(item)}
                                className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                                    !item.isRead ? "bg-orange-50/60" : ""
                                }`}
                            >
                                {/* System badge / icon */}
                                <div
                                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                                        item.isSystem ? "bg-blue-100" : "bg-orange-100"
                                    }`}
                                >
                                    {typeIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        {item.isSystem && (
                                            <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wide bg-blue-50 px-1.5 py-0.5 rounded">
                                                Hệ thống
                                            </span>
                                        )}
                                        {!item.isRead && (
                                            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{item.title}</p>
                                    <p className="text-[11px] text-gray-500 truncate">{item.body}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{formatCreatedAt(item.createdAt)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setSelected(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${
                                    selected.isSystem ? "bg-blue-100" : "bg-orange-100"
                                }`}
                            >
                                {typeIcon(selected.type)}
                            </div>
                            <div>
                                {selected.isSystem && (
                                    <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wide bg-blue-50 px-1.5 py-0.5 rounded">
                                        Hệ thống
                                    </span>
                                )}
                                <h3 className="font-semibold text-gray-800 text-sm mt-0.5">{selected.title}</h3>
                                <p className="text-[10px] text-gray-400">{formatCreatedAt(selected.createdAt)}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{selected.body}</p>

                        {selected.referenceId && (
                            <p className="text-xs text-gray-400 mb-4">
                                Ref: {selected.referenceType} #{selected.referenceId}
                            </p>
                        )}

                        {selected.actionRequired && !selected.actionDone && (
                            <button
                                onClick={() => handleActionDone(selected)}
                                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Hoàn thành
                            </button>
                        )}
                        {selected.actionRequired && selected.actionDone && (
                            <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium justify-center">
                                <CheckCheck className="w-4 h-4" />
                                Đã hoàn thành
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
