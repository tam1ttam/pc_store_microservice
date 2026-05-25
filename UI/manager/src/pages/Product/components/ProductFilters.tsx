import { Search } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { useTranslation } from "react-i18next";

type Props = {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedCategories: string[];
    setSelectedCategories: (value: string[]) => void;
};

const ProductFilters = ({ searchQuery, setSearchQuery, selectedCategories, setSelectedCategories }: Props) => {
    const { t } = useTranslation();

    const handleCheck = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter((c) => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    return (
        <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
                <h3 className="font-semibold text-lg mb-6 text-gray-800 dark:text-gray-100">{t("clientProduct.filters")}</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {t("clientProduct.search")}
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t("clientProduct.searchPlaceholder")}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                        {t("clientProduct.categories")}
                    </label>
                    <div className="space-y-2">
                        {CATEGORIES.map((cat) => (
                            <label
                                key={cat.name}
                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                        checked={selectedCategories.includes(cat.name)}
                                        onChange={() => handleCheck(cat.name)}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ProductFilters;
