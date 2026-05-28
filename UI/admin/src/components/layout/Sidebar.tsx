import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    ShieldCheck,
    FileText,
    Users,
    History,
    Menu,
    X,
    LayoutDashboard,
    Activity,
    LogOut,
} from "lucide-react";
import { adminApi } from "@/services/api/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();

    const menuItems = [
        {
            label: t('sidebar.dashboard'),
            href: "/",
            icon: LayoutDashboard,
        },
        {
            label: t('sidebar.serviceHealth'),
            href: "/service-health",
            icon: Activity,
        },
        {
            label: t('sidebar.logTracking'),
            href: "/log-tracking",
            icon: FileText,
        },
        {
            label: t('sidebar.userManagement'),
            href: "/user-management",
            icon: Users,
        },
        {
            label: t('sidebar.auditTrail'),
            href: "/audit-trail",
            icon: History,
        },
    ];

    const isActive = (href: string) => pathname === href;

    const handleLogout = async () => {
        try {
            await adminApi.logout();
            toast({
                title: t("common.logoutSuccess") || "Đăng xuất thành công",
                description: t("common.logoutDesc") || "Hẹn gặp lại bạn sau!",
            });
            navigate("/login");
        } catch (error) {
            toast({
                variant: "destructive",
                title: t("common.errorTitle") || "Lỗi",
                description: t("common.logoutFailed") || "Không thể đăng xuất, vui lòng thử lại",
            });
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-30 lg:static lg:z-auto border-r border-slate-700
                    ${isOpen ? "w-64" : "w-0 lg:w-64"} overflow-hidden lg:overflow-visible`}
            >
                <div className="pt-8 px-4 lg:px-6 py-6 h-full overflow-y-auto">
                    {/* Logo/Header */}
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                                ADMIN
                            </h1>
                            <p className="text-xs text-slate-400">Panel</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${active
                                        ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/50 font-semibold"
                                        : "text-slate-300 hover:bg-slate-700/50 hover:text-red-400 hover:translate-x-1"
                                        }`}
                                >
                                    <Icon size={20} className={`transition-transform ${active ? "" : "group-hover:scale-110"}`} />
                                    <span className="flex-1">{item.label}</span>
                                    {active && (
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="absolute bottom-6 left-4 right-4 pt-4 border-t border-slate-700 flex flex-col gap-3">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
                        >
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">{t('sidebar.logout') || 'Đăng xuất'}</span>
                        </button>
                        <p className="text-xs text-slate-500 text-center">{t('sidebar.footer')}</p>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-20 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
