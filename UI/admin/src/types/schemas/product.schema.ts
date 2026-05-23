import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string(),
    address: z.string()
});

export const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Tên sản phẩm không được để trống"),
    img: z.string(),
    price: z.number().min(0, "Giá không được âm"),
    unit: z.string().optional(),
    supplier: supplierSchema,
    inStock: z.number().min(0, "Số lượng tồn kho không được âm"),
    updateDetail: z.boolean().optional()
});

export const productDetailSchema = z.object({
    id: z.string().optional(),
    images: z.array(z.string()),
    productId: z.string().optional(),
    attributes: z.array(z.object({
        name: z.string(),
        value: z.string(),
        unit: z.string().optional(),
        description: z.string().optional()
    })).default([]),
    imagesUpload: z.array(z.string()).optional()
});

export const productResponseSchema = z.object({
    content: z.array(productSchema),
    totalPages: z.number()
});

export type Supplier = z.infer<typeof supplierSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type ProductResponse = z.infer<typeof productResponseSchema>;
