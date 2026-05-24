import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, LogIn, Monitor, ShoppingCart, User, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "@/hooks";
import { logout } from "@/redux/thunks/auth";
import { updateUserAvatar } from "@/redux/slices/user";
import { getUserInfo } from "@/redux/thunks/user";
import { messageApi } from "@/services/api/messageApi";
import { userApi } from "@/services/api/userApi";
import ProfileCompletionModal from "@/components/ProfileCompletionModal";
import NotificationBell from "@/components/NotificationBell";

export default function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userModalRef = useRef<HTMLDivElement>(null);
    const { info: user, status: userStatus } = useSelector((state: RootState) => state.user);
    const { isLogin } = useSelector((state: RootState) => state.auth);
    const { cartCount } = useSelector((state: RootState) => state.cart);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showProfileBanner, setShowProfileBanner] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
            const result = await dispatch(logout() as any);
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
    const handleOrderList = () => {
        setShowUserMenu(false);
        navigate("/order");
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast({ title: "Chỉ chấp nhận file ảnh" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Ảnh không được vượt quá 5MB" });
            return;
        }
        setUploadingAvatar(true);
        try {
            const { url } = await messageApi.uploadFile(file);
            await userApi.updateAvatar(url);
            dispatch(updateUserAvatar(url));
            toast({ title: "Cập nhật ảnh đại diện thành công" });
        } catch {
            toast({ title: "Cập nhật ảnh đại diện thất bại" });
        } finally {
            setUploadingAvatar(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    };

    return (
        <>
            {isLogin && user && user.isActive === false && showProfileBanner && (
                <div className="fixed top-20 right-4 z-40 bg-white border border-orange-200 rounded-xl shadow-lg p-4 w-72 animate-in slide-in-from-right duration-300">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">Hoàn thiện hồ sơ</p>
                            <p className="text-xs text-gray-500 mt-0.5">Bổ sung thông tin để có trải nghiệm mua sắm tốt hơn.</p>
                            <button
                                onClick={() => { setShowProfileModal(true); setShowProfileBanner(false); }}
                                className="mt-2 text-xs text-orange-500 font-medium hover:text-orange-600"
                            >
                                Hoàn thiện ngay →
                            </button>
                        </div>
                        <button onClick={() => setShowProfileBanner(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            {showProfileModal && (
                <ProfileCompletionModal onClose={() => setShowProfileModal(false)} />
            )}
            <header
                className={`flex justify-center items-center text-white fixed w-[90%] sm:w-[95%] top-2 z-50 max-h-16 rounded-full backdrop-blur-md left-1/2 -translate-x-1/2 transition-all duration-500  bg-black/50`}
                style={{
                    boxShadow: isScrolled
                        ? ` 0 0 10px rgba(251,146,60,0.6),
                            inset 0 0 40px rgba(251,146,60,0.3),
                            0 0 20px rgba(251,146,60,0.2),
                            0 0 30px rgba(251,146,60,0.15),
                            0 0 40px rgba(251,146,60,0.1)
                          `
                        : "none",
                    border: isScrolled ? `1px solid rgba(251,146,60,0.4)` : "none",
                    backgroundImage: isScrolled
                        ? `linear-gradient(135deg,
                            rgba(251,146,60,0.18) 0%,
                            rgba(225,29,72,0.18) 25%,
                            rgba(147,51,234,0.18) 50%,
                            rgba(225,29,72,0.18) 75%,
                            rgba(251,146,60,0.18) 100%
                          )`
                        : "none",
                    animation: isScrolled
                        ? "pulseGlow 2s ease-in-out infinite, gradientShift 6s linear infinite, shimmer 3s linear infinite"
                        : "none",
                    backdropFilter: isScrolled ? "blur(16px)" : "blur(8px)",
                    WebkitBackdropFilter: isScrolled ? "blur(16px)" : "blur(8px)",
                    transform: "translateX(-50%)",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
            >
                <div className="container mx-auto px-3 sm:px-6 py-4">
                    <nav className="flex items-center justify-between">
                        <Link to="/">
                            <Monitor className="h-6 w-6 sm:h-7 sm:w-7 text-white cursor-pointer hover:scale-110 transition-all" />
                        </Link>

                        <div className="hidden md:flex items-center space-x-6 lg:space-x-10">
                            <Link
                                className="text-sm lg:text-base font-medium hover:text-[#f76808] transition-all hover:scale-110"
                                to="/"
                            >
                                Home
                            </Link>
                            <Link
                                className="text-sm lg:text-base font-medium hover:text-[#f76808] transition-all hover:scale-110"
                                to="/about"
                            >
                                About
                            </Link>
                            <Link
                                className="text-sm lg:text-base font-medium hover:text-[#f76808] transition-all hover:scale-110"
                                to="/products"
                            >
                                Products
                            </Link>
                        </div>

                        {/* Mobile Menu */}
                        <div className="md:hidden flex items-center space-x-4">
                            <Link className="text-sm font-medium hover:text-[#f76808] transition-all" to="/">
                                Home
                            </Link>
                            <Link className="text-sm font-medium hover:text-[#f76808] transition-all" to="/product">
                                Products
                            </Link>
                        </div>

                        {isLogin ? (
                            <div className="flex items-center gap-2 sm:gap-4">
                                <NotificationBell />
                                <div className="relative">
                                    <Link
                                        to="/cart"
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-400 hover:scale-105 transition-all ${cartCount == 0
                                                ? "bg-orange-500/10"
                                                : "bg-gradient-to-br from-orange-400 to-orange-600"
                                            } flex items-center justify-center shadow-md`}
                                    >
                                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </Link>
                                    {cartCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[10px] font-medium rounded-full min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center">
                                            {cartCount > 99 ? "99+" : cartCount}
                                        </div>
                                    )}
                                </div>
                                <div className="relative" ref={userMenuRef}>
                                    <div
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-orange-400 hover:scale-110 transition-all overflow-hidden bg-orange-500/20 flex items-center justify-center"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                                        )}
                                    </div>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <button
                                                onClick={() => {
                                                    setShowUserModal(true);
                                                    setShowUserMenu(false);
                                                    if (!user && userStatus !== "loading") {
                                                        dispatch(getUserInfo({ token: token as string }) as any);
                                                    }
                                                }}
                                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-orange-100 transition-colors duration-200"
                                            >
                                                Thông tin cá nhân
                                            </button>
                                            <button
                                                onClick={() => {
                                                    handleOrderList();
                                                }}
                                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-orange-100 transition-colors duration-200"
                                            >
                                                Lịch sử mua hàng
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-orange-100 transition-colors duration-200"
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className={`${isScrolled
                                        ? "px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base gap-1.5 sm:gap-2"
                                        : "p-2.5 sm:p-3"
                                    } text-white rounded-md flex items-center group relative`}
                            >
                                <LogIn
                                    className={`${isScrolled ? "w-4 h-4 sm:w-5 sm:h-5" : "w-5 h-5 sm:w-6 sm:h-6"}`}
                                />
                                {isScrolled ? (
                                    <span>Đăng nhập</span>
                                ) : (
                                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8">
                                        <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                                            Đăng nhập
                                        </span>
                                    </div>
                                )}
                            </Link>
                        )}
                    </nav>
                </div>
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
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 group">
                                <div className="w-full h-full rounded-full overflow-hidden bg-orange-500/10 flex items-center justify-center border-2 border-orange-200">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                                    )}
                                </div>
                                <button
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {uploadingAvatar ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Thông tin người dùng</h2>
                        </div>

                        {userStatus === "loading" && !user ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                        <div className="space-y-3 sm:space-y-4 bg-orange-50/50 p-4 sm:p-6 rounded-lg">
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
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
