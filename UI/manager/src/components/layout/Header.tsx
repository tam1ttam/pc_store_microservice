import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/redux/store";
import { toast } from "@/hooks";
import { logout } from "@/redux/thunks/auth";
import { updateUserInfo } from "@/redux/thunks/user";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userModalRef = useRef<HTMLDivElement>(null);
    const { info: user } = useSelector((state: RootState) => state.user);
    const { isLogin } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.roles?.some((role) => role.name === "ADMIN") ?? false;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || ""
    });
    const [isChanged, setIsChanged] = useState(false);

    // Update editedUser when user object changes
    useEffect(() => {
        if (user) {
            setEditedUser({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || ""
            });
        }
    }, [user]);

    // Check for changes when editedUser changes
    useEffect(() => {
        if (user) {
            const hasChanged =
                editedUser.firstName !== user.firstName ||
                editedUser.lastName !== user.lastName ||
                editedUser.email !== user.email ||
                editedUser.phoneNumber !== user.phoneNumber;
            setIsChanged(hasChanged);
        }
    }, [user, editedUser]);

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
                    title: t("auth.logoutSuccess")
                });
                navigate("/");
            } else {
                toast({
                    title: t("auth.logoutFailed")
                });
            }
        } catch (error) {
            toast({
                title: t("auth.logoutFailed")
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({ ...prev, [name]: value }));
        setIsChanged(true);
    };

    const handleUpdateUser = async () => {
        console.log('update: ', user);

        if (!user?.userName) return;
        const result = await dispatch(
            updateUserInfo({
                userName: user.userName,
                data: editedUser
            }) as any
        );
        if (result.payload.code === 1000) {
            toast({
                title: t("user.updateSuccess")
            });
            setIsEditing(false);
        } else {
            toast({
                title: t("user.updateFailed"),
                description: result.payload.message
            });
        }
    };

    return (
        <>
            <header className="fixed top-3 right-6 z-50">
                <nav className="flex items-center gap-2">
                    <LanguageSwitcher />
                    {isLogin ? (
                        <div className="flex items-center gap-2 sm:gap-4">
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
                                            {t("header.profile")}
                                        </button>
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
                                                    {t("header.manageCustomers")}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate("/admin/products");
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                                >
                                                    {t("header.manageProducts")}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate("/admin/orders");
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                                >
                                                    {t("header.manageOrders")}
                                                </button>
                                                <div className="h-[1px] bg-gray-200 my-1"></div>
                                            </>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-green-100 transition-colors duration-200"
                                        >
                                            {t("header.logout")}
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
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t("user.info")}</h2>
                        </div>

                        <div className="space-y-3 sm:space-y-4 bg-green-50/50 p-4 sm:p-6 rounded-lg">
                            {isEditing ? (
                                <>
                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.lastName")}:
                                        </span>
                                        <Input
                                            name="lastName"
                                            value={editedUser.lastName}
                                            onChange={handleInputChange}
                                            className="text-sm sm:text-base"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.firstName")}:
                                        </span>
                                        <Input
                                            name="firstName"
                                            value={editedUser.firstName}
                                            onChange={handleInputChange}
                                            className="text-sm sm:text-base"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.email")}:
                                        </span>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={editedUser.email}
                                            onChange={handleInputChange}
                                            className="text-sm sm:text-base"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.phone")}:
                                        </span>
                                        <Input
                                            name="phoneNumber"
                                            value={editedUser.phoneNumber}
                                            onChange={handleInputChange}
                                            className="text-sm sm:text-base"
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.fullName")}:
                                        </span>
                                        <span className="text-gray-800 break-words text-sm sm:text-base">
                                            {user?.firstName} {user?.lastName}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.email")}:
                                        </span>
                                        <span className="text-gray-800 break-all text-sm sm:text-base">
                                            {user?.email}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.phone")}:
                                        </span>
                                        <span className="text-gray-800 break-words text-sm sm:text-base">
                                            {user?.phoneNumber}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[100px,1fr] sm:grid-cols-[120px,1fr] items-center p-2 sm:p-3 bg-white rounded-lg shadow-sm">
                                        <span className="font-medium text-gray-600 text-sm sm:text-base">
                                            {t("user.username")}:
                                        </span>
                                        <span className="text-gray-800 break-words text-sm sm:text-base">
                                            {user?.userName}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            if (user) {
                                                setEditedUser({
                                                    firstName: user.firstName || "",
                                                    lastName: user.lastName || "",
                                                    email: user.email || "",
                                                    phoneNumber: user.phoneNumber || ""
                                                });
                                            }
                                            setIsChanged(false);
                                        }}
                                    >
                                        {t("user.cancel")}
                                    </Button>
                                    <Button onClick={handleUpdateUser} disabled={!isChanged}>
                                        {t("user.saveChanges")}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}>{t("user.edit")}</Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
