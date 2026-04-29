import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SlidersHorizontal } from "lucide-react";
import { fetchProducts } from "@/redux/thunks/product";
import { AppDispatch, RootState } from "@/redux/store";
import ProductCard from "./components/ProductCard";
import ProductSkeleton from "./components/ProductSkeleton";
import ProductFilters from "./components/ProductFilters";
import { CATEGORY_KEYWORDS } from "@/data/categories";
import { removeAccents } from "@/utils/stringUtils";

const ProductsPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Lấy state từ Redux (products này là 1 trang 10 items từ server)
    const { products, loading, error, pagination } = useSelector((state: RootState) => state.product);

    // Filter states
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    // Fetch dữ liệu theo phân trang bình thường
    useEffect(() => {
        dispatch(fetchProducts({ page: 0, size: 10 }));
    }, [dispatch]);

    // --- LOGIC LỌC TRÊN TRANG HIỆN TẠI ---
    const displayedProducts = useMemo(() => {
        if (!products) return [];

        // 1. Lọc và Tìm kiếm trên danh sách hiện có
        let filtered = products.filter((product) => {
            const productNameNorm = removeAccents(product.name);
            const searchNorm = removeAccents(searchQuery);

            // Check Search
            const matchesSearch = productNameNorm.includes(searchNorm);

            // Check Category
            let matchesCategory = true;
            if (selectedCategories.length > 0) {
                matchesCategory = selectedCategories.some((catName) => {
                    const keywords = CATEGORY_KEYWORDS[catName] || [removeAccents(catName)];
                    return keywords.some((kw) => productNameNorm.includes(kw));
                });
            }

            return matchesSearch && matchesCategory;
        });

        // 2. Sắp xếp (Client-side sorting on current page)
        // Lưu ý: Nếu muốn sort toàn bộ database thì phải gọi API, còn đây là sort 10 item đang thấy
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.priceAfterDiscount - b.priceAfterDiscount;
                case "price-desc":
                    return b.priceAfterDiscount - a.priceAfterDiscount;
                case "discount":
                    return b.discountPercent - a.discountPercent;
                default:
                    return 0;
            }
        });
    }, [products, searchQuery, selectedCategories, sortBy]);

    if (error) {
        return <div className="text-center py-20 text-red-500">Lỗi: {error}</div>;
    }

    const handlePageChange = (newPage: number) => {
        dispatch(fetchProducts({ page: newPage, size: pagination.pageSize }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Banner */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="container mx-auto px-4 py-16 pl-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 pt-8">Build Your Dream PC</h1>
                    <p className="text-blue-100 max-w-2xl text-lg">
                        High-performance custom PCs built with premium components.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    <ProductFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                    />

                    <div className="flex-1">
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 border rounded-lg bg-white"
                            >
                                <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
                            </button>
                        </div>

                        {/* Header hiển thị số lượng */}
                        <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200">
                            <p className="text-gray-600 dark:text-gray-400">
                                Hiển thị <span className="font-semibold text-gray-900">{displayedProducts.length}</span>{" "}
                                kết quả (trên trang {pagination.currentPage + 1})
                            </p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price-asc">Giá thấp đến cao</option>
                                <option value="price-desc">Giá cao đến thấp</option>
                                <option value="discount">Giảm giá nhiều nhất</option>
                            </select>
                        </div>

                        {/* Danh sách sản phẩm */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <ProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : displayedProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl border">
                                <p className="text-gray-500">
                                    {products.length === 0
                                        ? "Không có sản phẩm nào ở trang này"
                                        : "Không tìm thấy sản phẩm phù hợp với bộ lọc trên trang này"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}

                        {/* Pagination  */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                <button
                                    disabled={pagination.first}
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-white"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    {pagination.currentPage + 1} / {pagination.totalPages}
                                </span>
                                <button
                                    disabled={pagination.last}
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-white"
                                >
                                    Tiếp
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
