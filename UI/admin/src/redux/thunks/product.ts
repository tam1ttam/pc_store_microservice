import { createAsyncThunk } from "@reduxjs/toolkit";
import ENDPOINT from "@/constants/endpoint";
import { ProductsResponse, Product } from "../slices/product";
import { get } from "@/services/api.service";
import { ProductDetail } from "@/types";

interface FetchProductsParams {
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
