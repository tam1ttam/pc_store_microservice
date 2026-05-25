import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function NotFound() {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-20 pt-24">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
            <p className="text-lg text-gray-600 mb-4">{t("notFound.message", "Trang không tìm thấy")}</p>
            <Button asChild>
                <Link to="/" className="inline-flex items-center">
                    {t("notFound.backHome", "Trở về trang chủ")}
                </Link>
            </Button>
        </div>
    );
}

export default NotFound;
