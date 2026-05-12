import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AppDispatch } from "@/redux/store";
import { login } from "@/redux/thunks/auth";
import { Auth } from "@/types";
import { CredentialsSchema } from "@/types/Auth";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

function Login() {
    const { toast } = useToast();
    const [credentials, setCredentials] = useState<Auth.Credentials>({
        userName: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            CredentialsSchema.parse(credentials);
            const result = await dispatch(login(credentials));

            if (login.fulfilled.match(result)) {
                // The role check is now implicitly handled by the backend endpoint
                toast({
                    title: "Đăng nhập thành công",
                    description: "Chào mừng quản trị viên!",
                    variant: "default",
                });
                navigate("/");
            } else {
                toast({
                    title: "Đăng nhập thất bại",
                    description: result.payload?.message || "Tên đăng nhập hoặc mật khẩu không chính xác.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                const errorMessage = err.errors[0].message;
                toast({
                    variant: "destructive",
                    description: errorMessage,
                });
            } else {
                toast({
                    variant: "destructive",
                    description: "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-green-400" />
                        <h1 className="text-3xl font-bold text-gray-100">Admin Panel</h1>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">Đăng nhập</h2>
                        <p className="text-sm text-gray-400">Truy cập vào bảng điều khiển quản trị</p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={credentials.userName}
                                onChange={(e) => setCredentials({ ...credentials, userName: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                        </div>

                        <Button disabled={isLoading} type="submit" className="w-full bg-green-600 hover:bg-green-700">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
