import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks";
import { RootState } from "@/redux/store";
import { getCustomer, setIsAdmin } from "@/redux/thunks/admin";
import { Role } from "@/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
const Customer = () => {
    const [loading, setLoading] = useState(true);
    const { token } = useSelector((state: RootState) => state.auth);
    const { customers } = useSelector((state: RootState) => state.admin);
    const { toast } = useToast();
    const dispatch = useDispatch();

    const handleSetIsAdmin = async (userName: string) => {
        try {
            const result = await dispatch(setIsAdmin({ token: token as string, userName }) as any);
            if (result.payload.code === 1000) {
                dispatch(getCustomer() as any);
                toast({
                    title: "Thành công",
                    description: "Cấp quyền Admin cho người dùng",
                    variant: "default"
                });
            } else throw new Error("Failed to set admin");
        } catch (error) {
            toast({
                title: "Thất bại",
                description: "Cấp quyền Admin cho người dùng",
                variant: "destructive"
            });
            console.error(error);
        }
    };

    const checkIsAdmin = (roles: Role[]): boolean => {
        return roles.some((role) => role.name === "ADMIN");
    };

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            dispatch(getCustomer() as any);
            setLoading(false);
        };
        fetchCustomers();
    }, [dispatch, token]);

    return (
        <div className="container mx-auto p-4 pt-24">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
                </div>
            ) : (
                <>
                    <h1 className="text-2xl font-bold mb-4">Danh Sách Người Dùng</h1>
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số Điện Thoại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vai Trò
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Chỉnh sửa
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {customers?.result.content &&
                                    customers.result.content.map((customer, index) => (
                                        <tr key={customer.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{customer.userName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.firstName} {customer.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{customer.phoneNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.roles.map((role: Role) => role.name).join(", ")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Button
                                                    variant="default"
                                                    onClick={() => handleSetIsAdmin(customer.userName)}
                                                    disabled={checkIsAdmin(customer.roles)}
                                                    className={`w-full ${
                                                        checkIsAdmin(customer.roles)
                                                            ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed"
                                                            : "bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-500 hover:to-red-600"
                                                    } transition-all duration-300`}
                                                >
                                                    {checkIsAdmin(customer.roles) ? "Đã là Admin" : "Cấp quyền Admin"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default Customer;
