import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Sparkles } from "lucide-react";
import ProductCard from "@/pages/Product/components/ProductCard";
import { productApi } from "@/services/api/productApi";

const RecommendedSection = () => {
    const { info: user } = useSelector((state: RootState) => state.user);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user?.id) return;

            try {
                setLoading(true);
                const response = (await productApi.getRecommendations(user.id)) as any;
                if (response.data && response.data.result) {
                    setProducts(response.data.result);
                }
            } catch (error) {
                console.error("Lỗi lấy gợi ý:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [user?.id]);

    if (!user || (!loading && products.length === 0)) return null;

    return (
        <div className="mt-16 border-t border-gray-100 pt-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Có thể bạn sẽ thích</h2>
                    <p className="text-sm text-gray-500">Dựa trên sở thích mua sắm của bạn</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Skeleton Loading đơn giản */}
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[380px] animate-pulse"
                        >
                            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecommendedSection;
