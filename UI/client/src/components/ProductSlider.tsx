import { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Flame, Clock, Tag } from "lucide-react";
import { productApi } from "@/services/api/productApi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCart, upsertCartItem } from "@/redux/thunks/cart";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/hooks";
import { RootState } from "@/redux/store";
import { findBestVoucher } from "@/redux/slices/voucher";
import { useTranslation } from "react-i18next";

import "swiper/css";
import "swiper/css/navigation";

interface ProductSliderProps {
    title: string;
    type: "newest" | "best-selling";
}

const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const SimpleProductCard = ({ product }: { product: any }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();
    const { toast } = useToast();
    const { t } = useTranslation();
    const { info: user } = useAppSelector((state: RootState) => state.user);
    const isLogin = useSelector((state: RootState) => state.auth.isLogin);
    const availableVouchers = useSelector((state: RootState) => state.voucher.available);

    const bestResult = useMemo(() => {
        if (!isLogin || !availableVouchers.length) return null;
        return findBestVoucher(product.price ?? 0, availableVouchers);
    }, [isLogin, availableVouchers, product.price]);

    const discountedPrice = bestResult
        ? Math.max(0, (product.price ?? 0) - bestResult.discount)
        : (product.price ?? 0);
    const hasDiscount = !!bestResult;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLogin) {
            toast({
                title: t('product.addToCartNotify'),
                description: t('product.loginRequired'),
            });
            navigate("/login");
            return;
        }
        try {
            await dispatch(
                upsertCartItem({
                    productId: product.id,
                    productName: product.name,
                    productPrice: product.price,
                    quantity: 1,
                    productImage: product.img,
                })
            ).unwrap();
            dispatch(getCart());
            toast({ title: t('common.success'), description: t('product.addedToCart') });
        } catch {
            toast({ variant: "destructive", title: t('common.error'), description: t('product.addToCartError') });
        }
    };

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="group relative w-full bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer flex flex-col"
        >
            {/* Image area */}
            <div className="relative w-full h-[220px] overflow-hidden bg-white/3 flex items-center justify-center p-4">
                <img
                    src={product.img}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                />
                {/* Quick actions on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center gap-1.5 bg-white text-purple-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-purple-600 hover:text-white transition-all shadow-lg"
                    >
                        <ShoppingCart className="w-4 h-4" /> Thêm
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product.id}`);
                        }}
                        className="p-2 bg-white/10 text-white border border-white/30 rounded-full hover:bg-white hover:text-purple-900 transition-all"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Badge voucher: hiện "-X%" hoặc "-Yđ" tùy loại voucher tốt nhất */}
            {hasDiscount && bestResult && (
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    <Tag className="w-3 h-3" />
                    {bestResult.voucher.discountPercent
                        ? `-${bestResult.voucher.discountPercent}%`
                        : `-${new Intl.NumberFormat("vi-VN").format(bestResult.voucher.discountAmount ?? 0)}đ`}
                </div>
            )}

            {/* Info always visible */}
            <div className="p-3 flex flex-col gap-1">
                <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug min-h-[40px]">
                    {product.name}
                </h3>
                {hasDiscount ? (
                    <div>
                        <p className="text-gray-400 text-xs line-through">{fmt(product.price)}</p>
                        <p className="text-red-400 font-bold text-base">{fmt(discountedPrice)}</p>
                    </div>
                ) : (
                    <p className="text-yellow-400 font-bold text-base">{fmt(product.price)}</p>
                )}
            </div>
        </div>
    );
};

const ProductSlider = ({ title, type }: ProductSliderProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response =
                    type === "best-selling"
                        ? ((await productApi.getBestSelling(10)) as any)
                        : ((await productApi.getNewest(10)) as any);
                if (response.data?.result) setProducts(response.data.result);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type]);

    if (!loading && products.length === 0) return null;

    return (
        <div className="py-10 relative group/slider w-full">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg ${
                                type === "best-selling"
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-orange-500/10 text-orange-400"
                            }`}
                        >
                            {type === "best-selling" ? (
                                <Flame className="w-6 h-6" />
                            ) : (
                                <Clock className="w-6 h-6" />
                            )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">{title}</h2>
                    </div>
                    <a href="/products" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Xem tất cả
                    </a>
                </div>

                <div className="relative">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white/5 h-[320px] rounded-2xl animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : products.length === 1 ? (
                        <div className="flex justify-center">
                            <div className="w-[260px]">
                                <SimpleProductCard product={products[0]} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <Swiper
                                modules={[Navigation, Autoplay]}
                                spaceBetween={16}
                                slidesPerView={2}
                                loop={true}
                                speed={600}
                                navigation={{
                                    nextEl: `.next-${type}`,
                                    prevEl: `.prev-${type}`,
                                }}
                                autoplay={{
                                    delay: 3500,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true,
                                }}
                                breakpoints={{
                                    640: { slidesPerView: 2 },
                                    1024: { slidesPerView: 3 },
                                    1280: { slidesPerView: 4 },
                                }}
                                className="!pb-2 !px-1"
                            >
                                {products.map((product) => (
                                    <SwiperSlide key={product.id} className="!h-auto">
                                        <SimpleProductCard product={product} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            <button
                                className={`prev-${type} absolute top-1/2 -left-5 z-20 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-purple-900 transition-all opacity-0 group-hover/slider:opacity-100 shadow-lg`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                className={`next-${type} absolute top-1/2 -right-5 z-20 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-purple-900 transition-all opacity-0 group-hover/slider:opacity-100 shadow-lg`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSlider;
