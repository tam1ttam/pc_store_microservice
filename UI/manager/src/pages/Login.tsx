import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/redux/thunks/auth";
import { Auth } from "@/types";
import { CredentialsSchema } from "@/types/Auth";
import { Loader2, Monitor } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";

function Login() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [credentials, setCredentials] = useState<Auth.Credentials>({
        userName: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            CredentialsSchema.parse(credentials);
            const result = await dispatch(login(credentials) as Auth.LoginResponse | any);

            if (login.fulfilled.match(result)) {
                toast({
                    title: t("auth.loginSuccess"),
                    description: t("auth.loginSuccess_welcome"),
                    variant: "default"
                });
                navigate("/");
            } else {
                toast({
                    title: t("auth.loginFailed"),
                    description: t("auth.loginFailed_desc"),
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
                    description: t("auth.unknownError")
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Monitor className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-900">PC Store</h1>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-semibold tracking-tight">{t("auth.login")}</h2>
                        <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">{t("auth.username")}</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t("auth.usernamePlaceholder")}
                                value={credentials.userName}
                                onChange={(e) => setCredentials({ ...credentials, userName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t("auth.password")}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t("auth.passwordPlaceholder")}
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" />
                                <label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {t("auth.rememberMe")}
                                </label>
                            </div>
                            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                                {t("auth.forgotPassword")}
                            </Link>
                        </div>

                        <Button disabled={isLoading} type="submit" className="w-full">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t("auth.loggingIn")}
                                </>
                            ) : (
                                t("auth.login")
                            )}
                        </Button>

                        <p className="text-center text-sm text-gray-600">
                            {t("auth.noAccount")}{" "}
                            <Link to="/register" className="font-medium text-blue-600 hover:underline">
                                {t("auth.registerNow")}
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
