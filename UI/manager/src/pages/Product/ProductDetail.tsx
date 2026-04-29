import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ShoppingCart,
    Heart,
    Star,
    Truck,
    Shield,
    Plus,
    Minus,
    Cpu,
    CircuitBoard,
    HardDrive,
    Monitor,
    Box,
    Wind,
    Settings,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { fetchProductDetail } from "@/redux/thunks/product";
import { clearCurrentProduct } from "@/redux/slices/product";
import { addToCart, getCartCount } from "@/redux/thunks/cart";
import { AppDispatch, RootState } from "@/redux/store";
import ProductDetailSkeleton from "./components/ProductDetailSkeleton";
import ImageModal from "@/components/ImageModal";
import { useToast } from "@/hooks/use-toast";
import RecommendedSection from "@/components/RecommendedSection";

const SpecRow = ({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) => {
    if (!value) return null;
    return (
        <div className="flex items-center py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2 rounded-md">
            <div className="w-10 text-gray-400">{Icon && <Icon className="w-5 h-5" />}</div>
            <div className="w-40 font-medium text-gray-600">{label}</div>
            <div className="flex-1 text-gray-800 font-medium">{value}</div>
        </div>
    );
};

export default function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { toast } = useToast();

    const {
        currentProduct,
        productDetailLoading: loading,
        productDetailError: error
    } = useSelector((state: RootState) => state.product);
    const { info: user } = useSelector((state: RootState) => state.user);

    const product = currentProduct as any;

    const [quantity, setQuantity] = useState(1);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (id) dispatch(fetchProductDetail(id));

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [id, dispatch]);

    const galleryImages = useMemo(() => {
        if (!product) return [];
        const imgs = [product.img];
        if (product.images && product.images.length > 0) {
            product.images.forEach((img: string) => {
                if (img !== product.img) imgs.push(img);
            });
        }
        return imgs;
    }, [product]);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);

            await dispatch(
                addToCart({
                    userId: user?.id as string,
                    productId: id as string,
                    quantity
                }) as any
            ).unwrap();

            await dispatch(
                getCartCount({
                    userId: user?.id as string
                }) as any
            );

            toast({
                title: "Thành công!",
                description: `Đã thêm ${quantity} sản phẩm vào giỏ hàng`
            });

            setQuantity(1);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: error?.message ?? "Không thể thêm sản phẩm vào giỏ hàng"
            });
        } finally {
            setIsAddingToCart(false);
        }
    };

    if (loading) return <ProductDetailSkeleton />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => id && dispatch(fetchProductDetail(id))}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (!product) return <div>Không tìm thấy sản phẩm</div>;

    // Data Mapping for UI
    const specs = [
        { label: "Vi xử lý (CPU)", value: product.processor, icon: Cpu },
        { label: "RAM", value: product.ram, icon: CircuitBoard },
        { label: "Lưu trữ", value: product.storage, icon: HardDrive },
        { label: "Card đồ họa", value: product.graphicsCard, icon: Monitor },
        { label: "Nguồn (PSU)", value: product.powerSupply, icon: Box },
        { label: "Bo mạch chủ", value: product.motherboard, icon: CircuitBoard },
        { label: "Vỏ máy (Case)", value: product.case_ || product.case, icon: Box },
        { label: "Tản nhiệt", value: product.coolingSystem, icon: Wind },
        { label: "Hệ điều hành", value: product.operatingSystem, icon: Settings }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pt-20">
            <ImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={galleryImages[currentImageIndex]}
                alt={product.name}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* LEFT COLUMN: IMAGES & SLIDER */}
                        <div className="w-full md:w-[40%] lg:w-[35%]">
                            <div className="relative group">
                                <div
                                    className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100 cursor-zoom-in relative"
                                    onClick={() => setIsImageModalOpen(true)}
                                >
                                    <img
                                        src={galleryImages[currentImageIndex]}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-4 transition-all duration-300"
                                    />
                                </div>

                                {galleryImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                                    {currentImageIndex + 1} / {galleryImages.length}
                                </div>
                            </div>

                            {galleryImages.length > 1 && (
                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`
                                                relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 
                                                ${
                                                    currentImageIndex === idx
                                                        ? "border-blue-600 ring-2 ring-blue-100"
                                                        : "border-transparent hover:border-gray-300"
                                                }
                                                transition-all bg-gray-50
                                            `}
                                        >
                                            <img
                                                src={img}
                                                alt="thumbnail"
                                                className="w-full h-full object-contain p-1"
                                            />
                                            {currentImageIndex !== idx && (
                                                <div className="absolute inset-0 bg-white/30 hover:bg-transparent transition-colors" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: INFO */}
                        <div className="flex-1 space-y-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium text-yellow-700">4.8</span>
                                    </div>
                                    <span className="text-sm text-gray-400">|</span>
                                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                                        NCC: {product.supplier?.name}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-3xl font-bold text-red-600">
                                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                                            product.priceAfterDiscount
                                        )}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-lg text-gray-400 line-through">
                                            {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND"
                                            }).format(product.originalPrice)}
                                        </span>
                                    )}
                                </div>
                                {product.discountPercent > 0 && (
                                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-sm font-bold px-2.5 py-1 rounded-full">
                                        <Minus className="w-3 h-3" />
                                        Giảm {product.discountPercent}%
                                    </span>
                                )}
                            </div>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-center gap-6">
                                    <span className="font-medium text-gray-700">Số lượng:</span>
                                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-medium text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-3 hover:bg-gray-100 text-gray-600 rounded-r-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <ShoppingCart className="w-6 h-6" />
                                        {isAddingToCart ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                                    </button>
                                    <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all">
                                        <Heart className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900">Giao hàng miễn phí</p>
                                        <p className="text-gray-500">Cho đơn hàng trên 5tr</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-900">Bảo hành 24 tháng</p>
                                        <p className="text-gray-500">Chính hãng 100%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: SPECS & DESCRIPTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CircuitBoard className="w-6 h-6 text-blue-600" />
                                Thông số kỹ thuật
                            </h3>
                            <div className="flex flex-col">
                                {specs.map((spec, index) => (
                                    <SpecRow key={index} label={spec.label} value={spec.value} icon={spec.icon} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá & Mô tả chi tiết</h2>
                            <div className="prose prose-blue max-w-none text-gray-600">
                                <p className="leading-relaxed mb-4">
                                    Sản phẩm <strong>{product.name}</strong> mang đến hiệu năng vượt trội nhờ trang bị
                                    vi xử lý {product.processor} kết hợp cùng {product.ram} RAM, đáp ứng tốt các nhu cầu
                                    từ văn phòng cơ bản đến giải trí đa phương tiện.
                                </p>
                                <p className="leading-relaxed mb-4">
                                    Thiết kế với case {product.case_ || product.case} hiện đại, tản nhiệt{" "}
                                    {product.coolingSystem} giúp máy luôn hoạt động mát mẻ trong thời gian dài. Được cài
                                    đặt sẵn {product.operatingSystem}, bạn có thể sử dụng ngay lập tức sau khi mua về.
                                </p>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 my-6">
                                    <h4 className="font-bold text-blue-800 mb-2">Điểm nổi bật:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-blue-900">
                                        <li>CPU: {product.processor} mạnh mẽ.</li>
                                        <li>Đồ họa: {product.graphicsCard} xử lý hình ảnh sắc nét.</li>
                                        <li>Lưu trữ: {product.storage} tốc độ cao.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <RecommendedSection />
            </div>
        </div>
    );
}
