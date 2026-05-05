import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/hooks";
import { logout } from "@/redux/thunks/auth";

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userModalRef = useRef<HTMLDivElement>(null);
    const { info: user } = useSelector((state: RootState) => state.user);
    const { isLogin, token } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.roles.some((role) => role.name === "ADMIN");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserMenu]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userModalRef.current && !userModalRef.current.contains(event.target as Node)) {
                setShowUserModal(false);
            }
        };

        if (showUserModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserModal]);

    const handleLogout = async () => {
        try {
            const result = await dispatch(logout(token as string) as any);
            if (result.payload.code === 1000) {
                toast({
                    title: "Đăng xuất thành công"
                });
                navigate("/");
            } else {
                toast({
                    title: "Đăng xuất thất bại"
                });
            }
        } catch (error) {
            toast({
                title: "Đăng xuất thất bại"
            });
        }
    };
    return (
        <>
            <header className="fixed top-3 right-6 z-50">
                <nav className="flex items-center">
                        {isLogin ? (
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* <div className="relative">
                                    <Link
                                        to="/cart"
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-green-400 hover:scale-105 transition-all ${cartCount == 0
                                            ? "bg-green-500/10"
                                            : "bg-gradient-to-br from-green-400 to-green-600"
                                            } flex items-center justify-center shadow-md`}
                                    >
                                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </Link>
                                    {cartCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[10px] font-medium rounded-full min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center">
                                            {cartCount > 99 ? "99+" : cartCount}
                                        </div>
                                    )}
                                </div> */}
                                <div className="relative" ref={userMenuRef}>
                                    <div
                                        className="w-8 h-8 sm:w-10 sm:h-10 p-1.5 sm:p-2 rounded-full cursor-pointer hover:ring-2 hover:ring-green-400 hover:scale-110 transition-all text-white bg-green-500/20 flex items-center justify-center"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        <User className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                                    </div>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <button
                                                onClick={() => {
                                                    setShowUserModal(true);
                                                    setShowUserMenu(false);
                                                }}
                                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                            >
                                                Thông tin cá nhân
                                            </button>
                                            {/* <button
                                                onClick={() => {
                                                    handleOrderList();
                                                }}
                                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                            >
                                                Lịch sử mua hàng
                                            </button> */}
                                            {isAdmin && (
                                                <>
                                                    <div className="h-[1px] bg-gray-200 my-1"></div>
                                                    <button
                                                        onClick={() => {
                                                            navigate("/admin/customers");
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                                    >
                                                        Quản lý người dùng
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            navigate("/admin/products");
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                                    >
                                                        Quản lý sản phẩm
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            navigate("/admin/orders");
                                                            setShowUserMenu(false);
                                                        }}
                                                        className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                                    >
                                                        Quản lý đơn hàng
                                                    </button>
                                                    <div className="h-[1px] bg-gray-200 my-1"></div>
                                                </>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                </nav>
            </header>

            {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div
                        ref={userModalRef}
                        className="bg-white rounded-xl p-4 sm:p-8 w-full max-w-[450px] relative shadow-2xl transform transition-all duration-300 hover:scale-[1.02]"
                    >
                        <button
                            onClick={() => setShowUserModal(false)}
                            className="absolute top-2 sm:top-4 right-2 sm:right-4 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <div className="text-center mb-4 sm:mb-6">
                            <div className="bg-green-500/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                                <User className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Thông tin người dùng</h2>
                        </div>

                        <div className="space-y-3 sm:space-y-4 bg-green-50/50 p-4 sm:p-6 rounded-lg">
                            <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Họ tên:</span>
                                <span className="text-gray-800 break-words text-sm sm:text-base">
                                    {user?.firstName} {user?.lastName}
                                </span>
                            </div>

                            <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Email:</span>
                                <span className="text-gray-800 break-all text-sm sm:text-base">{user?.email}</span>
                            </div>

                            <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Số điện thoại:</span>
                                <span className="text-gray-800 break-words text-sm sm:text-base">
                                    {user?.phoneNumber}
                                </span>
                            </div>

                            <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Tên đăng nhập:</span>
                                <span className="text-gray-800 break-words text-sm sm:text-base">{user?.userName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
