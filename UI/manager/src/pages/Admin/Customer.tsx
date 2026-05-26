import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { X, User } from "lucide-react";
import { RootState } from "@/redux/store";
import { getCustomer } from "@/redux/thunks/admin";
import { User as UserType } from "@/types";

interface DetailPanelProps {
    customer: UserType;
    onClose: () => void;
}

const DetailPanel = ({ customer, onClose }: DetailPanelProps) => {
    const { t } = useTranslation();
    const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—";

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">{t("customer.detailTitle")}</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center py-6 border-b">
                    {customer.avatar ? (
                        <img
                            src={customer.avatar}
                            alt={fullName}
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-orange-200"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                            <User size={36} className="text-orange-400" />
                        </div>
                    )}
                    <p className="mt-3 text-lg font-semibold text-gray-800">{fullName}</p>
                    <p className="text-sm text-gray-500">@{customer.userName}</p>
                    {customer.isActive !== undefined && customer.isActive !== null && (
                        <span
                            className={`mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                                customer.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-600"
                            }`}
                        >
                            {customer.isActive ? t("customer.active") : t("customer.inactive")}
                        </span>
                    )}
                </div>

                {/* Info rows */}
                <div className="px-6 py-4 space-y-4">
                    <InfoRow label={t("customer.detailEmail")} value={customer.email || "—"} />
                    <InfoRow label={t("customer.detailPhone")} value={customer.phoneNumber || "—"} />
                    <InfoRow label={t("customer.detailGender")} value={customer.gender || "—"} />
                    <InfoRow label={t("customer.detailDob")} value={customer.dob || "—"} />

                    {/* Addresses */}
                    {Array.isArray(customer.addresses) && customer.addresses.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                {t("customer.detailAddresses")}
                            </p>
                            <div className="space-y-2">
                                {customer.addresses.map((addr: any, i: number) => {
                                    const parts = [addr.street, addr.ward, addr.city, addr.province, addr.country].filter(Boolean);
                                    return (
                                        <div key={addr.id ?? i} className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                                            {parts.join(", ") || "—"}
                                            {addr.isDefault && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600 font-medium">
                                                    {t("customer.defaultAddress")}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-start gap-4">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[90px]">{label}</span>
        <span className="text-sm text-gray-800 text-right break-all">{value}</span>
    </div>
);

const Customer = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
    const { customers } = useSelector((state: RootState) => state.admin);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            await dispatch(getCustomer() as any);
            setLoading(false);
        };
        fetchCustomers();
    }, [dispatch]);

    return (
        <div className="container mx-auto p-4 pt-24">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500" />
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-bold mb-4">{t("customer.listTitle")}</h1>
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                        {t("customer.colStt")}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("customer.colName")}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("customer.colUsername")}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("customer.colEmail")}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("customer.colPhone")}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("customer.colDetail")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers?.result?.content?.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            {t("customer.noCustomers")}
                                        </td>
                                    </tr>
                                ) : (
                                    customers?.result?.content?.map((customer, index) => (
                                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {[customer.firstName, customer.lastName].filter(Boolean).join(" ") || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {customer.userName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {customer.email || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {customer.phoneNumber || "—"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedCustomer(customer)}
                                                    className="text-xs px-3 py-1.5 rounded border border-orange-400 text-orange-600 hover:bg-orange-50 transition-colors font-medium"
                                                >
                                                    {t("customer.colDetail")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {selectedCustomer && (
                <DetailPanel
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}
        </div>
    );
};

export default Customer;
