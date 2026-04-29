import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RootState } from "@/redux/store";
import { register } from "@/redux/thunks/auth";
import { RegisterCredentials, registerCredentialsSchema, RegisterResponse } from "@/types";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

export default function Register() {
    const { toast } = useToast();
    const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>({
        userName: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: ""
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status } = useSelector((state: RootState) => state.auth);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            registerCredentialsSchema.parse(registerCredentials);
            const result = await dispatch(register(registerCredentials) as RegisterResponse | any);
            if (register.fulfilled.match(result)) {
                toast({
                    title: "Đăng ký thành công",
                    description: "Chào mừng bạn đã đăng ký tài khoản!"
                });
                navigate("/login");
            } else {
                toast({
                    title: "Đăng ký thất bại",
                    description: "Thông tin đăng ký không hợp lệ",
                    variant: "destructive"
                });
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                const errorMessage = err.errors[0].message;
                toast({
                    variant: "destructive",
                    description: errorMessage
                });
            } else {
                toast({
                    variant: "destructive",
                    description: "Đã xảy ra lỗi không xác định"
                });
            }
        }
    };

    return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-28 pb-4">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg w-full max-w-md border border-gray-200 relative">
                <Link
                    to="/"
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100/50 group transition-colors"
                >
                    <X className="h-6 w-6 text-gray-500 group-hover:rotate-90 transition-transform" />
                </Link>

                <div className="flex flex-col items-center gap-4">
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
                            Đăng ký ngay
                        </h1>
                        <p className="text-sm text-gray-600">Nhập thông tin đăng ký của bạn để tạo tài khoản</p>
                    </div>

                    <form onSubmit={handleRegister} className="w-full space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="username" className="text-gray-700 text-sm">
                                Tên đăng nhập
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={registerCredentials.userName}
                                onChange={(e) =>
                                    setRegisterCredentials({
                                        ...registerCredentials,
                                        userName: e.target.value
                                    })
                                }
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-gray-700 text-sm">
                                Mật khẩu
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={registerCredentials.password}
                                onChange={(e) =>
                                    setRegisterCredentials({
                                        ...registerCredentials,
                                        password: e.target.value
                                    })
                                }
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="firstName" className="text-gray-700 text-sm">
                                    Họ
                                </Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder="Nhập họ"
                                    value={registerCredentials.firstName}
                                    onChange={(e) =>
                                        setRegisterCredentials({
                                            ...registerCredentials,
                                            firstName: e.target.value
                                        })
                                    }
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="lastName" className="text-gray-700 text-sm">
                                    Tên
                                </Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder="Nhập tên"
                                    value={registerCredentials.lastName}
                                    onChange={(e) =>
                                        setRegisterCredentials({
                                            ...registerCredentials,
                                            lastName: e.target.value
                                        })
                                    }
                                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-gray-700 text-sm">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Nhập email"
                                value={registerCredentials.email}
                                onChange={(e) =>
                                    setRegisterCredentials({
                                        ...registerCredentials,
                                        email: e.target.value
                                    })
                                }
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="phoneNumber" className="text-gray-700 text-sm">
                                Số điện thoại
                            </Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="Nhập số điện thoại"
                                value={registerCredentials.phoneNumber}
                                onChange={(e) =>
                                    setRegisterCredentials({
                                        ...registerCredentials,
                                        phoneNumber: e.target.value
                                    })
                                }
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 h-9"
                            />
                        </div>

                        <Button
                            disabled={status === "loading"}
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold h-9"
                        >
                            {status === "loading" ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang đăng ký...
                                </>
                            ) : (
                                "Đăng ký"
                            )}
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            Đã có tài khoản?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
                            >
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
