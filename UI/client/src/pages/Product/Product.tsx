import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchProducts, fetchProductsByCategories, fetchCategories } from "@/redux/thunks/product";
import { AppDispatch, RootState } from "@/redux/store";
import ProductCard from "./components/ProductCard";
import ProductSkeleton from "./components/ProductSkeleton";
import ProductFilters from "./components/ProductFilters";
import { CATEGORY_KEYWORDS } from "@/data/categories";
import { removeAccents } from "@/utils/stringUtils";

const ProductsPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams] = useSearchParams();

    const { products, loading, error, pagination } = useSelector((state: RootState) => state.product);

    const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
        const cat = searchParams.get("category");
        return cat ? [cat] : [];
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategories.length > 0) {
            dispatch(fetchProductsByCategories({ categories: selectedCategories, page: 0 }));
        } else {
            dispatch(fetchProducts({ page: 0, size: 10 }));
        }
    }, [selectedCategories, dispatch]);

    const displayedProducts = useMemo(() => {
        if (!products) return [];

        const backendFiltered = selectedCategories.length > 0;

        let filtered = products.filter((product) => {
            const productNameNorm = removeAccents(product.name);
            const searchNorm = removeAccents(searchQuery);

            const matchesSearch = !searchQuery || productNameNorm.includes(searchNorm);

            const matchesCategory = backendFiltered || selectedCategories.length === 0 || selectedCategories.some((catName) => {
                const keywords = CATEGORY_KEYWORDS[catName] || [removeAccents(catName)];
                return keywords.some((kw) => productNameNorm.includes(kw));
            });

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
        return <div className="text-center py-20 text-red-500">{t('common.error')}: {error}</div>;
    }

    const handlePageChange = (newPage: number) => {
        if (selectedCategories.length > 0) {
            dispatch(fetchProductsByCategories({ categories: selectedCategories, page: newPage }));
        } else {
            dispatch(fetchProducts({ page: newPage, size: pagination.pageSize }));
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Banner */}
            <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 text-white">
                <div className="container mx-auto px-4 py-16 pl-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 pt-8">{t('product.heroTitle')}</h1>
                    <p className="text-orange-100 max-w-2xl text-lg">
                        {t('product.heroDesc')}
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
                                <SlidersHorizontal className="w-4 h-4" /> {t('product.filterTitle')}
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200">
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('product.showing')} <span className="font-semibold text-gray-900">{displayedProducts.length}</span>{" "}
                                {t('product.results')} ({t('product.page')} {pagination.currentPage + 1})
                            </p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700"
                            >
                                <option value="newest">{t('product.newest')}</option>
                                <option value="price-asc">{t('product.priceAsc')}</option>
                                <option value="price-desc">{t('product.priceDesc')}</option>
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
                                        ? t('product.noProductsPage')
                                        : t('product.noProductsFilter')}
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
                                    {t('product.prev')}
                                </button>
                                <span className="px-4 py-2 bg-orange-600 text-white rounded-lg">
                                    {pagination.currentPage + 1} / {pagination.totalPages}
                                </span>
                                <button
                                    disabled={pagination.last}
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 bg-white"
                                >
                                    {t('product.next')}
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
