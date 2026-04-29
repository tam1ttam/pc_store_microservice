import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Flame, Clock } from "lucide-react";
import { productApi } from "@/services/api/productApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart, getCartCount } from "@/redux/thunks/cart";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/hooks";
import { RootState } from "@/redux/store";

import "swiper/css";
import "swiper/css/navigation";

interface ProductSliderProps {
    title: string;
    type: "newest" | "best-selling";
}

const SimpleProductCard = ({ product }: { product: any }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();
    const { toast } = useToast();
    const { info: user } = useAppSelector((state: RootState) => state.user);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            toast({ title: "Thông báo", description: "Vui lòng đăng nhập để mua hàng" });
            navigate("/login");
            return;
        }
        try {
            await dispatch(addToCart({ userId: user.id, productId: product.id, quantity: 1 })).unwrap();
            dispatch(getCartCount({ userId: user.id }));
            toast({ title: "Thành công", description: "Đã thêm vào giỏ hàng" });
        } catch (error) {
            toast({ variant: "destructive", title: "Lỗi", description: "Không thể thêm sản phẩm" });
        }
    };

    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            // FIX 1: Thêm w-full để thẻ chiếm hết chiều rộng của SwiperSlide
            className="group relative w-full h-[340px] bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer"
        >
            {/* 1. IMAGE ONLY (DEFAULT VIEW) */}
            <div className="w-full h-full p-6 flex items-center justify-center bg-transparent relative z-0">
                <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                />
            </div>

            {/* Discount Badge */}
            {product.discountPercent > 0 && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-md">
                    -{product.discountPercent}%
                </div>
            )}

            {/* 2. HOVER OVERLAY (BUTTONS & INFO) */}
            <div className="absolute inset-0 bg-[#0f0f1a]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 p-4 text-center backdrop-blur-[2px] z-20">
                {/* Product Name & Price */}
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-lg line-clamp-2 px-2 drop-shadow-md">{product.name}</h3>
                    <p className="text-yellow-400 font-bold text-xl mt-2 drop-shadow-md">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                            product.priceAfterDiscount
                        )}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center gap-2 bg-white text-purple-900 px-5 py-2.5 rounded-full font-bold hover:bg-purple-600 hover:text-white transition-all shadow-lg hover:shadow-purple-500/50"
                    >
                        <ShoppingCart className="w-4 h-4" /> Thêm
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${product.id}`);
                        }}
                        className="p-2.5 bg-white/10 text-white border border-white/20 rounded-full hover:bg-white hover:text-purple-900 transition-all backdrop-blur-md"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN SLIDER COMPONENT ---
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

                if (response.data && response.data.result) {
                    setProducts(response.data.result);
                }
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
        <div className="py-12 relative group/slider overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg ${
                                type === "best-selling" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                            }`}
                        >
                            {type === "best-selling" ? <Flame className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">{title}</h2>
                    </div>
                    <a
                        href="/products"
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors ml-8"
                    >
                        Xem tất cả
                    </a>
                </div>

                <div className="relative">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white/5 h-[340px] rounded-2xl animate-pulse border border-white/5"
                                />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* XỬ LÝ: Nếu chỉ có 1 sản phẩm thì căn giữa */}
                            {products.length === 1 ? (
                                <div className="flex justify-center items-center w-full">
                                    <div className="w-full max-w-[300px] sm:max-w-[340px]">
                                        <SimpleProductCard product={products[0]} />
                                    </div>
                                </div>
                            ) : (
                                /* Nếu nhiều hơn 1 sản phẩm thì dùng Swiper */
                                <>
                                    <Swiper
                                        modules={[Navigation, Autoplay]}
                                        spaceBetween={20}
                                        slidesPerView={1}
                                        // FIX 2: Tắt centerInsufficientSlides để tránh lỗi layout bị bóp méo
                                        // Nếu bạn muốn căn giữa, hãy dùng flexbox ngoài thay vì dùng prop này của swiper
                                        centerInsufficientSlides={false}
                                        navigation={{
                                            nextEl: `.next-${type}`,
                                            prevEl: `.prev-${type}`
                                        }}
                                        autoplay={{
                                            delay: 4000,
                                            disableOnInteraction: false,
                                            pauseOnMouseEnter: true
                                        }}
                                        breakpoints={{
                                            640: { slidesPerView: 2 },
                                            1024: { slidesPerView: 3 },
                                            1280: { slidesPerView: 4 }
                                        }}
                                        className="!pb-10 !px-1"
                                    >
                                        {products.map((product) => (
                                            <SwiperSlide key={product.id}>
                                                <SimpleProductCard product={product} />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>

                                    {/* Nút điều hướng chỉ hiện khi có nhiều hơn 1 sản phẩm */}
                                    {products.length > 1 && (
                                        <>
                                            <button
                                                className={`prev-${type} absolute top-1/2 -left-4 md:left-0 z-20 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-purple-900 transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 shadow-lg`}
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                className={`next-${type} absolute top-1/2 -right-4 md:right-0 z-20 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-purple-900 transition-all opacity-0 group-hover/slider:opacity-100 disabled:opacity-0 shadow-lg`}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSlider;
