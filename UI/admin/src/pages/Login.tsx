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
import { useTranslation } from "react-i18next";
import { z } from "zod";

function Login() {
    const { t } = useTranslation();
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
                toast({
                    title: t('auth.loginSuccess'),
                    description: t('auth.loginSuccess_admin'),
                    variant: "default",
                });
                navigate("/");
            } else {
                toast({
                    title: t('auth.loginFailed'),
                    description: result.payload?.message || t('auth.loginFailed_desc'),
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
                    description: t('auth.unknownError'),
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
                        <h2 className="text-2xl font-semibold tracking-tight">{t('auth.login')}</h2>
                        <p className="text-sm text-gray-400">{t('auth.adminSubtitle')}</p>
                    </div>

                    <form onSubmit={handleLogin} className="w-full space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username">{t('auth.username')}</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder={t('auth.usernamePlaceholder')}
                                value={credentials.userName}
                                onChange={(e) => setCredentials({ ...credentials, userName: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('auth.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('auth.passwordPlaceholder')}
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white"
                            />
                        </div>

                        <Button disabled={isLoading} type="submit" className="w-full bg-green-600 hover:bg-green-700">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('auth.processing')}
                                </>
                            ) : (
                                t('auth.login')
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
