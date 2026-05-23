import { createAsyncThunk } from "@reduxjs/toolkit";
import ENDPOINT from "@/constants/endpoint";
import { ProductsResponse, Product } from "../slices/product";
import { get } from "@/services/api.service";
import { ProductDetail } from "@/types";

interface FetchProductsParams {
    page?: number;
    size?: number;
}

interface FetchProductsByCategoryParams {
    category: string;
    page?: number;
    size?: number;
}

interface ApiResponse<T> {
    code: number;
    result: T;
    message?: string;
}

export const fetchProducts = createAsyncThunk<ProductsResponse, FetchProductsParams, { rejectValue: string }>(
    "product/fetchProducts",
    async ({ page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await get<ApiResponse<ProductsResponse>>(ENDPOINT.PRODUCTS, {
                page,
                size
            });

            if (response.data.code !== 1000) {
                throw new Error(response.data.message || "API trả về lỗi");
            }

            return response.data.result;
        } catch (error: any) {
            if (error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            }
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Đã xảy ra lỗi không xác định");
        }
    }
);

export const fetchProductDetail = createAsyncThunk<any, string, { rejectValue: string }>(
    "product/fetchProductDetail",
    async (id, { rejectWithValue }) => {
        try {
            const response = await get<ApiResponse<Product>>(`${ENDPOINT.PRODUCTS}/id?id=${id}`);
            const detailsResponse = await get<ApiResponse<ProductDetail>>(`${ENDPOINT.PRODUCT_DETAIL}/${id}`);

            if (response.data.code !== 1000) {
                throw new Error(response.data.message || "API trả về lỗi");
            }

            return {
                ...response.data.result,
                ...detailsResponse.data.result
            };
        } catch (error: any) {
            if (error.response?.data?.message) {
                return rejectWithValue(error.response.data.message);
            }
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("Đã xảy ra lỗi không xác định");
        }
    }
);


export const fetchProductsByCategory = createAsyncThunk<ProductsResponse, FetchProductsByCategoryParams, { rejectValue: string }>(
    "product/fetchProductsByCategory",
    async ({ category, page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await get<ApiResponse<ProductsResponse>>(ENDPOINT.PRODUCTS_CATEGORY, { name: category, page, size });
            if (response.data.code !== 1000) throw new Error(response.data.message || "API trả về lỗi");
            return response.data.result;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || "Không thể tải sản phẩm theo danh mục");
        }
    }
);

interface FetchProductsByCategoriesParams {
    categories: string[];
    page?: number;
    size?: number;
}

export const fetchProductsByCategories = createAsyncThunk<ProductsResponse, FetchProductsByCategoriesParams, { rejectValue: string }>(
    "product/fetchProductsByCategories",
    async ({ categories, page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const qs = categories.map(c => `names=${encodeURIComponent(c)}`).join("&");
            const url = `${ENDPOINT.PRODUCTS_BY_CATEGORIES}?${qs}&page=${page}&size=${size}`;
            const response = await get<ApiResponse<ProductsResponse>>(url);
            if (response.data.code !== 1000) throw new Error(response.data.message || "API trả về lỗi");
            return response.data.result;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || "Không thể tải sản phẩm theo danh mục");
        }
    }
);
