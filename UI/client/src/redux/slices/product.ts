import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchProducts, fetchProductDetail, fetchProductsByCategory, fetchProductsByCategories, fetchCategories } from "../thunks/product";

export interface Supplier {
    name: string;
    address: string;
}

export interface ProductAttribute {
    name: string;
    value: string;
    unit?: string;
    description?: string;
}

export interface Category {
    id: string;
    name: string;
    keyword: string;
}

export interface Product {
    id: string;
    name: string;
    img: string;
    price: number;
    unit?: string;
    inStock: number;
    supplier: Supplier;
    updateDetail: boolean;
}

export interface ProductDetail {
    _id: string;
    images: string[];
    productId: string;
    attributes: ProductAttribute[];
}

export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface ProductsResponse {
    content: Product[];
    pageable: Pageable;
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        unsorted: boolean;
        sorted: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface ProductState {
    products: Product[];
    categories: Category[];
    categoriesLoading: boolean;
    currentProduct: Product | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalElements: number;
        pageSize: number;
        first: boolean;
        last: boolean;
    };
    loading: boolean;
    productDetailLoading: boolean;
    error: string | null;
    productDetailError: string | null;
}

const initialState: ProductState = {
    products: [],
    categories: [],
    categoriesLoading: false,
    currentProduct: null,
    pagination: {
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10,
        first: true,
        last: false
    },
    loading: false,
    productDetailLoading: false,
    error: null,
    productDetailError: null
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.productDetailError = null;
        },
        resetProducts: (state) => {
            state.products = [];
            state.pagination = initialState.pagination;
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
            state.productDetailError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.categoriesLoading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.categoriesLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state) => {
                state.categoriesLoading = false;
            })
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductsResponse>) => {
                state.loading = false;
                state.products = action.payload.content;
                state.pagination = {
                    currentPage: action.payload.number,
                    totalPages: action.payload.totalPages,
                    totalElements: action.payload.totalElements,
                    pageSize: action.payload.size,
                    first: action.payload.first,
                    last: action.payload.last
                };
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Không thể tải danh sách sản phẩm";
            })
            .addCase(fetchProductDetail.pending, (state) => {
                state.productDetailLoading = true;
                state.productDetailError = null;
            })
            .addCase(fetchProductDetail.fulfilled, (state, action: PayloadAction<Product>) => {
                state.productDetailLoading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductDetail.rejected, (state, action) => {
                state.productDetailLoading = false;
                state.productDetailError = (action.payload as string) || "Không thể tải thông tin sản phẩm";
            })
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action: PayloadAction<ProductsResponse>) => {
                state.loading = false;
                state.products = action.payload.content;
                state.pagination = {
                    currentPage: action.payload.number,
                    totalPages: action.payload.totalPages,
                    totalElements: action.payload.totalElements,
                    pageSize: action.payload.size,
                    first: action.payload.first,
                    last: action.payload.last
                };
            })
            .addCase(fetchProductsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Không thể tải sản phẩm theo danh mục";
            })
            .addCase(fetchProductsByCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsByCategories.fulfilled, (state, action: PayloadAction<ProductsResponse>) => {
                state.loading = false;
                state.products = action.payload.content;
                state.pagination = {
                    currentPage: action.payload.number,
                    totalPages: action.payload.totalPages,
                    totalElements: action.payload.totalElements,
                    pageSize: action.payload.size,
                    first: action.payload.first,
                    last: action.payload.last
                };
            })
            .addCase(fetchProductsByCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = (action.payload as string) || "Không thể tải sản phẩm theo danh mục";
            });
    }
});

export const { clearError, resetProducts, clearCurrentProduct } = productSlice.actions;
export const productReducer = productSlice.reducer;
