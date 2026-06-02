import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Package,
    Users,
    ShoppingCart,
    Ticket,
    Menu,
    X,
    LayoutDashboard,
} from "lucide-react";

export default function Sidebar() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();

    const menuItems = [
        {
            label: t("sidebar.manageProducts"),
            href: "/admin/products",
            icon: Package,
        },
        {
            label: t("sidebar.manageCustomers"),
            href: "/admin/customers",
            icon: Users,
        },
        {
            label: t("sidebar.manageOrders"),
            href: "/admin/orders",
            icon: ShoppingCart,
        },
        {
            label: t("sidebar.manageVouchers"),
            href: "/admin/vouchers",
            icon: Ticket,
        },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-20 left-4 z-40 p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-30 border-r border-slate-700
                    ${isOpen ? "w-64" : "w-0 lg:w-64"} overflow-hidden`}
            >
                <div className="pt-24 lg:pt-8 px-4 lg:px-6 py-6 h-full overflow-y-auto">
                    {/* Logo/Header */}
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                            <LayoutDashboard size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                STORE MANAGER
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
                                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-600/50 font-semibold"
                                        : "text-slate-300 hover:bg-slate-700/50 hover:text-green-400 hover:translate-x-1"
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
                    <div className="absolute bottom-6 left-4 right-4 pt-4 border-t border-slate-700">
                        <p className="text-xs text-slate-500 text-center">{t("sidebar.footer")}</p>
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
