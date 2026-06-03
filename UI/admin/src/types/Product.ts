export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    discount: number;
    rating: number;
    stock: number;
    image: string;
}

export interface ProductFilters {
    searchQuery: string;
    sortBy: string;
    selectedCategories: string[];
}
