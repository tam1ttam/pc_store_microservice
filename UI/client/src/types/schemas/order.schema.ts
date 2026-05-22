import { z } from "zod";

export const orderItemSchema = z.object({
    id: z.number(),
    productId: z.string(),
    productName: z.string(),
    productPrice: z.number(),
    quantity: z.number(),
    subtotal: z.number(),
});

export const orderSchema = z.object({
    id: z.number(),
    customerId: z.string().nullable().optional(),
    identityUserId: z.string().nullable().optional(),
    shipAddress: z.string(),
    orderDate: z.string(),
    currency: z.string().optional(),
    totalPrice: z.number(),
    isPaid: z.boolean(),
    orderStatus: z.string(),
    items: z.array(orderItemSchema).optional(),
});

export const orderResponseSchema = z.object({
    code: z.number(),
    result: z.array(orderSchema),
});

export const orderAdminSchema = z.object({
    code: z.number(),
    result: z.object({
        content: z.array(orderSchema),
        totalPages: z.number(),
        totalElements: z.number(),
    }),
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type OrderAdmin = z.infer<typeof orderAdminSchema>;
