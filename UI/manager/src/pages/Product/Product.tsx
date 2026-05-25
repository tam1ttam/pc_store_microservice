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
import { useTranslation } from "react-i18next";

const ProductsPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const { products, loading, error, pagination } = useSelector((state: RootState) => state.product);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        dispatch(fetchProducts({ page: 0, size: 10 }));
    }, [dispatch]);

    const displayedProducts = useMemo(() => {
        if (!products) return [];

        let filtered = products.filter((product) => {
            const productNameNorm = removeAccents(product.name);
            const searchNorm = removeAccents(searchQuery);

            const matchesSearch = productNameNorm.includes(searchNorm);

            let matchesCategory = true;
            if (selectedCategories.length > 0) {
                matchesCategory = selectedCategories.some((catName) => {
                    const keywords = CATEGORY_KEYWORDS[catName] || [removeAccents(catName)];
                    return keywords.some((kw) => productNameNorm.includes(kw));
                });
            }

            return matchesSearch && matchesCategory;
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case "price-asc":
                    return a.price - b.price;
                case "price-desc":
                    return b.price - a.price;
                default:
                    return 0;
            }
        });
    }, [products, searchQuery, selectedCategories, sortBy]);

    if (error) {
        return <div className="text-center py-20 text-red-500">{t("clientProduct.error")}: {error}</div>;
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
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 pt-8">{t("clientProduct.bannerTitle")}</h1>
                    <p className="text-blue-100 max-w-2xl text-lg">
                        {t("clientProduct.bannerDesc")}
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
                                <SlidersHorizontal className="w-4 h-4" /> {t("clientProduct.filters")}
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200">
                            <p className="text-gray-600 dark:text-gray-400">
                                {t("clientProduct.showing")}{" "}
                                <span className="font-semibold text-gray-900">{displayedProducts.length}</span>{" "}
                                {t("clientProduct.results", { page: pagination.currentPage + 1 })}
                            </p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700"
                            >
                                <option value="newest">{t("clientProduct.sortNewest")}</option>
                                <option value="price-asc">{t("clientProduct.sortPriceAsc")}</option>
                                <option value="price-desc">{t("clientProduct.sortPriceDesc")}</option>
                            </select>
                        </div>

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
                                        ? t("clientProduct.noProductsOnPage")
                                        : t("clientProduct.noMatchingProducts")}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}

                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-8 gap-2">
                                <button
                                    disabled={pagination.first}
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-white"
                                >
                                    {t("clientProduct.previous")}
                                </button>
                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                                    {pagination.currentPage + 1} / {pagination.totalPages}
                                </span>
                                <button
                                    disabled={pagination.last}
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-white"
                                >
                                    {t("clientProduct.next")}
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
