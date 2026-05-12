import { z } from "zod";

export const supplierSchema = z.object({
    name: z.string(),
    address: z.string()
});

export const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Tên sản phẩm không được để trống"),
    img: z.string(),
    priceAfterDiscount: z.number().min(0, "Giá sau giảm không được âm"),
    originalPrice: z.number().min(0, "Giá gốc không được âm"),
    discountPercent: z
        .number()
        .min(0, "Phần trăm giảm giá không được âm")
        .max(100, "Phần trăm giảm giá không được quá 100%"),
    priceDiscount: z.number().min(0, "Số tiền giảm giá không được âm"),
    supplier: supplierSchema,
    inStock: z.number().min(0, "Số lượng tồn kho không được âm"),
    updateDetail: z.boolean().optional()
});

export const productDetailSchema = z.object({
    id: z.string(),
    images: z.array(z.string()),
    productId: z.string(),
    processor: z.string(),
    ram: z.string(),
    storage: z.string(),
    graphicsCard: z.string(),
    powerSupply: z.string(),
    motherboard: z.string(),
    case_: z.string(),
    coolingSystem: z.string(),
    operatingSystem: z.string(),
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
